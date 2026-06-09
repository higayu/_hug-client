import { FACILITY_SELECT_SELECTOR, HUG_WM_ATTENDANCE_URL } from '../shared/constants'
import { hugWmFetchText } from '../shared/fetch'

const parseFacilitiesFromSelect = (select) =>
  [...select.querySelectorAll('option')]
    .map((option) => ({
      facility_id: Number(option.value.trim()),
      name: option.textContent?.trim() || '',
      selected: option.selected,
    }))
    .filter((facility) => facility.facility_id > 0 || facility.name)
    .filter((facility) => Number.isFinite(facility.facility_id) && facility.facility_id > 0)

/** attendance.php の施設 select から事業所一覧を取得 */
export async function fetchFacilitiesFromHugWm() {
  console.log('[HUG WM] 施設データ取得 fetch開始:', HUG_WM_ATTENDANCE_URL)
  const html = await hugWmFetchText(HUG_WM_ATTENDANCE_URL)
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const facilitySelect = doc.querySelector(FACILITY_SELECT_SELECTOR)
  if (!facilitySelect) {
    throw new Error('施設選択 select が見つかりません（HUG WM にログイン済みか確認してください）')
  }
  const facilities = parseFacilitiesFromSelect(facilitySelect)
  console.log('[HUG WM] 施設データ:', facilities)
  return facilities
}
