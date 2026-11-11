-- Publicly readable settings with university-domain administrator updates.
create table if not exists public.app_settings (
  key text primary key,
  value_integer integer not null check (value_integer between 0 and 99),
  updated_at timestamptz not null default now()
);

insert into public.app_settings(key,value_integer)
values ('low_stock_threshold',1)
on conflict (key) do nothing;

alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon,authenticated;
grant select on public.app_settings to anon,authenticated;
grant update on public.app_settings to authenticated;

create policy public_read_app_settings on public.app_settings
for select to anon,authenticated using (true);

create policy dragon_admin_update_app_settings on public.app_settings
for update to authenticated
using (
  lower(coalesce(auth.jwt()->>'email','')) like '%@dragon.t.u-tokyo.ac.jp'
  and coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=false
)
with check (
  key='low_stock_threshold'
  and lower(coalesce(auth.jwt()->>'email','')) like '%@dragon.t.u-tokyo.ac.jp'
  and coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=false
);
