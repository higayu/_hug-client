// main/util.js
const { app } = require("electron");
const path = require("path");

function getDataPath(...paths) {
  const base = app.isPackaged ? process.resourcesPath : __dirname;
  return path.join(base, "../data", ...paths);
}

module.exports = { getDataPath };
