// renderer/src/components/Sidebar/SQLManager/index.jsx
import SelectTable from "./SelectTable.jsx";
import { useTabs } from '@/hooks/useTabs/index.js'
import { useSelector } from "react-redux";

function SQLManager() {
  const { addWebManagerAction } = useTabs()



  return (
    <div className="p-4 flex flex-col h-full bg-white">
      <h2 className="text-lg font-bold text-blue-600 mb-4">
        🗄️ データベース管理
      </h2>

      <button 
          id="professional-support-new"
          onClick={addWebManagerAction}
          className="block w-full text-left border-none bg-blue text-black px-4 py-2 text-sm cursor-pointer transition-all hover:bg-[#e3f2fd]"
        >
         データ管理
      </button>


      {/* 👇 ここで ChildrenTable を呼び出す */}
      <div className="flex-1 overflow-auto">
        <SelectTable />
      </div>
    </div>
  );
}

export default SQLManager;
