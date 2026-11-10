-- Account-free shared inventory, explicitly requested by the lab owner.
-- Only validated RPC writes are permitted; direct table writes remain denied.
alter table public.movements alter column actor drop not null;
grant usage on schema private to anon;
grant select on public.rooms, public.materials, public.colors, public.stock to anon;
revoke select on public.movements from authenticated;
grant select (id,request_id,kind,room,destination,material,color,quantity,created_at) on public.movements to anon,authenticated;
alter policy members_read_rooms on public.rooms to anon,authenticated using (true);
alter policy members_read_materials on public.materials to anon,authenticated using (true);
alter policy members_read_colors on public.colors to anon,authenticated using (true);
alter policy members_read_stock on public.stock to anon,authenticated using (true);
alter policy members_read_movements on public.movements to anon,authenticated using (true);

create or replace function private.record_movement(
  p_kind text, p_room text, p_destination text, p_material text, p_color text, p_quantity integer, p_request_id uuid
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_actor uuid := auth.uid();
  v_previous public.movements%rowtype;
  v_id uuid;
begin
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
    if v_previous.actor is not distinct from v_actor and v_previous.kind = p_kind and v_previous.room = p_room
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

grant execute on function private.record_movement(text,text,text,text,text,integer,uuid) to anon;
grant execute on function public.record_movement(text,text,text,text,text,integer,uuid) to anon;
