# FILAGON

研究室のフィラメント（スプール）を、居室・材料・色ごとに共有管理するWebアプリです。

- 本番: https://dragon-lab-filament-management.vercel.app
- React + TypeScript + Vite + Tailwind CSS
- Supabase: 東京リージョン。Postgres + RLS + REST API
- 日本語・英語・簡体字中国語。ブラウザーの言語で初期選択し、手動設定を保存
- ホーム、在庫管理表、在庫追加、使い切り、居室間移動、直近の操作履歴
- 初期値: 居室 `62C1`、材料 `PLA Basic`、数量 `1`。色と移動先は明示選択
- 居室: `62C1` / `72A4` / `536B` / `0066`。材料13種類、色32種類
- 初期在庫は0。実数を「フィラメント在庫追加」から登録してください

## ローカル起動

Node.js 24を推奨します。

```sh
npm ci
```

`.env.example`を参考に`.env.local`へ次の設定を保存します。接続済み環境には設定済みです。キーをコミット・ログ出力しないでください。

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

フロントエンドに設定するのはSupabaseの**publishable keyのみ**です。service roleやsecret keyは使用しません。

```sh
npm run dev
npm run build
npm test
```

## 利用方法

アカウント登録・ログインなしで在庫表と3種類のフォームを利用する構成です。インターネット上の利用者が、URLや公開APIを通じて在庫と操作履歴を閲覧し、在庫を変更できます。テーブルの直接更新は許可せず、入力検証付きの登録処理だけを公開します。

匿名アクセスを有効にする変更は`supabase/account-free.sql`です。

## データベース

新規環境では`supabase/schema.sql`、続けて`supabase/account-free.sql`の順で適用します。既存プロジェクトに再実行しないでください。初期スキーマのマイグレーション名は`create_filament_inventory`、匿名アクセス対応は`enable_account_free_inventory`です。

- `rooms` / `materials` / `colors`: マスター
- `lab_members`: 初期スキーマの互換用テーブル。アカウント不要の運用では使用しません
- `stock`: 居室・材料・色ごとの非負整数在庫
- `movements`: 数量・移動先・日時・リクエストIDを記録する履歴。匿名操作の変更者は空欄

変更処理は`public.record_movement`から、非公開スキーマ内の関数へ委譲し、在庫更新と履歴の追加を同一トランザクションで行います。API利用者によるテーブルへの直接書き込みは許可していません。在庫不足・同じ居室への移動・無効な材料／色・0以下や999超の数量を拒否します。Supportの色はN/Aに限定します。

同時更新を短いDBロックで直列化し、リクエストUUIDで二重送信を防ぎます。通信失敗後の同じ内容の再送は同じUUIDを使用します。別の内容で同じUUIDを使うと拒否されます。

`supabase/tests.sql`は匿名ロールで追加・使い切り・移動・合計保持・二重送信・在庫不足・直接更新禁止を検証し、全変更をロールバックします。空の専用テスト環境向けです。

## Google Sheets・Google Formsとの関係

ホームには指定されたGoogle Sheetsへのリンク、フッターには従来のGoogle Formへのリンクがあります。

**SupabaseとGoogle Sheetsは自動同期しません。** 今後このアプリで入力したデータはSupabaseだけに保存されます。Google Formからの回答もSupabaseには自動反映されません。運用開始後の入力先は、このアプリに統一してください。

参照フォームから居室・材料・色・数量の構成を確認済みです。元の綴り`BEIJE`はデータ互換性のため内部IDに残し、画面には「ベージュ」と表示します。添付画像にありフォームにはなかった`BRONZE`も追加しています。

## 公式画像

`public/images/SOURCES.md`に出典を記載しています。現在はBambu公式の**共通スプール写真＋色見本**です。全色の個別スプール写真は未確認です。写真を着色して個別商品の写真に見せる加工は行っていません。

画像はアプリから配信し、遅延読み込みを使います。外部CDNへの接続なしで表示できます。外部フォント、UIライブラリ、ルーター、Supabase SDKは追加していません。

## Vercelデプロイ

プロジェクト: `dragon-lab-filament-management` / チーム: `OKTM Industries`。ReactのビルドはVercel上でも成功し、本番デプロイはREADYです。

今回、コネクターにはプロジェクト環境変数の作成権限がなく（403）、GitHub連携も未インストールでした。そのためソースを直接アップロードし、Git管理外の`.env.production`として**ブラウザー公開用の接続設定だけ**をビルドに渡しました。DBの秘密鍵は使っていません。

今後の自動デプロイには、Vercelの管理画面で次を設定してください。

1. [GitHub連携](https://vercel.com/docs/git/vercel-for-github)で`Tomoya-Oku/filament-management`を接続
2. [プロジェクト設定](https://vercel.com/oktm-industries/dragon-lab-filament-management/settings)に`VITE_SUPABASE_URL`と`VITE_SUPABASE_PUBLISHABLE_KEY`を設定
3. Framework: Vite / Build: `npm run build` / Output: `dist` / Node.js: 24.x

今回のGit pushだけでは再デプロイされません。認証済みCLIを使う場合は、同じプロジェクトにリンクして`vercel --prod --scope oktm-industries`でデプロイできます。キーをコマンド引数に含めないでください。

## 確認結果と制限

- TypeScriptの型検査・本番ビルド・入力検証テストが成功
- 実Supabase上のDBテストが成功。セキュリティアドバイザーの指摘0件
- 1440px／390pxでホームとフォーム・在庫表を検証。3言語切り替え、在庫不足、登録確認、居室・材料フィルターを確認
- ブラウザーのフォーム検証には通信を差し替えたテストデータを使用
- 本番URLはHTTP 200、CSPとnosniffヘッダーを確認
- 同時リクエストの負荷試験、iOS Safari・Android実機、バックアップ復元、Google Sheetsの初期データ移行は未実施
- 認証セッションやパスワードの保存は不要

コミットは作業単位でGitHubのmainへプッシュ済みです。
