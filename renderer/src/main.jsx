import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import '../style.css'

// 🔍 調査用: フォーカス/入力奪取のトラッカー（調査が終わったら削除する）
import { startFocusTracker } from './debug/focusTracker.renderer.js'
startFocusTracker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)