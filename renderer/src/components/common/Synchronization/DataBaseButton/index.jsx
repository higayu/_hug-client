import { useDataBase } from "@/hooks/useDataBase";
import { Database } from "lucide-react";
import { useToast } from "@/components/common/ToastContext";

export default function DataBaseButton({ className = "" }) {
  const { showInfoToast, showErrorToast } = useToast();
  const { loadDataBase } = useDataBase();

  const handleClick = async () => {
    // DB取得処理
    try {
      await loadDataBase();
      showInfoToast("再取得OK");
    } catch {
      showErrorToast("エラー");
    } finally {
        console.log("取得処理終了");
    }
  };

  return (
    <button
      className={`${className} bg-red-300 hover:bg-red-500 inline-flex justify-center items-center text-gray-700 gap-2`}
      onClick={handleClick}
    >
      <Database size={18} />
      再取得
    </button>
  );
}