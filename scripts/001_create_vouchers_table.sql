-- Create vouchers table in public schema
CREATE TABLE IF NOT EXISTS public.vouchers (
  id BIGSERIAL PRIMARY KEY,
  tanggal TEXT NOT NULL,
  waktu TEXT NOT NULL,
  nama_outlet TEXT NOT NULL,
  alamat_outlet TEXT,
  jenis_voucher TEXT NOT NULL,
  jumlah INTEGER NOT NULL,
  harga_satuan INTEGER NOT NULL,
  total_harga INTEGER NOT NULL,
  metode_pembayaran TEXT NOT NULL,
  nomor_struk TEXT,
  kasir TEXT,
  catatan TEXT,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT * 1000)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_vouchers_tanggal ON public.vouchers(tanggal);
CREATE INDEX IF NOT EXISTS idx_vouchers_nama_outlet ON public.vouchers(nama_outlet);
CREATE INDEX IF NOT EXISTS idx_vouchers_created_at ON public.vouchers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Public users can view all vouchers
CREATE POLICY "Allow public SELECT" ON public.vouchers
  FOR SELECT TO anon
  USING (true);

-- Only authenticated users can insert
CREATE POLICY "Allow authenticated INSERT" ON public.vouchers
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Only authenticated users can delete
CREATE POLICY "Allow authenticated DELETE" ON public.vouchers
  FOR DELETE TO authenticated
  USING (true);
