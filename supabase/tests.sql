-- Runs against the dedicated project's schema. Everything is rolled back.
begin;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$
declare v_id uuid; v_repeat uuid; v_sum integer; v_count integer;
begin
  v_id := public.record_movement('add','62C1',null,'PLA Basic','BLACK',3,'00000000-0000-4000-8000-000000000002');
  v_repeat := public.record_movement('add','62C1',null,'PLA Basic','BLACK',3,'00000000-0000-4000-8000-000000000002');
  if v_id <> v_repeat then raise exception 'idempotency failed'; end if;
  perform public.record_movement('transfer','62C1','0066','PLA Basic','BLACK',2,gen_random_uuid());
  select sum(quantity) into v_sum from public.stock where material = 'PLA Basic' and color = 'BLACK';
  if v_sum <> 3 then raise exception 'transfer changed total'; end if;
  perform public.record_movement('use','0066',null,'PLA Basic','BLACK',1,gen_random_uuid());
  select sum(quantity) into v_sum from public.stock where material = 'PLA Basic' and color = 'BLACK';
  if v_sum <> 2 then raise exception 'use failed'; end if;
  begin
    perform public.record_movement('use','62C1',null,'PLA Basic','BLACK',10,gen_random_uuid());
    raise exception 'insufficient stock accepted';
  exception when raise_exception then
    if sqlerrm <> 'INSUFFICIENT_STOCK' then raise; end if;
  end;
  begin
    perform public.record_movement('transfer','62C1','62C1','PLA Basic','BLACK',1,gen_random_uuid());
    raise exception 'same-room transfer accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.record_movement('add','62C1',null,'Support','BLACK',1,gen_random_uuid());
    raise exception 'invalid support color accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.record_movement('add','62C1',null,'PLA Basic','BLACK',4,'00000000-0000-4000-8000-000000000002');
    raise exception 'conflicting request accepted';
  exception when invalid_parameter_value then null; end;
  begin
    update public.stock set quantity = 500 where room = '62C1';
    raise exception 'direct write accepted';
  exception when insufficient_privilege then null; end;
  select count(*) into v_count from public.movements;
  if v_count <> 3 then raise exception 'failed operations leaked into history'; end if;
end $$;
reset role;
rollback;
