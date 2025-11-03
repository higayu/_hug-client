import { 
  fetchAttendanceTableData, 
  fetchAttendanceData, 
  parseAttendanceTable 
} from './utils/attendanceTable.js'
import { usePreloadPath } from './hooks/usePreloadPath.js'
import { useAppInitialization } from './hooks/useAppInitialization.js'
import { ToastProvider } from './contexts/ToastContext.jsx'
import { AppStateProvider } from './contexts/AppStateContext.jsx'
import { IniStateProvider } from './contexts/IniStateContext.jsx'
import { CustomButtonsProvider } from './contexts/CustomButtonsContext.jsx'
import Toolbar from './components/Toolbar.jsx'
import Tabs from './components/Tabs.jsx'
import ContentArea from './components/ContentArea.jsx'

// グローバルにエクスポート（デバッグ・開発用）
window.attendanceTableAPI = {
  fetchAttendanceTableData,
  fetchAttendanceData,
  parseAttendanceTable
}

// Provider内で初期化を実行する内部コンポーネント
function AppContent({ preloadPath }) {
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

function App() {
  const preloadPath = usePreloadPath()

  return (
    <AppStateProvider>
      <IniStateProvider>
        <CustomButtonsProvider>
          <ToastProvider>
            <AppContent preloadPath={preloadPath} />
          </ToastProvider>
        </CustomButtonsProvider>
      </IniStateProvider>
    </AppStateProvider>
  )
}

export default App
