import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";

export default function Sql_SynchronizationBtn() {
  const databaseState = useSelector((state) => state.database);
  const [isSyncing, setIsSyncing] = useState(false);

  async function RunClick() {
    if (isSyncing) return;

    console.log("📦 databaseSlice 全体:", databaseState);

    if (!databaseState) {
      console.warn("⚠️ databaseState がありません");
      return;
    }

    if (!window.electronAPI?.syncDatabaseStateToSqlite) {
      console.error("❌ syncDatabaseStateToSqlite が preload に公開されていません");
      return;
    }

    try {
      setIsSyncing(true);

      const result = await window.electronAPI.syncDatabaseStateToSqlite(
        databaseState
      );

      console.log("✅ SQLite 同期完了:", result);
    } catch (error) {
      console.error("❌ SQLite 同期エラー:", error);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <button
        type="button"
        onClick={RunClick}
        disabled={isSyncing}
        className="flex items-center justify-center px-7 py-2 gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl shadow-md"
      >
        <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
      </button>
    </div>
  );
}