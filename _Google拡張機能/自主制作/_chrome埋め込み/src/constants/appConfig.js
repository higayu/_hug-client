import { FileEdit, LayoutDashboard, MessageSquare, UserSquare } from 'lucide-react'

export const NAV_LINKS = [
  { key: 'correction', label: '入退室管理', icon: FileEdit },
  { key: 'chat', label: 'AI問い合わせ', icon: MessageSquare },
  { key: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { key: 'personal-record', label: '個人記録', icon: UserSquare },
  { key: 'hug-personal-record', label: 'hugから個人記録取得', icon: UserSquare },
]

export const PAGE_TITLES = {
  chat: 'AI問い合わせ機能（チャットボット）',
  correction: '入退室管理',
  dashboard: '管理ダッシュボード',
  'personal-record': '個人記録一覧',
  'hug-personal-record': 'hugから個人記録取得',
}

export const API_BASE =
  window.AI_CONFIG?.API_BASE ||
  import.meta.env.VITE_API_BASE ||
  'http://192.168.1.229:3001/api/sql/hug_ai_support'

export const CORRECTION_SYSTEM_PROMPT =
  'あなたは児童支援記録の校正アシスタントです。入力された記録をF-SOAIP形式（事実・主観・客観・評価・計画）で整理・校正し、日本語で出力してください。'

export const CHAT_SYSTEM_PROMPT =
  'あなたは児童支援記録の分析アシスタントです。提供された支援記録の事実に基づき、推測で断定せず丁寧に回答してください。'
