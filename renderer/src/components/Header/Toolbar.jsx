import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

import { useHugActions } from '@/hooks/useHugActions';

import {
  selectFacilityId,
  setFacilityId,
} from '@/store/slices/appStateSlice';

import ProfessionalSupportListButton from '@/components/Header/ProfessionalSupportListButton';
import SettingsEditButton from '@/components/Header/SettingsEditButton';

import SupportPlanNavigation from './SupportPlanNavigation';
import ToolsListNavi from './ToolsListNavi';
import CustomButtonsPanel from './CustomButtonsPanel';

import UrlContent from '@/components/ui/UrlContent';
import CloseToggleSwitch from '@/components/ui/CloseToggleSwitch';
import FacilitySelector from '@/components/FacilitySelector';
import ActiveApiStatus from '@/components/common/Synchronization/ActiveApiStatus';

import { useAppState } from '@/AppStateContext';

export default function Toolbar() {
  const dispatch = useDispatch();
  const facilityId = useSelector(selectFacilityId);

  const [showCloseButton, setShowCloseButton] = useState(true);

  const { handleLogin } = useHugActions();

  const {
    activeSidebarTab: activeTab,
    setActiveSidebarTab: setActiveTab,
    DEBUG_FLG,
  } = useAppState()

  /**
   * 施設IDが未設定の場合は初期値を設定
   */
  useEffect(() => {
    if (!facilityId) {
      dispatch(setFacilityId('3'));
    }
  }, [dispatch, facilityId]);

  return (
    <div
      id="toolbar"
      className="
        relative
        z-[1000]
        flex
        flex-none
        flex-nowrap
        items-center
        gap-2.5
        overflow-x-auto
        whitespace-nowrap
        bg-[#616161]
        text-white
        pointer-events-auto
      "
    >
      <ProfessionalSupportListButton />

      {/* 設定編集 */}
      <nav className="relative z-[1001] flex-shrink-0">
        <SettingsEditButton
          className="
            rounded-2xl
            border-none
            bg-gray-500
            px-4 py-2
            text-center
            text-sm
            text-white
            hover:bg-gray-400
          "
        />
      </nav>

      {/* 自動ログイン */}
      <nav className="relative z-[1001] ml-0 inline-block min-w-fit flex-shrink-0">
        <button
          id="loginBtn"
          type="button"
          onClick={handleLogin}
          className="
            flex
            cursor-pointer
            items-center
            gap-2
            rounded-full
            border-none
            bg-sky-600
            px-4 py-2
            text-left
            text-sm
            text-white
            transition-colors
            hover:bg-gray-800
          "
          aria-label="自動ログイン"
        >
          <ArrowRightOnRectangleIcon
            className="h-5 w-5"
            aria-hidden="true"
          />

          <span>Login</span>
        </button>
      </nav>


      {/* URL・施設 */}
      <div className="flex w-full flex-col p-1">
        <UrlContent />
        <div className="flex w-full flex-row items-center justify-between">
          {/* 左側グループ */}
          <div className="flex flex-row items-center gap-3">
            <CloseToggleSwitch
              checked={showCloseButton}
              onChange={setShowCloseButton}
            />

            {/* 施設名の表示 */}
            <FacilitySelector />

            {/* データベースAPI状態 */}
            <ActiveApiStatus  className="px-1 py-2"/>
          </div>

          {/* 右側グループ */}
          <div className="flex flex-row items-center gap-2">
            {/* 専門的支援計画 */}
            <SupportPlanNavigation />

            {/* ツールメニュー */}
            <ToolsListNavi />

            {DEBUG_FLG && (
              <>
                {/* カスタムボタン */}
                <CustomButtonsPanel />
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}