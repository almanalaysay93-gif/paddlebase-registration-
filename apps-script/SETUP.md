# Apps Script setup (you do this in your own Google account)

Sheet: https://docs.google.com/spreadsheets/d/1AWQ3M5TOaa_3PukHmJK9Fb0NzZanngPNKqp-E5LnJkU/edit

## 1. Add the script to the sheet

1. Open the sheet above.
2. Click **Extensions > Apps Script**.
3. Delete the starter code. Paste the full contents of `Code.gs`.
4. Click **Save** (disk icon). Name the project `Paddlebase registration`.

## 2. Set the owner email

1. In Apps Script, click **Project Settings** (gear icon).
2. Under **Script properties**, click **Add script property**:
   - Property: `OWNER_EMAIL`
   - Value: the address that should receive new-registration alerts
3. Optional: add `EVENT_NAME` and `EVENT_WHEN` to change the event text in the emails.

The venue owner's welcome email and the site owner's alert include the poster and links to `paddlebase.org` and `paddlebaseowner.org`.
Publish `assets/welcome-to-paddlebase.png` with the site before you run the updated script.
Run `checkPosterAccess` once in the Apps Script editor to authorize image download access.
It returns `200` when the poster is available and sends no email.

## 3. Create the sheet tab and trigger

1. In the editor, select the function **setupSheet** and click **Run**. Approve the permissions prompt.
2. Select **installTrigger** and click **Run**. This makes `processPending` run every minute.
3. Optional test: change `REPLACE_WITH_YOUR_TEST_EMAIL@example.com` in `testRegistration`, then run **testRegistration**. Check the Registrations tab and your inbox.

## 4. Deploy as a web app

1. Click **Deploy > New deployment**.
2. Type: **Web app**.
3. Execute as: **Me**. Who has access: **Anyone**.
4. Click **Deploy**. Copy the **Web app URL** (ends in `/exec`).
5. Send that URL back to me. I'll put it into the site config.

If the web app already exists, use **Deploy > Manage deployments > Edit** and select a new version.

## Notes

- Emails go out within about a minute of a registration.
- The `email_status` column shows `sent` or `failed: ...` for each row.
- Only form submissions send email. Rows you type into the sheet by hand are ignored.
- Duplicate emails are rejected and no new row is written.
