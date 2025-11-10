import React from "react";
import { useSelector } from "react-redux";
import {
  selectExtractedData,
  selectAttendanceLoading,
  selectAttendanceError,
} from "@/store/slices/attendanceSlice.js";
import TableDataGetButon from "./TableDataGetButon.jsx";
import ChildrenTableList from "./ChildrenTableList.jsx"; // ← 新しく追加

function ChildrenTable() {
  const extractedData = useSelector(selectExtractedData);
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;

  const childrenList = extractedData?.data || [];

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-blue-600 mb-4">👶 子ども管理</h2>
      <p className="text-sm text-gray-600 mb-3">
        子どもデータの一覧・編集を管理します。
      </p>

      <TableDataGetButon />

      {/* ✅ 新しいテーブルコンポーネントを呼び出す */}
      <ChildrenTableList childrenList={childrenList} />
    </div>
  );
}

export default ChildrenTable;
