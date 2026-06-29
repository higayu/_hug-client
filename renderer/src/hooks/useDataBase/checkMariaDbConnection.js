// renderer/src/components/common/MariadbConnectButton/checkMariaDbConnection.js

import {
  setDatabaseType,
  setServerConnectionState,
  updateAppState,
} from "@/store/slices/appStateSlice";

/**
 * MariaDB / APIサーバ接続確認
 *
 * - SQLite → MariaDB 切替時は、先にサーバ接続チェックを行う
 * - 接続成功時だけ DATABASE_TYPE = mariadb にする
 * - 接続失敗時は DATABASE_TYPE = sqlite に自動切換えする
 * - Redux の DATABASE_TYPE を更新する
 * - main/data/ini.json の apiSettings.databaseType を更新する
 * - ApiTab の select 表示も同期する
 *
 * @param {Function} dispatch Redux dispatch
 * @param {Object} options オプション
 * @param {boolean} options.autoFallbackToSqlite 接続失敗時にSQLiteへ切り替えるか
 * @param {boolean} options.switchToMariaDbOnSuccess 接続成功時にMariaDBへ切り替えるか
 * @param {boolean} options.persistIni ini.jsonも更新するか
 * @returns {Promise<Object>} 接続確認結果
 */
export async function checkMariaDbConnection(dispatch, options = {}) {
  const {
    autoFallbackToSqlite = true,
    switchToMariaDbOnSuccess = false,
    persistIni = true,
  } = options;

  const checkedAt = new Date().toISOString();

  console.group("🔌 [checkMariaDbConnection] MariaDB接続確認開始");
  console.log("📌 options:", {
    autoFallbackToSqlite,
    switchToMariaDbOnSuccess,
    persistIni,
  });
  console.log("🕒 checkedAt:", checkedAt);
  console.log("🧩 dispatch exists:", Boolean(dispatch));

  if (dispatch) {
    console.log("📤 Redux: SERVER_CONNECTION_CHECKING = true");

    dispatch(
      setServerConnectionState({
        checking: true,
        message: "MariaDB 接続確認中...",
      })
    );
  }

  try {
    console.log("🔎 preload API確認: window.electronAPI.checkMariaDbConnection");

    if (!window.electronAPI?.checkMariaDbConnection) {
      throw new Error("checkMariaDbConnection が preload に定義されていません");
    }

    console.log("🚀 Electron IPC: checkMariaDbConnection 実行");

    const res = await window.electronAPI.checkMariaDbConnection();

    console.log("📥 Electron IPC response:", res);

    const connected = res?.connected === true;

    console.log("✅ connected:", connected);

    const result = {
      success: res?.success === true,
      connected,
      checking: false,
      message:
        res?.message ||
        (connected
          ? "APIサーバに接続できました"
          : "APIサーバに接続できません"),
      serverHost: res?.serverHost || null,
      url: res?.url || null,
      status: res?.status || null,
      statusText: res?.statusText || null,
      code: res?.code || null,
      checkedAt,
      data: res?.data || null,
      error: null,
      switchedDatabaseType: null,
      fallbackToSqlite: false,
    };

    console.log("🧾 normalized result:", result);

    if (dispatch) {
      console.log("📤 Redux: setServerConnectionState 接続結果反映", {
        connected,
        checking: false,
        message: result.message,
        checkedAt,
      });

      dispatch(
        setServerConnectionState({
          connected,
          checking: false,
          message: result.message,
          checkedAt,
        })
      );
    }

    // SQLite → MariaDB 切替時：
    // 接続成功した場合だけ MariaDB に切り替える
    if (connected && switchToMariaDbOnSuccess) {
      console.log(
        "🔁 接続成功 + switchToMariaDbOnSuccess=true のため MariaDB に切り替えます"
      );

      await switchDatabaseType({
        dispatch,
        databaseType: "mariadb",
        message: "APIサーバに接続できたため MariaDB に切り替えました",
        persistIni,
      });

      const switchedResult = {
        ...result,
        message: "APIサーバに接続できたため MariaDB に切り替えました",
        switchedDatabaseType: "mariadb",
        fallbackToSqlite: false,
      };

      console.log("✅ MariaDB切替完了 result:", switchedResult);
      console.groupEnd();

      return switchedResult;
    }

    // 接続失敗時：
    // SQLite に自動切換え
    if (!connected && autoFallbackToSqlite) {
      console.warn(
        "⚠️ 接続失敗 + autoFallbackToSqlite=true のため SQLite に切り替えます"
      );

      await switchDatabaseType({
        dispatch,
        databaseType: "sqlite",
        message: "APIサーバに接続できないため SQLite に切り替えました",
        persistIni,
      });

      const fallbackResult = {
        ...result,
        message: "APIサーバに接続できないため SQLite に切り替えました",
        switchedDatabaseType: "sqlite",
        fallbackToSqlite: true,
      };

      console.log("✅ SQLite自動切替完了 result:", fallbackResult);
      console.groupEnd();

      return fallbackResult;
    }

    console.log("✅ 接続確認のみ完了 result:", result);
    console.groupEnd();

    return result;
  } catch (err) {
    console.error("❌ [checkMariaDbConnection] 接続確認エラー:", err);

    const baseResult = {
      success: false,
      connected: false,
      checking: false,
      message: err?.message || "接続確認に失敗しました",
      serverHost: null,
      url: null,
      status: err?.response?.status || null,
      statusText: err?.response?.statusText || null,
      code: err?.code || null,
      checkedAt,
      data: err?.response?.data || null,
      error: {
        name: err?.name || "Error",
        message: err?.message || "接続確認に失敗しました",
      },
      switchedDatabaseType: null,
      fallbackToSqlite: false,
    };

    console.log("🧾 error baseResult:", baseResult);

    if (dispatch) {
      console.log("📤 Redux: setServerConnectionState エラー反映", {
        connected: false,
        checking: false,
        message: baseResult.message,
        checkedAt,
      });

      dispatch(
        setServerConnectionState({
          connected: false,
          checking: false,
          message: baseResult.message,
          checkedAt,
        })
      );
    }

    // 例外発生時も SQLite に自動切換え
    if (autoFallbackToSqlite) {
      console.warn(
        "⚠️ 例外発生 + autoFallbackToSqlite=true のため SQLite に切り替えます"
      );

      await switchDatabaseType({
        dispatch,
        databaseType: "sqlite",
        message: "接続確認に失敗したため SQLite に切り替えました",
        persistIni,
      });

      const fallbackResult = {
        ...baseResult,
        message: `${baseResult.message}。SQLite に切り替えました。`,
        switchedDatabaseType: "sqlite",
        fallbackToSqlite: true,
      };

      console.log("✅ 例外後 SQLite自動切替完了 result:", fallbackResult);
      console.groupEnd();

      return fallbackResult;
    }

    console.log("✅ エラー結果を返します:", baseResult);
    console.groupEnd();

    return baseResult;
  }
}

/**
 * DB種別をまとめて切り替える
 *
 * - Redux
 * - appState
 * - main/data/ini.json
 * - ApiTab select表示
 */
export async function switchDatabaseType({
  dispatch,
  databaseType,
  message,
  persistIni = true,
}) {
  const checkedAt = new Date().toISOString();

  console.group("🔁 [switchDatabaseType] DB種別切替開始");
  console.log("📌 params:", {
    databaseType,
    message,
    persistIni,
    checkedAt,
    dispatchExists: Boolean(dispatch),
  });

  if (dispatch) {
    console.log("📤 Redux: setDatabaseType", databaseType);

    dispatch(setDatabaseType(databaseType));

    console.log("📤 Redux: updateAppState", {
      DATABASE_TYPE: databaseType,
      SERVER_CONNECTED: databaseType === "mariadb",
      SERVER_CONNECTION_CHECKING: false,
      SERVER_CONNECTION_MESSAGE: message,
      SERVER_CONNECTION_CHECKED_AT: checkedAt,
    });

    dispatch(
      updateAppState({
        DATABASE_TYPE: databaseType,
        SERVER_CONNECTED: databaseType === "mariadb",
        SERVER_CONNECTION_CHECKING: false,
        SERVER_CONNECTION_MESSAGE: message,
        SERVER_CONNECTION_CHECKED_AT: checkedAt,
      })
    );

    console.log("📤 Redux: setServerConnectionState", {
      connected: databaseType === "mariadb",
      checking: false,
      message,
      checkedAt,
    });

    dispatch(
      setServerConnectionState({
        connected: databaseType === "mariadb",
        checking: false,
        message,
        checkedAt,
      })
    );
  } else {
    console.warn("⚠️ dispatch がないため Redux は更新されません");
  }

  if (persistIni) {
    console.log("💾 ini.json 更新開始:", databaseType);
    const iniResult = await updateIniDatabaseType(databaseType);
    console.log("💾 ini.json 更新結果:", iniResult);
  } else {
    console.log("💾 persistIni=false のため ini.json は更新しません");
  }

  console.log("🖥 ApiTab select 表示同期開始:", databaseType);
  syncDatabaseTypeSelect(databaseType);

  console.log("✅ [switchDatabaseType] DB種別切替完了:", {
    databaseType,
    message,
    checkedAt,
  });

  console.groupEnd();
}

/**
 * main/data/ini.json の apiSettings.databaseType を更新
 */
async function updateIniDatabaseType(databaseType) {
  console.group("💾 [updateIniDatabaseType] ini.json更新");

  try {
    console.log("📌 databaseType:", databaseType);
    console.log("🔎 preload API確認: window.electronAPI.updateIniSetting");

    if (!window.electronAPI?.updateIniSetting) {
      console.warn(
        "⚠️ window.electronAPI.updateIniSetting が未定義のため ini.json は更新されません"
      );

      const result = {
        success: false,
        message: "updateIniSetting が preload に定義されていません",
      };

      console.log("🧾 result:", result);
      console.groupEnd();

      return result;
    }

    console.log("🚀 Electron IPC: updateIniSetting 実行", {
      path: "apiSettings.databaseType",
      value: databaseType,
    });

    const res = await window.electronAPI.updateIniSetting(
      "apiSettings.databaseType",
      databaseType
    );

    console.log("✅ ini databaseType updated:", {
      databaseType,
      res,
    });

    console.groupEnd();

    return res;
  } catch (error) {
    console.error("❌ ini.json の databaseType 更新に失敗しました:", error);

    const result = {
      success: false,
      message: error?.message || "ini.json の更新に失敗しました",
    };

    console.log("🧾 result:", result);
    console.groupEnd();

    return result;
  }
}

/**
 * ApiTab の select 表示を同期
 */
function syncDatabaseTypeSelect(databaseType) {
  console.group("🖥 [syncDatabaseTypeSelect] ApiTab select同期");

  const databaseTypeSelect = document.getElementById("api-database-type");

  if (databaseTypeSelect) {
    console.log("✅ select found. value を更新します:", databaseType);
    databaseTypeSelect.value = databaseType;
  } else {
    console.warn(
      "⚠️ #api-database-type が見つかりません。ApiTab未表示の可能性があります。"
    );
  }

  console.groupEnd();
}