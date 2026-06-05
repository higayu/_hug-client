# src/apiClient.js から renderer/index.html までの流れ

## 概要
このドキュメントは、`src/apiClient.js`から`renderer/index.html`までのデータフローと処理の流れを矢印で表したものです。

## プロシージャの取得の流れ
```
 renderer/modules/childrenList.js
   ・ loadChildren
        ・ const data = await window.electronAPI.GetChildrenByStaffAndDay(AppState.STAFF_ID, AppState.day_of_week_id, facility_id);
        引数を指定
    ↓
preload.js
    ↓ (ipcRenderer.invoke)
main/parts/apiHandler.js
    ↓ (apiClient.callProcedure)
src/apiClient.js
``` 


## データフロー図

```
src/apiClient.js
    ↓ (require)
main/parts/apiHandler.js
    ↓ (handleApiCalls)
main/ipcHandlers.js
    ↓ (registerIpcHandlers)
main.js
    ↓ (app.whenReady)
main/window.js
    ↓ (createMainWindow)
preload.js
    ↓ (contextBridge.exposeInMainWorld)
renderer/index.html
    ↓ (script src="mainRenderer.js")
renderer/mainRenderer.js
    ↓ (import)
renderer/modules/childrenList.js
    ↓ (window.electronAPI.GetChildrenByStaffAndDay)
preload.js
    ↓ (ipcRenderer.invoke)
main/parts/apiHandler.js
    ↓ (apiClient.callProcedure)
src/apiClient.js
```

## 詳細な流れ

### 1. アプリケーション起動時
```
main.js
    ↓ app.whenReady()
    ↓ createMainWindow()
    ↓ registerIpcHandlers()
```

### 2. IPCハンドラー登録
```
main\parts\handlers\apiHandler.js
    ↓ handleApiCalls(ipcMain)
    ↓ ipcMain.handle("GetChildrenByStaffAndDay", ...)
```

### 3. APIクライアントの準備
```
main/parts/apiHandler.js
    ↓ const apiClient = require("../../src/apiClient")
    ↓ apiClient.callProcedure("GetChildrenByStaffAndDay", ...)
```

### 4. レンダラープロセスの初期化
```
renderer/index.html
    ↓ <script type="module" src="mainRenderer.js">
    ↓ DOMContentLoaded
    ↓ initChildrenList()
```

### 5. データ取得の流れ
```
renderer/modules/childrenList.js
    ↓ window.electronAPI.GetChildrenByStaffAndDay(staffId, date)
    ↓ preload.js (contextBridge)
    ↓ ipcRenderer.invoke("GetChildrenByStaffAndDay", {staffId, date})
    ↓ main/parts/apiHandler.js (IPCハンドラー)
    ↓ apiClient.callProcedure("GetChildrenByStaffAndDay", params)
    ↓ src/apiClient.js (axios HTTP リクエスト)
    ↓ 外部APIサーバー
```

## 主要なファイルと役割

### src/apiClient.js
- **役割**: HTTP APIクライアント（axios使用）
- **機能**: 
  - 外部APIサーバーとの通信
  - ストアドプロシージャの呼び出し
  - 各種データ取得（スタッフ、施設、子ども情報など）

### main/parts/apiHandler.js
- **役割**: IPCハンドラーの実装
- **機能**:
  - レンダラープロセスからのAPI呼び出しを処理
  - apiClientを使用して実際のAPI呼び出しを実行
  - 結果をレンダラープロセスに返却

### main/ipcHandlers.js
- **役割**: IPCハンドラーの登録
- **機能**:
  - 各種IPCハンドラーを登録
  - handleApiCallsを含む複数のハンドラーを管理

### preload.js
- **役割**: セキュリティブリッジ
- **機能**:
  - レンダラープロセスとメインプロセス間の安全な通信
  - contextBridgeを使用してAPIを公開

### renderer/index.html
- **役割**: メインのHTMLファイル
- **機能**:
  - アプリケーションのUI構造
  - mainRenderer.jsを読み込み

### renderer/mainRenderer.js
- **役割**: レンダラープロセスのメインスクリプト
- **機能**:
  - 各種モジュールの初期化
  - イベントリスナーの設定
  - アプリケーション全体の制御

### renderer/modules/childrenList.js
- **役割**: 子ども一覧の管理
- **機能**:
  - 子どもデータの取得と表示
  - サイドバーの管理
  - データの更新処理

## データの流れ

1. **ユーザーアクション** → ボタンクリックやページ読み込み
2. **レンダラープロセス** → `window.electronAPI.GetChildrenByStaffAndDay()`呼び出し
3. **preload.js** → IPC通信の準備と実行
4. **メインプロセス** → IPCハンドラーでAPI呼び出し
5. **apiClient.js** → 外部APIサーバーへのHTTPリクエスト
6. **外部APIサーバー** → データベースクエリ実行
7. **レスポンス** → 逆順でレンダラープロセスまで返却
8. **UI更新** → 取得したデータで画面を更新

## 注意点

- `facility_id`パラメータが現在の実装では渡されていないため、`Get_waiting_children_pc`の呼び出しでエラーが発生する可能性があります
- エラーハンドリングは各層で実装されていますが、適切なエラーメッセージの表示が必要です
- 非同期処理が多いため、適切なawait/asyncの使用が重要です
