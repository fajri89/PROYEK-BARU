-- Enable RLS (idempotent)
alter table if exists public.vouchers enable row level security;

-- Grant delete to authenticated role
grant delete on table public.vouchers to authenticated;

-- Policy: only authenticated may delete
drop policy if exists "authenticated can delete vouchers" on public.vouchers;
create policy "authenticated can delete vouchers"
on public.vouchers
as permissive
for delete
to authenticated
using (true);
