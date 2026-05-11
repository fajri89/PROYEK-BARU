-- Ensure RLS is enabled on the vouchers table
alter table if exists public.vouchers
  enable row level security;

-- Grant minimal privileges for anon to perform INSERT
do $$
begin
  -- schema usage (usually already present, safe to re-grant)
  execute 'grant usage on schema public to anon';

  -- table insert privilege for anon
  execute 'grant insert on table public.vouchers to anon';
exception
  when others then
    -- ignore if already granted
    null;
end $$;

-- Create a policy to allow anonymous inserts
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'vouchers'
      and polname = 'anon_insert_vouchers'
  ) then
    create policy anon_insert_vouchers
      on public.vouchers
      for insert
      to anon
      with check (true);
  end if;
end $$;

-- NOTE:
-- - We are intentionally NOT creating SELECT/UPDATE/DELETE policies for anon.
--   This means publik hanya bisa MENAMBAH data (INSERT) tanpa bisa melihat/mengubah/menghapus data.
-- - Service role (SUPABASE_SERVICE_ROLE_KEY) akan tetap bisa membaca semua data untuk halaman admin/riwayat.
