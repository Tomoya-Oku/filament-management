export const rooms = ['62C1', '72A4', '536B', '0066'] as const
export const materials = ['PLA Basic', 'PLA CF', 'PA6-CF', 'PLA Silk', 'PLA Glow', 'ABS', 'PC', 'TPU', 'UP300 PLA', 'UP300 ABS+', 'PLA+', 'ePA-CF', 'Support'] as const
export type Operation = 'add' | 'use' | 'transfer'
export type Stock = { room: string; material: string; color: string; quantity: number }
export type Movement = { id: string; kind: Operation; room: string; destination: string | null; material: string; color: string; quantity: number; created_at: string }
export type Entry = { kind: Operation; room: string; destination: string; material: string; color: string; quantity: number }
export type Color = { id: string; hex: string; ja: string; en: string; zh: string; image: string | null }
const color = (id: string, hex: string, ja: string, en: string, zh: string): Color => ({ id, hex, ja, en, zh, image: id === 'N/A' || id === 'CLEAR' ? null : '/images/bambu-pla-basic-spool.png' })
// The official spool photo is shared; the separate swatch identifies the color without recoloring the manufacturer's photograph.
export const colors: Color[] = [
  color('Maroon RED','#9d2235','マルーンレッド','Maroon red','栗红色'),
  color('RED','#c12e1f','レッド','Red','红色'),
  color('MAGENTA','#ec008c','マゼンタ','Magenta','品红色'),
  color('Hot PINK','#f5547c','ホットピンク','Hot pink','亮粉色'),
  color('PINK','#f55a74','ピンク','Pink','粉色'),
  color('ORANGE','#ff6a13','オレンジ','Orange','橙色'),
  color('Pumpkin ORANGE','#ff9016','パンプキンオレンジ','Pumpkin orange','南瓜橙'),
  color('Sunflower YELLOW','#fec600','サンフラワーイエロー','Sunflower yellow','向日葵黄'),
  color('YELLOW','#f4ee2a','イエロー','Yellow','黄色'),
  color('BEIJE','#d9b69b','ベージュ','Beige','米色'),
  color('Bright GREEN','#becb00','ブライトグリーン','Bright green','亮绿色'),
  color('Bambu GREEN','#00ae42','バンブーグリーン','Bambu green','拓竹绿'),
  color('GREEN','#438a3e','グリーン','Green','绿色'),
  color('TURQUOISE','#00b1b7','ターコイズ','Turquoise','绿松石色'),
  color('CYAN','#0086d6','シアン','Cyan','青色'),
  color('Cobalt BLUE','#0056b8','コバルトブルー','Cobalt blue','钴蓝色'),
  color('BLUE','#0a2989','ブルー','Blue','蓝色'),
  color('BLUE GRAY','#5b6579','ブルーグレー','Blue gray','蓝灰色'),
  color('Indigo PURPLE','#482960','インディゴパープル','Indigo purple','靛紫色'),
  color('PURPLE','#6545b0','パープル','Purple','紫色'),
  color('BROWN','#9d432c','ブラウン','Brown','棕色'),
  color('Cocoa BROWN','#6f5034','ココアブラウン','Cocoa brown','可可棕'),
  color('GOLD','#e4bd68','ゴールド','Gold','金色'),
  color('SILVER','#a6a9aa','シルバー','Silver','银色'),
  color('BRONZE','#857b48','ブロンズ','Bronze','古铜色'),
  color('WHITE','#ffffff','ホワイト','White','白色'),
  color('Light GRAY','#cbd0d3','ライトグレー','Light gray','浅灰色'),
  color('GRAY','#92958b','グレー','Gray','灰色'),
  color('Dark GRAY','#545454','ダークグレー','Dark gray','深灰色'),
  color('BLACK','#101010','ブラック','Black','黑色'),
  color('CLEAR','#f4f5f5','クリア','Clear','透明'),
  color('N/A','#dddddd','該当なし（サポート）','N/A (Support)','不适用（支撑）'),
]
export const sheetUrl = 'https://docs.google.com/spreadsheets/d/1X_AY94A3bmVuqEtZS31nuR3lj3thFaq8-rW4c_TqAyI/edit?gid=46801638#gid=46801638'
export const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSevSuhVjXQx09PCKcCK8fSJb2ck4LihBtQv0ckAknoDnyKnmw/viewform'
export const officialUrl = 'https://jp.store.bambulab.com/products/pla-basic-filament'
