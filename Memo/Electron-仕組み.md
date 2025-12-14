
```bash
settings.html → index.html のイベント → preload.js → ipcRenderer.invoke("fetch-staff")

→ main.js → apiClient.js → .env の値を使って API リクエスト

という流れになります。

✅ ポイント

renderer 側（settings.html / index.html） は window.electronAPI.fetchStaff() を呼ぶだけ

preload.js は「橋渡し」

main.js が .env を参照して API を叩く
```