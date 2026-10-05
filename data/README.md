# Data

Three small files, drawn from the *Epileptic Seizure Recognition* dataset (re-segmented Bonn University EEG database, 11,500 one-second segments of 178 samples, fs = 173.61 Hz).

| File | Segments | Seizure / non-seizure | Used for |
|---|---|---|---|
| `calibration_set.csv` | 200 | 100 / 100 | calibrating the likelihood score (threshold 2.3) |
| `evaluation_set.csv` | 50 | 25 / 25 | final evaluation of the full pipeline |
| `evaluation_set_tab.csv` | 50 | 25 / 25 | tab-separated copy of the evaluation set, read by the LabVIEW VI |

- The two subsets were drawn with seed 42 by `scripts/prepare_datasets.py` and do not overlap.
- The LabVIEW VI reads each row as: segment id, class (1 to 5), then the 178 samples. Class 1 is seizure activity and classes 2 to 5 are merged into `NON_CRISE`.
- The full 11,500-segment file is **not** included. Download it from the original source and keep it out of version control (it is listed in `.gitignore`).

## Attribution

Andrzejak RG, Lehnertz K, Mormann F, Rieke C, David P, Elger CE. *Indications of nonlinear deterministic and finite-dimensional structures in time series of brain electrical activity: Dependence on recording region and brain state.* Physical Review E 64, 061907 (2001).

The original data remains subject to its providers' terms. Check them before reusing it. The repository's MIT license covers the code only.
