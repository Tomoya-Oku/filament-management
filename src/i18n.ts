export type Language = 'ja' | 'en' | 'zh'
const ja = {
  home:'ホーム', inventory:'在庫管理表', forms:'入力フォーム',
  headline:'フィラメントを、スムーズに管理。', intro:'研究室の3Dプリンター用フィラメントの在庫を、追加・使い切り・居室間の移動まで、シンプルに記録・管理できます。',
  inventoryDesc:'全居室のフィラメント在庫を確認', sheets:'Google Sheetsで開く', originalForm:'従来のGoogleフォーム',
  add:'フィラメント在庫追加', use:'フィラメント使い切り', transfer:'フィラメント居室間移動',
  addDesc:'新しいフィラメントを在庫に追加します。', useDesc:'フィラメントを使い切ったことを記録します。', transferDesc:'フィラメントを別の居室へ移動したことを記録します。',
  room:'居室', from:'移動元の居室', to:'移動先の居室', material:'材料（マテリアル）', quantity:'数量（スプール）', color:'カラー',
  colorHelp:'Bambu公式のPLA Basic画像を色の参考として表示しています。素材によって実際の色・外観が異なります。', search:'色名で検索',
  submit:'内容を確認', confirm:'この内容で登録する', cancel:'戻って修正', confirmTitle:'登録内容の確認', busy:'登録しています…',
  success:'登録しました。在庫に反映されています。', next:'続けて入力', viewStock:'在庫を確認',
  selectColor:'カラーを選択してください。', chooseTo:'移動先を選択', sameRoom:'移動元と移動先は別の居室を選択してください。', invalidQuantity:'数量は1〜999の整数で入力してください。',
  insufficient:'在庫が不足しています。最新の在庫数を確認してください。', available:'現在の在庫', spools:'個',
  all:'全居室', allMaterials:'すべての材料', inStock:'在庫がある色のみ', total:'合計', noStock:'在庫はまだ登録されていません。実数を「在庫追加」から登録してください。',
  updated:'取得日時', refresh:'更新', loading:'読み込み中…', error:'通信に失敗しました。接続を確認して再度お試しください。', retry:'再試行',
  signIn:'ログイン', signOut:'ログアウト', email:'メールアドレス', password:'パスワード',
  loginTitle:'研究室の在庫にアクセス', loginHelp:'管理者が登録した研究室メンバーのアカウントでログインしてください。', loginError:'ログインできませんでした。メールアドレスとパスワードを確認してください。',
  memberOnly:'在庫の閲覧・変更は研究室メンバー限定です。管理者へアカウント登録をご依頼ください。',
  notMember:'このアカウントには研究室の利用権限がありません。管理者にご連絡ください。', sessionExpired:'ログインの有効期限が切れました。もう一度ログインしてください。',
  notConfigured:'接続設定がありません。管理者にご連絡ください。', history:'最近の操作', noHistory:'操作履歴はまだありません。',
  back:'ホームに戻る', official:'画像出典：Bambu Lab公式ストア', noImage:'色見本', supportHelp:'Supportのカラーは「該当なし」に固定されます。',
  footer:'研究室で共有する、小さな在庫管理。', loginBusy:'ログイン中…', readOnly:'未ログイン', confirmationHelp:'送信すると研究室の共有在庫に反映されます。',
} as const
type Copy = { [K in keyof typeof ja]: string }
const en: Copy = {
  home:'Home', inventory:'Inventory', forms:'Entry forms', headline:'Filament, simply managed.', intro:'Keep track of the lab’s 3D printing filament. Record new stock, used-up spools, and transfers between rooms in one place.', inventoryDesc:'Check filament stock across all rooms', sheets:'Open in Google Sheets', originalForm:'Original Google Form',
  add:'Add filament stock',use:'Use up filament',transfer:'Transfer between rooms',addDesc:'Add new filament spools to the inventory.',useDesc:'Record filament spools that have been used up.',transferDesc:'Record filament moved to another room.',
  room:'Room',from:'From room',to:'To room',material:'Material',quantity:'Quantity (spools)',color:'Color',colorHelp:'Official Bambu PLA Basic photos are color references. Actual appearance varies by material.',search:'Search colors',
  submit:'Review entry',confirm:'Confirm and save',cancel:'Back to edit',confirmTitle:'Review your entry',busy:'Saving…',success:'Saved. The inventory has been updated.',next:'Add another entry',viewStock:'View inventory',selectColor:'Please select a color.',chooseTo:'Select destination',sameRoom:'Please choose different source and destination rooms.',invalidQuantity:'Enter a whole number from 1 to 999.',insufficient:'Not enough stock. Please check the latest inventory.',available:'Available stock',spools:'spools',
  all:'All rooms',allMaterials:'All materials',inStock:'Only colors in stock',total:'Total',noStock:'No stock recorded yet. Add the actual quantities using “Add filament stock”.',updated:'Retrieved',refresh:'Refresh',loading:'Loading…',error:'Connection failed. Check your connection and try again.',retry:'Try again',
  signIn:'Sign in',signOut:'Sign out',email:'Email',password:'Password',loginTitle:'Access the lab inventory',loginHelp:'Sign in with the lab member account registered by your administrator.',loginError:'Sign-in failed. Check your email and password.',memberOnly:'Inventory is available to lab members. Ask your administrator to register an account.',notMember:'This account does not have lab access. Please contact your administrator.',sessionExpired:'Your session has expired. Please sign in again.',notConfigured:'Connection is not configured. Please contact your administrator.',history:'Recent activity',noHistory:'No activity yet.',back:'Back to home',official:'Photos: Bambu Lab official store',noImage:'Color swatch',supportHelp:'Support filament uses “N/A (Support)” as its color.',footer:'A small inventory, shared by the lab.',loginBusy:'Signing in…',readOnly:'Signed out',confirmationHelp:'Saving this entry updates the lab’s shared inventory.',
}
const zh: Copy = {
  home:'首页',inventory:'库存管理表',forms:'录入表单',headline:'轻松管理每一卷耗材。',intro:'集中记录实验室3D打印耗材的入库、用尽和房间间转移，让库存管理更简单。',inventoryDesc:'查看所有房间的耗材库存',sheets:'在Google Sheets中打开',originalForm:'原Google表单',
  add:'添加耗材库存',use:'耗材用尽',transfer:'房间间转移耗材',addDesc:'将新的耗材卷添加到库存。',useDesc:'记录已用尽的耗材卷。',transferDesc:'记录转移到其他房间的耗材。',
  room:'房间',from:'来源房间',to:'目标房间',material:'材料',quantity:'数量（卷）',color:'颜色',colorHelp:'拓竹官方PLA Basic图片仅供颜色参考。不同材料的实际颜色和外观可能不同。',search:'搜索颜色',submit:'确认内容',confirm:'确认并保存',cancel:'返回修改',confirmTitle:'确认录入内容',busy:'正在保存…',success:'保存成功，库存已更新。',next:'继续录入',viewStock:'查看库存',selectColor:'请选择颜色。',chooseTo:'选择目标房间',sameRoom:'来源房间和目标房间不能相同。',invalidQuantity:'请输入1至999之间的整数。',insufficient:'库存不足，请查看最新库存。',available:'当前库存',spools:'卷',
  all:'所有房间',allMaterials:'所有材料',inStock:'仅显示有库存的颜色',total:'合计',noStock:'尚未录入库存，请通过“添加耗材库存”登记实际数量。',updated:'获取时间',refresh:'刷新',loading:'加载中…',error:'连接失败，请检查网络后重试。',retry:'重试',signIn:'登录',signOut:'退出',email:'电子邮箱',password:'密码',loginTitle:'访问实验室库存',loginHelp:'请使用管理员登记的实验室成员账号登录。',loginError:'登录失败，请检查邮箱和密码。',memberOnly:'库存仅供实验室成员查看和修改，请联系管理员注册账号。',notMember:'此账号没有实验室访问权限，请联系管理员。',sessionExpired:'登录已过期，请重新登录。',notConfigured:'尚未配置连接，请联系管理员。',history:'最近操作',noHistory:'暂无操作记录。',back:'返回首页',official:'图片来源：拓竹官方商店',noImage:'色卡',supportHelp:'支撑材料的颜色固定为“不适用（支撑）”。',footer:'实验室共享的轻量库存管理。',loginBusy:'正在登录…',readOnly:'未登录',confirmationHelp:'保存后将更新实验室的共享库存。',
}
export const translations = { ja, en, zh }
export function detectLanguage(): Language {
  const saved = localStorage.getItem('dragon-language')
  if (saved === 'ja' || saved === 'en' || saved === 'zh') return saved
  for (const value of navigator.languages) {
    const code = value.split('-')[0]
    if (code === 'ja' || code === 'en' || code === 'zh') return code
  }
  return 'en'
}
export type Text = Copy
