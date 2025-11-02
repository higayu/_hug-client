import { 
  fetchAttendanceTableData, 
  fetchAttendanceData, 
  parseAttendanceTable 
} from '../modules/data/attendanceTable.js'
import { usePreloadPath } from './hooks/usePreloadPath.js'
import { useAppInitialization } from './hooks/useAppInitialization.js'
import Toolbar from './components/Toolbar.jsx'
import Tabs from './components/Tabs.jsx'
import ContentArea from './components/ContentArea.jsx'

// グローバルにエクスポート（デバッグ・開発用）
window.attendanceTableAPI = {
  fetchAttendanceTableData,
  fetchAttendanceData,
  parseAttendanceTable
}

function App() {
  const preloadPath = usePreloadPath()
  useAppInitialization()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Toolbar />
      <Tabs />
      <ContentArea preloadPath={preloadPath} />
      <pre id="configOutput" style={{ display: 'none' }}></pre>
    </div>
  )
}

export default App
