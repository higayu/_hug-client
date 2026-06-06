import { useEffect, useMemo } from 'react'
import { useAppState } from '@/hooks/useAppState'
import { API_BASE, CHAT_SYSTEM_PROMPT, CORRECTION_SYSTEM_PROMPT, NAV_LINKS, PAGE_TITLES } from '@/constants/appConfig'
import { MOCK_CHILDREN, MOCK_FACILITIES, MOCK_RECORDS } from '@/constants/mockData'
import { callAi } from '@/services/aiClient'
import { fetchJson } from '@/services/apiClient'
import {
  addAttendanceFlags,
  ATTENDANCE_FACILITY_OPTIONS,
  fetchAttendanceRows,
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
} from '@/services/hugService'
import { filterRecordsByDateRange, formatRecordDate, sortRecordsByDateDesc } from '@/utils/recordUtils'
const hashToPage = (hash) => {
  const page = hash.replace(/^#\/?/, '')
  return NAV_LINKS.some((link) => link.key === page) ? page : 'chat'
}

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
    halfTime,
    showLeftRecords,
    attendanceFacilityMap,
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
    setHalfTime,
    setShowLeftRecords,
    setAttendanceFacilityMap,
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
  } = useAppState()

  useEffect(() => {
    document.body.classList.add('hug-attendance-primary-page')
    return () => document.body.classList.remove('hug-attendance-primary-page')
  }, [])

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
      try {
        const data = await fetchJson(`${API_BASE}/children/_search?pk=facility_id&values=${facilityId}`)
        if (!mounted) return
        dispatch(setChildrenByFacilityAction({
          ...reduxStore.getState().facility.childrenByFacility,
          [facilityId]: data,
        }))
        if (data[0]?.child_id && !reduxStore.getState().facility.selectedChildId) {
          dispatch(setSelectedChildIdAction(data[0].child_id))
        }
      } catch (error) {
        console.warn('[loadChildren] fallback to mock data', error)
        const fallback = MOCK_CHILDREN[facilityId] || []
        if (!mounted) return
        dispatch(setChildrenByFacilityAction({
          ...reduxStore.getState().facility.childrenByFacility,
          [facilityId]: fallback,
        }))
        if (fallback[0]?.child_id && !reduxStore.getState().facility.selectedChildId) {
          dispatch(setSelectedChildIdAction(fallback[0].child_id))
        }
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
        dispatch(setSelectedFacilityIdAction(MOCK_FACILITIES[0].facility_id))
        await loadChildren(MOCK_FACILITIES[0].facility_id)
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

  const handleFacilityChange = async (value) => {
    const facilityId = Number(value)
    setSelectedFacilityId(facilityId)
    const children = childrenByFacility[facilityId]
    if (children?.[0]?.child_id) {
      setSelectedChildId(children[0].child_id)
      return
    }

    try {
      const data = await fetchJson(`${API_BASE}/children/_search?pk=facility_id&values=${facilityId}`)
      setChildrenByFacility((prev) => ({ ...prev, [facilityId]: data }))
      setSelectedChildId(data[0]?.child_id || '')
    } catch (error) {
      console.warn('[handleFacilityChange] fallback to mock data', error)
      const fallback = MOCK_CHILDREN[facilityId] || []
      setChildrenByFacility((prev) => ({ ...prev, [facilityId]: fallback }))
      setSelectedChildId(fallback[0]?.child_id || '')
    }
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

  const handleAttendanceFetch = async () => {
    setAttendanceLoading(true)
    setAttendanceStatus('HUG WM から入退室一覧を取得しています...')
    try {
      const rows = addAttendanceFlags(await fetchAttendanceRows({
        date: attendanceDate,
        facilityMap: attendanceFacilityMap,
      }))
      setAttendanceRows(rows)
      setAttendanceStatus(rows.length ? `${rows.length}件の入退室データを取得しました。` : '入退室データが見つかりませんでした。')
    } catch (error) {
      setAttendanceStatus(`取得に失敗しました: ${error.message}`)
    } finally {
      setAttendanceLoading(false)
    }
  }

  const handleAttendanceFacilityToggle = (facilityId, checked) => {
    setAttendanceFacilityMap((prev) => ({ ...prev, [String(facilityId)]: checked }))
  }

  const handleHalfTimeChange = (value) => {
    const normalized = normalizeHalfTime(value)
    setHalfTime(normalized)
    localStorage.setItem(HALF_TIME_STORAGE_KEY, normalized)
  }

  const handleShowLeftRecordsChange = (value) => {
    const next = Number(value) >= 1 ? 1 : 0
    setShowLeftRecords(next)
    localStorage.setItem(SHOW_LEFT_RECORDS_STORAGE_KEY, String(next))
  }

  const handleAlertPrefChange = (row, field, value) => {
    const numberValue = Number(value)
    if (Number.isNaN(numberValue)) return
    setAlertPref(row.hugWeekdayIndex, row.c_id, {
      [field]: field === 'amPmFlag' ? (numberValue >= 1 ? 1 : 0) : Math.max(0, Math.floor(numberValue)),
    })
    setAttendanceRows((rows) => addAttendanceFlags(rows))
  }

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
      await handleAttendanceFetch()
    } catch (error) {
      setAttendanceStatus(`入室登録に失敗しました: ${error.message}`)
    }
  }

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
      await handleAttendanceFetch()
    } catch (error) {
      setAttendanceStatus(`退室登録に失敗しました: ${error.message}`)
    }
  }

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
    handleAttendanceFacilityToggle,
    handleAttendanceFetch,
    handleChatBack,
    handleChatSend,
    handleChatStart,
    handleCorrect,
    handleCorrectionMode,
    handleFacilityChange,
    handleHalfTimeChange,
    handleHugFetch,
    handleHugMonthFetch,
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
    setHprStartDate,
    setPrEndDate,
    setPrStartDate,
    setSelectedChildId,
    setSidebarOpen,
    setSidePanelTab,
    showLeftRecords,
    sidePanelTab,
    sidebarOpen,
  }
}
