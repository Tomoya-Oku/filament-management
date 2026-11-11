export type Language = 'ja' | 'en' | 'zh'

const ja = {
  home:'ホーム', inventory:'在庫管理表', procurement:'調達アンケート', admin:'管理者', forms:'入力フォーム',
  add:'在庫追加', use:'使い切り', transfer:'移動',
  room:'居室', from:'移動元の居室', to:'移動先の居室', material:'フィラメントの種類', quantity:'数量（スプール）', color:'カラー',
  search:'色名で検索', submit:'内容を確認', confirm:'この内容で登録する', cancel:'修正', confirmTitle:'登録内容の確認', busy:'登録しています…',
  colorHelp:'大きな色見本から選択してください。実際の色は素材や製造ロットにより異なる場合があります。', notConfigured:'接続設定がありません。',
  success:'登録しました。在庫に反映されています。', next:'続けて入力', viewStock:'在庫を確認',
  selectColor:'カラーを選択してください。', chooseTo:'移動先を選択', sameRoom:'移動元と移動先は別の居室を選択してください。', invalidQuantity:'数量は1〜999の整数で入力してください。', invalidCombination:'この種類とカラーの組み合わせはBambu公式では販売されていません。',
  insufficient:'在庫が不足しています。最新の在庫数を確認してください。', available:'現在の在庫', spools:'個', selectedColor:'選択中のカラー',
  all:'全居室', allMaterials:'すべての種類', inStock:'在庫がある色のみ', total:'合計', noStock:'在庫はまだ登録されていません。',
  updated:'取得日時', refresh:'更新', loading:'読み込み中…', error:'通信に失敗しました。接続を確認して再度お試しください。', retry:'再試行',
  signIn:'ログイン', signOut:'ログアウト', signedOut:'未ログイン', email:'メールアドレス', password:'パスワード', loginTitle:'管理者ログイン', loginHelp:'通常の在庫管理はログイン不要です。管理者ページは @dragon.t.u-tokyo.ac.jp のアカウントのみ利用できます。', loginError:'ログインできませんでした。メールアドレスとパスワードを確認してください。', loginBusy:'ログイン中…',
  history:'最近の操作', noHistory:'操作履歴はまだありません。', back:'ホームに戻る', official:'Bambu公式で見る', supportHelp:'Supportのカラーは「該当なし」に固定されます。', confirmationHelp:'送信すると研究室の共有在庫に反映されます。',
  procurementTitle:'次に購入してほしいフィラメント', procurementHelp:'希望する種類・カラー・数量を投票できます。', vote:'投票する', voted:'投票を受け付けました。', surveyResults:'現在の希望',
  adminTitle:'マスターデータ管理', adminHelp:'居室、種類、カラー、公式の組み合わせを変更できます。', adminOnly:'管理者権限がありません。@dragon.t.u-tokyo.ac.jp のアカウントでログインしてください。', addItem:'追加', deactivate:'無効化', combinations:'公式の組み合わせ', availableCombination:'入力可能', unavailable:'取扱なし',
  language:'表示言語', purchase:'購入ページ',
  notifications:'通知', lowStock:'在庫低下', remaining:'残り', newRecord:'新しい記録', scanner:'カラー判定', experimental:'試験的機能', startCamera:'カメラを開始', stopCamera:'カメラを停止', cameraHelp:'中央の枠内にフィラメントを映してください。候補から最も近い色を端末上で判定します。', closestColor:'最も近いカラー', cameraError:'カメラを利用できません。ブラウザーのカメラ許可とHTTPS接続を確認してください。', setQuantity:'値を変更', updateStock:'在庫を更新', continue:'続行', close:'閉じる', action:'操作',
} as const

type Copy = { [K in keyof typeof ja]: string }

const en: Copy = {
  home:'Home', inventory:'Inventory', procurement:'Procurement survey', admin:'Admin', forms:'Entry forms', add:'Add stock', use:'Use up', transfer:'Move', room:'Room', from:'From room', to:'To room', material:'Filament type', quantity:'Quantity (spools)', color:'Color', search:'Search colors', submit:'Review entry', confirm:'Confirm and save', cancel:'Edit', confirmTitle:'Review your entry', busy:'Saving…', colorHelp:'Choose from the large color swatches. Appearance can vary by material and production lot.', notConfigured:'Connection is not configured.', success:'Saved. Inventory is up to date.', next:'Add another', viewStock:'View inventory', selectColor:'Select a color.', chooseTo:'Select destination', sameRoom:'Choose different source and destination rooms.', invalidQuantity:'Enter a whole number from 1 to 999.', invalidCombination:'Bambu does not offer this material and color combination.', insufficient:'Not enough stock. Check the latest inventory.', available:'Available', spools:'spools', selectedColor:'Selected color', all:'All rooms', allMaterials:'All types', inStock:'Only colors in stock', total:'Total', noStock:'No stock has been recorded yet.', updated:'Retrieved', refresh:'Refresh', loading:'Loading…', error:'Connection failed. Check your connection and try again.', retry:'Try again', signIn:'Sign in', signOut:'Sign out', signedOut:'Signed out', email:'Email', password:'Password', loginTitle:'Administrator sign in', loginHelp:'Inventory is available without signing in. Admin is limited to @dragon.t.u-tokyo.ac.jp accounts.', loginError:'Sign-in failed. Check your email and password.', loginBusy:'Signing in…', history:'Recent activity', noHistory:'No activity yet.', back:'Back to home', official:'View on Bambu', supportHelp:'Support filament uses “N/A” as its color.', confirmationHelp:'Saving updates the shared lab inventory.', procurementTitle:'Filament requested for the next order', procurementHelp:'Vote for a filament type, color, and quantity.', vote:'Vote', voted:'Your vote was recorded.', surveyResults:'Current requests', adminTitle:'Master data', adminHelp:'Manage rooms, filament types, colors, and official combinations.', adminOnly:'Administrator access required. Sign in with an @dragon.t.u-tokyo.ac.jp account.', addItem:'Add', deactivate:'Deactivate', combinations:'Official combinations', availableCombination:'Enabled', unavailable:'Not offered', language:'Language', purchase:'Purchase page', notifications:'Notifications', lowStock:'Low stock', remaining:'remaining', newRecord:'New record', scanner:'Color scanner', experimental:'Experimental', startCamera:'Start camera', stopCamera:'Stop camera', cameraHelp:'Place the filament inside the center frame. The closest catalog color is identified on this device.', closestColor:'Closest color', cameraError:'Camera is unavailable. Check camera permission and use an HTTPS connection.', setQuantity:'Set quantity', updateStock:'Update stock', continue:'Continue', close:'Close', action:'Action',
}

const zh: Copy = {
  home:'首页', inventory:'库存管理表', procurement:'采购问卷', admin:'管理员', forms:'录入表单', add:'添加库存', use:'用尽', transfer:'转移', room:'房间', from:'来源房间', to:'目标房间', material:'耗材类型', quantity:'数量（卷）', color:'颜色', search:'搜索颜色', submit:'确认内容', confirm:'确认并保存', cancel:'修改', confirmTitle:'确认录入内容', busy:'正在保存…', colorHelp:'请从大色卡中选择。实际颜色可能因材料和生产批次而异。', notConfigured:'尚未配置连接。', success:'保存成功，库存已更新。', next:'继续录入', viewStock:'查看库存', selectColor:'请选择颜色。', chooseTo:'选择目标房间', sameRoom:'来源房间和目标房间不能相同。', invalidQuantity:'请输入1至999之间的整数。', invalidCombination:'拓竹官方未提供此材料和颜色组合。', insufficient:'库存不足，请查看最新库存。', available:'当前库存', spools:'卷', selectedColor:'已选颜色', all:'所有房间', allMaterials:'所有类型', inStock:'仅显示有库存的颜色', total:'合计', noStock:'尚未录入库存。', updated:'获取时间', refresh:'刷新', loading:'加载中…', error:'连接失败，请检查网络后重试。', retry:'重试', signIn:'登录', signOut:'退出', signedOut:'未登录', email:'电子邮箱', password:'密码', loginTitle:'管理员登录', loginHelp:'普通库存管理无需登录。管理员页面仅限 @dragon.t.u-tokyo.ac.jp 账号。', loginError:'登录失败，请检查邮箱和密码。', loginBusy:'正在登录…', history:'最近操作', noHistory:'暂无操作记录。', back:'返回首页', official:'在拓竹官网查看', supportHelp:'支撑材料的颜色固定为“不适用”。', confirmationHelp:'保存后将更新实验室共享库存。', procurementTitle:'下次希望采购的耗材', procurementHelp:'可投票选择耗材类型、颜色和数量。', vote:'投票', voted:'投票已记录。', surveyResults:'当前需求', adminTitle:'主数据管理', adminHelp:'管理房间、耗材类型、颜色和官方组合。', adminOnly:'需要管理员权限。请使用 @dragon.t.u-tokyo.ac.jp 账号登录。', addItem:'添加', deactivate:'停用', combinations:'官方组合', availableCombination:'可录入', unavailable:'无此产品', language:'显示语言', purchase:'购买页面', notifications:'通知', lowStock:'库存不足', remaining:'剩余', newRecord:'新记录', scanner:'颜色识别', experimental:'实验功能', startCamera:'启动相机', stopCamera:'停止相机', cameraHelp:'请将耗材放在中央框内。系统会在设备上识别最接近的候选颜色。', closestColor:'最接近的颜色', cameraError:'无法使用相机。请检查相机权限并使用HTTPS连接。', setQuantity:'修改数量', updateStock:'更新库存', continue:'继续', close:'关闭', action:'操作',
}

export const translations = { ja, en, zh }

export function detectLanguage(): Language {
  const saved = localStorage.getItem('filament-language')
  if (saved === 'ja' || saved === 'en' || saved === 'zh') return saved
  return 'en'
}

export type Text = Copy
