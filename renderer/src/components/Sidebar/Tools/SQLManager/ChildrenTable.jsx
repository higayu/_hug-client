import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useToast } from  '@/components/common/ToastContext.jsx'

export default function ChildrenTable() {
  const database = useSelector((state) => state.database); // 全テーブル
  const { showInfoToast } = useToast();

  const [selectedTable, setSelectedTable] = useState("children"); // ⭐ 初期選択
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const tableData = database[selectedTable] || []; // ⭐ 選んだテーブルの中身

  // 例：カラムごとの文字制限（なければデフォルト10）
// ⭐ テーブルごと ＋ カラムごとに制限
const columnLimit = {
  children: {
    children_name: 20,
    children_type_name: 15,
    notes: 10,
  },
  staffs: {
    staff_name: 25,
    memo: 40,
  },
  pronunciation: {
    word: 15,
    reading: 20,
  },
};

// デフォルト制限
const defaultLimit = 30;


  return (
    <div className="p-4 bg-white shadow rounded-xl">
      <div className="mb-2">テーブル名</div>

      {/* 🔽 テーブル名セレクト */}
      <select
        className="border px-2 py-1 w-full mb-4"
        value={selectedTable}
        onChange={(e) => setSelectedTable(e.target.value)}
      >
        {Object.keys(database).map((tableName) => (
          <option key={tableName} value={tableName}>
            {tableName}
          </option>
        ))}
      </select>

      {/* 🔽 表示するテーブル名 */}
      <h2 className="text-lg font-bold mb-2">
        {selectedTable} のデータ一覧
      </h2>

      {/* データが存在しないとき */}
      {(!Array.isArray(tableData) || tableData.length === 0) ? (
        <p className="text-gray-500">データがありません。</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              {/* ⭐ 動的にカラムヘッダを生成 */}
              {Object.keys(tableData[0]).map((key) => (
                <th key={key} className="border p-2 capitalize">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                {Object.keys(row).map((key) => {
                  const value = row[key] ?? "";
                  const text = String(value);

                  // ⭐ 選択中テーブルにカラム制限があれば適用
                  const limit =
                    columnLimit[selectedTable]?.[key] || defaultLimit;

                  const displayText =
                    text.length > limit ? text.substring(0, limit) + "…" : text;

                  return (
                    <td key={key} className="border p-2">
                      {displayText}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>


        </table>
      )}
    </div>
  );
}
