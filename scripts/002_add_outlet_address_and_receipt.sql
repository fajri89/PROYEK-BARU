ALTER TABLE vouchers
ADD COLUMN IF NOT EXISTS store_address TEXT;

ALTER TABLE vouchers
ADD COLUMN IF NOT EXISTS receipt_number TEXT;

-- Optional indexes if needed later:
CREATE INDEX IF NOT EXISTS idx_vouchers_store_name ON vouchers(store_name);
CREATE INDEX IF NOT EXISTS idx_vouchers_receipt_number ON vouchers(receipt_number);
