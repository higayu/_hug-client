import { useEffect } from 'react'

import { initializeProfessionalSupportWindow } from './scripts'
import './styles/professionalSupport.css'

export default function ProfessionalSupportWindow() {
  useEffect(() => {
    return initializeProfessionalSupportWindow()
  }, [])

  return (
    <div className="professional-support-window">
      <div id="toolbar">
        <div>
          <label htmlFor="facilityIdInput">施設ID:</label>
          <input id="facilityIdInput" readOnly />
        </div>
        <div>
          <label htmlFor="facilityNameInput">施設名:</label>
          <input id="facilityNameInput" readOnly />
        </div>
        <div>
          <label htmlFor="facilityUrlInput">施設URL:</label>
          <input id="facilityUrlInput" readOnly />
        </div>
        <div>
          <label htmlFor="yearMonthInput">年月:</label>
          <input type="month" id="yearMonthInput" />
        </div>
        <div>
          <label htmlFor="dateStrInput">日付:</label>
          <input type="date" id="dateStrInput" />
        </div>
        <button type="button" id="getDataBtn">📥 データ取得</button>
      </div>

      <div id="tabs">
        <button type="button" id="tabView" className="tab active">📄 ページ表示</button>
        <button type="button" id="tabResult" className="tab">📊 取得結果</button>
      </div>

      <div id="content">
        <div id="webviews">
          <webview
            id="left"
            src="https://www.hug-ayumu.link/hug/wm/attendance.php"
            allowpopups="true"
          />
          <webview
            id="right"
            src="https://www.hug-ayumu.link/hug/wm/record_proceedings.php"
            allowpopups="true"
          />
        </div>
        <div id="resultView" />
      </div>
    </div>
  )
}
