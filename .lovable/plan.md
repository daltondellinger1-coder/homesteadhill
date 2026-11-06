# VACANCIES_INGEST_KEY — read-only findings (no changes)

## Findings
- The secret `VACANCIES_INGEST_KEY` exists in this project (confirmed with the secret listing just now).
- Secret values are write-only. The secret tool returns names only, and stored values are encrypted and never shown. Neither I nor the UI can reveal or copy the current value. Because this one was generated randomly, nobody can retrieve it.
- Where to manage it in the current UI: **More → Settings group → Secrets**. On desktop, open the More tab above the preview, then pick Secrets under the Settings group in the left sidebar. On mobile, switch to Chat mode, tap the `...` in the bottom right, tap More, open the bottom section sheet, then go to Settings → Secrets. If Developer mode is on, Settings still holds Secrets; only Logs and Build jobs move to Developer.

## Only way to get a usable key (needs your action, nothing done now)
1. Create your own strong value, for example with a password manager or `openssl rand -hex 32`.
2. In More → Settings → Secrets, update `VACANCIES_INGEST_KEY` to that value.
3. Put the same value in your bot's `X-Ingest-Key` header.
This replaces the current key, so only do it when you're ready. No code or redeploy is needed.

No action is planned unless you ask for it.
