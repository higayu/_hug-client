// AppStateContext/useReduxBindings/index.js
import { useMemo, useCallback } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import * as s from '@/store/slices/appStateSlice'

import {
  selectDatabaseState,
  selectChildren,
  selectChildrenType,
  selectPronunciation,
  selectStaffs,
  selectFacilitys,
  selectFacilityChildren,
  selectFacilityStaff,
  selectManagers2,
  selectPc,
  selectPcToChildren,
  selectDayOfWeek,
  selectServiceRecord,
  selectChildRecords,
  selectRecordTypes,
  selectMServiceItems,
  selectTempNotes,
  selectMemo,
  selectTextData,
  selectToolbox,
  selectStaffFacilityRoles,
  selectUsers,
  selectRefreshTokens,
  selectDatabaseLoading,
  selectDatabaseError,
  selectDatabaseMetadata,
} from '@/store/slices/databaseSlice'

import { splitChildrenData } from '@/AppStateContext/splitChildrenData'

export function useReduxBindings() {
  // ✅ appState 全体（必要な場合のみ）
  const appState = useSelector(s.selectAppState, shallowEqual)

  // =========================
  // databaseSlice
  // =========================
  const databaseState = useSelector(selectDatabaseState, shallowEqual)

  // 基本マスタ
  const dbChildren = useSelector(selectChildren, shallowEqual)
  const dbChildrenType = useSelector(selectChildrenType, shallowEqual)
  const dbPronunciation = useSelector(selectPronunciation, shallowEqual)
  const dbStaffs = useSelector(selectStaffs, shallowEqual)
  const dbFacilitys = useSelector(selectFacilitys, shallowEqual)

  // 関連テーブル
  const dbFacilityChildren = useSelector(selectFacilityChildren, shallowEqual)
  const dbFacilityStaff = useSelector(selectFacilityStaff, shallowEqual)
  const dbManagers2 = useSelector(selectManagers2, shallowEqual)
  const dbPc = useSelector(selectPc, shallowEqual)
  const dbPcToChildren = useSelector(selectPcToChildren, shallowEqual)
  const dbDayOfWeek = useSelector(selectDayOfWeek, shallowEqual)

  // 記録系
  const dbServiceRecord = useSelector(selectServiceRecord, shallowEqual)
  const dbChildRecords = useSelector(selectChildRecords, shallowEqual)
  const dbRecordTypes = useSelector(selectRecordTypes, shallowEqual)
  const dbMServiceItems = useSelector(selectMServiceItems, shallowEqual)

  // メモ・テキスト系
  const dbTempNotes = useSelector(selectTempNotes, shallowEqual)
  const dbMemo = useSelector(selectMemo, shallowEqual)
  const dbTextData = useSelector(selectTextData, shallowEqual)
  const dbToolbox = useSelector(selectToolbox, shallowEqual)
  const dbStaffFacilityRoles = useSelector(
    selectStaffFacilityRoles,
    shallowEqual
  )

  // 認証系
  const dbUsers = useSelector(selectUsers, shallowEqual)
  const dbRefreshTokens = useSelector(selectRefreshTokens, shallowEqual)

  // database状態
  const databaseLoading = useSelector(selectDatabaseLoading)
  const databaseError = useSelector(selectDatabaseError)
  const databaseMetadata = useSelector(selectDatabaseMetadata, shallowEqual)

  // =========================
  // primitives
  // =========================
  const HUG_USERNAME = useSelector(s.selectHugUsername)
  const HUG_PASSWORD = useSelector(s.selectHugPassword)

  // Gemini
  const GEMINI_API_KEY = useSelector(s.selectGeminiApiKey)
  const GEMINI_MODEL = useSelector(s.selectGeminiModel)

  // OpenRouter
  const OPEN_ROUTER_API_KEY = useSelector(s.selectOpenRouterApiKey)
  const OPEN_ROUTER_MODEL = useSelector(s.selectOpenRouterModel)

  // DeepSeek
  const DEEPSEEK_MAIL = useSelector(s.selectDeepSeekMail)
  const DEEPSEEK_PASSWORD = useSelector(s.selectDeepSeekPassword)

  // ChatGPT
  const OPENAI_MAIL = useSelector(s.selectOpenaiMail)
  const OPENAI_PASSWORD = useSelector(s.selectOpenaiPassword)

  // Ollama
  const OLLAMA_URL = useSelector(s.selectOllamaUrl)
  const OLLAMA_MODEL = useSelector(s.selectOllamaModel)

  const USE_AI = useSelector(s.selectUseAI)
  const DATABASE_TYPE = useSelector(s.selectDatabaseType)

  const AUTO_SYNCHRONIZATION = useSelector(s.selectAutoSynchronization)
  const AUTO_SWITCHING = useSelector(s.selectAutoSwitching)

  const STAFF_ID = useSelector(s.selectStaffId)
  const FACILITY_ID = useSelector(s.selectFacilityId)

  const SELECT_CHILD = useSelector(s.selectSelectedChild)

  // =========================
  // ✅ 日付・曜日は1本化
  // =========================
  const CURRENT_DAY_OF_WEEK = useSelector(s.selectCurrentDate, shallowEqual)
  const CURRENT_YMD = useSelector(s.selectCurrentYmd)

  // =========================
  // others
  // =========================
  const PROMPTS = useSelector(s.selectPrompts)
  const attendanceData = useSelector(s.selectAttendanceData)
  const DEBUG_FLG = useSelector(s.selectDebugFlg)
  const SELECT_CHILD_FILTER_MODE = useSelector(s.selectSelectChildFilterMode)

  // =========================
  // databaseSlice を抽出用 tables にまとめる
  // =========================
  const databaseTables = useMemo(
    () => ({
      // 基本マスタ
      children: dbChildren,
      children_type: dbChildrenType,
      pronunciation: dbPronunciation,
      staffs: dbStaffs,
      facilitys: dbFacilitys,

      // 関連テーブル
      facility_children: dbFacilityChildren,
      facility_staff: dbFacilityStaff,
      managers2: dbManagers2,
      pc: dbPc,
      pc_to_children: dbPcToChildren,
      day_of_week: dbDayOfWeek,

      // 記録系
      service_record: dbServiceRecord,
      child_records: dbChildRecords,
      record_types: dbRecordTypes,
      m_service_items: dbMServiceItems,

      // メモ・テキスト系
      temp_notes: dbTempNotes,
      memo: dbMemo,
      text_data: dbTextData,
      toolbox: dbToolbox,
      staff_facility_roles: dbStaffFacilityRoles,

      // 認証系
      users: dbUsers,
      refresh_tokens: dbRefreshTokens,
    }),
    [
      dbChildren,
      dbChildrenType,
      dbPronunciation,
      dbStaffs,
      dbFacilitys,
      dbFacilityChildren,
      dbFacilityStaff,
      dbManagers2,
      dbPc,
      dbPcToChildren,
      dbDayOfWeek,
      dbServiceRecord,
      dbChildRecords,
      dbRecordTypes,
      dbMServiceItems,
      dbTempNotes,
      dbMemo,
      dbTextData,
      dbToolbox,
      dbStaffFacilityRoles,
      dbUsers,
      dbRefreshTokens,
    ]
  )

  // =========================
  // databaseSlice から必要な時だけ児童データを抽出する関数
  // =========================
  const getChildrenDataByDay = useCallback(
    async ({
      staffId = STAFF_ID,
      weekdayId,
      facilityId = FACILITY_ID,
    } = {}) => {
      const resolvedWeekdayId =
        weekdayId ??
        CURRENT_DAY_OF_WEEK?.weekdayId ??
        CURRENT_DAY_OF_WEEK?.id ??
        CURRENT_DAY_OF_WEEK?.weekday_id ??
        CURRENT_DAY_OF_WEEK

      console.groupCollapsed('[useReduxBindings/getChildrenDataByDay] START')
      console.log('staffId:', staffId)
      console.log('weekdayId:', weekdayId)
      console.log('resolvedWeekdayId:', resolvedWeekdayId)
      console.log('facilityId:', facilityId)
      console.log('databaseLoading:', databaseLoading)
      console.log('databaseError:', databaseError)
      console.log('databaseMetadata:', databaseMetadata)
      console.log('table counts:', {
        children: databaseTables.children.length,
        children_type: databaseTables.children_type.length,
        pronunciation: databaseTables.pronunciation.length,
        staffs: databaseTables.staffs.length,
        facilitys: databaseTables.facilitys.length,
        facility_children: databaseTables.facility_children.length,
        facility_staff: databaseTables.facility_staff.length,
        managers2: databaseTables.managers2.length,
        pc: databaseTables.pc.length,
        pc_to_children: databaseTables.pc_to_children.length,
        day_of_week: databaseTables.day_of_week.length,
      })

      if (!staffId) {
        console.warn('[useReduxBindings/getChildrenDataByDay] staffId が空です')
        console.groupEnd()

        return {
          week_children: [],
          waiting_children: [],
          Experience_children: [],
        }
      }

      if (!resolvedWeekdayId) {
        console.warn('[useReduxBindings/getChildrenDataByDay] weekdayId が空です')
        console.groupEnd()

        return {
          week_children: [],
          waiting_children: [],
          Experience_children: [],
        }
      }

      const result = await splitChildrenData({
        tables: databaseTables,
        staffId,
        weekdayId: resolvedWeekdayId,
        facility_id: facilityId,
      })

      console.log('[useReduxBindings/getChildrenDataByDay] result:', result)
      console.groupEnd()

      return {
        week_children: Array.isArray(result?.week_children)
          ? result.week_children
          : [],
        waiting_children: Array.isArray(result?.waiting_children)
          ? result.waiting_children
          : [],
        Experience_children: Array.isArray(result?.Experience_children)
          ? result.Experience_children
          : [],
      }
    },
    [
      STAFF_ID,
      FACILITY_ID,
      CURRENT_DAY_OF_WEEK,
      databaseTables,
      databaseLoading,
      databaseError,
      databaseMetadata,
    ]
  )

  return {
    appState,

    // =========================
    // databaseSlice
    // =========================
    databaseState,
    databaseTables,

    // 基本マスタ
    dbChildren,
    dbChildrenType,
    dbPronunciation,
    dbStaffs,
    dbFacilitys,

    // 関連テーブル
    dbFacilityChildren,
    dbFacilityStaff,
    dbManagers2,
    dbPc,
    dbPcToChildren,
    dbDayOfWeek,

    // 記録系
    dbServiceRecord,
    dbChildRecords,
    dbRecordTypes,
    dbMServiceItems,

    // メモ・テキスト系
    dbTempNotes,
    dbMemo,
    dbTextData,
    dbToolbox,
    dbStaffFacilityRoles,

    // 認証系
    dbUsers,
    dbRefreshTokens,

    // database状態
    databaseLoading,
    databaseError,
    databaseMetadata,

    // databaseSlice から必要時に抽出する関数
    getChildrenDataByDay,

    HUG_USERNAME,
    HUG_PASSWORD,

    GEMINI_API_KEY,
    GEMINI_MODEL,
    OPEN_ROUTER_API_KEY,
    OPEN_ROUTER_MODEL,
    DEEPSEEK_MAIL,
    DEEPSEEK_PASSWORD,
    OPENAI_MAIL,
    OPENAI_PASSWORD,
    OLLAMA_URL,
    OLLAMA_MODEL,

    USE_AI,
    DATABASE_TYPE,

    AUTO_SYNCHRONIZATION,
    AUTO_SWITCHING,

    STAFF_ID,
    FACILITY_ID,

    SELECT_CHILD,

    CURRENT_DAY_OF_WEEK,
    CURRENT_YMD,
    PROMPTS,
    attendanceData,
    DEBUG_FLG,
    SELECT_CHILD_FILTER_MODE,
  }
}