import { usePreloadPath } from '@/hooks/usePreloadPath'
import { useAppInitialization } from '@/AppStateContext/useAppInitializer/useAppInitialization.js'
import { Provider } from 'react-redux'
import { store } from '@/store/store.js'
import { ToastProvider } from '@/components/common/ToastContext'
import { AppStateProvider } from '@/AppStateContext'
import { CustomButtonsProvider } from '@/components/CustomButtonsContext'
import Toolbar from '@/components/Header/Toolbar.jsx'
import Tabs from '@/components/Header/Tabs.jsx'
import MainContent from '@/MainContent.jsx'
import { useActiveWebviewLogger } from '@/hooks/useTabs/useActiveWebviewLogger'
import DataBaseAutoLoader from '@/components/common/Synchronization/DataBaseAutoLoader'

// Provider内で初期化を実行する内部コンポーネント
function AppContent({ preloadPath }) {
  useAppInitialization()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Toolbar />
      <Tabs />
      <MainContent preloadPath={preloadPath} />
      <pre id="configOutput" style={{ display: 'none' }}></pre>
    </div>
  )
}

function App() {
  const preloadPath = usePreloadPath()
  useActiveWebviewLogger()

  return (
    <Provider store={store}>
      <AppStateProvider>
        <DataBaseAutoLoader />
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