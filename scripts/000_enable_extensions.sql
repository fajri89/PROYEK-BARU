-- Enable pgcrypto for gen_random_uuid (no-op if already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
