-- restrict inserts to admin only; revoke previous anon insert policy
-- Keep RLS enabled
alter table if exists public.vouchers enable row level security;

-- Remove any prior public insert policy if it exists
drop policy if exists allow_public_insert on public.vouchers;
drop policy if exists allow_anon_insert on public.vouchers;

-- Ensure only authenticated users with role=admin can insert
grant insert on table public.vouchers to authenticated;

drop policy if exists allow_admin_insert on public.vouchers;

create policy allow_admin_insert
on public.vouchers
for insert
to authenticated
with check ((auth.jwt() ->> 'role') = 'admin');
