// main.js
const { app } = require("electron");
const path = require("path");
//require("dotenv").config();

const { createMainWindow } = require("./main/window");
const { registerIpcHandlers } = require("./main/ipcHandlers");

app.whenReady().then(() => {
  console.log("🚀 [MAIN] Electronアプリが起動しました");
  const mainWindow = createMainWindow();
  console.log("🪟 [MAIN] メインウィンドウを作成しました");
  registerIpcHandlers(mainWindow);
  console.log("🔧 [MAIN] IPCハンドラーの登録を開始しました");
});
