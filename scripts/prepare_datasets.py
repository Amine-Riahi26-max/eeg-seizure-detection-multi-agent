import pandas as pd
import numpy as np

SRC = "/home/amine/Bureau/projet_eeg/Epileptic Seizure Recognition.csv"
RNG_SEED = 42

df = pd.read_csv(SRC)
df = df.reset_index().rename(columns={"index": "segment_id"})

x_cols = [f"X{i}" for i in range(1, 179)]
cols_out = ["segment_id", "y"] + x_cols

rng = np.random.RandomState(RNG_SEED)

def sample_balanced(source_df, n_crise, n_non_crise, exclude_ids=None):
    pool = source_df if exclude_ids is None else source_df[~source_df["segment_id"].isin(exclude_ids)]
    crise = pool[pool["y"] == 1].sample(n=n_crise, random_state=rng.randint(0, 1_000_000))
    non_crise_pool = pool[pool["y"] != 1]
    per_class = n_non_crise // 4
    reste = n_non_crise - per_class * 4
    parts = []
    classes = [2, 3, 4, 5]
    for i, c in enumerate(classes):
        n_c = per_class + (1 if i < reste else 0)
        parts.append(non_crise_pool[non_crise_pool["y"] == c].sample(n=n_c, random_state=rng.randint(0, 1_000_000)))
    non_crise = pd.concat(parts)
    combined = pd.concat([crise, non_crise]).sample(frac=1, random_state=rng.randint(0, 1_000_000)).reset_index(drop=True)
    return combined

eval_set = sample_balanced(df, n_crise=25, n_non_crise=25)
eval_ids = set(eval_set["segment_id"])

calib_set = sample_balanced(df, n_crise=100, n_non_crise=100, exclude_ids=eval_ids)

eval_set[cols_out].to_csv("/home/amine/Bureau/projet_eeg/data/evaluation_set.csv", index=False, header=False)
calib_set[cols_out].to_csv("/home/amine/Bureau/projet_eeg/data/calibration_set.csv", index=False, header=False)

print("evaluation_set.csv :", len(eval_set), "lignes | crises :", (eval_set["y"] == 1).sum())
print("calibration_set.csv :", len(calib_set), "lignes | crises :", (calib_set["y"] == 1).sum())
print("Chevauchement eval/calib :", len(set(eval_set["segment_id"]) & set(calib_set["segment_id"])))
