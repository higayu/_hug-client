// src/components/Tools/SQLManager/SelectTable.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";

export default function SelectTable() {
  const database = useSelector((state) => state.database);

  // テーブル名一覧（配列だけ）
  const tableNames = Object.keys(database).filter(
    (key) => Array.isArray(database[key])
  );

  const [selectedTable, setSelectedTable] = useState(tableNames[0] || "");

  const tableData = database[selectedTable] || [];

  return (
    <div className="p-4 bg-white shadow rounded-xl">
      <h1 className="text-lg font-bold mb-4">テーブル確認</h1>

      {/* テーブル選択 */}
      <select
        className="border px-2 py-1 w-full mb-4"
        value={selectedTable}
        onChange={(e) => setSelectedTable(e.target.value)}
      >
        {tableNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <h2 className="font-semibold mb-2">{selectedTable}</h2>

      {/* データなし */}
      {tableData.length === 0 ? (
        <p className="text-gray-500">データがありません。</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              {Object.keys(tableData[0]).map((key) => (
                <th key={key} className="border p-2">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i}>
                {Object.keys(row).map((key) => (
                  <td key={key} className="border p-2">
                    {String(row[key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
