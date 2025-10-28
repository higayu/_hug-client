# 設定モーダル

このフォルダには設定編集モーダルに関するファイルが含まれています。

## ファイル構成

```
settings/
├── modal.html      # 設定モーダルのHTML構造
├── modal.css       # 設定モーダル専用のスタイル
├── modal.js        # 設定モーダル専用のJavaScript機能
├── config.js       # 設定モーダル用の設定ファイル
└── README.md       # このファイル
```

## 使用方法

### HTMLの読み込み
```javascript
import { SettingsModal } from './settings/modal.js';

const modal = new SettingsModal();
await modal.load();
modal.show();
```

### 設定の使用
```javascript
import { SettingsConfig } from './settings/config.js';

// タブ設定の取得
const tabs = SettingsConfig.tabs;

// 機能設定の取得
const features = SettingsConfig.features;
```

## 機能

- **動的読み込み**: 必要な時のみHTMLとCSSを読み込み
- **モジュール化**: 独立したコンポーネントとして動作
- **設定管理**: 設定項目を外部ファイルで管理
- **テーマ対応**: ライト/ダークテーマに対応
- **レスポンシブ**: モバイルデバイスにも対応

## カスタマイズ

設定項目を追加・変更する場合は `config.js` を編集してください。

新しいタブを追加する場合：
```javascript
// config.js
tabs: [
  { id: 'newTab', name: '新しいタブ', icon: '🆕' }
]
```

新しい設定項目を追加する場合：
```javascript
// config.js
features: [
  {
    id: 'newFeature',
    name: '新しい機能',
    type: 'checkbox',
    path: 'appSettings.features.newFeature.enabled'
  }
]
```
