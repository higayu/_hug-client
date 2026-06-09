# Redux Store Spec

このディレクトリは、Chrome 埋め込み画面の Redux Toolkit store を管理する。

## Entry

- `index.js`: `configureStore` で store を作成する入口。
- `rootReducer.js`: 各 slice reducer をまとめる。
- `persistConfig.js`: 永続化対象の slice 名を定義する。現在は `redux-persist` 未導入のため、設定値のみを保持する。

## Slices

- `ui`: ページ表示、サイドバー、HUG サイドパネルのタブ状態。
- `facility`: 事業所、児童一覧、選択中の事業所/児童。
- `hugAuth`: HUG WM ログイン状態（キャッシュ）と自動ログイン設定。ID/パスワードの永続化は `src/lib/hugAuthCredentials.js`。
- `chat`: AI 問い合わせ画面の入力、期間、モデル、メッセージ。
- `correction`: 支援記録校正画面の入力、結果、モーダル、処理中状態。
- `attendance`: HUG 入退室一覧、取得状態、施設フィルタ、表示設定。
- `personalRecord`: DB 側の個人記録一覧と選択中詳細。
- `hugPersonalRecord`: HUG 連絡帳の取得/保存フォーム状態。

## Notes

App 側では既存コンポーネントの props 形を大きく変えないため、Redux action を `setX(...)` 風に呼べる薄い setter ラッパーで扱っている。

永続化を有効にする場合は `redux-persist` を追加し、`persistConfig.js` の `persistConfig` を `persistReducer` に渡す。
