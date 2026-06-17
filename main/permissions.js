// main/permissions.js
const { session } = require("electron");

function setupMediaPermissions() {
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "media" || permission === "microphone") {
        callback(true);
        return;
      }

      callback(false);
    }
  );

  session.defaultSession.setPermissionCheckHandler(
    (webContents, permission) => {
      if (permission === "media" || permission === "microphone") {
        return true;
      }

      return false;
    }
  );
}

module.exports = {
  setupMediaPermissions,
};