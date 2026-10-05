import pandas as pd
import numpy as np

FS = 173.61

def compute_features(signal):
    energie_rms = np.sqrt(np.mean(signal**2))
    n = len(signal)
    fft_vals = np.fft.fft(signal)
    power_spectrum = np.abs(fft_vals)**2
    power_spectrum = power_spectrum[:90]
    total = np.sum(power_spectrum)
    p = power_spectrum / total
    epsilon = 1e-12
    entropie = -np.sum(p * np.log2(p + epsilon)) / np.log2(len(p))
    df = FS / n
    index_pic = np.argmax(power_spectrum[1:]) + 1
    freq_dominante = index_pic * df
    return energie_rms, entropie, freq_dominante

def compute_score(energie, entropie, freq):
    facteur_freq = 1.2 if (freq > 3 and freq < 30) else 0.8
    score = min((energie / 100) * (1 / (entropie + 0.01)) * facteur_freq, 10)
    return score

df = pd.read_csv("/home/amine/Bureau/projet_eeg/data/calibration_set.csv", header=None)
segment_ids = df.iloc[:, 0].values
classes = df.iloc[:, 1].values
signals = df.iloc[:, 2:].values

scores = []
for i in range(len(df)):
    energie, entropie, freq = compute_features(signals[i].astype(float))
    score = compute_score(energie, entropie, freq)
    scores.append(score)

scores = np.array(scores)
is_crise = (classes == 1)

print("Score moyen CRISE:", scores[is_crise].mean())
print("Score moyen NON_CRISE:", scores[~is_crise].mean())
print("Score median CRISE:", np.median(scores[is_crise]))
print("Score median NON_CRISE:", np.median(scores[~is_crise]))

best_threshold = None
best_accuracy = 0
for threshold in np.arange(0, 10, 0.1):
    predictions = scores >= threshold
    accuracy = np.mean(predictions == is_crise)
    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_threshold = threshold

print("Meilleur seuil:", round(best_threshold, 2))
print("Accuracy a ce seuil:", round(best_accuracy, 4))
