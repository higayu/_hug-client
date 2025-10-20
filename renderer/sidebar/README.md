# サイドバー機能

このフォルダには、アプリケーションのサイドバー機能に関するファイルが含まれています。

## ファイル構成

```
renderer/sidebar/
├── sidebar.html      # サイドバーのHTML構造
├── sidebar.css       # サイドバーのスタイル
├── sidebar.js        # サイドバーのJavaScript機能
└── README.md         # このファイル
```

## 機能

### 1. サイドバー開閉制御
- ハンバーガーメニューでのサイドバー表示/非表示
- 外側クリックでの自動閉じる機能
- WebViewの位置調整

### 2. 日付選択
- 個人記録用の日付選択機能
- 日付変更時に自動的に曜日も更新

### 3. 曜日選択
- 対応児童の曜日別表示機能
- 曜日変更時に子どもリストを更新

### 4. 子どもリスト
- 選択された曜日の対応児童を表示
- クリックで児童を選択可能

## 使用方法

### サイドバー開閉制御
```javascript
import { setupSidebar } from "../sidebar/sidebar.js";

// サイドバーの開閉機能を設定
setupSidebar();
```

### サイドバー内容の管理
```javascript
import { initSidebar, updateSidebarValues } from "../sidebar/sidebar.js";

// サイドバーを初期化
initSidebar();

// サイドバーの値を更新
updateSidebarValues("2024-01-01", "月");
```

### 状態の取得
```javascript
import { getSidebarState } from "../sidebar/sidebar.js";

const state = getSidebarState();
console.log(state.date);     // 選択された日付
console.log(state.weekday);  // 選択された曜日
```

## スタイル

- レスポンシブデザイン対応
- ホバー効果
- 選択状態の視覚的フィードバック
- モバイル対応

## イベント

### サイドバー開閉
- ハンバーガーメニュークリック時: サイドバーの表示/非表示切り替え
- 外側クリック時: サイドバーを自動で閉じる

### サイドバー内容
- `dateSelect` 変更時: 日付と曜日を更新
- `weekdaySelect` 変更時: 曜日を更新し、子どもリストを再読み込み
- 子どもリスト項目クリック時: 児童を選択

## 依存関係

- `../modules/config.js`: AppState管理
- `../modules/toast/toast.js`: 通知機能
