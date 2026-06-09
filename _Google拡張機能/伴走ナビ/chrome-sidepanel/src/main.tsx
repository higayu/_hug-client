import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const connectSidePanelState = async () => {
  if (
    typeof chrome === 'undefined' ||
    !chrome.runtime ||
    !chrome.tabs ||
    typeof chrome.runtime.connect !== 'function' ||
    typeof chrome.tabs.query !== 'function'
  ) {
    return
  }

  const port = chrome.runtime.connect({
    name: 'banso-navi-side-panel',
  })

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    })

    if (typeof tab?.id === 'number') {
      port.postMessage({
        type: 'side-panel-mounted',
        tabId: tab.id,
      })
    }
  } catch (error) {
    console.warn('[Banso Navi SidePanel] tab query failed:', error)
  }
}

void connectSidePanelState()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
