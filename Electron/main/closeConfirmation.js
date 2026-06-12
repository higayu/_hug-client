// main/closeConfirmation.js
const { ipcMain } = require("electron");

function registerCloseConfirmation(mainWindow) {
  let isHandlingClose = false;

  mainWindow.on("close", (e) => {
    if (isHandlingClose) return;

    e.preventDefault();
    isHandlingClose = true;

    mainWindow.webContents.send("confirm-close-request");

    ipcMain.once("confirm-close-response", (event, shouldClose) => {
      if (shouldClose) {
        isHandlingClose = false;
        mainWindow.destroy();
      } else {
        isHandlingClose = false;
      }
    });
  });
}

module.exports = {
  registerCloseConfirmation,
};