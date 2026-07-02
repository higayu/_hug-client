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

    const shouldSync = window.confirm(
      `MariaDBのデータをSqliteに同期します。このまま実行しますか？`
    );
    if (!shouldSync) return;

    try {
      setIsSyncing(true);

     // const result = await window.electronAPI.syncDatabaseStateToSqlite(databaseState);
      const result = await window.electronAPI.syncDatabaseStateToSqlite();


      console.log("✅ SQLite 同期完了:", result);
    } catch (error) {
      console.error("❌ SQLite 同期エラー:", error);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={RunClick}
        disabled={isSyncing}
        className="w-full py-1 flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white shadow-md"
      >
        <span>同期</span>
        <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
      </button>
    </>
  );
}