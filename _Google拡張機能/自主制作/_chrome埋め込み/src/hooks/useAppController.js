import { useCallback, useEffect, useMemo } from 'react'
import { useAttendanceAutoUpdate } from '@/hooks/useAttendanceAutoUpdate'
import { useAppState } from '@/hooks/useAppState'
import { ATTENDANCE_AUTO_UPDATE_STORAGE_KEY } from '@/store/slices/attendanceSlice'
import {
  clearHugAuthCredentials,
  loadHugAuthCredentials,
  saveHugAuthCredentials,
} from '@/lib/hugAuthCredentials'
import {
  setHugAuthCredentials as setHugAuthCredentialsAction,
  clearHugAuthCredentialsState as clearHugAuthCredentialsStateAction,
  setHugLoginCheckLoading as setHugLoginCheckLoadingAction,
  setHugLoginStatus as setHugLoginStatusAction,
} from '@/store/slices/hugAuthSlice'
import {
  hasCompleteHprAttendanceCache,
  loadHprAttendanceCache,
  saveHprAttendanceCache,
} from '@/lib/personalRecordAttendanceCache'
import {
  setHprAttendanceChildren as setHprAttendanceChildrenAction,
  setHprAttendanceDate as setHprAttendanceDateAction,
  setHprFacilities as setHprFacilitiesAction,
  setHprFacilitiesLoading as setHprFacilitiesLoadingAction,
  setHprSelectedChildId as setHprSelectedChildIdAction,
  setHprSelectedFacilityId as setHprSelectedFacilityIdAction,
} from '@/store/slices/hugPersonalRecordSlice'
import { API_BASE, CHAT_SYSTEM_PROMPT, CORRECTION_SYSTEM_PROMPT, NAV_LINKS, PAGE_TITLES } from '@/constants/appConfig'
import { MOCK_FACILITIES, MOCK_RECORDS } from '@/constants/mockData'
import { callAi } from '@/lib/aiClient'
import { fetchJson } from '@/lib/apiClient'
import {
  addAttendanceFlags,
  ATTENDANCE_FACILITY_OPTIONS,
  fetchAttendanceRows,
  fetchAttendanceRowsForFacility,
  checkHugWmLoginStatus,
  fetchChildrenFromHugWm,
  fetchFacilitiesFromHugWm,
  postLoginFromHugWm,
  fetchPersonalRecordUntilFound,
  fetchPersonalRecordWithNote,
  HALF_TIME_STORAGE_KEY,
  HUG_TIME_RE,
  HUG_WM_BASE_URL,
  HUG_WM_CONTACT_BOOK_LIST_URL,
  normalizeHalfTime,
  parseHmToMinutes,
  postContactBookUpdateFromEditHtml,
  postEnterAttendance,
  postLeaveAttendance,
  setAlertPref,
  SHOW_LEFT_RECORDS_STORAGE_KEY,
  WEEKDAY_JA,
} from '@/lib/hugwm'
import { filterRecordsByDateRange, formatRecordDate, sortRecordsByDateDesc } from '@/utils/recordUtils'
const hashToPage = (hash) => {
  const page = hash.replace(/^#\/?/, '')
  return NAV_LINKS.some((link) => link.key === page) ? page : 'chat'
}

const getAttendanceFetchBlockReason = (state) => {
  const { attendance, hugPersonalRecord } = state
  if (hugPersonalRecord.hprFacilitiesLoading) {
    return '施設データを取得中です。完了するまで一覧を取得できません。'
  }
  if (!hugPersonalRecord.hprFacilities?.length) {
    return '施設データが取得できていません。HUG WM にログインしたうえで再読み込みしてください。'
  }
  const hasFacility = ATTENDANCE_FACILITY_OPTIONS.some((option) =>
    Boolean(attendance.attendanceFacilityMap[String(option.id)]),
  )
  if (!hasFacility) {
    return '施設を1件以上選択してください。'
  }
  if (!attendance.attendanceDate) {
    return '出席表日付を指定してください。'
  }
  return ''
}

const canFetchAttendanceFromState = (state) => !getAttendanceFetchBlockReason(state)

export const useAppController = () => {
  const {
    dispatch,
    reduxStore,
    setActivePageAction,
    setChatStartedAction,
    setChildrenByFacilityAction,
    setFacilitiesAction,
    setSelectedChildIdAction,
    setSelectedFacilityIdAction,
    activePage,
    sidebarOpen,
    sidePanelTab,
    chatStarted,
    chatInput,
    chatModel,
    chatStartDate,
    chatEndDate,
    chatMessages,
    facilities,
    childrenByFacility,
    selectedFacilityId,
    selectedChildId,
    correctionDate,
    correctionOriginal,
    correctionAdditional,
    correctionText,
    correctionModalOpen,
    correctionLoading,
    correctionMode,
    attendanceDate,
    attendanceRows,
    attendanceLoading,
    attendanceStatus,
    attendanceLastFetchedAt,
    halfTime,
    showLeftRecords,
    attendanceFacilityMap,
    attendanceAutoUpdateEnabled,
    prStartDate,
    prEndDate,
    prResults,
    prStatus,
    selectedPr,
    hprStartDate,
    hprEndDate,
    hprResults,
    hprLoading,
    hprNote,
    hprCachedRecord,
    hprRecordStaff,
    hugStatus,
    hprAttendanceDate,
    hprSelectedFacilityId,
    hprSelectedChildId,
    hprAttendanceChildren,
    hprAttendanceLoading,
    hprFacilities,
    hprFacilitiesLoading,
    hprPublishSaveVisible,
    hugLoginStatus,
    hugAutoLoginEnabled,
    hugKeepSession,
    hugLoginId,
    hugLoginCheckLoading,
    hugPassword,
    setSidebarOpen,
    setSidePanelTab,
    setChatStarted,
    setChatInput,
    setChatModel,
    setChatStartDate,
    setChatEndDate,
    setChatMessages,
    setChildrenByFacility,
    setSelectedFacilityId,
    setSelectedChildId,
    setCorrectionDate,
    setCorrectionOriginal,
    setCorrectionAdditional,
    setCorrectionText,
    setCorrectionModalOpen,
    setCorrectionLoading,
    setCorrectionMode,
    setAttendanceDate,
    setAttendanceRows,
    setAttendanceLoading,
    setAttendanceStatus,
    setAttendanceLastFetchedAt,
    setHalfTime,
    setShowLeftRecords,
    setAttendanceFacilityMap,
    setAttendanceAutoUpdateEnabled,
    setPrStartDate,
    setPrEndDate,
    setPrResults,
    setPrStatus,
    setSelectedPr,
    setHprStartDate,
    setHprEndDate,
    setHprResults,
    setHprLoading,
    setHprNote,
    setHprCachedRecord,
    setHprRecordStaff,
    setHugStatus,
    setHprAttendanceDate,
    setHprSelectedFacilityId,
    setHprSelectedChildId,
    setHprAttendanceChildren,
    setHprAttendanceLoading,
    setHprFacilities,
    setHprFacilitiesLoading,
    setHugLoginId,
    setHugPassword,
    setHugAutoLoginEnabled,
    setHugKeepSession,
  } = useAppState()

  useEffect(() => {
    document.body.classList.add('hug-attendance-primary-page')
    return () => document.body.classList.remove('hug-attendance-primary-page')
  }, [])

  const runHugAutoLogin = useCallback(
    async ({ silent = false, force = false } = {}) => {
      const auth = reduxStore.getState().hugAuth
      dispatch(setHugLoginCheckLoadingAction(true))

      try {
        let status = await checkHugWmLoginStatus()

        if (status !== 'authenticated' && (force || auth.autoLoginEnabled)) {
          if (!auth.loginId?.trim() || !auth.password) {
            if (!silent) {
              alert('ログインIDとパスワードを入力して保存してください。')
            }
            dispatch(setHugLoginStatusAction('unauthenticated'))
            return false
          }

          await postLoginFromHugWm({
            loginId: auth.loginId,
            password: auth.password,
            keepSession: auth.keepSession,
          })
          status = await checkHugWmLoginStatus()
        }

        dispatch(setHugLoginStatusAction(status))

        if (status !== 'authenticated') {
          if (!silent) {
            alert('HUG WM にログインできていません。')
          }
          return false
        }

        if (!silent && force) {
          alert('ログインしました。')
        }
        return true
      } catch (error) {
        console.warn('[runHugAutoLogin]', error)
        dispatch(setHugLoginStatusAction('unauthenticated'))
        if (!silent) {
          alert(`ログインに失敗しました: ${error.message}`)
        }
        return false
      } finally {
        dispatch(setHugLoginCheckLoadingAction(false))
      }
    },
    [dispatch, reduxStore],
  )

  useEffect(() => {
    let mounted = true

    const initHugAuth = async () => {
      const credentials = await loadHugAuthCredentials()
      if (!mounted) return
      dispatch(setHugAuthCredentialsAction(credentials))

      if (credentials.autoLoginEnabled) {
        await runHugAutoLogin({ silent: true })
        return
      }

      dispatch(setHugLoginCheckLoadingAction(true))
      try {
        const status = await checkHugWmLoginStatus()
        if (mounted) {
          dispatch(setHugLoginStatusAction(status))
        }
      } catch (error) {
        console.warn('[initHugAuth] login status check failed:', error)
        if (mounted) {
          dispatch(setHugLoginStatusAction('unauthenticated'))
        }
      } finally {
        if (mounted) {
          dispatch(setHugLoginCheckLoadingAction(false))
        }
      }
    }

    void initHugAuth()

    return () => {
      mounted = false
    }
  }, [dispatch, runHugAutoLogin])

  useEffect(() => {
    const initial = hashToPage(window.location.hash)
    dispatch(setActivePageAction(initial))

    const onHashChange = () => {
      const nextPage = hashToPage(window.location.hash)
      dispatch(setActivePageAction(nextPage))
      if (nextPage !== 'chat') {
        dispatch(setChatStartedAction(false))
      }
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [dispatch, setActivePageAction, setChatStartedAction])

  useEffect(() => {
    let mounted = true

    const loadChildren = async (facilityId) => {
      let children = []
      try {
        children = await fetchChildrenFromHugWm({ facilityIds: [facilityId] })
      } catch (error) {
        console.warn('[loadChildren] HUG WM から児童を取得できませんでした:', error)
      }
      if (!mounted) return
      dispatch(setChildrenByFacilityAction({
        ...reduxStore.getState().facility.childrenByFacility,
        [facilityId]: children,
      }))
      if (children[0]?.child_id && !reduxStore.getState().facility.selectedChildId) {
        dispatch(setSelectedChildIdAction(children[0].child_id))
      }
    }

    const loadFacilities = async () => {
      try {
        const data = await fetchJson(`${API_BASE}/facilities`)
        if (!mounted) return
        dispatch(setFacilitiesAction(data))
        const firstId = data[0]?.facility_id
        if (firstId) {
          dispatch(setSelectedFacilityIdAction(firstId))
          await loadChildren(firstId)
        }
      } catch (error) {
        console.warn('[loadFacilities] fallback to mock data', error)
        if (!mounted) return
        dispatch(setFacilitiesAction(MOCK_FACILITIES))
        const firstId = MOCK_FACILITIES[0].facility_id
        dispatch(setSelectedFacilityIdAction(firstId))
        await loadChildren(firstId)
      }
    }

    loadFacilities()
    return () => {
      mounted = false
    }
  }, [
    dispatch,
    reduxStore,
    setChildrenByFacilityAction,
    setFacilitiesAction,
    setSelectedChildIdAction,
    setSelectedFacilityIdAction,
  ])

  useEffect(() => {
    let mounted = true

    const restoreFromCache = (cached) => {
      dispatch(setHprAttendanceDateAction(cached.attendanceDate))
      dispatch(setHprFacilitiesAction(cached.facilities))
      if (cached.selectedFacilityId) {
        dispatch(setHprSelectedFacilityIdAction(cached.selectedFacilityId))
      }
      dispatch(setHprAttendanceChildrenAction(cached.attendanceChildren))
      if (cached.selectedChildId) {
        dispatch(setHprSelectedChildIdAction(cached.selectedChildId))
      }
      dispatch(setHprFacilitiesLoadingAction(false))
    }

    const loadHprFacilities = async () => {
      const cached = loadHprAttendanceCache()
      if (hasCompleteHprAttendanceCache(cached)) {
        if (!mounted) return
        restoreFromCache(cached)
        return
      }

      dispatch(setHprFacilitiesLoadingAction(true))
      try {
        const data = await fetchFacilitiesFromHugWm()
        if (!mounted) return
        dispatch(setHprFacilitiesAction(data))
        const currentId = reduxStore.getState().hugPersonalRecord.hprSelectedFacilityId
        if (!currentId) {
          const selected = data.find((facility) => facility.selected) || data[0]
          if (selected?.facility_id) {
            dispatch(setHprSelectedFacilityIdAction(selected.facility_id))
          }
        }
      } catch (error) {
        console.warn('[loadHprFacilities] HUG WM から施設を取得できませんでした:', error)
        if (!mounted) return
        dispatch(setHprFacilitiesAction([]))
      } finally {
        if (mounted) {
          dispatch(setHprFacilitiesLoadingAction(false))
        }
      }
    }

    loadHprFacilities()
    return () => {
      mounted = false
    }
  }, [dispatch, reduxStore])

  const selectedChildren = useMemo(
    () => childrenByFacility[selectedFacilityId] || [],
    [childrenByFacility, selectedFacilityId],
  )

  const selectedFacilityName = useMemo(
    () => facilities.find((facility) => facility.facility_id === Number(selectedFacilityId))?.name || '',
    [facilities, selectedFacilityId],
  )

  const selectedChildName = useMemo(
    () => selectedChildren.find((child) => child.child_id === Number(selectedChildId))?.name || '',
    [selectedChildren, selectedChildId],
  )

  const displayAttendanceRows = useMemo(
    () =>
      attendanceRows
        .filter((row) => showLeftRecords === 1 || (!HUG_TIME_RE.test(String(row.leaveTime || '').trim()) && !row.isAbsenceStatus))
        .sort((a, b) => {
          const alertDiff = Number(b.hugAlertPref?.alertType || 0) - Number(a.hugAlertPref?.alertType || 0)
          if (alertDiff !== 0) return alertDiff
          return (parseHmToMinutes(a.enterTime) ?? 24 * 60) - (parseHmToMinutes(b.enterTime) ?? 24 * 60)
        }),
    [attendanceRows, showLeftRecords],
  )

  const attendanceFacilitiesReady = useMemo(
    () => !hprFacilitiesLoading && Boolean(hprFacilities?.length),
    [hprFacilitiesLoading, hprFacilities],
  )

  const canFetchAttendance = useMemo(
    () =>
      attendanceFacilitiesReady &&
      ATTENDANCE_FACILITY_OPTIONS.some((option) =>
        Boolean(attendanceFacilityMap[String(option.id)]),
      ) &&
      Boolean(attendanceDate),
    [attendanceFacilitiesReady, attendanceFacilityMap, attendanceDate],
  )

  const handleFacilityChange = async (value) => {
    const facilityId = Number(value)
    setSelectedFacilityId(facilityId)
    const cached = childrenByFacility[facilityId]
    if (cached?.[0]?.child_id) {
      setSelectedChildId(cached[0].child_id)
      return
    }

    try {
      const children = await fetchChildrenFromHugWm({ facilityIds: [facilityId] })
      setChildrenByFacility((prev) => ({ ...prev, [facilityId]: children }))
      setSelectedChildId(children[0]?.child_id || '')
    } catch (error) {
      console.warn('[handleFacilityChange] HUG WM から児童を取得できませんでした:', error)
      setChildrenByFacility((prev) => ({ ...prev, [facilityId]: [] }))
      setSelectedChildId('')
    }
  }

  const runHprAttendanceChildrenFetch = useCallback(
    async ({ silent = false, date, facilityId, facilities: facilitiesOverride } = {}) => {
      const state = reduxStore.getState().hugPersonalRecord
      const resolvedDate = date ?? state.hprAttendanceDate
      const resolvedFacilityId = facilityId ?? state.hprSelectedFacilityId
      const facilities = facilitiesOverride ?? state.hprFacilities

      if (state.hprFacilitiesLoading) {
        if (!silent) alert('施設データを取得中です。完了するまで児童を取得できません。')
        return
      }

      if (!facilities?.length) {
        if (!silent) {
          alert('施設データが取得できていません。HUG WM にログインしたうえで再読み込みしてください。')
        }
        return
      }

      if (!resolvedFacilityId) {
        if (!silent) alert('事業所を選択してください。')
        return
      }

      if (!resolvedDate) {
        if (!silent) alert('出席表日付を指定してください。')
        return
      }

      const facility = facilities.find(
        (item) => String(item.facility_id) === String(resolvedFacilityId),
      )
      if (!facility) {
        if (!silent) {
          alert('事業所情報が見つかりません。HUG WM にログインしたうえで再読み込みしてください。')
        }
        return
      }

      setHprAttendanceLoading(true)
      try {
        const rows = await fetchAttendanceRowsForFacility({
          date: resolvedDate,
          facilityId: facility.facility_id,
          facilityName: facility.name,
        })
        setHprAttendanceChildren(rows)
        const firstChildId = rows[0]?.c_id ?? rows[0]?.child_id ?? rows[0]?.id
        const nextChildId = firstChildId || ''
        if (nextChildId) {
          setHprSelectedChildId(nextChildId)
        } else {
          setHprSelectedChildId('')
        }
        saveHprAttendanceCache({
          attendanceDate: resolvedDate,
          facilities,
          selectedFacilityId: resolvedFacilityId,
          attendanceChildren: rows,
          selectedChildId: nextChildId,
        })
      } catch (error) {
        if (silent) {
          console.warn('[runHprAttendanceChildrenFetch]', error)
        } else {
          alert(`児童の取得に失敗しました: ${error.message}`)
        }
      } finally {
        setHprAttendanceLoading(false)
      }
    },
    [
      reduxStore,
      setHprAttendanceChildren,
      setHprAttendanceLoading,
      setHprSelectedChildId,
    ],
  )

  const handleHprFacilityChange = (value) => {
    const facilityId = Number(value)
    setHprSelectedFacilityId(facilityId)
    setHprSelectedChildId('')
    setHprAttendanceChildren([])
    void runHprAttendanceChildrenFetch({ silent: true, facilityId })
  }

  const handleHprAttendanceDateChange = (value) => {
    setHprAttendanceDate(value)
    void runHprAttendanceChildrenFetch({ silent: true, date: value })
  }

  const handleHprAttendanceFetch = useCallback(async () => {
    const state = reduxStore.getState().hugPersonalRecord
    const resolvedDate = state.hprAttendanceDate

    if (!resolvedDate) {
      alert('出席表日付を指定してください。')
      return
    }

    setHprFacilitiesLoading(true)
    let facilities
    try {
      facilities = await fetchFacilitiesFromHugWm()
      setHprFacilities(facilities)
    } catch (error) {
      alert(`事業所の取得に失敗しました: ${error.message}`)
      setHprFacilities([])
      setHprAttendanceChildren([])
      setHprSelectedChildId('')
      return
    } finally {
      setHprFacilitiesLoading(false)
    }

    if (!facilities?.length) {
      alert('施設データが取得できていません。HUG WM にログインしたうえで再読み込みしてください。')
      setHprAttendanceChildren([])
      setHprSelectedChildId('')
      return
    }

    let facilityId = state.hprSelectedFacilityId
    const stillValid = facilities.some(
      (item) => String(item.facility_id) === String(facilityId),
    )
    if (!stillValid) {
      const selected = facilities.find((facility) => facility.selected) || facilities[0]
      facilityId = selected?.facility_id || ''
      if (facilityId) {
        setHprSelectedFacilityId(facilityId)
      }
    }

    if (!facilityId) {
      alert('事業所を選択してください。')
      return
    }

    await runHprAttendanceChildrenFetch({
      silent: false,
      date: resolvedDate,
      facilityId,
      facilities,
    })
  }, [
    reduxStore,
    runHprAttendanceChildrenFetch,
    setHprAttendanceChildren,
    setHprFacilities,
    setHprFacilitiesLoading,
    setHprSelectedChildId,
    setHprSelectedFacilityId,
  ])

  const handleHugAuthCredentialsSave = async () => {
    const state = reduxStore.getState().hugAuth
    if (!state.loginId.trim()) {
      alert('ログインIDを入力してください。')
      return
    }
    if (!state.password) {
      alert('パスワードを入力してください。')
      return
    }

    await saveHugAuthCredentials({
      loginId: state.loginId,
      password: state.password,
      autoLoginEnabled: state.autoLoginEnabled,
      keepSession: state.keepSession,
    })
    alert('自動ログイン情報を保存しました。')

    if (reduxStore.getState().hugAuth.autoLoginEnabled) {
      await runHugAutoLogin({ silent: true })
    }
  }

  const handleHugAutoLoginExecute = () => runHugAutoLogin({ silent: false, force: true })

  const handleHugAuthCredentialsClear = async () => {
    if (!window.confirm('保存したログイン情報を削除します。よろしいですか？')) return
    await clearHugAuthCredentials()
    dispatch(clearHugAuthCredentialsStateAction())
    alert('自動ログイン情報を削除しました。')
  }

  const pageHeader = useMemo(() => PAGE_TITLES[activePage], [activePage])

  const selectPage = (page) => {
    setSidebarOpen(false)
    window.location.hash = `/${page}`
  }

  const loadSupportRecords = async (childId, startDate, endDate) => {
    try {
      const records = await fetchJson(`${API_BASE}/support_records/_search?pk=child_id&values=${childId}`)
      return filterRecordsByDateRange(records, startDate, endDate)
    } catch (error) {
      console.warn('[loadSupportRecords] fallback to mock records', error)
      return filterRecordsByDateRange(MOCK_RECORDS, startDate, endDate)
    }
  }

  const handleChatStart = async () => {
    if (!selectedChildId) {
      alert('児童を選択してください。')
      return
    }
    if (chatStartDate > chatEndDate) {
      alert('開始日は終了日以前にしてください。')
      return
    }
    const records = await loadSupportRecords(selectedChildId, chatStartDate, chatEndDate)
    const preview = records
      .slice(0, 5)
      .map((record) => `・${formatRecordDate(record.target_date)}: ${record.content}`)
      .join('\n')
    setChatMessages([
      {
        role: 'assistant',
        content:
          `${selectedFacilityName}・${selectedChildName}さんの支援記録を取得しました（${records.length}件）。\n\n` +
          (preview || '指定期間の記録は見つかりませんでした。') +
          '\n\n記録の検索や要約について質問できます。',
        records,
      },
    ])
    setChatStarted(true)
  }

  const handleChatBack = () => {
    setChatStarted(false)
  }

  const handleChatSend = async () => {
    const trimmed = chatInput.trim()
    if (!trimmed) return

    const records = chatMessages.find((message) => message.records)?.records || []
    const recordsText = records.length
      ? records.map((record) => `- ${formatRecordDate(record.target_date)}: ${record.content}`).join('\n')
      : '記録なし'
    const history = chatMessages
      .filter((message) => !message.records)
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: message.content,
      }))
    const loadingMessage = { role: 'assistant', content: 'AIが回答を生成しています...' }

    setChatMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: trimmed },
      loadingMessage,
    ])
    setChatInput('')

    try {
      const reply = await callAi([
        {
          role: 'system',
          content: `${CHAT_SYSTEM_PROMPT}\n\n児童: ${selectedChildName}\n期間: ${chatStartDate} ～ ${chatEndDate}\n\n支援記録:\n${recordsText}`,
        },
        ...history,
        { role: 'user', content: trimmed },
      ])
      setChatMessages((prevMessages) =>
        prevMessages.map((message) => (message === loadingMessage ? { role: 'assistant', content: reply } : message)),
      )
    } catch (error) {
      setChatMessages((prevMessages) =>
        prevMessages.map((message) =>
          message === loadingMessage
            ? { role: 'assistant', content: `AI応答の取得に失敗しました: ${error.message}` }
            : message,
        ),
      )
    }
  }

  const handleCorrectionMode = (mode) => {
    setCorrectionMode(mode)
  }

  const runAttendanceUpdate = useCallback(
    async (options = {}) => {
      const force = Boolean(options?.force)
      const silent = options.silent ?? !force
      const blockReason = getAttendanceFetchBlockReason(reduxStore.getState())

      if (blockReason) {
        if (!silent) {
          alert(blockReason)
        }
        return
      }

      if (!silent) {
        setAttendanceLoading(true)
        setAttendanceStatus('HUG WM から入退室一覧を取得しています...')
      }

      try {
        const rows = addAttendanceFlags(
          await fetchAttendanceRows({
            date: attendanceDate,
            facilityMap: attendanceFacilityMap,
          }),
        )
        setAttendanceRows(rows)
        setAttendanceLastFetchedAt(Date.now())
      } catch (error) {
        if (silent) {
          console.error('[HUG WM] 入退室データ更新エラー:', error)
        } else {
          setAttendanceStatus(`取得に失敗しました: ${error.message}`)
        }
        if (!silent) {
          throw error
        }
      } finally {
        if (!silent) {
          setAttendanceLoading(false)
        }
      }
    },
    [
      attendanceDate,
      attendanceFacilityMap,
      reduxStore,
      setAttendanceLastFetchedAt,
      setAttendanceLoading,
      setAttendanceRows,
      setAttendanceStatus,
    ],
  )

  useAttendanceAutoUpdate(runAttendanceUpdate, {
    isPaused: () => {
      const state = reduxStore.getState()
      if (state.attendance.attendanceAutoUpdateEnabled !== 1) return true
      return !canFetchAttendanceFromState(state)
    },
  })

  const handleAttendanceFetch = () => runAttendanceUpdate({ force: true, silent: false })

  // 出席施設のトグル処理
  const handleAttendanceFacilityToggle = (facilityId, checked) => {
    setAttendanceFacilityMap((prev) => ({ ...prev, [String(facilityId)]: checked }))
  }

  // 半日時間の変更処理
  const handleHalfTimeChange = (value) => {
    const normalized = normalizeHalfTime(value)
    setHalfTime(normalized)
    localStorage.setItem(HALF_TIME_STORAGE_KEY, normalized)
  }

  // 左記録表示のトグル処理
  const handleShowLeftRecordsChange = (value) => {
    const next = Number(value) >= 1 ? 1 : 0
    setShowLeftRecords(next)
    localStorage.setItem(SHOW_LEFT_RECORDS_STORAGE_KEY, String(next))
  }

  const handleAttendanceAutoUpdateChange = (value) => {
    const next = Number(value) >= 1 ? 1 : 0
    setAttendanceAutoUpdateEnabled(next)
    localStorage.setItem(ATTENDANCE_AUTO_UPDATE_STORAGE_KEY, String(next))
  }

  // アラート設定の変更処理
  const handleAlertPrefChange = (row, field, value) => {
    const numberValue = Number(value)
    if (Number.isNaN(numberValue)) return
    setAlertPref(row.hugWeekdayIndex, row.c_id, {
      [field]: field === 'amPmFlag' ? (numberValue >= 1 ? 1 : 0) : Math.max(0, Math.floor(numberValue)),
    })
    setAttendanceRows((rows) => addAttendanceFlags(rows))
  }

  // 入室・退室登録の処理
  const handlePostEnter = async (row) => {
    if (!row.enterOnclick) {
      alert('この行には入室ボタンがありません。')
      return
    }
    const mailFlg = row.isEnterMailEnabled && window.confirm(`${row.name} さんの入室メールを送信しますか？`) ? 1 : 0
    setAttendanceStatus(`${row.name} さんの入室を登録しています...`)
    try {
      await postEnterAttendance(row, mailFlg)
      setAttendanceStatus(`${row.name} さんの入室を登録しました。一覧を更新しています...`)
      await runAttendanceUpdate({ force: true, silent: false })
    } catch (error) {
      setAttendanceStatus(`入室登録に失敗しました: ${error.message}`)
    }
  }

  // 退室登録の処理
  const handlePostLeave = async (row) => {
    if (!row.leaveOnclick) {
      alert('この行には退室ボタンがありません。')
      return
    }
    const mailFlg = Number(row.leaveIsMail) === 1 && window.confirm(`${row.name} さんの退室メールを送信しますか？`) ? 1 : 0
    setAttendanceStatus(`${row.name} さんの退室を登録しています...`)
    try {
      await postLeaveAttendance(row, mailFlg)
      setAttendanceStatus(`${row.name} さんの退室を登録しました。一覧を更新しています...`)
      await runAttendanceUpdate({ force: true, silent: false })
    } catch (error) {
      setAttendanceStatus(`退室登録に失敗しました: ${error.message}`)
    }
  }

  // 支援記録の検索処理
  const handlePrSearch = async () => {
    if (!selectedChildId) {
      alert('児童を選択してください。')
      return
    }
    if (prStartDate > prEndDate) {
      alert('開始日は終了日以前にしてください。')
      return
    }
    setPrStatus('記録を取得しています...')
    const records = sortRecordsByDateDesc(await loadSupportRecords(selectedChildId, prStartDate, prEndDate)).map(
      (record) => ({
        id: record.record_id ?? record.id,
        date: formatRecordDate(record.target_date),
        child: selectedChildName,
        content: record.content || '',
      }),
    )
    setPrResults(records)
    setPrStatus(records.length ? `${records.length}件の記録を取得しました。` : '指定条件の記録は見つかりませんでした。')
    setSelectedPr(null)
  }

  const handlePrSelect = (record) => {
    setSelectedPr(record)
  }

  const handlePrClose = () => {
    setSelectedPr(null)
  }

  const handleCorrect = async () => {
    if (!correctionOriginal.trim()) {
      alert('校正する文章を入力してください。')
      return
    }
    setCorrectionLoading(true)
    try {
      const reply = await callAi([
        { role: 'system', content: CORRECTION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            `元文章:\n${correctionOriginal}`,
            correctionAdditional.trim() ? `追加指示:\n${correctionAdditional}` : '',
          ]
            .filter(Boolean)
            .join('\n\n'),
        },
      ])
      setCorrectionText(reply)
      setCorrectionModalOpen(true)
    } catch (error) {
      alert(`AI校正に失敗しました: ${error.message}`)
    } finally {
      setCorrectionLoading(false)
    }
  }

  const handleRegister = async () => {
    const content = (correctionText || correctionOriginal).trim()
    if (!content) {
      alert('登録する記録内容がありません。')
      return
    }
    if (!selectedChildId) {
      alert('児童を選択してください。')
      return
    }
    if (!window.confirm(`支援日 ${correctionDate} の記録として登録します。よろしいですか？`)) return

    try {
      await fetchJson(`${API_BASE}/support_records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: Number(selectedChildId),
          user_id: 1,
          content,
          target_date: correctionDate,
        }),
      })
      alert('DBへの登録が完了しました。')
      setCorrectionOriginal('')
      setCorrectionText('')
      setCorrectionModalOpen(false)
    } catch (error) {
      alert(`登録に失敗しました: ${error.message}`)
    }
  }

  const handleHugFetch = async () => {
    if (!selectedChildId) {
      alert('児童を選択してください。')
      return
    }
    if (hprStartDate > hprEndDate) {
      alert('開始日は終了日以前にしてください。')
      return
    }
    setHprLoading(true)
    setHprResults([])
    setHprCachedRecord(null)
    setHprNote('')
    setHugStatus('HUG WM から取得しています...')
    try {
      const record = await fetchPersonalRecordWithNote({
        facilityId: Number(selectedFacilityId),
        date: hprStartDate,
        dateEnd: hprEndDate,
        childId: Number(selectedChildId),
      })
      setHprResults([record])
      setHprCachedRecord(record)
      setHprNote(record.note || '')
      setHprRecordStaff(record.recordStaff?.value || '')
      setHugStatus(`取得しました: ${record.date} / ${record.childName}`)
    } catch (error) {
      setHugStatus(`取得に失敗しました: ${error.message}`)
    } finally {
      setHprLoading(false)
    }
  }

  const handleHugMonthFetch = async () => {
    if (!selectedChildId) {
      alert('児童を選択してください。')
      return
    }
    setHprLoading(true)
    setHprResults([])
    setHprCachedRecord(null)
    setHprNote('')
    setHugStatus('過去月を検索しています...')
    try {
      const record = await fetchPersonalRecordUntilFound({
        facilityId: Number(selectedFacilityId),
        childId: Number(selectedChildId),
        onProgress: setHugStatus,
      })
      setHprStartDate(record.dateNorm || hprStartDate)
      setHprEndDate(record.dateNorm || hprEndDate)
      setHprResults([record])
      setHprCachedRecord(record)
      setHprNote(record.note || '')
      setHprRecordStaff(record.recordStaff?.value || '')
      setHugStatus(`取得しました: ${record.date} / ${record.childName}`)
    } catch (error) {
      setHugStatus(`取得に失敗しました: ${error.message}`)
    } finally {
      setHprLoading(false)
    }
  }

  const handleHprPanelHugFetch = async () => {
    if (!hprSelectedChildId) {
      alert('児童を選択してください。')
      return
    }
    if (hprStartDate > hprEndDate) {
      alert('開始日は終了日以前にしてください。')
      return
    }
    setHprLoading(true)
    setHprResults([])
    setHprCachedRecord(null)
    setHprNote('')
    setHugStatus('HUG WM から取得しています...')
    try {
      const record = await fetchPersonalRecordWithNote({
        facilityId: Number(hprSelectedFacilityId),
        date: hprStartDate,
        dateEnd: hprEndDate,
        childId: Number(hprSelectedChildId),
      })
      setHprResults([record])
      setHprCachedRecord(record)
      setHprNote(record.note || '')
      setHprRecordStaff(record.recordStaff?.value || '')
      setHugStatus(`取得しました: ${record.date} / ${record.childName}`)
    } catch (error) {
      setHugStatus(`取得に失敗しました: ${error.message}`)
    } finally {
      setHprLoading(false)
    }
  }

  const handleHprPanelHugMonthFetch = async () => {
    if (!hprSelectedChildId) {
      alert('児童を選択してください。')
      return
    }
    setHprLoading(true)
    setHprResults([])
    setHprCachedRecord(null)
    setHprNote('')
    setHugStatus('過去月を検索しています...')
    try {
      const record = await fetchPersonalRecordUntilFound({
        facilityId: Number(hprSelectedFacilityId),
        childId: Number(hprSelectedChildId),
        onProgress: setHugStatus,
      })
      setHprStartDate(record.dateNorm || hprStartDate)
      setHprEndDate(record.dateNorm || hprEndDate)
      setHprResults([record])
      setHprCachedRecord(record)
      setHprNote(record.note || '')
      setHprRecordStaff(record.recordStaff?.value || '')
      setHugStatus(`取得しました: ${record.date} / ${record.childName}`)
    } catch (error) {
      setHugStatus(`取得に失敗しました: ${error.message}`)
    } finally {
      setHprLoading(false)
    }
  }

  const handleHugSave = async (state) => {
    if (!hprCachedRecord?.editHtml) {
      alert('先に個人記録を取得してください。')
      return
    }
    if (state === '2' && !window.confirm('公開で更新します。よろしいですか？')) return
    setHprLoading(true)
    setHugStatus(state === '2' ? '公開保存しています...' : '下書き保存しています...')
    try {
      await postContactBookUpdateFromEditHtml(hprCachedRecord.editHtml, {
        note: hprNote,
        recordStaff: hprRecordStaff,
        state,
      })
      setHugStatus(state === '2' ? '公開保存しました。' : '下書き保存しました。')
    } catch (error) {
      setHugStatus(`保存に失敗しました: ${error.message}`)
    } finally {
      setHprLoading(false)
    }
  }

  const pageDescription = useMemo(() => {
    switch (activePage) {
      case 'chat':
        return '過去のデータをもとにAIと対話を行います。'
      case 'correction':
        return 'HUG WM の入退室一覧を取得し、入室登録を行います。'
      case 'dashboard':
        return 'プロンプト管理とバッチ処理のステータスを確認します。'
      case 'personal-record':
        return '児童ごとの支援記録（support_records）を期間指定で表示します。'
      case 'hug-personal-record':
        return 'HUG WM の連絡帳一覧から「出席」の日のみ編集画面を開き、活動内容（note）を取得します。'
      default:
        return ''
    }
  }, [activePage])

  return {
    NAV_LINKS,
    ATTENDANCE_FACILITY_OPTIONS,
    HUG_WM_BASE_URL,
    HUG_WM_CONTACT_BOOK_LIST_URL,
    HUG_TIME_RE,
    WEEKDAY_JA,
    activePage,
    attendanceDate,
    attendanceFacilityMap,
    attendanceLoading,
    attendanceRows,
    attendanceStatus,
    attendanceLastFetchedAt,
    attendanceAutoUpdateEnabled,
    attendanceFacilitiesReady,
    canFetchAttendance,
    hprFacilitiesLoading,
    showLeftRecords,
    chatEndDate,
    chatInput,
    chatMessages,
    chatModel,
    chatStarted,
    chatStartDate,
    correctionAdditional,
    correctionLoading,
    correctionModalOpen,
    correctionMode,
    correctionOriginal,
    correctionDate,
    correctionText,
    displayAttendanceRows,
    facilities,
    halfTime,
    handleAlertPrefChange,
    handleAttendanceAutoUpdateChange,
    handleAttendanceFacilityToggle,
    handleAttendanceFetch,
    handleChatBack,
    handleChatSend,
    handleChatStart,
    handleCorrect,
    handleCorrectionMode,
    handleFacilityChange,
    handleHalfTimeChange,
    handleHugAuthCredentialsClear,
    handleHugAuthCredentialsSave,
    handleHugAutoLoginExecute,
    handleHugFetch,
    handleHugMonthFetch,
    handleHprAttendanceDateChange,
    handleHprAttendanceFetch,
    handleHprFacilityChange,
    handleHprPanelHugFetch,
    handleHprPanelHugMonthFetch,
    handleHugSave,
    handlePostEnter,
    handlePostLeave,
    handlePrClose,
    handlePrSearch,
    handlePrSelect,
    handleRegister,
    handleShowLeftRecordsChange,
    hprCachedRecord,
    hprEndDate,
    hprLoading,
    hprNote,
    hprRecordStaff,
    hprResults,
    hprAttendanceDate,
    hprFacilities,
    hprFacilitiesLoading,
    hprPublishSaveVisible,
    hugAutoLoginEnabled,
    hugKeepSession,
    hugLoginId,
    hugLoginCheckLoading,
    hugLoginStatus,
    hugPassword,
    hprSelectedChildId,
    hprSelectedFacilityId,
    hprStartDate,
    hugStatus,
    pageDescription,
    pageHeader,
    prEndDate,
    prResults,
    prStartDate,
    prStatus,
    selectPage,
    selectedChildId,
    selectedChildren,
    selectedFacilityId,
    selectedPr,
    setAttendanceDate,
    setChatEndDate,
    setChatInput,
    setChatModel,
    setChatStartDate,
    setCorrectionAdditional,
    setCorrectionDate,
    setCorrectionModalOpen,
    setCorrectionOriginal,
    setCorrectionText,
    setHprEndDate,
    setHprNote,
    setHprRecordStaff,
    setHugAutoLoginEnabled,
    setHugKeepSession,
    setHugLoginId,
    setHugPassword,
    setHprAttendanceDate,
    setHprSelectedChildId,
    setHprStartDate,
    setPrEndDate,
    setPrStartDate,
    setSelectedChildId,
    setSidebarOpen,
    setSidePanelTab,
    sidePanelTab,
    sidebarOpen,
  }
}
