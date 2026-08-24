# DataPure SQL Setup — Run this in Supabase SQL Editor

-- Table 1: Unique verified entries
CREATE TABLE IF NOT EXISTS entries (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    phone         VARCHAR(50)  NOT NULL,
    content       TEXT         NOT NULL,
    content_hash  VARCHAR(64)  NOT NULL UNIQUE,   -- SHA-256 hex digest
    created_at    TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- Index for fast hash lookup (Layer 1)
CREATE INDEX IF NOT EXISTS idx_entries_hash ON entries(content_hash);

-- Table 2: Flagged (ambiguous) entries awaiting manual review
CREATE TABLE IF NOT EXISTS flagged_entries (
    id                SERIAL PRIMARY KEY,
    entry_data        JSONB        NOT NULL,        -- Raw submitted entry as JSON
    matched_entry_id  INTEGER REFERENCES entries(id) ON DELETE SET NULL,
    similarity_score  FLOAT        NOT NULL,        -- RapidFuzz score that triggered flagging
    status            VARCHAR(20)  NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
    created_at        TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_flagged_status ON flagged_entries(status);
