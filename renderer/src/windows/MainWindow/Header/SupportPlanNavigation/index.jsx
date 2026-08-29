import { useHugActions } from '@/hooks/useHugActions';

import PortalDropdown from '@/components/ui/PortalDropdown';
import MonitoringButtton from '@/components/common/MonitoringButtton';

export default function SupportPlanNavigation({
  className = '',
}) {
  const {
    handleIndividualSupport,
    handleSpecializedSupport,
  } = useHugActions();

  /**
   * 個別支援計画
   */
  const handleIndividualClick =
    async (closeMenu) => {
      closeMenu();

      try {
        await handleIndividualSupport();
      } catch (error) {
        console.error(
          '[SupportPlanNavigation] 個別支援計画の表示に失敗しました:',
          error,
        );
      }
    };

  /**
   * 専門的支援計画
   */
  const handleSpecializedClick =
    async (closeMenu) => {
      closeMenu();

      try {
        await handleSpecializedSupport();
      } catch (error) {
        console.error(
          '[SupportPlanNavigation] 専門的支援計画の表示に失敗しました:',
          error,
        );
      }
    };

  return (
    <PortalDropdown
      id="support-plan-menu"
      ariaLabel="支援計画メニュー"
      align="start"
      menuClassName="
        min-w-[200px]
        max-w-[calc(100vw-16px)]
        overflow-hidden
        rounded-md
        border
        border-gray-300
        bg-white
        shadow-lg
      "
      trigger={({
        isOpen,
        triggerRef,
        toggleMenu,
        menuId,
      }) => (
        <nav
          className={`
            relative
            z-[1001]
            ml-0
            inline-block
            min-w-fit
            flex-shrink-0
            ${className}
          `}
          aria-label="支援計画"
        >
          <button
            ref={triggerRef}
            id="panel-support-btn"
            type="button"
            onClick={toggleMenu}
            className="
              relative
              z-[1002]
              cursor-pointer
              whitespace-nowrap
              border-none
              bg-[#1976d2]
              px-3
              py-1.5
              text-white
              transition-colors
              hover:bg-[#2196f3]
              focus:bg-[#2196f3]
              focus:outline-none
            "
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-controls={
              isOpen
                ? menuId
                : undefined
            }
          >
            📜支援計画

            <span
              className={`
                ml-1
                inline-block
                text-xs
                transition-transform
                ${
                  isOpen
                    ? 'rotate-180'
                    : ''
                }
              `}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>
        </nav>
      )}
    >
      {({ closeMenu }) => (
        <ul className="m-0 list-none p-0 py-1">
          <li className="m-0 p-0">
            <button
              id="Individual_Support_Button"
              type="button"
              role="menuitem"
              onClick={() => {
                handleIndividualClick(
                  closeMenu,
                );
              }}
              className="
                block
                w-full
                cursor-pointer
                border-none
                bg-green-600
                px-4
                py-2
                text-left
                text-sm
                text-white
                transition-colors
                hover:bg-green-700
                focus:bg-green-700
                focus:outline-none
              "
            >
              個別支援-計画
            </button>
          </li>

          <li className="m-0 p-0">
            <button
              id="Specialized-Support-Plan"
              type="button"
              role="menuitem"
              onClick={() => {
                handleSpecializedClick(
                  closeMenu,
                );
              }}
              className="
                block
                w-full
                cursor-pointer
                border-none
                bg-red-600
                px-4
                py-2
                text-left
                text-sm
                text-white
                transition-colors
                hover:bg-red-700
                focus:bg-red-700
                focus:outline-none
              "
            >
              専門的支援-計画
            </button>
          </li>
          <li className="m-0 p-0">
              <MonitoringButtton />
          </li>
        </ul>
      )}
    </PortalDropdown>
  );
}