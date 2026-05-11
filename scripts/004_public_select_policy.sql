-- Ensure RLS is enabled (safe to run multiple times)
alter table if exists public.vouchers enable row level security;

-- Grant select to anon role (explicit; RLS still applies)
grant select on table public.vouchers to anon;

-- Recreate a permissive SELECT policy for anon
drop policy if exists "Allow anon select vouchers" on public.vouchers;

create policy "Allow anon select vouchers"
  on public.vouchers
  for select
  to anon
  using (true);
