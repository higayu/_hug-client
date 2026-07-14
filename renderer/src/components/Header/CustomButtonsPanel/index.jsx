// src/components/CustomButtonsPanel/index.jsx

import { useEffect, useState } from 'react';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

import { useCustomButtons } from '@/components/CustomButtonsContext';
import PortalDropdown from '@/components/ui/PortalDropdown';

import CustomButtonItem from './CustomButtonItem';
import { useCustomButtonHandlers } from './useCustomButtonHandlers';

export default function CustomButtonsPanel({ className = '' }) {
  const { customButtons, getCustomButtons } = useCustomButtons();
  const { handleButtonClick } = useCustomButtonHandlers();

  const [buttons, setButtons] = useState([]);

  useEffect(() => {
    const currentButtons = getCustomButtons();
    setButtons(Array.isArray(currentButtons) ? currentButtons : []);
  }, [customButtons, getCustomButtons]);

  /**
   * カスタムボタンを実行
   *
   * CustomButtonItemから渡される引数は
   * そのままhandleButtonClickへ渡す。
   */
  const handleMenuButtonClick = (closeMenu, ...args) => {
    closeMenu();

    try {
      return handleButtonClick(...args);
    } catch (error) {
      console.error('[CustomButtonsPanel] カスタムボタン実行エラー:', error);
      return undefined;
    }
  };

  return (
    <PortalDropdown
      id="custom-buttons-menu"
      ariaLabel="カスタムボタンメニュー"
      align="start"
      menuClassName="
        max-h-[400px]
        min-w-[220px]
        max-w-[calc(100vw-16px)]
        overflow-hidden
        overflow-y-auto
        bg-white
        shadow-lg
      "
      trigger={({ isOpen, triggerRef, toggleMenu, menuId }) => (
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
          aria-label="カスタムボタン"
        >
          <button
            ref={triggerRef}
            id="custom-buttons-panel-btn"
            type="button"
            onClick={toggleMenu}
            className="
              relative
              z-[1002]
              flex
              cursor-pointer
              items-center
              gap-2
              whitespace-nowrap
              border-none
              bg-[#515152]
              px-3
              py-1.5
              text-sm
              text-white
              transition-colors
              hover:bg-[#2196f3]
              focus:bg-[#2196f3]
              focus:outline-none
            "
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-controls={isOpen ? menuId : undefined}
          >
            <Squares2X2Icon
              className="h-5 w-5 flex-shrink-0 text-white"
              aria-hidden="true"
            />

            <span>カスタムボタン</span>

            {buttons.length > 0 && (
              <span
                className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs"
                aria-label={`${buttons.length}件`}
              >
                {buttons.length}
              </span>
            )}

            <span
              className={`
                inline-block
                text-xs
                opacity-80
                transition-transform
                ${isOpen ? 'rotate-180' : ''}
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
        <ul
          className="m-0 list-none p-0 py-1"
          role="menu"
          aria-label="カスタムボタン一覧"
        >
          {buttons.length > 0 ? (
            buttons.map((buttonConfig) => (
              <li key={buttonConfig.id} className="m-0 p-0" role="none">
                <CustomButtonItem
                  buttonConfig={buttonConfig}
                  onClick={(...args) => {
                    handleMenuButtonClick(closeMenu, ...args);
                  }}
                />
              </li>
            ))
          ) : (
            <li
              className="px-4 py-3 text-sm text-gray-500"
              role="none"
            >
              登録されたカスタムボタンはありません
            </li>
          )}
        </ul>
      )}
    </PortalDropdown>
  );
}