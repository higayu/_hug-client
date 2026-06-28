import React, { useState } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

const MariadbConnectButton = ({ className = "" }) => {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheckConnection = async () => {
    setChecking(true);
    setResult(null);

    try {
      if (!window.electronAPI?.checkMariaDbConnection) {
        throw new Error("checkMariaDbConnection が preload に定義されていません");
      }

      const res = await window.electronAPI.checkMariaDbConnection();
      setResult(res);
    } catch (err) {
      console.error("接続確認エラー:", err);

      setResult({
        success: false,
        connected: false,
        message: err.message || "接続確認に失敗しました",
      });
    } finally {
      setChecking(false);
    }
  };

  const isConnected = result?.connected === true;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleCheckConnection}
        disabled={checking}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
          "border shadow-sm",
          checking
            ? "cursor-not-allowed bg-gray-100 hover:bg-gray-300  text-gray-500"
            : "bg-white text-gray-800 hover:bg-gray-50",
          className,
        ].join(" ")}
      >
        {checking ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isConnected ? (
          <Wifi size={18} className="text-green-600" />
        ) : result ? (
          <WifiOff size={18} className="text-red-600" />
        ) : (
          <Wifi size={18} />
        )}

        {checking ? "接続確認中..." : "サーバ接続を確認"}
      </button>

      {result && (
        <div
          className={[
            "rounded-md border px-3 py-2 text-sm",
            isConnected
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800",
          ].join(" ")}
        >
          <div className="font-semibold">
            {isConnected ? "接続OK" : "接続NG"}
          </div>

          <div className="mt-1">
            {result.message ||
              (isConnected
                ? "APIサーバに接続できました"
                : "APIサーバに接続できません")}
          </div>

          {result.serverHost && (
            <div className="mt-1 text-xs opacity-80">
              接続先: {result.serverHost}
            </div>
          )}

          {result.url && (
            <div className="mt-1 break-all text-xs opacity-80">
              URL: {result.url}
            </div>
          )}

          {result.status && (
            <div className="mt-1 text-xs opacity-80">
              status: {result.status}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MariadbConnectButton;