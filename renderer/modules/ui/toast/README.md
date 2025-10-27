# トースト通知システム

このモジュールは、アプリケーション全体で使用できるトースト通知システムを提供します。

## 使用方法

### 基本的なインポート

```javascript
import { 
  showToast, 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast, 
  showInfoToast 
} from "./toast/toast.js";
```

### 基本的な使用方法

```javascript
// 基本的なトースト
showToast("メッセージ", "success", 3000);

// 成功メッセージ
showSuccessToast("操作が完了しました");

// エラーメッセージ
showErrorToast("エラーが発生しました");

// 警告メッセージ
showWarningToast("注意が必要です");

// 情報メッセージ
showInfoToast("情報をお知らせします");
```

### 高度な使用方法

```javascript
// 複数のトーストを順次表示
import { showMultipleToasts } from "./toast/toast.js";

showMultipleToasts([
  { message: "処理1完了", type: "success", duration: 2000 },
  { message: "処理2完了", type: "success", duration: 2000 },
  { message: "すべて完了", type: "info", duration: 3000 }
], 500); // 500ms間隔

// すべてのトーストをクリア
import { clearAllToasts } from "./toast/toast.js";
clearAllToasts();
```

## パラメータ

### showToast(message, type, duration)

- `message` (string): 表示するメッセージ
- `type` (string): トーストの種類
  - `'success'`: 成功（緑色）
  - `'error'`: エラー（赤色）
  - `'warning'`: 警告（黄色）
  - `'info'`: 情報（青色）
- `duration` (number): 表示時間（ミリ秒、デフォルト: 3000）

## 機能

- ✅ 自動消去（指定時間後）
- ✅ クリックで手動消去
- ✅ アニメーション効果
- ✅ 複数トースト対応
- ✅ 改行対応（`\n`を`<br>`に変換）
- ✅ レスポンシブデザイン
- ✅ 既存トーストの自動置換

## スタイル

トーストは画面右上に表示され、以下のスタイルが適用されます：

- 固定位置（`position: fixed`）
- 影付き（`box-shadow`）
- 角丸（`border-radius: 6px`）
- スムーズアニメーション（`transition`）
- 高z-index（`z-index: 10000`）

## 使用例

### URL取得機能での使用例

```javascript
import { showSuccessToast, showErrorToast } from "./toast/toast.js";

try {
  const url = webview.getURL();
  await navigator.clipboard.writeText(url);
  showSuccessToast(`✅ URLをコピーしました\n${url}`);
} catch (error) {
  showErrorToast("❌ URLのコピーに失敗しました");
}
```

### 設定保存での使用例

```javascript
import { showSuccessToast, showErrorToast } from "./toast/toast.js";

try {
  await saveSettings();
  showSuccessToast("✅ 設定を保存しました");
} catch (error) {
  showErrorToast("❌ 設定の保存に失敗しました");
}
```
