// main/parts/util.js
const { app } = require("electron");
const path = require("path");

function getDataPath(...paths) {
  // 🟢 開発時 → プロジェクト直下の data/
  // 🟢 ビルド後 → resources/data/
  const base = app.isPackaged
    ? path.join(process.resourcesPath, "data")
    : path.join(__dirname, "../../data");

  return path.join(base, ...paths);
}

module.exports = { getDataPath };
