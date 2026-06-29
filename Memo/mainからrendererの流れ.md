「main側」
・ipcMain.handle("【read-ini】", async () => {});
    ↓
「preload側」
・【readIni】: () => ipcRenderer.invoke("【read-ini】"),
　　↓
「renderer側」
・const result = await window.electronAPI.【readIni】()