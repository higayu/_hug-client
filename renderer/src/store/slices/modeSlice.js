// renderer/src/store/slices/modeSlice.js
// アプリケーションの表示モード・選択項目管理

import { createSlice } from '@reduxjs/toolkit'

export const APP_MODES = Object.freeze({
  DASHBOARD: 'dashboard',
  AI_INQUIRY: 'aiInquiry',
})

const VALID_MODES = Object.values(APP_MODES)

/**
 * 各モードの初期選択項目
 */
export const DEFAULT_SELECTED_ITEM_BY_MODE =
  Object.freeze({
    [APP_MODES.DASHBOARD]: 'home',
    [APP_MODES.AI_INQUIRY]: 'chat',
  })

const createInitialState = () => ({
  currentMode: APP_MODES.DASHBOARD,

  /**
   * モードごとの選択項目ID
   *
   * dashboardへ戻ったときはhomeなど、
   * 各モードで最後に選択した項目を保持する
   */
  selectedItemIdByMode: {
    ...DEFAULT_SELECTED_ITEM_BY_MODE,
  },
})

const initialState = createInitialState()

/**
 * 有効なモードを取得
 */
const resolveMode = (
  requestedMode,
  fallbackMode = APP_MODES.DASHBOARD
) => {
  return VALID_MODES.includes(requestedMode)
    ? requestedMode
    : fallbackMode
}

const modeSlice = createSlice({
  name: 'mode',
  initialState,

  reducers: {
    /**
     * 表示モードを変更
     */
    setMode: (state, action) => {
      const mode = resolveMode(action.payload)

      state.currentMode = mode

      // 古い永続化データなどに項目が存在しない場合の補完
      if (!state.selectedItemIdByMode) {
        state.selectedItemIdByMode = {
          ...DEFAULT_SELECTED_ITEM_BY_MODE,
        }
      }

      if (!state.selectedItemIdByMode[mode]) {
        state.selectedItemIdByMode[mode] =
          DEFAULT_SELECTED_ITEM_BY_MODE[mode]
      }
    },

    /**
     * モード内の選択項目を変更
     *
     * payload:
     * {
     *   mode?: 'dashboard' | 'aiInquiry',
     *   itemId: string
     * }
     *
     * modeを省略した場合は現在のモードを使用
     */
    setSelectedItem: (state, action) => {
      const itemId = action.payload?.itemId

      if (
        typeof itemId !== 'string' ||
        itemId.trim() === ''
      ) {
        return
      }

      const mode = resolveMode(
        action.payload?.mode,
        state.currentMode
      )

      if (!state.selectedItemIdByMode) {
        state.selectedItemIdByMode = {
          ...DEFAULT_SELECTED_ITEM_BY_MODE,
        }
      }

      state.selectedItemIdByMode[mode] = itemId
    },

    /**
     * 初期モードへ戻す
     *
     * 各モードの選択状態は維持
     */
    resetMode: (state) => {
      state.currentMode = APP_MODES.DASHBOARD
    },

    /**
     * 指定したモードの選択項目を初期値へ戻す
     *
     * payloadにモードを指定しない場合は、
     * 現在のモードを対象にする
     */
    resetModeSelection: (state, action) => {
      const mode = resolveMode(
        action.payload,
        state.currentMode
      )

      if (!state.selectedItemIdByMode) {
        state.selectedItemIdByMode = {
          ...DEFAULT_SELECTED_ITEM_BY_MODE,
        }
      }

      state.selectedItemIdByMode[mode] =
        DEFAULT_SELECTED_ITEM_BY_MODE[mode]
    },

    /**
     * モードと選択状態をすべて初期化
     */
    resetModeState: () => {
      return createInitialState()
    },
  },
})

export const {
  setMode,
  setSelectedItem,
  resetMode,
  resetModeSelection,
  resetModeState,
} = modeSlice.actions

/**
 * mode Slice全体
 */
export const selectModeState = (state) =>
  state.mode ?? initialState

/**
 * 現在のモード
 */
export const selectCurrentMode = (state) =>
  state.mode?.currentMode ??
  APP_MODES.DASHBOARD

/**
 * 指定したモードの選択項目ID
 *
 * 使用例:
 * useSelector((state) =>
 *   selectSelectedItemIdByMode(
 *     state,
 *     APP_MODES.DASHBOARD
 *   )
 * )
 */
export const selectSelectedItemIdByMode = (
  state,
  requestedMode
) => {
  const mode = resolveMode(requestedMode)

  return (
    state.mode?.selectedItemIdByMode?.[mode] ??
    DEFAULT_SELECTED_ITEM_BY_MODE[mode]
  )
}

/**
 * 現在のモードで選択されている項目ID
 */
export const selectCurrentSelectedItemId = (
  state
) => {
  const currentMode = selectCurrentMode(state)

  return selectSelectedItemIdByMode(
    state,
    currentMode
  )
}

export const selectDashboardSelectedItemId = (
  state
) =>
  selectSelectedItemIdByMode(
    state,
    APP_MODES.DASHBOARD
  )

export const selectAiInquirySelectedItemId = (
  state
) =>
  selectSelectedItemIdByMode(
    state,
    APP_MODES.AI_INQUIRY
  )

export const selectIsDashboardMode = (state) =>
  selectCurrentMode(state) ===
  APP_MODES.DASHBOARD

export const selectIsAiInquiryMode = (state) =>
  selectCurrentMode(state) ===
  APP_MODES.AI_INQUIRY

export default modeSlice.reducer