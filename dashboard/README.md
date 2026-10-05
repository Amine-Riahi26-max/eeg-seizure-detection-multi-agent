# Google Sheets dashboard

`Code.gs` is the Google Apps Script behind the dashboard:

- `doPost(e)` receives the JSON sent by n8n and appends one row to the **Journal** tab (12 columns).
- `setupAll()` formats the Journal tab (navy header, number formats, colour rules on `classification` and `action`) and builds the **Résumé** (summary) tab: counts, confusion matrix, accuracy, precision, recall and two charts.

## Setup

1. Create a Google Sheet (for example *EEG Monitoring Dashboard*).
2. **Extensions → Apps Script**, paste the contents of `Code.gs`, save.
3. Select `setupAll` in the function list and **Run** it once. Accept the permission prompt. Warning: it clears the Journal tab.
4. **Deploy → New deployment → Web app.** Execute as *Me*, access for *Anyone*. Copy the web-app URL into the `Send to Dashboard` node of the n8n workflow.
5. After any code change, deploy a **new version** (Deploy → Manage deployments), otherwise the URL keeps running the old code.

**The web-app URL lets anyone append rows to your sheet. Treat it as a secret and never commit it.**

## Journal columns

`timestamp`, `segment_id`, `energie_rms`, `entropie_spectrale`, `frequence_dominante_hz`, `score_vraisemblance`, `label_reel`, `classification`, `confiance`, `action`, `prompt_version`, `justification`.
