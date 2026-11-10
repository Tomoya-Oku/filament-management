-- Apply to the dedicated DRAGON Lab project. Initial stock is deliberately empty.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table public.lab_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.rooms (code text primary key);
create table public.materials (name text primary key);
create table public.colors (name text primary key);
insert into public.rooms values ('62C1'),('72A4'),('536B'),('0066');
insert into public.materials values ('PLA Basic'),('PLA CF'),('PA6-CF'),('PLA Silk'),('PLA Glow'),('ABS'),('PC'),('TPU'),('UP300 PLA'),('UP300 ABS+'),('PLA+'),('ePA-CF'),('Support');
insert into public.colors values ('Maroon RED'),('RED'),('MAGENTA'),('Hot PINK'),('PINK'),('ORANGE'),('Pumpkin ORANGE'),('Sunflower YELLOW'),('YELLOW'),('BEIJE'),('Bright GREEN'),('Bambu GREEN'),('GREEN'),('TURQUOISE'),('CYAN'),('Cobalt BLUE'),('BLUE'),('BLUE GRAY'),('Indigo PURPLE'),('PURPLE'),('BROWN'),('Cocoa BROWN'),('GOLD'),('SILVER'),('BRONZE'),('WHITE'),('Light GRAY'),('GRAY'),('Dark GRAY'),('BLACK'),('CLEAR'),('N/A');

create table public.stock (
  room text not null references public.rooms(code),
  material text not null references public.materials(name),
  color text not null references public.colors(name),
  quantity integer not null default 0 check (quantity >= 0),
  primary key (room, material, color),
  constraint support_color check ((material = 'Support') = (color = 'N/A'))
);
create table public.movements (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  actor uuid not null references auth.users(id),
  kind text not null check (kind in ('add','use','transfer')),
  room text not null references public.rooms(code),
  destination text references public.rooms(code),
  material text not null references public.materials(name),
  color text not null references public.colors(name),
  quantity integer not null check (quantity between 1 and 999),
  created_at timestamptz not null default now(),
  constraint valid_destination check ((kind = 'transfer' and destination is not null and room <> destination) or (kind <> 'transfer' and destination is null)),
  constraint support_color check ((material = 'Support') = (color = 'N/A'))
);
create index movements_created_at_idx on public.movements(created_at desc);
create index movements_actor_idx on public.movements(actor);
create index stock_material_idx on public.stock(material);
create index stock_color_idx on public.stock(color);
create index movements_room_idx on public.movements(room);
create index movements_destination_idx on public.movements(destination);
create index movements_material_idx on public.movements(material);
create index movements_color_idx on public.movements(color);

alter table public.lab_members enable row level security;
alter table public.rooms enable row level security;
alter table public.materials enable row level security;
alter table public.colors enable row level security;
alter table public.stock enable row level security;
alter table public.movements enable row level security;
create policy member_self on public.lab_members for select to authenticated using (user_id = (select auth.uid()));
create policy members_read_rooms on public.rooms for select to authenticated using (exists (select 1 from public.lab_members where user_id = (select auth.uid())));
create policy members_read_materials on public.materials for select to authenticated using (exists (select 1 from public.lab_members where user_id = (select auth.uid())));
create policy members_read_colors on public.colors for select to authenticated using (exists (select 1 from public.lab_members where user_id = (select auth.uid())));
create policy members_read_stock on public.stock for select to authenticated using (exists (select 1 from public.lab_members where user_id = (select auth.uid())));
create policy members_read_movements on public.movements for select to authenticated using (exists (select 1 from public.lab_members where user_id = (select auth.uid())));
revoke all on public.lab_members, public.rooms, public.materials, public.colors, public.stock, public.movements from anon, authenticated;
grant select on public.lab_members, public.rooms, public.materials, public.colors, public.stock, public.movements to authenticated;

-- Definer is required to expose one atomic, audited operation without allowing direct table writes.
-- It lives in an unexposed schema and explicitly checks both authentication and lab membership.
create function private.record_movement(
  p_kind text, p_room text, p_destination text, p_material text, p_color text, p_quantity integer, p_request_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_previous public.movements%rowtype;
  v_id uuid;
begin
  if v_actor is null or not exists (select 1 from public.lab_members where user_id = v_actor) then
    raise exception 'NOT_A_MEMBER' using errcode = '42501';
  end if;
  if p_kind is null or p_kind not in ('add','use','transfer')
    or p_quantity is null or p_quantity < 1 or p_quantity > 999 or p_request_id is null
    or not exists (select 1 from public.rooms where code = p_room)
    or not exists (select 1 from public.materials where name = p_material)
    or not exists (select 1 from public.colors where name = p_color)
    or ((p_material = 'Support') <> (p_color = 'N/A'))
    or (p_kind = 'transfer' and (p_destination is null or p_destination = p_room or not exists (select 1 from public.rooms where code = p_destination)))
    or (p_kind <> 'transfer' and p_destination is not null) then
    raise exception 'INVALID_ENTRY' using errcode = '22023';
  end if;
  -- A lab's short transactions are serialized to prevent lost updates and opposite-direction transfer deadlocks.
  perform pg_catalog.pg_advisory_xact_lock(770301116);
  select * into v_previous from public.movements where request_id = p_request_id;
  if found then
    if v_previous.actor = v_actor and v_previous.kind = p_kind and v_previous.room = p_room
      and v_previous.destination is not distinct from p_destination and v_previous.material = p_material
      and v_previous.color = p_color and v_previous.quantity = p_quantity then
      return v_previous.id;
    end if;
    raise exception 'REQUEST_CONFLICT' using errcode = '22023';
  end if;
  if p_kind = 'add' then
    insert into public.stock(room,material,color,quantity) values(p_room,p_material,p_color,p_quantity)
    on conflict(room,material,color) do update set quantity = public.stock.quantity + excluded.quantity;
  else
    update public.stock set quantity = quantity - p_quantity
      where room = p_room and material = p_material and color = p_color and quantity >= p_quantity;
    if not found then raise exception 'INSUFFICIENT_STOCK' using errcode = 'P0001'; end if;
    if p_kind = 'transfer' then
      insert into public.stock(room,material,color,quantity) values(p_destination,p_material,p_color,p_quantity)
      on conflict(room,material,color) do update set quantity = public.stock.quantity + excluded.quantity;
    end if;
  end if;
  insert into public.movements(request_id,actor,kind,room,destination,material,color,quantity)
    values(p_request_id,v_actor,p_kind,p_room,p_destination,p_material,p_color,p_quantity) returning id into v_id;
  return v_id;
end;
$$;
revoke all on function private.record_movement(text,text,text,text,text,integer,uuid) from public, anon;
grant execute on function private.record_movement(text,text,text,text,text,integer,uuid) to authenticated;
create function public.record_movement(p_kind text,p_room text,p_destination text,p_material text,p_color text,p_quantity integer,p_request_id uuid)
returns uuid language sql security invoker set search_path = '' as $$
  select private.record_movement(p_kind,p_room,p_destination,p_material,p_color,p_quantity,p_request_id);
$$;
revoke all on function public.record_movement(text,text,text,text,text,integer,uuid) from public, anon;
grant execute on function public.record_movement(text,text,text,text,text,integer,uuid) to authenticated;
