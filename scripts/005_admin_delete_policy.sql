-- Ensure RLS is enabled
alter table if exists public.vouchers enable row level security;

-- Allow delete only when JWT role = 'admin'
drop policy if exists allow_admin_delete on public.vouchers;

grant delete on table public.vouchers to authenticated;

create policy allow_admin_delete
on public.vouchers
for delete
to authenticated
using ((auth.jwt() ->> 'role') = 'admin');
