-- Add configurable OT counting period (e.g. 26th previous month to 26th current month).

alter table public.app_settings
  add column if not exists period_start_day integer not null default 26;

alter table public.app_settings
  add column if not exists period_end_day integer not null default 26;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'app_settings_period_start_day_range'
  ) then
    alter table public.app_settings
      add constraint app_settings_period_start_day_range
      check (period_start_day between 1 and 31);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'app_settings_period_end_day_range'
  ) then
    alter table public.app_settings
      add constraint app_settings_period_end_day_range
      check (period_end_day between 1 and 31);
  end if;
end
$$;
