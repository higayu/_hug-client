// src/components/Sidebar/SelectChildrenList/TodayChildrenList/useTodayChildrenListController.js
// 選択児童のフィルタリング処理
import { useCallback, useEffect, useMemo } from "react"
import {
  getAttendanceItemForChild,
  isChildAbsent,
  isChildExited,
} from "@/utils/attendance/helpers/attendanceStatus.js"
import { TABS } from "../constants"
import { debugLog, debugTable } from "../debug"
import { isMorningChild } from "../timeUtils";
import { useAppState } from '@/AppStateContext';

export function useTodayChildrenListController({
  SELECT_CHILD,
  SELECT_CHILD_FILTER_MODE,
  childrenData,
  waiting_childrenData,
  Experience_childrenData,
  attendanceData,
  activeTab,
  setDoneChildIds,
  setSelectedChild,
  setSelectedPcName,
}) {
  const { STAFF_ID, FACILITY_ID, CURRENT_DAY_OF_WEEK, appState } = useAppState();

  // ==============================
  // AppState 側の命名を画面側で扱いやすい名前に寄せる
  // ==============================
  const weekChildrenData = useMemo(() => {
    return Array.isArray(childrenData) ? childrenData : []
  }, [childrenData])

  const waitingChildrenData = useMemo(() => {
    return Array.isArray(waiting_childrenData) ? waiting_childrenData : []
  }, [waiting_childrenData])

  const experienceChildrenData = useMemo(() => {
    return Array.isArray(Experience_childrenData) ? Experience_childrenData : []
  }, [Experience_childrenData])

  const handleToggleDone = useCallback(
    (child, checked) => {
      debugLog("完了チェック変更", {
        checked,
        child,
        childId: child?.children_id,
        childName: child?.children_name,
      })

      setDoneChildIds((prev) => {
        const next = checked
          ? [...new Set([...prev, child.children_id])]
          : prev.filter((id) => id !== child.children_id)

        debugLog("doneChildIds 更新", {
          previous: prev,
          next,
        })

        return next
      })
    },
    [setDoneChildIds]
  )

  const getAttendanceItem = useCallback(
    (childId) => {
      const attendanceItem = getAttendanceItemForChild(attendanceData, childId)

      debugLog("attendanceItem 取得", {
        childId,
        attendanceItem,
      })

      return attendanceItem
    },
    [attendanceData]
  )

  /**
   * 施設IDによるフィルタリング判定
   */
  const isSameFacility = useCallback((child) => {
    if (!child) return false
    
    const childFacilityId = child.facility_id
    const currentFacilityId = Number(FACILITY_ID)
    
    if (childFacilityId != null && currentFacilityId != null) {
      return Number(childFacilityId) === currentFacilityId
    }
    
    // facility_id が存在しない場合は表示しない（安全側に倒す）
    return false
  }, [FACILITY_ID])

  const isChildVisible = useCallback(
    (child) => {
      if (!child) {
        return false
      }

      const mode = Number(SELECT_CHILD_FILTER_MODE ?? 1) // デフォルトを 1 に変更
      const attendanceItem = getAttendanceItem(child.children_id)

      const absent = isChildAbsent(attendanceItem)
      const exited = isChildExited(attendanceItem)
      const morning = isMorningChild(child)
      
      // 施設IDによるフィルタリング（全モード共通）
      const facilityMatch = isSameFacility(child)

      let visible = true

      // 0: 全件表示（施設フィルタリングのみ適用）
      if (mode === 0) {
        visible = facilityMatch
      }

      // 1: 施設で抽出
      else if (mode === 1) {
        visible = facilityMatch
      }

      // 2: 欠席を除く + 施設フィルタリング
      else if (mode === 2) {
        visible = facilityMatch && !absent
      }

      // 3: 欠席・午前を除く + 施設フィルタリング
      else if (mode === 3) {
        visible = facilityMatch && !absent && !morning
      }

      // 4: 欠席・午前・退室済みを除く + 施設フィルタリング
      else if (mode === 4) {
        visible = facilityMatch && !absent && !morning && !exited
      }

      debugLog("児童の表示判定", {
        mode,
        visible,
        childId: child?.children_id,
        childName: child?.children_name,
        priority: child?.priority,
        support_start_time: child?.support_start_time,
        support_end_time: child?.support_end_time,
        facility_id: child?.facility_id,
        currentFacilityId: FACILITY_ID,
        facilityMatch,
        absent,
        morning,
        exited,
        attendanceItem,
      })

      return visible
    },
    [getAttendanceItem, SELECT_CHILD_FILTER_MODE, isSameFacility]
  )

  const getChildAbsent = useCallback(
    (child) => {
      if (!child) {
        return false
      }

      const result = isChildAbsent(getAttendanceItem(child.children_id))

      debugLog("欠席判定", {
        childId: child?.children_id,
        childName: child?.children_name,
        result,
      })

      return result
    },
    [getAttendanceItem]
  )

  const getChildExited = useCallback(
    (child) => {
      if (!child) {
        return false
      }

      const result = isChildExited(getAttendanceItem(child.children_id))

      debugLog("退室済み判定", {
        childId: child?.children_id,
        childName: child?.children_name,
        result,
      })

      return result
    },
    [getAttendanceItem]
  )

  const filterVisibleChildren = useCallback(
    (children) => {
      const list = Array.isArray(children) ? children : []
      const filtered = list.filter(isChildVisible)

      debugLog("filterVisibleChildren 実行", {
        beforeCount: list.length,
        afterCount: filtered.length,
        SELECT_CHILD_FILTER_MODE,
        FACILITY_ID,
      })

      return filtered
    },
    [isChildVisible, SELECT_CHILD_FILTER_MODE]
  )

  // ==============================
  // priority 別に分類
  // ==============================
  const {
    normalChildren,
    sometimesChildren,
    temporaryChildren,
  } = useMemo(() => {
    const base = Array.isArray(weekChildrenData) ? weekChildrenData : []

    const result = {
      normalChildren: filterVisibleChildren(
        base.filter((child) => Number(child.priority ?? 0) === 0)
      ),
      sometimesChildren: filterVisibleChildren(
        base.filter((child) => Number(child.priority ?? 0) === 1)
      ),
      temporaryChildren: filterVisibleChildren(
        base.filter((child) => Number(child.priority ?? 0) === 2)
      ),
    }

    debugLog("priority別分類結果", {
      baseCount: base.length,
      normalCount: result.normalChildren.length,
      sometimesCount: result.sometimesChildren.length,
      temporaryCount: result.temporaryChildren.length,
      FACILITY_ID,
    })

    debugTable(
      "通常児童",
      result.normalChildren.map((child) => ({
        children_id: child.children_id,
        children_name: child.children_name,
        priority: child.priority,
        pc_name: child.pc_name,
        support_start_time: child.support_start_time,
        support_end_time: child.support_end_time,
        facility_id: child.facility_id,
      }))
    )

    debugTable(
      "時々児童",
      result.sometimesChildren.map((child) => ({
        children_id: child.children_id,
        children_name: child.children_name,
        priority: child.priority,
        pc_name: child.pc_name,
        support_start_time: child.support_start_time,
        support_end_time: child.support_end_time,
        facility_id: child.facility_id,
      }))
    )

    debugTable(
      "一時児童",
      result.temporaryChildren.map((child) => ({
        children_id: child.children_id,
        children_name: child.children_name,
        priority: child.priority,
        pc_name: child.pc_name,
        support_start_time: child.support_start_time,
        support_end_time: child.support_end_time,
        facility_id: child.facility_id,
      }))
    )

    return result
  }, [weekChildrenData, filterVisibleChildren])

  const visibleWaitingChildren = useMemo(() => {
    const result = filterVisibleChildren(waitingChildrenData)

    debugLog("待機児童フィルタ結果", {
      beforeCount: waitingChildrenData.length,
      afterCount: result.length,
    })

    debugTable(
      "待機児童",
      result.map((child) => ({
        children_id: child.children_id,
        children_name: child.children_name,
        priority: child.priority,
        pc_name: child.pc_name,
        support_start_time: child.support_start_time,
        support_end_time: child.support_end_time,
        facility_id: child.facility_id,
      }))
    )

    return result
  }, [waitingChildrenData, filterVisibleChildren])

  const visibleExperienceChildren = useMemo(() => {
    const result = filterVisibleChildren(experienceChildrenData)

    debugLog("体験児童フィルタ結果", {
      beforeCount: experienceChildrenData.length,
      afterCount: result.length,
    })

    debugTable(
      "体験児童",
      result.map((child) => ({
        children_id: child.children_id,
        children_name: child.children_name,
        priority: child.priority,
        pc_name: child.pc_name,
        support_start_time: child.support_start_time,
        support_end_time: child.support_end_time,
        facility_id: child.facility_id,
      }))
    )

    return result
  }, [experienceChildrenData, filterVisibleChildren])

  const getVisibleChildrenForTab = useCallback(
    (tab) => {
      let result = []

      switch (tab) {
        case TABS.NORMAL:
          result = normalChildren
          break

        case TABS.SOMETIMES:
          result = sometimesChildren
          break

        case TABS.TEMPORARY:
          result = temporaryChildren
          break

        case TABS.WAITING:
          result = visibleWaitingChildren
          break

        case TABS.EXPERIENCE:
          result = visibleExperienceChildren
          break

        default:
          result = []
          break
      }

      debugLog("現在タブの表示対象児童", {
        tab,
        count: result.length,
        children: result.map((child) => ({
          children_id: child.children_id,
          children_name: child.children_name,
          pc_name: child.pc_name,
          facility_id: child.facility_id,
        })),
      })

      return result
    },
    [
      normalChildren,
      sometimesChildren,
      temporaryChildren,
      visibleWaitingChildren,
      visibleExperienceChildren,
    ]
  )

  // ==============================
  // 初期選択
  // 重要:
  // - 通常タブ表示中だけ自動選択する
  // - 空のキャンセル/体験タブで SELECT_CHILD を空にした直後に、
  //   通常児童を勝手に再選択すると無限ループになるため
  // ==============================
  useEffect(() => {
    debugLog("初期選択 useEffect 実行", {
      SELECT_CHILD,
      activeTab,
      normalChildrenCount: normalChildren.length,
    })

    if (activeTab !== TABS.NORMAL) {
      debugLog("初期選択をスキップ", {
        reason: "通常タブではない",
        activeTab,
      })

      return
    }

    if (SELECT_CHILD || normalChildren.length === 0) {
      debugLog("初期選択をスキップ", {
        reason: SELECT_CHILD
          ? "すでに SELECT_CHILD が存在する"
          : "normalChildren が空",
        SELECT_CHILD,
      })

      return
    }

    const first = normalChildren[0]

    debugLog("初期選択を設定", {
      childId: first.children_id,
      childName: first.children_name,
      pcName: first.pc_name || "",
    })

    setSelectedChild(first.children_id, first.children_name)
    setSelectedPcName(first.pc_name || "")

    if (window.AppState) {
      window.AppState.SELECT_CHILD = first.children_id
      window.AppState.SELECT_CHILD_NAME = first.children_name
      window.AppState.SELECT_PC_NAME = first.pc_name || ""

      debugLog("window.AppState 初期選択反映", {
        SELECT_CHILD: window.AppState.SELECT_CHILD,
        SELECT_CHILD_NAME: window.AppState.SELECT_CHILD_NAME,
        SELECT_PC_NAME: window.AppState.SELECT_PC_NAME,
      })
    }
  }, [
    activeTab,
    normalChildren,
    SELECT_CHILD,
    setSelectedChild,
    setSelectedPcName,
  ])

  // ==============================
  // フィルタ変更時:
  // 欠席・午前・退室済みなどで非表示になった児童の選択を変更
  //
  // 重要:
  // - 現在タブに表示児童が0件の場合、SELECT_CHILDを解除しない
  // - 解除すると「通常タブの初期選択」と衝突して無限ループになる
  // ==============================
  useEffect(() => {
    debugLog("選択児童の表示状態チェック useEffect 実行", {
      SELECT_CHILD,
      SELECT_CHILD_FILTER_MODE,
      activeTab,
    })

    if (!SELECT_CHILD) {
      debugLog("選択児童チェックをスキップ", {
        reason: "SELECT_CHILD が空",
      })

      return
    }

    const visibleChildren = getVisibleChildrenForTab(activeTab)

    if (visibleChildren.length === 0) {
      debugLog("現在タブに表示児童がいないため選択状態は変更しない", {
        activeTab,
        SELECT_CHILD,
      })

      return
    }

    const selectedStillVisible = visibleChildren.some(
      (child) => String(child.children_id) === String(SELECT_CHILD)
    )

    debugLog("現在選択中の児童が表示対象に含まれるか", {
      SELECT_CHILD,
      selectedStillVisible,
      visibleChildrenCount: visibleChildren.length,
    })

    if (selectedStillVisible) {
      return
    }

    const first = visibleChildren[0]

    debugLog("非表示になった児童から先頭の表示児童へ選択変更", {
      previousSelectedChild: SELECT_CHILD,
      nextChildId: first.children_id,
      nextChildName: first.children_name,
      nextPcName: first.pc_name || "",
    })

    setSelectedChild(first.children_id, first.children_name)
    setSelectedPcName(first.pc_name || "")

    if (window.AppState) {
      window.AppState.SELECT_CHILD = first.children_id
      window.AppState.SELECT_CHILD_NAME = first.children_name
      window.AppState.SELECT_PC_NAME = first.pc_name || ""

      debugLog("window.AppState 選択変更反映", {
        SELECT_CHILD: window.AppState.SELECT_CHILD,
        SELECT_CHILD_NAME: window.AppState.SELECT_CHILD_NAME,
        SELECT_PC_NAME: window.AppState.SELECT_PC_NAME,
      })
    }
  }, [
    SELECT_CHILD,
    SELECT_CHILD_FILTER_MODE,
    activeTab,
    getVisibleChildrenForTab,
    setSelectedChild,
    setSelectedPcName,
  ])

  // ==============================
  // 子ども選択
  // ==============================
  const handleChildSelect = useCallback(
    (childId, childName, pcName = "") => {
      debugLog("子ども選択", {
        childId,
        childName,
        pcName,
        previousSelectedChild: SELECT_CHILD,
      })

      setSelectedChild(childId, childName)
      setSelectedPcName(pcName || "")

      if (window.AppState) {
        window.AppState.SELECT_CHILD = childId
        window.AppState.SELECT_CHILD_NAME = childName
        window.AppState.SELECT_PC_NAME = pcName || ""

        debugLog("window.AppState 子ども選択反映", {
          SELECT_CHILD: window.AppState.SELECT_CHILD,
          SELECT_CHILD_NAME: window.AppState.SELECT_CHILD_NAME,
          SELECT_PC_NAME: window.AppState.SELECT_PC_NAME,
        })
      }
    },
    [
      SELECT_CHILD,
      setSelectedChild,
      setSelectedPcName,
    ]
  )

  // ==============================
  // title
  // ==============================
  const getChildNotesTitle = useCallback((child) => {
    const notes2 = child?.notes2?.trim()
    return notes2 || undefined
  }, [])

  return {
    weekChildrenData,
    waitingChildrenData,
    experienceChildrenData,

    normalChildren,
    sometimesChildren,
    temporaryChildren,
    visibleWaitingChildren,
    visibleExperienceChildren,

    handleChildSelect,
    handleToggleDone,
    getChildNotesTitle,
    getChildAbsent,
    getChildExited,
  }
}