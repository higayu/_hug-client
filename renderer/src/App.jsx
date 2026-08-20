import { lazy, Suspense } from 'react'

import MainWindow from '@/windows/MainWindow'
import { ToastProvider } from '@/provider/ToastProvider/ToastContext'

const ProfessionalSupportWindow = lazy(
  () => import('@/windows/ProfessionalSupportWindow')
)

function resolveWindowType() {
  const params = new URLSearchParams(window.location.search)
  return params.get('window') ?? 'main'
}

const WINDOW_COMPONENTS = {
  main: MainWindow,
  professionalSupport: ProfessionalSupportWindow,
}

export default function App() {
  const windowType = resolveWindowType()
  const WindowComponent = WINDOW_COMPONENTS[windowType] ?? MainWindow

  return (
    <ToastProvider>
      <Suspense fallback={<div className="p-4">画面を読み込んでいます...</div>}>
        <WindowComponent />
      </Suspense>
    </ToastProvider>
  )
}
