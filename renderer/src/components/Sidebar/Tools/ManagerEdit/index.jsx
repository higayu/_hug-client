// renderer/src/components/Sidebar/SQLManager/index.jsx
import ManagerEditTable from "./ManagerEditTable.jsx";

function ManagerEdit() {
  return (
    <div className="p-4 flex flex-col h-full bg-white">
      <h2 className="text-lg font-bold text-blue-600 mb-4">
        児童担当編集
      </h2>


      {/* 👇 ここで ChildrenTable を呼び出す */}
      <div className="flex-1 overflow-auto">
        <ManagerEditTable />
      </div>
    </div>
  );
}

export default ManagerEdit;
