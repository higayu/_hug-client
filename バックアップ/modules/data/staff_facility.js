// modules/data/staff_facility.js
import { AppState,getWeekdayFromDate } from "../config/config.js";
import { initSidebar, updateSidebarValues } from "../../sidebar/sidebar.js";

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
    console.log('🔄 [STAFF_FACILITY] 設定モーダルが開いているため、セレクトボックスを更新します');
    console.log('📊 [STAFF_FACILITY] 受信データ:', data);
    
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
      console.log('✅ [STAFF_FACILITY] 施設セレクトボックスを更新しました');
    }
    
    // スタッフセレクトボックスを更新（施設フィルタリング適用）
    const staffSelect = document.querySelector('#config-staff-id');
    if (staffSelect && data.staffs) {
      // 現在選択されている施設IDを取得
      const selectedFacilityId = facilitySelect ? facilitySelect.value : '';
      console.log('🔍 [STAFF_FACILITY] 現在選択されている施設ID:', selectedFacilityId);
      
      // 施設が選択されている場合はフィルタリング
      let staffsToShow = data.staffs;
      if (selectedFacilityId && selectedFacilityId !== '') {
        staffsToShow = data.staffs.filter(staff => {
          if (!staff.facility_ids) return false;
          const facilityIds = staff.facility_ids.split(',').map(id => id.trim());
          const isIncluded = facilityIds.includes(selectedFacilityId);
          console.log(`👤 [STAFF_FACILITY] スタッフ ${staff.staff_name} (施設ID: ${staff.facility_ids}) は施設 ${selectedFacilityId} に所属: ${isIncluded}`);
          return isIncluded;
        });
        console.log(`🔍 [STAFF_FACILITY] 施設 ${selectedFacilityId} でフィルタリング: ${staffsToShow.length}件`);
      } else {
        console.log('👥 [STAFF_FACILITY] 施設が選択されていないため、全スタッフを表示します');
      }
      
      // 既存のオプションをクリア（最初の「選択してください」以外）
      while (staffSelect.children.length > 1) {
        staffSelect.removeChild(staffSelect.lastChild);
      }
      
      // フィルタリングされたスタッフデータを追加
      staffsToShow.forEach(staff => {
        const option = document.createElement('option');
        option.value = staff.staff_id;
        option.textContent = staff.staff_name;
        staffSelect.appendChild(option);
      });
      console.log(`✅ [STAFF_FACILITY] スタッフセレクトボックスを更新しました (${staffsToShow.length}件)`);
    }
    
    console.log('✅ [STAFF_FACILITY] 設定モーダルのセレクトボックスを更新しました');
  }
}
