-- Admin-editable catalog, Bambu material/color compatibility, and anonymous procurement voting.
-- Apply once after schema.sql and account-free.sql.

alter table public.rooms add column if not exists active boolean not null default true;
alter table public.rooms add column if not exists display_order integer not null default 0;
alter table public.materials add column if not exists active boolean not null default true;
alter table public.materials add column if not exists display_order integer not null default 0;
alter table public.materials add column if not exists official_url text;
alter table public.colors add column if not exists active boolean not null default true;
alter table public.colors add column if not exists display_order integer not null default 0;
alter table public.colors add column if not exists hex text not null default '#dddddd' check (hex ~ '^#[0-9a-fA-F]{6}$');
alter table public.colors add column if not exists label_ja text not null default '';
alter table public.colors add column if not exists label_en text not null default '';
alter table public.colors add column if not exists label_zh text not null default '';

update public.materials set official_url = 'https://jp.store.bambulab.com/search?q=' || replace(name,' ','%20') || '&type=product'
where name in ('PLA Basic','PLA CF','PA6-CF','PLA Silk','PLA Glow','ABS','PC','TPU') and official_url is null;

update public.colors c set hex=v.hex,label_ja=v.ja,label_en=v.en,label_zh=v.zh
from (values
('Maroon RED','#9d2235','マルーンレッド','Maroon red','栗红色'),('RED','#c12e1f','レッド','Red','红色'),('MAGENTA','#ec008c','マゼンタ','Magenta','品红色'),('Hot PINK','#f5547c','ホットピンク','Hot pink','亮粉色'),('PINK','#f55a74','ピンク','Pink','粉色'),('ORANGE','#ff6a13','オレンジ','Orange','橙色'),('Pumpkin ORANGE','#ff9016','パンプキンオレンジ','Pumpkin orange','南瓜橙'),('Sunflower YELLOW','#fec600','サンフラワーイエロー','Sunflower yellow','向日葵黄'),('YELLOW','#f4ee2a','イエロー','Yellow','黄色'),('BEIJE','#d9b69b','ベージュ','Beige','米色'),('Bright GREEN','#becb00','ブライトグリーン','Bright green','亮绿色'),('Bambu GREEN','#00ae42','バンブーグリーン','Bambu green','拓竹绿'),('GREEN','#438a3e','グリーン','Green','绿色'),('TURQUOISE','#00b1b7','ターコイズ','Turquoise','绿松石色'),('CYAN','#0086d6','シアン','Cyan','青色'),('Cobalt BLUE','#0056b8','コバルトブルー','Cobalt blue','钴蓝色'),('BLUE','#0a2989','ブルー','Blue','蓝色'),('BLUE GRAY','#5b6579','ブルーグレー','Blue gray','蓝灰色'),('Indigo PURPLE','#482960','インディゴパープル','Indigo purple','靛紫色'),('PURPLE','#6545b0','パープル','Purple','紫色'),('BROWN','#9d432c','ブラウン','Brown','棕色'),('Cocoa BROWN','#6f5034','ココアブラウン','Cocoa brown','可可棕'),('GOLD','#e4bd68','ゴールド','Gold','金色'),('SILVER','#a6a9aa','シルバー','Silver','银色'),('BRONZE','#857b48','ブロンズ','Bronze','古铜色'),('WHITE','#ffffff','ホワイト','White','白色'),('Light GRAY','#cbd0d3','ライトグレー','Light gray','浅灰色'),('GRAY','#92958b','グレー','Gray','灰色'),('Dark GRAY','#545454','ダークグレー','Dark gray','深灰色'),('BLACK','#101010','ブラック','Black','黑色'),('CLEAR','#f4f5f5','クリア','Clear','透明'),('N/A','#dddddd','該当なし（サポート）','N/A (Support)','不适用（支撑）')
) as v(name,hex,ja,en,zh) where c.name=v.name;

create table if not exists public.material_colors (
  material text not null references public.materials(name) on update cascade on delete cascade,
  color text not null references public.colors(name) on update cascade on delete cascade,
  available boolean not null default true,
  primary key(material,color)
);
insert into public.material_colors(material,color,available)
select m.name,c.name,true from public.materials m cross join public.colors c on conflict do nothing;
update public.material_colors set available=false where material in ('PLA CF','PA6-CF','PLA Silk','PLA Glow','ABS','PC','TPU','Support');
update public.material_colors set available=true where
  (material='PLA CF' and color in ('BLACK','BLUE','RED','GREEN')) or
  (material='PA6-CF' and color='BLACK') or
  (material='PLA Silk' and color in ('GOLD','SILVER','BRONZE','BLUE','PURPLE','PINK','RED','GREEN','ORANGE')) or
  (material='PLA Glow' and color in ('GREEN','YELLOW','PINK','BLUE')) or
  (material='ABS' and color in ('BLACK','WHITE','GRAY','RED','BLUE','GREEN','ORANGE','YELLOW')) or
  (material='PC' and color in ('BLACK','WHITE','CLEAR')) or
  (material='TPU' and color in ('BLACK','WHITE','GRAY','RED','BLUE','GREEN','YELLOW')) or
  (material='Support' and color='N/A');

create table if not exists public.procurement_votes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  actor uuid references auth.users(id) on delete set null,
  material text not null references public.materials(name),
  color text not null references public.colors(name),
  quantity integer not null check (quantity between 1 and 99),
  created_at timestamptz not null default now()
);
create index if not exists procurement_votes_created_at_idx on public.procurement_votes(created_at desc);
alter table public.material_colors enable row level security;
alter table public.procurement_votes enable row level security;
revoke all on public.material_colors,public.procurement_votes from anon,authenticated;
grant select on public.material_colors,public.procurement_votes to anon,authenticated;
create policy public_read_material_colors on public.material_colors for select to anon,authenticated using (true);
create policy public_read_procurement_votes on public.procurement_votes for select to anon,authenticated using (true);

create policy dragon_admin_rooms on public.rooms for all to authenticated
using (lower(coalesce(auth.jwt()->>'email','')) like '%@dragon.t.u-tokyo.ac.jp' and coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=false)
with check (lower(coalesce(auth.jwt()->>'email','')) like '%@dragon.t.u-tokyo.ac.jp' and coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=false);
create policy dragon_admin_materials on public.materials for all to authenticated
using (lower(coalesce(auth.jwt()->>'email','')) like '%@dragon.t.u-tokyo.ac.jp' and coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=false)
with check (lower(coalesce(auth.jwt()->>'email','')) like '%@dragon.t.u-tokyo.ac.jp' and coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=false);
create policy dragon_admin_colors on public.colors for all to authenticated
using (lower(coalesce(auth.jwt()->>'email','')) like '%@dragon.t.u-tokyo.ac.jp' and coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=false)
with check (lower(coalesce(auth.jwt()->>'email','')) like '%@dragon.t.u-tokyo.ac.jp' and coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=false);
create policy dragon_admin_material_colors on public.material_colors for all to authenticated
using (lower(coalesce(auth.jwt()->>'email','')) like '%@dragon.t.u-tokyo.ac.jp' and coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=false)
with check (lower(coalesce(auth.jwt()->>'email','')) like '%@dragon.t.u-tokyo.ac.jp' and coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=false);
grant insert,update,delete on public.rooms,public.materials,public.colors,public.material_colors to authenticated;

create or replace function private.submit_procurement_vote(p_material text,p_color text,p_quantity integer,p_request_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; begin
  if p_quantity is null or p_quantity not between 1 and 99 or p_request_id is null
    or not exists(select 1 from public.material_colors where material=p_material and color=p_color and available) then
    raise exception 'INVALID_VOTE' using errcode='22023';
  end if;
  select id into v_id from public.procurement_votes where request_id=p_request_id;
  if found then return v_id; end if;
  insert into public.procurement_votes(request_id,actor,material,color,quantity)
  values(p_request_id,auth.uid(),p_material,p_color,p_quantity) returning id into v_id;
  return v_id;
end $$;
revoke all on function private.submit_procurement_vote(text,text,integer,uuid) from public;
grant execute on function private.submit_procurement_vote(text,text,integer,uuid) to anon,authenticated;
create or replace function public.submit_procurement_vote(p_material text,p_color text,p_quantity integer,p_request_id uuid)
returns uuid language sql security invoker set search_path='' as $$ select private.submit_procurement_vote(p_material,p_color,p_quantity,p_request_id) $$;
revoke all on function public.submit_procurement_vote(text,text,integer,uuid) from public;
grant execute on function public.submit_procurement_vote(text,text,integer,uuid) to anon,authenticated;
