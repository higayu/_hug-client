import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAppState } from "@/AppStateContext";
import {
  fetchAllTables,
  selectServiceRecord,
} from "@/store/slices/databaseSlice.js";
import { selectPersonalRecordNote } from "@/utils/personalRecord/selectPersonalRecordNote.js";
import PersonalRecordUpdateBtn from "./PersonalRecordUpdateBtn";

import { sqliteApi } from "@/sql/sqliteApi.js";
import { mariadbApi } from "@/sql/mariadbApi.js";

export default function PersonalRecordManagerPanel() {
  const dispatch = useDispatch();

  const {
    SELECT_CHILD,
    CURRENT_YMD,
    DATABASE_TYPE,
    isInitialized,
  } = useAppState();

  const serviceRecords = useSelector(selectServiceRecord);

  const [date, setDate] = useState(() => CURRENT_YMD || "");
  const [personalRecordText, setPersonalRecordText] = useState("");
  const [personalRecordTextError, setPersonalRecordTextError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const databaseType = DATABASE_TYPE || "mariadb";

  const getCurrentApi = useCallback(() => {
    return databaseType === "mariadb" ? mariadbApi : sqliteApi;
  }, [databaseType]);

  useEffect(() => {
    if (CURRENT_YMD) {
      setDate(CURRENT_YMD);
    }
  }, [CURRENT_YMD]);

  const applyDisplayFromStore = useCallback(() => {
    setPersonalRecordTextError("");

    if (!SELECT_CHILD) {
      setPersonalRecordText("");
      setPersonalRecordTextError("児童が選択されていません。");
      return;
    }

    if (!date) {
      setPersonalRecordText("");
      setPersonalRecordTextError("日付を指定してください。");
      return;
    }

    const note = selectPersonalRecordNote(serviceRecords, {
      childrenId: SELECT_CHILD,
      dateStr: date,
    });

    setPersonalRecordText(note || "");
  }, [SELECT_CHILD, date, serviceRecords]);

  useEffect(() => {
    applyDisplayFromStore();
  }, [applyDisplayFromStore]);

  const handleRefreshAndDisplay = async () => {
    setRefreshing(true);
    setPersonalRecordTextError("");

    try {
      if (!isInitialized) {
        setPersonalRecordTextError("データベースが初期化されていません。");
        return;
      }

      if (!SELECT_CHILD) {
        setPersonalRecordTextError("児童が選択されていません。");
        return;
      }

      const api = getCurrentApi();

      console.log("[PersonalRecordManagerPanel] 個人記録再取得", {
        databaseType,
        apiName: databaseType === "mariadb" ? "mariadbApi" : "sqliteApi",
        SELECT_CHILD,
        date,
      });

      const tables = await api.getAllTables();

      if (!tables) {
        setPersonalRecordTextError("テーブルデータの再取得に失敗しました。");
        return;
      }

      await dispatch(fetchAllTables(tables));
    } catch (error) {
      console.error("個人記録の再読み込みに失敗しました:", error);
      setPersonalRecordTextError("テーブルデータの再取得に失敗しました。");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1"
        />

        <PersonalRecordUpdateBtn dateStr={date} />
      </div>

      <button
        type="button"
        onClick={handleRefreshAndDisplay}
        disabled={refreshing || !SELECT_CHILD}
        className="rounded bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {refreshing ? "読み込み中…" : "個人記録の表示"}
      </button>

      {personalRecordTextError && (
        <div className="rounded bg-red-100 p-2 text-sm text-red-700">
          {personalRecordTextError}
        </div>
      )}

      <textarea
        className="h-40 w-full rounded bg-gray-700 p-2 text-white"
        value={personalRecordText}
        onChange={(e) => setPersonalRecordText(e.target.value)}
        placeholder="個人記録の表示..."
      />
    </div>
  );
}