// renderer/src/components/Sidebar/Tools/ManagerEdit/Modals/DeleteModal.jsx

export default function DeleteModal({ open, onClose, onConfirm, manager }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
        <h2 className="text-lg font-bold mb-4">削除確認</h2>

        <p className="text-sm">以下の担当データを削除しますか？</p>

        <div className="mt-3 p-3 border rounded-md bg-gray-50 text-sm">
          <p><b>ID:</b> {manager?.children_id}</p>
          <p><b>子ども名:</b> {manager?.children_name}</p>
          <p><b>スタッフ:</b> {manager?.staff_name}</p>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            className="px-4 py-2 border rounded-md text-sm"
            onClick={onClose}
          >
            キャンセル
          </button>

          <button
            className="px-4 py-2 rounded-md text-sm text-white bg-red-500"
            onClick={() => onConfirm(manager)}
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
