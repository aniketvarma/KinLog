DROP TABLE IF EXISTS reminders;

CREATE TABLE reminders(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message VARCHAR(500) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('once', 'daily', 'weekly')),
    due_at TIMESTAMPTZ NOT NULL, 
    notified_at TIMESTAMPTZ ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() 

);

CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(due_at) WHERE notified_at IS NULL;



CREATE TABLE IF NOT EXISTS push_subscriptions(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPtZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subs_user ON push_subscriptions(user_id);