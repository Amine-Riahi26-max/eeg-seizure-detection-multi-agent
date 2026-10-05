# n8n workflow

`workflow.json` is the export of **Multi-Agent System - EEG Epilepsy Seizure Detection** (23 nodes, built on n8n 2.38.7 self-hosted). Credentials, e-mail addresses, the Apps Script URL and instance identifiers were replaced by placeholders.

## Import

1. Start n8n (see the main README), open **Workflows**, then **Import from file** and choose `workflow.json`.
2. Fix the placeholders:
   - **Groq credential:** select your Groq API credential on the four chat-model nodes (`Chat Model - Classifier`, `- Writer`, `- Supervisor`, `- Format Validator`). They use `openai/gpt-oss-120b` at temperature 0.
   - **SMTP credential:** select an SMTP credential on `Email Alert - Doctor`, and set the sender and recipient (`sender@example.com`, `doctor@example.com`).
   - **Dashboard URL:** in `Send to Dashboard`, replace `YOUR_DEPLOYMENT_ID` with your Apps Script web-app URL (see `dashboard/README.md`).
   - **Log files:** the two `Write Log` nodes write a CSV log to disk. Check the file path in each node and make sure it is writable in your setup.
3. **Publish** the workflow. The webhook is `POST /webhook/eeg-crise` (production URL).

## Flow

`Webhook` → `Compute Likelihood Score` (Code) → `Agent 1 - Classifier` → `Fetch Medical Reference` (French Wikipedia) → `Agent 2 - Medical Writer` → `Agent 3 - Decision Supervisor` (Simple Memory, window of 5) → `Trigger Alert Condition` (If) → alert branch (log + e-mail) or no-seizure branch (log) → `Send to Dashboard`.

*Retry On Fail* is disabled on the three agents on purpose: on quota errors it looped and made things worse.
