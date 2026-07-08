// renderer/src/components/SettingsModal/useSettingsModalLogic/useApiSelectBoxes/index.js
import { useCallback } from 'react'

import { getJoinedStaffFacilityData } from './staffDispatcher'
import {
  toBooleanFlag,
  toId,
  isNotDeleted,
} from '../settingsModalUtils'

const LOG_PREFIX = '[API SELECT]'

const getOptionsSnapshot = (select) => {
  if (!select) return []

  return Array.from(select.options).map((option, index) => ({
    index,
    value: option.value,
    text: option.textContent,
    selected: option.selected,
    disabled: option.disabled,
  }))
}

const clearSelectOptions = (select) => {
  if (!select) return

  while (select.children.length > 1) {
    select.removeChild(select.lastChild)
  }
}

const appendOptions = (select, items, getValue, getText) => {
  if (!select) return

  items.forEach((item) => {
    const option = document.createElement('option')
    option.value = String(getValue(item))
    option.textContent = getText(item)
    select.appendChild(option)
  })
}

const buildFromTables = (tables) => {
  const staffs = Array.isArray(tables?.staffs) ? tables.staffs : []
  const facilityStaff = Array.isArray(tables?.facility_staff)
    ? tables.facility_staff
    : []
  const facilitys = Array.isArray(tables?.facilitys) ? tables.facilitys : []

  const facilityList = facilitys
    .filter((facility) => {
      return (
        facility?.id != null &&
        facility?.name &&
        isNotDeleted(facility?.is_delete)
      )
    })
    .map((facility) => ({
      id: toId(facility.id),
      name: facility.name,
      url: facility.url || '',
    }))

  const facilityById = new Map(
    facilityList.map((facility) => [facility.id, facility])
  )

  const allStaffList = staffs
    .filter((staff) => {
      return (
        toId(staff?.id) !== '-1' &&
        staff?.name &&
        isNotDeleted(staff?.is_delete)
      )
    })
    .map((staff) => {
      const facilityIdArray = facilityStaff
        .filter((fs) => toId(fs?.staff_id) === toId(staff.id))
        .map((fs) => toId(fs?.facility_id))
        .filter(Boolean)

      const uniqueFacilityIdArray = Array.from(new Set(facilityIdArray))

      const facilityNames = uniqueFacilityIdArray
        .map((facilityId) => facilityById.get(facilityId)?.name)
        .filter(Boolean)

      return {
        staff_id: toId(staff.id),
        staff_name: staff.name,
        notes: staff.notes ?? '',
        is_delete: staff.is_delete ?? 0,
        facility_ids: uniqueFacilityIdArray.join(','),
        facility_names: facilityNames.join(', '),
        facility_id_array: uniqueFacilityIdArray,
      }
    })

  return {
    source: 'appState.databaseState',
    allStaffList,
    facilityList,
  }
}

const buildFromJoinedData = (joinedData) => {
  const allStaffList = joinedData
    .filter((item) => {
      return (
        item?.staff_id != null &&
        item?.staff_name &&
        isNotDeleted(item?.is_delete)
      )
    })
    .map((item) => {
      const facilityIdArray = String(item.facility_ids ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)

      return {
        staff_id: toId(item.staff_id),
        staff_name: item.staff_name,
        notes: item.notes ?? '',
        is_delete: item.is_delete ?? 0,
        facility_ids: facilityIdArray.join(','),
        facility_names: item.facility_names ?? '',
        facility_id_array: facilityIdArray,
      }
    })

  const facilityMap = new Map()

  allStaffList.forEach((staff) => {
    const facilityNames = String(staff.facility_names ?? '')
      .split(', ')
      .map((name) => name.trim())

    staff.facility_id_array.forEach((facilityId, index) => {
      const name = facilityNames[index] || `施設ID:${facilityId}`

      if (facilityId && !facilityMap.has(facilityId)) {
        facilityMap.set(facilityId, name)
      }
    })
  })

  const facilityList = Array.from(facilityMap.entries()).map(([id, name]) => ({
    id: toId(id),
    name,
  }))

  return {
    source: 'reduxJoinedData',
    allStaffList,
    facilityList,
  }
}

export function useApiSelectBoxes({ iniState, appState }) {
  const initializeApiSelectBoxes = useCallback(async () => {
    try {
      console.log(`${LOG_PREFIX} 初期化開始`)

      const staffSelect = document.getElementById('api-staff-id')
      const facilitySelect = document.getElementById('api-facility-id')
      const aiSelect = document.getElementById('api-ai-type')
      const baseUrlInput = document.getElementById('api-base-url')
      const databaseTypeSelect = document.getElementById('api-database-type')
      const autoSynchronizationInput = document.getElementById(
        'api-auto-synchronization'
      )
      const autoSwitchingInput = document.getElementById('api-auto-switching')

      const selectedDatabaseType =
        iniState?.apiSettings?.databaseType ||
        appState?.DATABASE_TYPE ||
        'sqlite'

      let builtData = {
        source: '',
        allStaffList: [],
        facilityList: [],
      }

      const tables = appState?.databaseState || null

      if (
        tables &&
        (Array.isArray(tables.staffs) ||
          Array.isArray(tables.facility_staff) ||
          Array.isArray(tables.facilitys))
      ) {
        builtData = buildFromTables(tables)
      }

      if (!builtData.facilityList.length || !builtData.allStaffList.length) {
        try {
          const joinedData = getJoinedStaffFacilityData()

          if (Array.isArray(joinedData) && joinedData.length > 0) {
            builtData = buildFromJoinedData(joinedData)
          }
        } catch (error) {
          console.warn(`${LOG_PREFIX} Redux結合データ取得失敗`, error)
        }
      }

      const { source, allStaffList, facilityList } = builtData

      if (!facilityList.length && !allStaffList.length) {
        console.warn(`${LOG_PREFIX} スタッフ・施設データがありません`)

        return {
          success: false,
          reason: 'no-data',
          source,
          allStaffList,
          facilityList,
        }
      }

      console.log(
        `${LOG_PREFIX} データ読込完了 source=${source}, facilities=${facilityList.length}, staffs=${allStaffList.length}`
      )

      const getFilteredStaffList = (facilityId) => {
        const targetFacilityId = toId(facilityId)

        if (!targetFacilityId) {
          return allStaffList
        }

        return allStaffList.filter((staff) => {
          return staff.facility_id_array.includes(targetFacilityId)
        })
      }

      const rebuildStaffSelectByFacility = (
        facilityId,
        preferredStaffId = ''
      ) => {
        if (!staffSelect) return []

        const targetFacilityId = toId(facilityId)
        const targetStaffId = toId(preferredStaffId)
        const filteredStaffList = getFilteredStaffList(targetFacilityId)

        clearSelectOptions(staffSelect)

        appendOptions(
          staffSelect,
          filteredStaffList,
          (staff) => staff.staff_id,
          (staff) => staff.staff_name
        )

        const canKeepSelectedStaff =
          targetStaffId &&
          filteredStaffList.some((staff) => staff.staff_id === targetStaffId)

        staffSelect.value = canKeepSelectedStaff ? targetStaffId : ''

        console.log(
          `${LOG_PREFIX} スタッフ絞り込み facilityId=${targetFacilityId || '(未選択)'}, count=${filteredStaffList.length}`
        )

        return filteredStaffList
      }

      const selectedStaffId = toId(iniState?.apiSettings?.staffId || '')
      const selectedFacilityId = toId(iniState?.apiSettings?.facilityId || '')
      const selectedAiType =
        iniState?.apiSettings?.useAI || appState?.USE_AI || 'gemini'
      const selectedBaseUrl = iniState?.apiSettings?.baseURL || ''
      const selectedAutoSynchronization = toBooleanFlag(
        iniState?.apiSettings?.autoSynchronization,
        true
      )
      const selectedAutoSwitching = toBooleanFlag(
        iniState?.apiSettings?.autoSwitching,
        true
      )

      if (facilitySelect) {
        clearSelectOptions(facilitySelect)

        appendOptions(
          facilitySelect,
          facilityList,
          (facility) => facility.id,
          (facility) => facility.name
        )

        facilitySelect.value = selectedFacilityId

        if (
          selectedFacilityId &&
          !Array.from(facilitySelect.options).some(
            (option) => option.value === selectedFacilityId
          )
        ) {
          console.warn(
            `${LOG_PREFIX} iniState の facilityId が候補にありません: ${selectedFacilityId}`
          )
        }
      } else {
        console.warn(`${LOG_PREFIX} facilitySelect が見つかりません`)
      }

      const initialFilteredStaffList = rebuildStaffSelectByFacility(
        selectedFacilityId,
        selectedStaffId
      )

      if (facilitySelect) {
        if (facilitySelect.__apiFacilityChangeHandler) {
          facilitySelect.removeEventListener(
            'change',
            facilitySelect.__apiFacilityChangeHandler
          )
        }

        facilitySelect.__apiFacilityChangeHandler = (event) => {
          const nextFacilityId = event.target.value
          const currentStaffId = staffSelect?.value || ''

          rebuildStaffSelectByFacility(nextFacilityId, currentStaffId)
        }

        facilitySelect.addEventListener(
          'change',
          facilitySelect.__apiFacilityChangeHandler
        )
      }

      if (aiSelect) {
        aiSelect.value = selectedAiType
      }

      if (baseUrlInput) {
        baseUrlInput.value = selectedBaseUrl
      }

      if (databaseTypeSelect) {
        databaseTypeSelect.value = selectedDatabaseType
      }

      if (autoSynchronizationInput) {
        autoSynchronizationInput.checked = selectedAutoSynchronization
      }

      if (autoSwitchingInput) {
        autoSwitchingInput.checked = selectedAutoSwitching
      }

      console.log(
        `${LOG_PREFIX} 初期化完了 facilityId=${selectedFacilityId || '(未選択)'}, staffId=${staffSelect?.value || '(未選択)'}, ai=${selectedAiType}`
      )

      return {
        success: true,
        source,
        allStaffList,
        facilityList,
        initialFilteredStaffList,
        selectedStaffId,
        selectedFacilityId,
        selectedDatabaseType,
        staffSelectOptions: getOptionsSnapshot(staffSelect),
        facilitySelectOptions: getOptionsSnapshot(facilitySelect),
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} 初期化エラー`, error)

      return {
        success: false,
        reason: 'error',
        error,
      }
    }
  }, [iniState, appState])

  return {
    initializeApiSelectBoxes,
  }
}