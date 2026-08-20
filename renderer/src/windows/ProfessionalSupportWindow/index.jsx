import { useEffect } from 'react'

import { initializeProfessionalSupportWindow } from './scripts'

const inputClassName = 'rounded border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-800'

function ToolbarField({ id, label, type = 'text', readOnly = false }) {
  return (
    <label htmlFor={id} className="text-sm font-semibold text-gray-700">
      <span className="mb-1 block">{label}</span>
      <input id={id} type={type} readOnly={readOnly} className={inputClassName} />
    </label>
  )
}

export default function ProfessionalSupportWindow() {
  useEffect(() => initializeProfessionalSupportWindow(), [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 text-gray-800">
      <header id="toolbar" className="flex flex-wrap items-end gap-4 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <ToolbarField id="facilityIdInput" label="施設ID" readOnly />
        <ToolbarField id="facilityNameInput" label="施設名" readOnly />
        <ToolbarField id="facilityUrlInput" label="施設URL" readOnly />
        <ToolbarField id="yearMonthInput" label="年月" type="month" />
        <ToolbarField id="dateStrInput" label="日付" type="date" />
        <button type="button" id="getDataBtn" className="rounded bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700">
          📥 データ取得
        </button>
      </header>

      <nav id="tabs" className="flex border-b border-gray-300 bg-gray-100">
        <button type="button" id="tabView" className="tab active flex-1 border-t-2 border-blue-600 bg-white px-4 py-2.5 text-sm font-medium text-blue-700">
          📄 ページ表示
        </button>
        <button type="button" id="tabResult" className="tab flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200">
          📊 取得結果
        </button>
      </nav>

      <main id="content" className="relative min-h-0 flex-1">
        <div id="webviews" className="absolute inset-0 flex">
          <webview id="left" src="https://www.hug-ayumu.link/hug/wm/attendance.php" allowpopups="true" className="h-full flex-1 border-r-2 border-gray-300" />
          <webview id="right" src="https://www.hug-ayumu.link/hug/wm/record_proceedings.php" allowpopups="true" className="h-full flex-1" />
        </div>
        <div id="resultView" className="absolute inset-0 hidden overflow-auto bg-gray-50 p-5" />
      </main>
    </div>
  )
}
