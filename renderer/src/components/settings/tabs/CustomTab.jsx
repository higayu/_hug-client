function CustomTab() {
  return (
    <div>
      <h3 className="text-gray-700 text-lg mb-4 pb-2 border-b border-gray-200">カスタムボタン</h3>
      <p className="mb-4 text-gray-600">
        カスタムボタンは自由に追加・編集・削除できます。<br />
        加算比較ボタンもここで管理されます。
      </p>
      
      <div className="mb-6">
        <h4 className="text-gray-700 font-semibold mb-3">新しいカスタムボタンを作成</h4>
        <div className="flex gap-2.5 items-end mb-4">
          <div className="flex-1">
            <label className="block mb-1.5 font-bold text-gray-700">アクション:</label>
            <select id="new-button-action" className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200">
              <option value="">アクションを選択してください</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-1.5 font-bold text-gray-700">テキスト:</label>
            <input type="text" id="new-button-text" placeholder="ボタンのテキスト" className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200" />
          </div>
          <div className="w-20">
            <label className="block mb-1.5 font-bold text-gray-700">カラー:</label>
            <input type="color" id="new-button-color" defaultValue="#007bff" className="w-full h-10 border border-gray-300 rounded cursor-pointer" />
          </div>
          <div>
            <button id="create-custom-button" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none px-5 h-10 rounded-md cursor-pointer font-medium transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-lg">作成</button>
          </div>
        </div>
      </div>
      
      <div id="custom-buttons-list" className="mb-6">
        {/* カスタムボタンが動的に追加される */}
      </div>
      <button id="add-custom-button" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none px-5 py-2.5 rounded-md cursor-pointer font-medium transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-lg">+ カスタムボタンを追加</button>
    </div>
  )
}

export default CustomTab

