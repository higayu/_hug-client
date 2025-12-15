import { 
  fetchAttendanceTableData, 
  fetchAttendanceData, 
  parseAttendanceTable 
} from '@/utils/ToDayChildrenList/attendanceTable.js'
import { usePreloadPath } from '@/hooks/usePreloadPath.js'
import { useAppInitialization } from '@/hooks/useAppInitialization.js'
import { Provider } from 'react-redux'
import { store } from '@/store/store.js'
import { ToastProvider } from '@/components/common/ToastContext.jsx'
//import { AppStateProvider } from '@/contexts/AppStateContext.jsx'
import { AppStateProvider } from '@/contexts/appState'
//import { IniStateProvider } from '@/contexts/IniStateContext.jsx'
import { CustomButtonsProvider } from '@/components/common/CustomButtonsContext.jsx'
import Toolbar from '@/components/Header/Toolbar.jsx'
import Tabs from '@/components/Header/Tabs.jsx'
import ContentArea from '@/components/ContentArea.jsx'

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
    <Provider store={store}>
      <AppStateProvider>
          <CustomButtonsProvider>
            <ToastProvider>
              <AppContent preloadPath={preloadPath} />
            </ToastProvider>
          </CustomButtonsProvider>
      </AppStateProvider>
    </Provider>
  )
}

export default App
