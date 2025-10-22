// modules/childrenList.js
import { AppState,getWeekdayFromDate } from "./config.js";
import { initSidebar, updateSidebarValues } from "../sidebar/sidebar.js";

export async function initStaffFacility() {
  async function loadStaffFacility() {
    const data = await window.electronAPI.getStaffAndFacility();
    AppState.STAFF_DATA = data.staffs;
    AppState.FACILITY_DATA = data.facilitys;
    AppState.STAFF_AND_FACILITY_DATA = data.staffAndFacility;
    
    // 設定モーダルが開いている場合はセレクトボックスを更新
    updateSelectBoxesIfModalOpen(data);
  }

  await loadStaffFacility();
}

// 設定モーダルが開いている場合のセレクトボックス更新
function updateSelectBoxesIfModalOpen(data) {
  const settingsModal = document.getElementById('settingsModal');
  if (settingsModal && settingsModal.style.display === 'block') {
    // スタッフセレクトボックスを更新
    const staffSelect = document.querySelector('#config-staff-id');
    if (staffSelect && data.staffs) {
      // 既存のオプションをクリア（最初の「選択してください」以外）
      while (staffSelect.children.length > 1) {
        staffSelect.removeChild(staffSelect.lastChild);
      }
      
      // スタッフデータを追加
      data.staffs.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff.id;
        option.textContent = staff.name;
        staffSelect.appendChild(option);
      });
    }
    
    // 施設セレクトボックスを更新
    const facilitySelect = document.querySelector('#config-facility-id');
    if (facilitySelect && data.facilitys) {
      // 既存のオプションをクリア（最初の「選択してください」以外）
      while (facilitySelect.children.length > 1) {
        facilitySelect.removeChild(facilitySelect.lastChild);
      }
      
      // 施設データを追加
      data.facilitys.forEach(facility => {
        const option = document.createElement('option');
        option.value = facility.id;
        option.textContent = facility.name;
        facilitySelect.appendChild(option);
      });
    }
    
    console.log('✅ [STAFF_FACILITY] 設定モーダルのセレクトボックスを更新しました');
  }
}
