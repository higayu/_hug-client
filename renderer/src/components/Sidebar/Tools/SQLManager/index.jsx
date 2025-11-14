// renderer/src/components/Sidebar/SQLManager/index.jsx
import ChildrenTable from "./ChildrenTable.jsx";

function SQLManager() {
  return (
    <div className="p-4 flex flex-col h-full bg-white">
      <h2 className="text-lg font-bold text-blue-600 mb-4">
        🗄️ データベース管理
      </h2>


      {/* 👇 ここで ChildrenTable を呼び出す */}
      <div className="flex-1 overflow-auto">
        <ChildrenTable />
      </div>
    </div>
  );
}

export default SQLManager;
