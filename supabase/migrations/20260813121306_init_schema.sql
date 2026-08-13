-- SocietyPro schema: multi-tenant residential society billing/management.
-- Tenancy model: one row in `societies` per society. Every admin-facing table
-- carries `society_id` and is protected by RLS scoped to the caller's own
-- society (via `profiles`). Residents have no Supabase Auth identity (product
-- design: flat-number-only login, no password) so their portal is served by
-- a SECURITY DEFINER RPC scoped to a single flat rather than table grants,
-- keeping the anon key from being able to read every flat's financial data.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.societies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- One row per admin user, linking their Supabase Auth identity to a society.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  society_id uuid not null references public.societies (id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  email text,
  created_at timestamptz not null default now()
);

create table public.buildings (
  id bigint generated always as identity primary key,
  society_id uuid not null references public.societies (id) on delete cascade,
  name text not null,
  floors integer not null default 0,
  total_flats integer not null default 0,
  year_built integer,
  created_at timestamptz not null default now()
);

create table public.flats (
  id bigint generated always as identity primary key,
  society_id uuid not null references public.societies (id) on delete cascade,
  building_id bigint not null references public.buildings (id) on delete cascade,
  flat_number text not null,
  floor integer,
  type text not null default '2BHK',
  area numeric not null default 0,
  owner_name text not null default '',
  owner_mobile text not null default '',
  created_at timestamptz not null default now(),
  unique (society_id, flat_number)
);

create table public.residents (
  id bigint generated always as identity primary key,
  society_id uuid not null references public.societies (id) on delete cascade,
  flat_id bigint not null references public.flats (id) on delete cascade,
  name text not null,
  phone text not null default '',
  email text not null default '',
  type text not null default 'Owner' check (type in ('Owner', 'Tenant')),
  move_in_date date,
  created_at timestamptz not null default now()
);

create table public.bills (
  id bigint generated always as identity primary key,
  society_id uuid not null references public.societies (id) on delete cascade,
  flat_id bigint not null references public.flats (id) on delete cascade,
  month text not null,
  amount numeric not null default 0,
  pending_dues numeric not null default 0,
  total_due numeric not null default 0,
  status text not null default 'Pending' check (status in ('Paid', 'Pending', 'Partial')),
  generated_at date not null default current_date,
  created_at timestamptz not null default now(),
  unique (flat_id, month)
);

create table public.payments (
  id bigint generated always as identity primary key,
  society_id uuid not null references public.societies (id) on delete cascade,
  bill_id bigint not null references public.bills (id) on delete cascade,
  flat_id bigint not null references public.flats (id) on delete cascade,
  amount numeric not null,
  mode text not null check (mode in ('Cash', 'UPI', 'Bank Transfer', 'Cheque')),
  reference text not null default '',
  date date not null,
  received_by text not null default 'Admin',
  created_at timestamptz not null default now()
);

create table public.expenses (
  id bigint generated always as identity primary key,
  society_id uuid not null references public.societies (id) on delete cascade,
  category text not null,
  description text not null,
  amount numeric not null,
  date date not null,
  paid_to text not null default '',
  created_at timestamptz not null default now()
);

create table public.notices (
  id bigint generated always as identity primary key,
  society_id uuid not null references public.societies (id) on delete cascade,
  title text not null,
  content text not null,
  priority text not null default 'Normal' check (priority in ('High', 'Normal', 'Low')),
  date date not null default current_date,
  author text not null default 'Admin',
  created_at timestamptz not null default now()
);

create index on public.buildings (society_id);
create index on public.flats (society_id);
create index on public.flats (building_id);
create index on public.residents (society_id);
create index on public.residents (flat_id);
create index on public.bills (society_id);
create index on public.bills (flat_id);
create index on public.payments (society_id);
create index on public.payments (bill_id);
create index on public.payments (flat_id);
create index on public.expenses (society_id);
create index on public.notices (society_id);

-- ---------------------------------------------------------------------------
-- Helper: the calling admin's own society, resolved from their profile row.
-- ---------------------------------------------------------------------------

create function public.current_society_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select society_id from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- RLS: authenticated admins can only touch rows in their own society.
-- No policies are granted to `anon` — resident access goes through the
-- SECURITY DEFINER RPC below instead of direct table reads.
-- ---------------------------------------------------------------------------

alter table public.societies enable row level security;
alter table public.profiles enable row level security;
alter table public.buildings enable row level security;
alter table public.flats enable row level security;
alter table public.residents enable row level security;
alter table public.bills enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.notices enable row level security;

create policy "members can view their society" on public.societies
  for select to authenticated
  using (id = public.current_society_id());

create policy "user can view own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "admins manage own buildings" on public.buildings
  for all to authenticated
  using (society_id = public.current_society_id())
  with check (society_id = public.current_society_id());

create policy "admins manage own flats" on public.flats
  for all to authenticated
  using (society_id = public.current_society_id())
  with check (society_id = public.current_society_id());

create policy "admins manage own residents" on public.residents
  for all to authenticated
  using (society_id = public.current_society_id())
  with check (society_id = public.current_society_id());

create policy "admins manage own bills" on public.bills
  for all to authenticated
  using (society_id = public.current_society_id())
  with check (society_id = public.current_society_id());

create policy "admins manage own payments" on public.payments
  for all to authenticated
  using (society_id = public.current_society_id())
  with check (society_id = public.current_society_id());

create policy "admins manage own expenses" on public.expenses
  for all to authenticated
  using (society_id = public.current_society_id())
  with check (society_id = public.current_society_id());

create policy "admins manage own notices" on public.notices
  for all to authenticated
  using (society_id = public.current_society_id())
  with check (society_id = public.current_society_id());

-- ---------------------------------------------------------------------------
-- RPC: first-run onboarding. Creates a society and links the calling
-- (already authenticated) user to it as its admin. No-op-proofed against
-- being called twice by the same user.
-- ---------------------------------------------------------------------------

create function public.create_society(p_society_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_society_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Must be signed in to create a society';
  end if;

  if exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'This account is already linked to a society';
  end if;

  if coalesce(trim(p_society_name), '') = '' then
    raise exception 'Society name is required';
  end if;

  insert into public.societies (name) values (trim(p_society_name))
  returning id into v_society_id;

  insert into public.profiles (id, society_id, role, email)
  values (auth.uid(), v_society_id, 'admin', auth.jwt() ->> 'email');

  return v_society_id;
end;
$$;

grant execute on function public.create_society(text) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: resident self-service portal, looked up by flat number only (matches
-- the product's current no-password resident login). Scoped to a single
-- flat so the anon key can never pull the whole dataset in one call.
-- ---------------------------------------------------------------------------

create function public.get_resident_portal(p_flat_number text)
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_flat public.flats%rowtype;
  v_result json;
begin
  select * into v_flat
  from public.flats
  where upper(flat_number) = upper(trim(p_flat_number))
  limit 1;

  if not found then
    return null;
  end if;

  select json_build_object(
    'flat', json_build_object(
      'id', v_flat.id,
      'flatNumber', v_flat.flat_number,
      'floor', v_flat.floor,
      'type', v_flat.type,
      'area', v_flat.area,
      'ownerName', v_flat.owner_name,
      'ownerMobile', v_flat.owner_mobile
    ),
    'resident', (
      select json_build_object(
        'id', r.id, 'name', r.name, 'phone', r.phone, 'email', r.email,
        'type', r.type, 'moveInDate', r.move_in_date
      )
      from public.residents r
      where r.flat_id = v_flat.id
      order by r.created_at
      limit 1
    ),
    'bills', coalesce((
      select json_agg(json_build_object(
        'id', b.id, 'month', b.month, 'amount', b.amount,
        'pendingDues', b.pending_dues, 'totalDue', b.total_due,
        'status', b.status, 'generatedAt', b.generated_at
      ) order by b.month desc)
      from public.bills b
      where b.flat_id = v_flat.id
    ), '[]'::json),
    'payments', coalesce((
      select json_agg(json_build_object(
        'id', p.id, 'billId', p.bill_id, 'amount', p.amount, 'mode', p.mode,
        'reference', p.reference, 'date', p.date
      ) order by p.date desc)
      from public.payments p
      where p.flat_id = v_flat.id
    ), '[]'::json)
  ) into v_result;

  return v_result;
end;
$$;

grant execute on function public.get_resident_portal(text) to anon, authenticated;
