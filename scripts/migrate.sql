-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Polls table
CREATE TABLE IF NOT EXISTS polls (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                     TEXT NOT NULL,
  description               TEXT NOT NULL DEFAULT '',
  created_by                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  show_results_before_vote  BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at                TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Options table
CREATE TABLE IF NOT EXISTS options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id     UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- Votes table  (UNIQUE constraint prevents double voting per user per poll)
CREATE TABLE IF NOT EXISTS votes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  poll_id    UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id  UUID NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, poll_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_polls_created_by  ON polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_is_active   ON polls(is_active);
CREATE INDEX IF NOT EXISTS idx_options_poll_id   ON options(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id     ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id     ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_option_id   ON votes(option_id);
