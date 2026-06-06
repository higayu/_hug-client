import { useAppController } from '@/hooks/useAppController'
import AppLayout from './components/AppLayout'
import './App.css'

function App() {
  const appProps = useAppController()
  return <AppLayout {...appProps} />
}

export default App
