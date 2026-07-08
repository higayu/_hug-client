// renderer/src/components/SettingsModal/useSettingsModalLogic/useApiSelectBoxes/index.js
import { useCallback } from 'react'
import { sqliteApi } from '@/hooks/useDataBase/sql/sqliteApi.js'
import { mariadbApi } from '@/hooks/useDataBase/sql/mariadbApi.js'

import { getJoinedStaffFacilityData } from './staffDispatcher'
import { apiSelectLogStyle } from './settingsModalLogStyle'
import {
  toBooleanFlag,
  toId,
  isNotDeleted,
} from '../settingsModalUtils'

const getApiByDatabaseType = (databaseType) => {
  return databaseType === 'mariadb' ? mariadbApi : sqliteApi
}

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

  console.log('%c🧾 データ確認', apiSelectLogStyle.info, {
    staffs,
    facilityStaff,
    facilitys,
  })

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
    source: 'databaseTables',
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
    let groupOpened = false

    try {
      console.groupCollapsed(
        '%c🚀 [API SELECT INIT] initializeApiSelectBoxes START',
        apiSelectLogStyle.title
      )
      groupOpened = true

      console.log(
        '%c📌 API設定セレクトボックス初期化を開始しました',
        apiSelectLogStyle.info
      )
      console.log(
        '%c🕒 startedAt:',
        apiSelectLogStyle.info,
        new Date().toISOString()
      )

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

      const apiToUse = getApiByDatabaseType(selectedDatabaseType)

      console.log('%c📌 使用DB', apiSelectLogStyle.info, selectedDatabaseType)
      console.log(
        '%c📌 使用API',
        apiSelectLogStyle.info,
        selectedDatabaseType === 'mariadb' ? 'mariadbApi' : 'sqliteApi'
      )

      let joinedData = []

      try {
        joinedData = getJoinedStaffFacilityData()

        console.log(
          '%c📊 Reduxストアから取得データ',
          apiSelectLogStyle.info,
          joinedData
        )
      } catch (error) {
        console.warn(
          '%c⚠️ Redux結合データの取得に失敗しました',
          apiSelectLogStyle.warn,
          error
        )
      }

      let builtData = {
        source: '',
        allStaffList: [],
        facilityList: [],
      }

      try {
        if (!apiToUse?.getAllTables) {
          throw new Error('getAllTables が API に存在しません')
        }

        const tables = await apiToUse.getAllTables()

        console.log(
          '%c📊 データベースから取得したテーブル',
          apiSelectLogStyle.info,
          tables
        )

        if (
          tables &&
          (Array.isArray(tables.staffs) ||
            Array.isArray(tables.facility_staff) ||
            Array.isArray(tables.facilitys))
        ) {
          builtData = buildFromTables(tables)
        }
      } catch (error) {
        console.warn(
          '%c⚠️ DBからの取得に失敗したためReduxデータへフォールバックします',
          apiSelectLogStyle.warn,
          error
        )
      }

      if (
        (!builtData.facilityList.length || !builtData.allStaffList.length) &&
        Array.isArray(joinedData) &&
        joinedData.length > 0
      ) {
        builtData = buildFromJoinedData(joinedData)
      }

      const { source, allStaffList, facilityList } = builtData

      if (!facilityList.length && !allStaffList.length) {
        console.warn(
          '%c⚠️ スタッフ・施設データが取得できませんでした',
          apiSelectLogStyle.warn
        )

        return {
          success: false,
          reason: 'no-data',
          source,
          allStaffList,
          facilityList,
        }
      }

      console.log('%c🧱 初期化用データ source', apiSelectLogStyle.info, source)

      console.log('%c🏢 facilityList 全件', apiSelectLogStyle.success, {
        count: facilityList.length,
      })
      console.table(facilityList)

      console.log('%c👤 allStaffList 全件', apiSelectLogStyle.info, {
        count: allStaffList.length,
      })
      console.table(allStaffList)

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
          '%c🔎 施設に紐づくスタッフへフィルター',
          apiSelectLogStyle.success,
          {
            facilityId: targetFacilityId,
            preferredStaffId: targetStaffId,
            filteredStaffCount: filteredStaffList.length,
            staffSelectValue: staffSelect.value,
          }
        )
        console.table(filteredStaffList)

        console.log(
          '%c👤 staffSelect options after filter',
          apiSelectLogStyle.info,
          getOptionsSnapshot(staffSelect)
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

        console.log(
          '%c✅ 施設セレクト初期化完了',
          apiSelectLogStyle.success,
          {
            facilityCount: facilityList.length,
            optionCount: facilitySelect.options.length,
            selectedFacilityId,
            selectedFacilityText:
              facilitySelect.selectedOptions?.[0]?.textContent ?? '',
          }
        )
        console.table(getOptionsSnapshot(facilitySelect))

        if (
          selectedFacilityId &&
          !Array.from(facilitySelect.options).some(
            (option) => option.value === selectedFacilityId
          )
        ) {
          console.warn(
            '%c⚠️ iniState の facilityId が施設セレクト候補に存在しません',
            apiSelectLogStyle.warn,
            {
              selectedFacilityId,
              availableValues: Array.from(facilitySelect.options).map(
                (option) => option.value
              ),
            }
          )
        }
      } else {
        console.warn(
          '%c⚠️ facilitySelect 要素が見つかりません',
          apiSelectLogStyle.warn
        )
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

          console.log(
            '%c🏢 施設変更 → スタッフ再フィルター',
            apiSelectLogStyle.info,
            {
              nextFacilityId,
              currentStaffId,
              facilityName:
                event.target.selectedOptions?.[0]?.textContent ?? '',
            }
          )

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

      console.log('%c🎯 適用値', apiSelectLogStyle.info, {
        selectedStaffId,
        selectedFacilityId,
        selectedAiType,
        selectedBaseUrl,
        selectedDatabaseType,
        selectedAutoSynchronization,
        selectedAutoSwitching,
        actualStaffSelectValue: staffSelect?.value ?? '',
        actualFacilitySelectValue: facilitySelect?.value ?? '',
      })

      console.log(
        '%c🎉 [API SELECT INIT] initializeApiSelectBoxes END',
        apiSelectLogStyle.success,
        {
          source,
          allStaffCount: allStaffList.length,
          facilityCount: facilityList.length,
          initialFilteredStaffCount: initialFilteredStaffList.length,
          selectedStaffId,
          selectedFacilityId,
          actualStaffSelectValue: staffSelect?.value ?? '',
          actualFacilitySelectValue: facilitySelect?.value ?? '',
          selectedDatabaseType,
        }
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
      console.error(
        '%c❌ [SettingsModal] APIセレクトボックス初期化エラー',
        apiSelectLogStyle.error,
        error
      )

      return {
        success: false,
        reason: 'error',
        error,
      }
    } finally {
      if (groupOpened) {
        console.groupEnd()
      }
    }
  }, [iniState, appState])

  return {
    initializeApiSelectBoxes,
  }
}