# ini.jsonとcustomButtons.jsonの重複について

## 問題の概要

現在、カスタムボタンの設定が**2つの場所に重複して保存**されています：

1. **`ini.json`内の`appSettings.customButtons`** 
2. **`customButtons.json`ファイル**

これは冗長で、データの不整合を引き起こす可能性があります。

---

## 現状の確認

### 1. データ構造

両方とも**同じデータ構造**を持っています：

```json
// ini.json内
{
  "appSettings": {
    "customButtons": [
      {
        "id": "addition-compare-btn",
        "enabled": true,
        "text": "加算の比較",
        "color": "#f9d4fc",
        "action": "additionCompare",
        "order": 1
      }
    ]
  }
}

// customButtons.json
{
  "version": "1.0.0",
  "customButtons": [
    {
      "id": "addition-compare-btn",
      "enabled": true,
      "text": "加算の比較",
      "color": "#f9d4fc",
      "action": "additionCompare",
      "order": 1
    }
  ]
}
```

### 2. 実際に使用されているソース

#### ✅ 実際に使われている: `customButtons.json`

**`CustomButtonManager`（実際のボタン表示を担当）**:
- `renderer/modules/actions/customButtons.js`の`init()`メソッド
- `loadCustomButtons()` → `customButtons.json`から読み込み
- `getCustomButtons()` → `CustomButtonsState.customButtons`から取得
- **実際のUI表示はここから取得したデータを使用**

```javascript
// renderer/modules/actions/customButtons.js
async init() {
  // カスタムボタンを読み込み（customButtons.jsonから）
  await loadCustomButtons();
  
  // カスタムボタンを取得（CustomButtonsStateから）
  this.customButtons = getCustomButtons();
  
  // カスタムボタンを生成（実際のUI）
  this.generateCustomButtons();
}
```

#### ⚠️ 古いコードで参照されている: `ini.json`内の`customButtons`

**`settingsEditor.js`（設定画面の表示）**:
- `updateCustomButtonsList()`メソッド
- `IniState.appSettings.customButtons`を**優先**して参照（フォールバックで`CustomButtonsState`も参照）
- しかし、保存時は`saveCustomButtons()`で`customButtons.json`に保存

```javascript
// renderer/modules/ui/settingsEditor.js
updateCustomButtonsList() {
  // IniStateを優先して取得
  if (IniState.appSettings && IniState.appSettings.customButtons && IniState.appSettings.customButtons.length > 0) {
    customButtons = [...IniState.appSettings.customButtons];
  } else if (CustomButtonsState.customButtons && CustomButtonsState.customButtons.length > 0) {
    customButtons = [...CustomButtonsState.customButtons];
  }
}
```

### 3. 保存処理

**保存時**: `saveCustomButtons()`が呼ばれ、`customButtons.json`に保存される

```javascript
// renderer/modules/config/customButtons.js
export async function saveCustomButtons() {
  const data = {
    version: "1.0.0",
    customButtons: CustomButtonsState.customButtons  // ← customButtons.jsonに保存
  };
  await window.electronAPI.saveCustomButtons(data);
}
```

**`ini.json`への保存**: `saveIni()`が呼ばれるが、`IniState.appSettings.customButtons`も一緒に保存される

```javascript
// renderer/modules/config/ini.js
export async function saveIni() {
  const data = {
    appSettings: IniState.appSettings,  // ← customButtonsも含まれる
    userPreferences: IniState.userPreferences
  };
  await window.electronAPI.saveIni(data);
}
```

---

## 問題点

### 1. データの不整合のリスク

- `ini.json`と`customButtons.json`の内容が不一致になる可能性
- どちらを優先すべきか不明確
- 設定画面と実際のボタン表示で異なるデータが表示される可能性

### 2. メンテナンス性の悪化

- 2つの場所でデータを管理する必要がある
- 同期を保つ必要がある
- バグの原因になりやすい

### 3. コードの複雑化

- `settingsEditor.js`で両方を参照して優先順位を決めている
- 混乱を招くコード

---

## 推奨される解決策

### ✅ `customButtons.json`に統一する

**理由**:
1. **実際のUI表示で使われている**（`CustomButtonManager`）
2. **専用ファイルとして分離されている**（設定の整理）
3. **他の設定と独立している**（`availableActions.json`とも関連が深い）

### 実施すべき変更

1. **`ini.json`から`customButtons`プロパティを削除**
2. **`settingsEditor.js`の`updateCustomButtonsList()`を修正**
   - `IniState.appSettings.customButtons`への参照を削除
   - `CustomButtonsState.customButtons`のみを使用
3. **`ini.js`の`getCustomButtons()`関数を削除または非推奨化**
4. **初期化時のデータ移行処理を追加**
   - `ini.json`に`customButtons`がある場合、`customButtons.json`に移行

---

## 移行手順

### ステップ1: データの移行確認

`ini.json`に`customButtons`がある場合、`customButtons.json`の内容と比較：

```javascript
// 初期化時に実行
if (IniState.appSettings.customButtons?.length > 0) {
  // customButtons.jsonが空または古い場合のみ移行
  if (CustomButtonsState.customButtons.length === 0) {
    // ini.jsonから移行
    CustomButtonsState.customButtons = [...IniState.appSettings.customButtons];
    await saveCustomButtons();
  }
}
```

### ステップ2: コードの修正

1. **`settingsEditor.js`の修正**
   ```javascript
   updateCustomButtonsList() {
     // IniStateへの参照を削除
     // CustomButtonsStateのみを使用
     const customButtons = [...CustomButtonsState.customButtons];
     // ...
   }
   ```

2. **`saveIni()`からの`customButtons`削除**
   ```javascript
   export async function saveIni() {
     const data = {
       appSettings: {
         ...IniState.appSettings,
         customButtons: undefined  // 削除
       },
       userPreferences: IniState.userPreferences
     };
     // または明示的に除外
   }
   ```

### ステップ3: 既存データのクリーンアップ

既存の`ini.json`から`customButtons`プロパティを削除する処理を追加（初回のみ）

---

## まとめ

| 項目 | ini.json内のcustomButtons | customButtons.json |
|------|-------------------------|-------------------|
| **実際の使用** | ❌ 古いコードで参照のみ | ✅ 実際のUI表示で使用 |
| **保存先** | `ini.json` | `customButtons.json` |
| **推奨** | ❌ 削除推奨 | ✅ これに統一 |
| **理由** | 重複、不整合のリスク | 実際に使われている、専用ファイル |

**結論**: `ini.json`内の`customButtons`は不要です。`customButtons.json`に統一すべきです。

