# LabVIEW acquisition

`EEG_Main.vi` (LabVIEW Community Edition 2026 Q3, 64-bit) is a single VI with no sub-VIs.

## What it does

1. Reads the tab-separated evaluation set (`data/evaluation_set_tab.csv`) with `Read Delimited Spreadsheet`.
2. In a `For` loop (N wired to `Array Size`), extracts one row per iteration, then computes the RMS energy, the spectral entropy (one-sided power spectrum, 90 bins) and the dominant frequency.
3. Builds the JSON message with `Format Into String` and sends it with the native HTTP Client VIs (`Open Handle`, `AddHeader`, `POST`, `Close Handle`).
4. Waits 30 s between segments, and routes errors to a `Simple Error Handler`.

## Before running

- Set the **file path** control to your copy of `data/evaluation_set_tab.csv`.
- Set the **Webhook URL** control (default `http://127.0.0.1:5678/webhook/eeg-crise`). The workflow must be published in n8n.
- Press **Run once**. Do not use *Run Continuously*: HTTP handles pile up until LabVIEW runs out of memory. Keep *Highlight Execution* off.

## Notes

- The `;` modifier in the format string (`%.;%.4f`) forces a decimal point, so the JSON stays valid on a French-locale system.
- The response indicators (`Response Headers`, `Response Body`) only update when the loop finishes, so they show the last segment.
