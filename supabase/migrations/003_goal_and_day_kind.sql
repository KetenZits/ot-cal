-- Cycle goal + day marks (day off / absent).

alter table public.app_settings
  add column if not exists cycle_goal_amount numeric(10, 2) not null default 0;

alter table public.ot_records
  add column if not exists day_kind text not null default 'ot';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'app_settings_cycle_goal_nonnegative'
  ) then
    alter table public.app_settings
      add constraint app_settings_cycle_goal_nonnegative
      check (cycle_goal_amount >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'ot_records_day_kind_valid'
  ) then
    alter table public.ot_records
      add constraint ot_records_day_kind_valid
      check (day_kind in ('ot', 'off', 'absent'));
  end if;
end
$$;
