import React, { useState } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { useAppState } from "@/contexts/appState/AppStateContext";

const ServerConnectButton = ({
  className = "",
  autoFallbackToSqlite = true,
  switchToMariaDbOnSuccess = true,
  persistIni = true,
}) => {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  const {
    updateAppState,
    updateIniSetting,

    // 既存のDB種別を参照する
    DATABASE_TYPE,

    // もし useReduxBindings 側で公開されていれば利用する
    SERVER_CONNECTED,
    SERVER_CONNECTION_STATE,
    SERVER_CONNECTION_CHECKING,
    SERVER_CONNECTION_MESSAGE,
    SERVER_CONNECTION_CHECKED_AT,
  } = useAppState();

  const isMariaDb = DATABASE_TYPE === "mariadb";

  const appStateConnected =
    SERVER_CONNECTED === true || SERVER_CONNECTION_STATE === "connected";

  const isConnected =
    result?.connected === true || appStateConnected || isMariaDb;

  const isChecking = checking || SERVER_CONNECTION_CHECKING === true;

  const checkedAt = result?.checkedAt || SERVER_CONNECTION_CHECKED_AT;

  const displayMessage =
    result?.message ||
    SERVER_CONNECTION_MESSAGE ||
    (isConnected
      ? "MariaDB / APIサーバに接続済みです"
      : "MariaDB / APIサーバに接続していません");

  const titleText = [
    isChecking
      ? "MariaDB 接続確認中..."
      : isConnected
        ? "MariaDB / APIサーバ接続OK"
        : result
          ? "MariaDB / APIサーバ接続NG"
          : "MariaDB / APIサーバ接続を確認",
    displayMessage,
    DATABASE_TYPE ? `DATABASE_TYPE: ${DATABASE_TYPE}` : null,
    checkedAt ? `checkedAt: ${checkedAt}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const syncDatabaseType = async (databaseType, message) => {
    const connected = databaseType === "mariadb";
    const checkedAt = new Date().toISOString();

    console.log("[ServerConnectButton] DATABASE_TYPE を同期します", {
      databaseType,
      connected,
      persistIni,
    });

    updateAppState({
      DATABASE_TYPE: databaseType,

      SERVER_CONNECTED: connected,
      SERVER_CONNECTION_STATE: connected ? "connected" : "disconnected",
      SERVER_CONNECTION_CHECKING: false,
      SERVER_CONNECTION_MESSAGE:
        message ||
        (connected
          ? "APIサーバに接続できたため MariaDB に切り替えました"
          : "APIサーバに接続できないため SQLite に切り替えました"),
      SERVER_CONNECTION_CHECKED_AT: checkedAt,
    });

    if (persistIni) {
      await updateIniSetting("apiSettings.databaseType", databaseType);
    }
  };

  const handleCheckConnection = async () => {
    console.log("[ServerConnectButton] サーバ接続確認を開始します");

    setChecking(true);
    setResult(null);

    updateAppState({
      SERVER_CONNECTION_CHECKING: true,
      SERVER_CONNECTION_MESSAGE: "MariaDB 接続確認中...",
    });

    try {
      if (!window.electronAPI?.checkMariaDbConnection) {
        throw new Error("checkMariaDbConnection が preload に定義されていません");
      }

      const res = await window.electronAPI.checkMariaDbConnection();

      console.log("[ServerConnectButton] 接続確認結果:", res);

      const connected = res?.connected === true || res?.success === true;
      const checkedAt = new Date().toISOString();

      const normalizedResult = {
        ...res,
        success: connected,
        connected,
        checking: false,
        checkedAt,
        message:
          res?.message ||
          (connected
            ? "APIサーバに接続できました"
            : "APIサーバに接続できません"),
      };

      setResult(normalizedResult);

      updateAppState({
        SERVER_CONNECTED: connected,
        SERVER_CONNECTION_STATE: connected ? "connected" : "disconnected",
        SERVER_CONNECTION_CHECKING: false,
        SERVER_CONNECTION_MESSAGE: normalizedResult.message,
        SERVER_CONNECTION_CHECKED_AT: checkedAt,
      });

      if (connected) {
        console.log("[ServerConnectButton] MariaDB 接続成功");

        if (switchToMariaDbOnSuccess) {
          await syncDatabaseType(
            "mariadb",
            "APIサーバに接続できたため MariaDB に切り替えました"
          );
        }

        return;
      }

      console.warn("[ServerConnectButton] MariaDB 接続失敗", normalizedResult);

      if (autoFallbackToSqlite) {
        await syncDatabaseType(
          "sqlite",
          "APIサーバに接続できないため SQLite に切り替えました"
        );
      }
    } catch (err) {
      console.error("[ServerConnectButton] 接続確認エラー:", err);

      const checkedAt = new Date().toISOString();

      const errorResult = {
        success: false,
        connected: false,
        checking: false,
        checkedAt,
        message: err?.message || "接続確認に失敗しました",
      };

      setResult(errorResult);

      updateAppState({
        SERVER_CONNECTED: false,
        SERVER_CONNECTION_STATE: "disconnected",
        SERVER_CONNECTION_CHECKING: false,
        SERVER_CONNECTION_MESSAGE: errorResult.message,
        SERVER_CONNECTION_CHECKED_AT: checkedAt,
      });

      if (autoFallbackToSqlite) {
        await syncDatabaseType(
          "sqlite",
          "接続確認に失敗したため SQLite に切り替えました"
        );
      }
    } finally {
      console.log("[ServerConnectButton] サーバ接続確認を終了します");
      setChecking(false);
    }
  };

  return (
    <div className={`${className} inline-flex items-center`}>
      <button
        type="button"
        onClick={handleCheckConnection}
        disabled={isChecking}
        title={titleText}
        aria-label={titleText}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition",
          "border shadow-sm",
          isChecking
            ? "cursor-not-allowed bg-gray-100 text-gray-500"
            : "bg-white text-gray-800 hover:bg-gray-300",
          className,
        ].join(" ")}
      >
        {isChecking ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isConnected ? (
          <Wifi size={18} className="text-green-600" />
        ) : result || SERVER_CONNECTION_MESSAGE ? (
          <WifiOff size={18} className="text-red-600" />
        ) : (
          <Wifi size={18} />
        )}

        <span>サーバ接続</span>
      </button>
    </div>
  );
};

export default ServerConnectButton;