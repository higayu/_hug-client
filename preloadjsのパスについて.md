# preload.js パス修正メモ

## 背景

Electron 38 環境で `preload.js` 内から以下のようなローカル `require` が失敗した。

```js
require("./preload/electronApi")
require("./preload/devApi")
require("./preload/whisperApi")
```

エラー例：

```txt
Error: module not found: ./preload/electronApi
executeSandboxedPreloadScripts
```

原因は、preload が sandboxed preload として実行され、ローカルファイルの `require` が解決できなかったため。

そのため、`preload.js` と `preload/` 配下の分割ファイルを `esbuild` で `preload.bundle.cjs` に bundle し、Electron には `preload.bundle.cjs` を読ませる方式に変更した。

---

## 新しい preload パス

今後は直接 `preload.js` を読まない。

```js
path.join(app.getAppPath(), "preload.bundle.cjs")
```

を使う。

---

## 修正した主なファイル

### 1. `main/window.js`

変更前：

```js
preload: path.join(__dirname, "../preload.js")
```

変更後：

```js
const preloadPath = path.join(app.getAppPath(), "preload.bundle.cjs");

webPreferences: {
  preload: preloadPath,
}
```

---

### 2. `main/parts/window/planWindows.js`

変更前：

```js
preload: path.join(__dirname, "../../preload.js")
```

変更後：

```js
preload: path.join(app.getAppPath(), "preload.bundle.cjs")
```

---

### 3. `main/parts/window/windowManager.js`

変更前：

```js
const devPath = path.join(__dirname, "../../../preload.js");
const prodPath = path.join(process.resourcesPath, "preload.js");
```

変更後：

```js
const bundlePath = path.join(app.getAppPath(), "preload.bundle.cjs");
```

---

### 4. `main/parts/window/computeWindows/windowManager.js`

変更前：

```js
const devPath = path.join(__dirname, "../../../../preload.js");
const prodPath = path.join(process.resourcesPath, "preload.js");
```

変更後：

```js
const bundlePath = path.join(app.getAppPath(), "preload.bundle.cjs");
```

---

### 5. `main/parts/window/ProfessionalSearch/windowManager.js`

変更前：

```js
const devPath = path.join(__dirname, "../../../../preload.js");
const prodPath = path.join(process.resourcesPath, "preload.js");
```

変更後：

```js
const bundlePath = path.join(app.getAppPath(), "preload.bundle.cjs");
```

---

### 6. `main/parts/window/handleProfessionalSupportSearch/windowManager.js`

変更前：

```js
const devPath = path.join(__dirname, "../../../../preload.js");
const prodPath = path.join(process.resourcesPath, "preload.js");
```

変更後：

```js
const bundlePath = path.join(app.getAppPath(), "preload.bundle.cjs");
```

---

## build-preload 追加

`scripts/build-preload.js` で `preload.js` を bundle し、ルート直下に `preload.bundle.cjs` を作成する。

```js
outfile: path.join(__dirname, "../preload.bundle.cjs")
```

実行コマンド：

```bash
npm run build:preload
```

---

## package.json の scripts 修正

`npm start` や `npm run dist` の前に必ず preload bundle を作る。

```json
"build:preload": "node scripts/build-preload.js",
"start": "npm run build:preload && electron . --prod",
"start:dev": "npm run build:preload && electron . --dev",
"electron": "npm run build:preload && electron .",
"dist": "npm run build:preload && npm run build:renderer && electron-builder"
```

---

## electron-builder 設定

実行ファイル化後も `preload.bundle.cjs` が含まれるように、`files` に追加する。

### package.json の build.files の場合

```json
"files": [
  "main.js",
  "main/**/*",
  "preload.bundle.cjs",
  "preload.js",
  "preload/**/*",
  "renderer/dist/**/*",
  "package.json"
]
```

### electron-builder.yml の場合

```yml
files:
  - main.js
  - main/**/*
  - preload.bundle.cjs
  - preload.js
  - preload/**/*
  - renderer/dist/**/*
  - package.json
```

---

## 確認コマンド

### main 配下に直接 preload.js を読んでいる箇所がないか確認

```powershell
Get-ChildItem -Recurse -File .\main | Select-String -Pattern "preload\.js"
```

### preload 指定箇所を確認

```powershell
Get-ChildItem -Recurse -File .\main | Select-String -Pattern "preload:"
```

### bundle 内に古いローカル require が残っていないか確認

```powershell
Select-String -Path .\preload.bundle.cjs -Pattern "\./preload/electronApi"
Select-String -Path .\preload.bundle.cjs -Pattern "\./preload/devApi"
Select-String -Path .\preload.bundle.cjs -Pattern "\./preload/whisperApi"
```

何も出なければOK。

---

## 起動時の確認ログ

main 側：

```txt
preload exists = true
```

renderer 側：

```txt
[preload.bundle.cjs] start
```

以下が出なければ成功：

```txt
Unable to load preload script: ...\preload.js
module not found: ./preload/electronApi
```

---

## 要点

全 `BrowserWindow` / `webview` preload を、直接 `preload.js` を読む方式から `preload.bundle.cjs` を読む方式に統一した。
