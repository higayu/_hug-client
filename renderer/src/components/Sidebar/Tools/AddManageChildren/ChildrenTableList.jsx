import React from "react";

/**
 * 出勤データを一覧表示するコンポーネント
 * @param {Array} childrenList - 抽出された児童データ配列
 */
function ChildrenTableList({ childrenList = [] }) {
  if (!childrenList || childrenList.length === 0) {
    return <p className="text-gray-500 mt-4">データがありません。</p>;
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-700 mb-2">出勤データ一覧</h3>
      <table className="min-w-full border border-gray-300 text-sm rounded-md overflow-hidden shadow-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">児童名</th>
            <th className="border px-2 py-1">入室</th>
            <th className="border px-2 py-1">退室</th>
            <th className="border px-2 py-1">児童ID</th>
          </tr>
        </thead>
        <tbody>
          {childrenList.map((child) => (
            <tr
              key={child.children_id}
              className="hover:bg-blue-50 transition-colors"
            >
              <td className="border px-2 py-1 text-center">{child.rowIndex}</td>
              <td className="border px-2 py-1">{child.children_name}</td>
              <td className="border px-2 py-1 text-green-700 font-semibold">
                {child.column5}
              </td>
              <td className="border px-2 py-1 text-blue-700 font-semibold">
                {child.column6 || "-"}
              </td>
              <td className="border px-2 py-1 text-gray-500 text-center">
                {child.children_id}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChildrenTableList;
