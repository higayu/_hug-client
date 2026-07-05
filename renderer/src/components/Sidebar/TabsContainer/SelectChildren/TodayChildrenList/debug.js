// src/components/Sidebar/SelectChildrenList/TodayChildrenList/debug.js

// ==============================
// デバッグログ設定
// ==============================
export const DEBUG_TODAY_CHILDREN_LIST = true

export function debugLog(label, payload = undefined) {
  if (!DEBUG_TODAY_CHILDREN_LIST) return

  if (payload === undefined) {
    console.log(`[TodayChildrenList] ${label}`)
    return
  }

  console.log(`[TodayChildrenList] ${label}`, payload)
}

export function debugTable(label, rows) {
  if (!DEBUG_TODAY_CHILDREN_LIST) return
  if (!Array.isArray(rows)) return

  console.groupCollapsed(`[TodayChildrenList] ${label} (${rows.length}件)`)
  console.table(rows)
  console.groupEnd()
}