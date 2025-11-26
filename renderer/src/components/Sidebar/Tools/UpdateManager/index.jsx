// renderer/src/components/Sidebar/SQLManager/index.jsx
import UpdateManagerTable from "./UpdateManagerTable.jsx";
import { useTabs } from '@/hooks/useTabs/index.js'

function UpdateManager() {
  const { addWebManagerAction } = useTabs()

  return (
    <div className="p-4 flex flex-col h-full bg-white">

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-blue-600 mb-4">
          児童担当編集
        </h2>

        <button 
            id="professional-support-new"
            onClick={addWebManagerAction}
            className="block w-full text-left border-none bg-white text-black px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
          >
          データ管理
        </button>
      </div>



      {/* 👇 ここで ChildrenTable を呼び出す */}
      <div className="flex-1 overflow-auto">
        <UpdateManagerTable />
      </div>
    </div>
  );
}

export default UpdateManager;
