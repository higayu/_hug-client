// contexts/appState/useWindowBridge.js
import { useEffect } from 'react'

export function useWindowBridge({ isInitialized, appState, activeApi, actions }) {
  useEffect(() => {
    if (!isInitialized) return

    window.AppState = { ...appState, activeApi }
    Object.assign(window, actions)

    return () => {
      delete window.AppState
      Object.keys(actions).forEach((k) => delete window[k])
    }
  }, [isInitialized, appState, activeApi, actions])
}

