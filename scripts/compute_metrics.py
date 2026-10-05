import sys
import json
import math
import pandas as pd


def wilson_interval(successes, n, z=1.96):
    if n == 0:
        return (0.0, 0.0)
    p = successes / n
    denom = 1 + z**2 / n
    centre = p + z**2 / (2 * n)
    marge = z * math.sqrt((p * (1 - p) + z**2 / (4 * n)) / n)
    borne_inf = (centre - marge) / denom
    borne_sup = (centre + marge) / denom
    return (max(0.0, borne_inf), min(1.0, borne_sup))


def main():
    csv_path = sys.argv[1]
    df = pd.read_csv(csv_path)

    df = df.dropna(subset=["label_reel", "classification"])
    df["label_reel"] = df["label_reel"].str.strip().str.upper()
    df["classification"] = df["classification"].str.strip().str.upper()

    y_true = df["label_reel"] == "CRISE"
    y_pred = df["classification"] == "CRISE"

    tp = int(((y_true) & (y_pred)).sum())
    tn = int(((~y_true) & (~y_pred)).sum())
    fp = int(((~y_true) & (y_pred)).sum())
    fn = int(((y_true) & (~y_pred)).sum())

    n = tp + tn + fp + fn
    accuracy = (tp + tn) / n if n > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    rappel = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * rappel / (precision + rappel)
          if (precision + rappel) > 0 else 0.0)

    acc_ci = wilson_interval(tp + tn, n)
    prec_ci = wilson_interval(tp, tp + fp) if (tp + fp) > 0 else (0.0, 0.0)
    rappel_ci = wilson_interval(tp, tp + fn) if (tp + fn) > 0 else (0.0, 0.0)

    repartition_actions = (
        df["action"].value_counts().to_dict() if "action" in df.columns else {}
    )

    segments_mal_classes = df[y_true != y_pred][
        [c for c in ["segment_id", "label_reel", "classification", "confiance"]
         if c in df.columns]
    ].to_dict(orient="records")

    metrics = {
        "n_segments": n,
        "matrice_confusion": {
            "vrai_positif": tp,
            "vrai_negatif": tn,
            "faux_positif": fp,
            "faux_negatif": fn,
        },
        "accuracy": round(accuracy, 4),
        "accuracy_ic95": [round(acc_ci[0], 4), round(acc_ci[1], 4)],
        "precision": round(precision, 4),
        "precision_ic95": [round(prec_ci[0], 4), round(prec_ci[1], 4)],
        "rappel": round(rappel, 4),
        "rappel_ic95": [round(rappel_ci[0], 4), round(rappel_ci[1], 4)],
        "f1_score": round(f1, 4),
        "repartition_actions": repartition_actions,
        "segments_mal_classes": segments_mal_classes,
    }

    with open("metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    print("=== Resultats ===")
    print(f"Segments evalues : {n}")
    print(f"Matrice de confusion : VP={tp} VN={tn} FP={fp} FN={fn}")
    print(f"Accuracy  : {accuracy:.4f}  (IC95%: {acc_ci[0]:.4f} - {acc_ci[1]:.4f})")
    print(f"Precision : {precision:.4f}  (IC95%: {prec_ci[0]:.4f} - {prec_ci[1]:.4f})")
    print(f"Rappel    : {rappel:.4f}  (IC95%: {rappel_ci[0]:.4f} - {rappel_ci[1]:.4f})")
    print(f"F1-score  : {f1:.4f}")
    print(f"\nResultats dans : metrics.json")


if __name__ == "__main__":
    main()
