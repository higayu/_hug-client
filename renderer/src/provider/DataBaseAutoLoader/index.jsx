// renderer/src/components/common/DataBaseAutoLoader/index.jsx

import { useDataBase } from "@/hooks/useDataBase";

/**
 * AppState 初期化完了後にDBデータを自動取得するためのコンポーネント。
 *
 * useDataBase 側で
 * - isInitialized
 * - STAFF_ID
 * - CURRENT_DAY_OF_WEEK.weekdayId
 * を見てから loadDataBase が走る想定。
 */
export default function DataBaseAutoLoader() {
  useDataBase({
    autoLoad: true,
  });

  return null;
}