export const rooms = ['62C1', '72A4', '536B', '0066'] as const
export const materials = ['PLA Basic', 'PLA CF', 'PA6-CF', 'PLA Silk', 'PLA Glow', 'ABS', 'PC', 'TPU', 'UP300 PLA', 'UP300 ABS+', 'PLA+', 'ePA-CF', 'Support'] as const
export type Operation = 'add' | 'use' | 'transfer'
export type Stock = { room: string; material: string; color: string; quantity: number }
export type Movement = { id: string; kind: Operation; room: string; destination: string | null; material: string; color: string; quantity: number; created_at: string }
export type Entry = { kind: Operation; room: string; destination: string; material: string; color: string; quantity: number }
export type Color = { id: string; hex: string; ja: string; en: string; zh: string; image: string | null }
const cdn = 'https://store.bblcdn.com/s6/default/'
const color = (id: string, hex: string, ja: string, en: string, zh: string, image: string | null): Color => ({ id, hex, ja, en, zh, image: image ? cdn + image : null })
// Official Bambu PLA Basic photographs are color references, not a claim that every material has every color.
export const colors: Color[] = [
  color('Maroon RED','#9d2235','マルーンレッド','Maroon red','栗红色','246e449c29a64d8e93c07f3ac46735c6/MaroonRed.jpg'),
  color('RED','#c12e1f','レッド','Red','红色','2844052efef94e5c89f42821a3fce548/Red.jpg'),
  color('MAGENTA','#ec008c','マゼンタ','Magenta','品红色','9c7667888227416eaf935330951fb99c/Magenta.jpg'),
  color('Hot PINK','#f5547c','ホットピンク','Hot pink','亮粉色','df36f81e12474d3a9a1d00aa7f10b7db/HotPink.jpg'),
  color('PINK','#f55a74','ピンク','Pink','粉色','634b9c83e8fe495e8fb887611563c6e4/Pink.jpg'),
  color('ORANGE','#ff6a13','オレンジ','Orange','橙色','7c26ef9837be45868745f020f23802fb/Orange_20e2a5a4-72b3-49fa-848f-0154c25305f7.jpg'),
  color('Pumpkin ORANGE','#ff9016','パンプキンオレンジ','Pumpkin orange','南瓜橙','819e72f6f2d546108d46e70fb5e3f355/PumpkinOrange.jpg'),
  color('Sunflower YELLOW','#fec600','サンフラワーイエロー','Sunflower yellow','向日葵黄','ee2fe91fac5c40cbbf9c61b70fa541e6/SunflowerYellow.jpg'),
  color('YELLOW','#f4ee2a','イエロー','Yellow','黄色','1bee8db3e9db49c68f149f382dd9445e/Yellow.jpg'),
  color('BEIJE','#d9b69b','ベージュ','Beige','米色','b5ee36c03d6747b48b082ab599c051ed/PLABasicBeige.png'),
  color('Bright GREEN','#becb00','ブライトグリーン','Bright green','亮绿色','c9f183a7711c482ba1104971bca3337c/BrightGreen.jpg'),
  color('Bambu GREEN','#00ae42','バンブーグリーン','Bambu green','拓竹绿','0099ecc76bbe4826a7ed131a33e3098c/Bambu_Green.jpg'),
  color('GREEN','#438a3e','グリーン','Green','绿色','8d05699a01cc473dac5270be90181595/063c3c25cb6510ea2566af540e5e3c99_1800x1800_452c9e09-f37a-4874-a57f-a70c3861d0fb.webp'),
  color('TURQUOISE','#00b1b7','ターコイズ','Turquoise','绿松石色','e6ef3117a6944cfbbffd90cd037e89d5/Turquoise.jpg'),
  color('CYAN','#0086d6','シアン','Cyan','青色','b5a4be8614db4eb3a90c544383024f42/CMYK-Cyan-1_bc42ed85-49a0-4c87-b57a-0932aa62beea.webp'),
  color('Cobalt BLUE','#0056b8','コバルトブルー','Cobalt blue','钴蓝色','1a628ecb49c04693aa6bf3129333ee70/CobaltBlue.jpg'),
  color('BLUE','#0a2989','ブルー','Blue','蓝色','668eb537d7374f83aed5436fecce6e88/PLABasicBlue.jpg'),
  color('BLUE GRAY','#5b6579','ブルーグレー','Blue gray','蓝灰色','4e1f975b562c42229d2763e2683483c0/PLA-Basic_Blue-Gray.png'),
  color('Indigo PURPLE','#482960','インディゴパープル','Indigo purple','靛紫色','22e8c2b97eaf4729b8e9186817bd3aa6/IndigoPurple.jpg'),
  color('PURPLE','#6545b0','パープル','Purple','紫色','4881a5d5bc684ea98586d4df5c67403a/PLAbasic-Purple.jpg'),
  color('BROWN','#9d432c','ブラウン','Brown','棕色','c7886bfbc54b4d63bb21340255517137/PLA-Basic_Brown.png'),
  color('Cocoa BROWN','#6f5034','ココアブラウン','Cocoa brown','可可棕','83bb02b3f09545eb8913837109460b8b/CocoaBrown.jpg'),
  color('GOLD','#e4bd68','ゴールド','Gold','金色','93d640ea566943489176c67a75f3ad0c/Gold.jpg'),
  color('SILVER','#a6a9aa','シルバー','Silver','银色','83e517be1f2b449b9babbf0b82413bbf/Sliver.jpg'),
  color('BRONZE','#857b48','ブロンズ','Bronze','古铜色','8f55b14b034a4964b06151857d624130/Bronze.jpg'),
  color('WHITE','#ffffff','ホワイト','White','白色','1fe6f5252f1d4f7cbf67ec6a32e56acc/PLA_Basic.jpg'),
  color('Light GRAY','#cbd0d3','ライトグレー','Light gray','浅灰色','93fe0bab85a54fc48aed64f7a94794dd/light_gray_pla_basic.jpg'),
  color('GRAY','#92958b','グレー','Gray','灰色','2e2aca4a712544cdbc818d89a6c55b29/PLA-Basic_Gray.png'),
  color('Dark GRAY','#545454','ダークグレー','Dark gray','深灰色','59c2b06786e84383a7f45dfd8a2e3c81/pla_basic-dark_grey.jpg'),
  color('BLACK','#101010','ブラック','Black','黑色','65ef8439faf84461b9bbff482fd8bb9c/PLA-Basic_Black_e33768fd-c87a-4b2d-a3f7-0b3afc81f13f.png'),
  color('CLEAR','#f4f5f5','クリア','Clear','透明',null),
  color('N/A','#dddddd','該当なし（サポート）','N/A (Support)','不适用（支撑）',null),
]
export const sheetUrl = 'https://docs.google.com/spreadsheets/d/1X_AY94A3bmVuqEtZS31nuR3lj3thFaq8-rW4c_TqAyI/edit?gid=46801638#gid=46801638'
export const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSevSuhVjXQx09PCKcCK8fSJb2ck4LihBtQv0ckAknoDnyKnmw/viewform'
export const officialUrl = 'https://jp.store.bambulab.com/products/pla-basic-filament'
