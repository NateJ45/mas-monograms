-- MAS Monograms: the Studio's Messages inbox reads quote requests from here
-- (starter PORTS.md card 117). src/pages/api/quote.ts writes one row per quote
-- when the CONTACT_DB binding exists, beside the R2 backup and the email.
-- The columns are the family's contact_submissions table, copied from the
-- starter's generated migration so src/lib/studio-messages.ts reads it as is.
--
-- Apply it with:
--   npx wrangler d1 migrations apply <DB_NAME> --remote

CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  received_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  -- Whether the notification email was accepted by the transport. A row with
  -- notified = 0 is the whole reason this table exists: the enquiry survives an
  -- email that never arrived.
  notified INTEGER NOT NULL DEFAULT 0,
  notify_error TEXT,
  user_agent TEXT,
  country TEXT
);
CREATE INDEX IF NOT EXISTS contact_submissions_received_at
  ON contact_submissions (received_at DESC);
