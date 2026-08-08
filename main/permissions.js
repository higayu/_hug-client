// main/permissions.js
const { session } = require("electron");

/**
 * WebView / BrowserWindow で使用する権限を設定する
 */
function setupMediaPermissions() {
  const allowedHosts = new Set([
    "www.hug-ayumu.link",
    "hug-ayumu.link",
  ]);

  /**
   * 指定されたURLが許可対象か確認
   *
   * @param {string} value
   * @returns {boolean}
   */
  const isAllowedUrl = (value) => {
    if (!value) {
      return false;
    }

    try {
      const url = new URL(value);

      return (
        url.protocol === "https:" &&
        allowedHosts.has(url.hostname)
      );
    } catch (error) {
      console.warn(
        "[Permission] URL parse failed:",
        value,
        error
      );

      return false;
    }
  };

  /**
   * 権限要求時の処理
   */
  session.defaultSession.setPermissionRequestHandler(
    (
      webContents,
      permission,
      callback,
      details
    ) => {
      const requestingUrl =
        details?.requestingUrl ||
        details?.embeddingOrigin ||
        webContents?.getURL?.() ||
        "";

      console.log(
        "[PermissionRequest]",
        {
          permission,
          requestingUrl,
        }
      );

      // ==========================================
      // マイク / メディア
      // ==========================================
      if (
        permission === "media" ||
        permission === "microphone"
      ) {
        console.log(
          "[PermissionRequest] allowed:",
          permission
        );

        callback(true);
        return;
      }

      // ==========================================
      // Clipboard 書き込み
      //
      // navigator.clipboard.writeText()
      // ==========================================
      if (
        permission ===
        "clipboard-sanitized-write"
      ) {
        const allowed =
          isAllowedUrl(requestingUrl);

        console.log(
          "[PermissionRequest] clipboard write:",
          allowed
            ? "allowed"
            : "denied",
          requestingUrl
        );

        callback(allowed);
        return;
      }

      // ==========================================
      // Clipboard 読み込み
      //
      // navigator.clipboard.readText()
      // ==========================================
      if (
        permission === "clipboard-read"
      ) {
        const allowed =
          isAllowedUrl(requestingUrl);

        console.log(
          "[PermissionRequest] clipboard read:",
          allowed
            ? "allowed"
            : "denied",
          requestingUrl
        );

        callback(allowed);
        return;
      }

      // ==========================================
      // その他は拒否
      // ==========================================
      console.warn(
        "[PermissionRequest] denied:",
        permission,
        requestingUrl
      );

      callback(false);
    }
  );

  /**
   * 権限チェック時の処理
   */
  session.defaultSession.setPermissionCheckHandler(
    (
      webContents,
      permission,
      requestingOrigin,
      details
    ) => {
      const origin =
        requestingOrigin ||
        details?.requestingUrl ||
        details?.embeddingOrigin ||
        webContents?.getURL?.() ||
        "";

      console.log(
        "[PermissionCheck]",
        {
          permission,
          origin,
        }
      );

      // ==========================================
      // マイク / メディア
      // ==========================================
      if (
        permission === "media" ||
        permission === "microphone"
      ) {
        console.log(
          "[PermissionCheck] allowed:",
          permission
        );

        return true;
      }

      // ==========================================
      // Clipboard 書き込み
      // ==========================================
      if (
        permission ===
        "clipboard-sanitized-write"
      ) {
        const allowed =
          isAllowedUrl(origin);

        console.log(
          "[PermissionCheck] clipboard write:",
          allowed
            ? "allowed"
            : "denied",
          origin
        );

        return allowed;
      }

      // ==========================================
      // Clipboard 読み込み
      // ==========================================
      if (
        permission === "clipboard-read"
      ) {
        const allowed =
          isAllowedUrl(origin);

        console.log(
          "[PermissionCheck] clipboard read:",
          allowed
            ? "allowed"
            : "denied",
          origin
        );

        return allowed;
      }

      // ==========================================
      // その他は拒否
      // ==========================================
      console.warn(
        "[PermissionCheck] denied:",
        permission,
        origin
      );

      return false;
    }
  );
}

module.exports = {
  setupMediaPermissions,
};

