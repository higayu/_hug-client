// renderer/src/hooks/useDataBase/checkMariaDbConnection.js

import {
  setDatabaseType,
  setServerConnectionState,
  updateAppState,
} from "@/store/slices/appStateSlice";

/**
 * MariaDB / APIサーバ接続確認
 *
 * 方針:
 * - activeApi は使わない
 * - DATABASE_TYPE を Redux の正本にする
 * - ini.json は必要に応じて更新する
 * - iniState 側の古い値による巻き戻りを防ぐため、ini 更新後に再読み込みする
 * - 最後にもう一度 Redux の DATABASE_TYPE を確定する
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
    dispatch(
      setServerConnectionState({
        connected: false,
        checking: true,
        message: "MariaDB 接続確認中...",
        checkedAt,
      })
    );
  }

  try {
    if (!window.electronAPI?.checkMariaDbConnection) {
      throw new Error("checkMariaDbConnection が preload に定義されていません");
    }

    const res = await window.electronAPI.checkMariaDbConnection();

    console.log("📥 Electron IPC response:", res);

    const connected = res?.connected === true;

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
      dispatch(
        setServerConnectionState({
          connected,
          checking: false,
          message: result.message,
          checkedAt,
        })
      );
    }

    // SQLite → MariaDB 切替
    if (connected && switchToMariaDbOnSuccess) {
      const switched = await switchDatabaseType({
        dispatch,
        databaseType: "mariadb",
        message: "APIサーバに接続できたため MariaDB に切り替えました",
        persistIni,
      });

      const switchedResult = {
        ...result,
        message: switched.message,
        switchedDatabaseType: switched.databaseType,
        fallbackToSqlite: false,
      };

      console.log("✅ MariaDB切替完了 result:", switchedResult);
      console.groupEnd();

      return switchedResult;
    }

    // 接続失敗時の SQLite fallback
    if (!connected && autoFallbackToSqlite) {
      const switched = await switchDatabaseType({
        dispatch,
        databaseType: "sqlite",
        message: "APIサーバに接続できないため SQLite に切り替えました",
        persistIni,
      });

      const fallbackResult = {
        ...result,
        message: switched.message,
        switchedDatabaseType: switched.databaseType,
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

    if (dispatch) {
      dispatch(
        setServerConnectionState({
          connected: false,
          checking: false,
          message: baseResult.message,
          checkedAt,
        })
      );
    }

    if (autoFallbackToSqlite) {
      const switched = await switchDatabaseType({
        dispatch,
        databaseType: "sqlite",
        message: "接続確認に失敗したため SQLite に切り替えました",
        persistIni,
      });

      const fallbackResult = {
        ...baseResult,
        message: switched.message,
        switchedDatabaseType: switched.databaseType,
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
 * 方針:
 * - activeApi は使わない
 * - Redux の DATABASE_TYPE を必ず更新する
 * - ini.json を必要に応じて更新する
 * - iniState の古い値による巻き戻りを避けるため、ini 更新後に再読み込みする
 * - 最後にもう一度 Redux を更新して表示を確定する
 */
export async function switchDatabaseType({
  dispatch,
  databaseType,
  message = "",
  persistIni = true,
}) {
  const checkedAt = new Date().toISOString();

  const resolvedDatabaseType =
    databaseType === "mariadb" ? "mariadb" : "sqlite";

  const resolvedMessage =
    message ||
    (resolvedDatabaseType === "mariadb"
      ? "MariaDB に切り替えました"
      : "SQLite に切り替えました");

  console.group("🔁 [switchDatabaseType] DB種別切替開始");
  console.log("📌 params:", {
    databaseType,
    resolvedDatabaseType,
    resolvedMessage,
    persistIni,
    checkedAt,
    dispatchExists: Boolean(dispatch),
  });

  try {
    // =============================================================
    // 1) Redux を先に更新する
    // =============================================================
    if (dispatch) {
      applyDatabaseTypeToRedux(dispatch, {
        databaseType: resolvedDatabaseType,
        message: resolvedMessage,
        checkedAt,
      });
    } else {
      console.warn("⚠️ dispatch がないため Redux は更新されません");
    }

    // =============================================================
    // 2) ini.json を更新する
    // =============================================================
    if (persistIni) {
      const iniResult = await updateIniDatabaseType(resolvedDatabaseType);
      console.log("💾 ini.json 更新結果:", iniResult);
    } else {
      console.log("💾 persistIni=false のため ini.json は更新しません");
    }

    // =============================================================
    // 3) AppStateContext / iniState 側を再読み込みする
    // 古い iniState が Redux を mariadb に戻す事故を防ぐ
    // =============================================================
    await reloadIniStateIfPossible();

    // =============================================================
    // 4) Redux を最後にもう一度確定する
    // ここが重要。iniState 側の useEffect による巻き戻り対策
    // =============================================================
    if (dispatch) {
      applyDatabaseTypeToRedux(dispatch, {
        databaseType: resolvedDatabaseType,
        message: resolvedMessage,
        checkedAt,
      });
    }

    // =============================================================
    // 5) ApiTab select 表示同期
    // =============================================================
    syncDatabaseTypeSelect(resolvedDatabaseType);

    // =============================================================
    // 6) window.AppState はReduxのミラーなので基本触らないが、
    // 互換表示用に値だけ同期しておく
    // =============================================================
    if (window.AppState) {
      window.AppState.DATABASE_TYPE = resolvedDatabaseType;
      window.AppState.SERVER_CONNECTED = resolvedDatabaseType === "mariadb";
      window.AppState.SERVER_CONNECTION_CHECKING = false;
      window.AppState.SERVER_CONNECTION_MESSAGE = resolvedMessage;
      window.AppState.SERVER_CONNECTION_CHECKED_AT = checkedAt;
    }

    // =============================================================
    // 7) DB切替完了イベントを発火
    // useDataBase 側の再取得トリガー
    // =============================================================
    window.dispatchEvent(
      new CustomEvent("database-type-changed", {
        detail: {
          databaseType: resolvedDatabaseType,
          message: resolvedMessage,
          checkedAt,
          source: "switchDatabaseType",
        },
      })
    );

    const result = {
      success: true,
      connected: resolvedDatabaseType === "mariadb",
      databaseType: resolvedDatabaseType,
      message: resolvedMessage,
      checkedAt,
    };

    console.log("✅ [switchDatabaseType] DB種別切替完了:", result);
    console.groupEnd();

    return result;
  } catch (error) {
    console.error("❌ [switchDatabaseType] DB種別切替エラー:", error);

    if (dispatch) {
      dispatch(
        setServerConnectionState({
          connected: false,
          checking: false,
          message: error?.message || "DB種別切替に失敗しました",
          checkedAt,
        })
      );
    }

    const result = {
      success: false,
      connected: false,
      databaseType: resolvedDatabaseType,
      message: error?.message || "DB種別切替に失敗しました",
      checkedAt,
      error,
    };

    console.log("===== switchDatabaseType END failed =====", result);
    console.groupEnd();

    return result;
  }
}

/**
 * Redux に DATABASE_TYPE / サーバ接続状態を反映
 */
function applyDatabaseTypeToRedux(
  dispatch,
  {
    databaseType,
    message,
    checkedAt,
  }
) {
  const connected = databaseType === "mariadb";

  console.log("📤 [applyDatabaseTypeToRedux]", {
    databaseType,
    connected,
    message,
    checkedAt,
  });

  dispatch(setDatabaseType(databaseType));

  dispatch(
    updateAppState({
      DATABASE_TYPE: databaseType,
      SERVER_CONNECTED: connected,
      SERVER_CONNECTION_CHECKING: false,
      SERVER_CONNECTION_MESSAGE: message,
      SERVER_CONNECTION_CHECKED_AT: checkedAt,
    })
  );

  dispatch(
    setServerConnectionState({
      connected,
      checking: false,
      message,
      checkedAt,
    })
  );
}

/**
 * main/data/ini.json の apiSettings.databaseType を更新
 */
async function updateIniDatabaseType(databaseType) {
  console.group("💾 [updateIniDatabaseType] ini.json更新");

  try {
    if (!window.electronAPI?.updateIniSetting) {
      const result = {
        success: false,
        message: "updateIniSetting が preload に定義されていません",
      };

      console.warn("⚠️", result.message);
      console.groupEnd();

      return result;
    }

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

    console.groupEnd();

    return result;
  }
}

/**
 * AppStateContext 側の iniState を再読み込み
 *
 * window.IniState.loadIni がある場合にも対応
 * window.loadIni がある場合にも対応
 */
async function reloadIniStateIfPossible() {
  console.group("🔄 [reloadIniStateIfPossible] iniState 再読み込み");

  try {
    if (window.IniState?.loadIni) {
      await window.IniState.loadIni();
      console.log("✅ window.IniState.loadIni 実行完了");
      console.groupEnd();
      return true;
    }

    if (typeof window.loadIni === "function") {
      await window.loadIni();
      console.log("✅ window.loadIni 実行完了");
      console.groupEnd();
      return true;
    }

    console.warn(
      "⚠️ iniState 再読み込み関数が window に見つかりません。AppStateContext 側で loadIni を useWindowBridge に公開してください。"
    );

    console.groupEnd();
    return false;
  } catch (error) {
    console.error("❌ iniState 再読み込みエラー:", error);
    console.groupEnd();
    return false;
  }
}

/**
 * ApiTab の select 表示を同期
 */
function syncDatabaseTypeSelect(databaseType) {
  console.group("🖥 [syncDatabaseTypeSelect] ApiTab select同期");

  const databaseTypeSelect = document.getElementById("api-database-type");

  if (databaseTypeSelect) {
    databaseTypeSelect.value = databaseType;
    console.log("✅ select value 更新:", databaseType);
  } else {
    console.warn(
      "⚠️ #api-database-type が見つかりません。ApiTab未表示の可能性があります。"
    );
  }

  console.groupEnd();
}