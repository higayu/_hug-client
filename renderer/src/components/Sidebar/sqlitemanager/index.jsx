// renderer/src/components/Sidebar/sqlitemanager/index.jsx
import ChildrenTable from "./ChildrenTable.jsx";

function SQLiteManager() {
  return (
    <div className="p-4 flex flex-col h-full bg-white">
      <h2 className="text-lg font-bold text-blue-600 mb-4">
        🗄️ SQLite Manager
      </h2>

      <p className="text-sm text-gray-600 mb-3">
        子どもデータの一覧・編集を管理します。
      </p>

      {/* 👇 ここで ChildrenTable を呼び出す */}
      <div className="flex-1 overflow-auto">
        <ChildrenTable />
      </div>
    </div>
  );
}

export default SQLiteManager;
