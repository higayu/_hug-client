import {
    useCallback,
    useEffect,
    useRef,
    useState,
  } from 'react';
  import { createPortal } from 'react-dom';
  
  const DEFAULT_GAP = 5;
  const DEFAULT_VIEWPORT_PADDING = 8;
  const DEFAULT_Z_INDEX = 99999;
  
  /**
   * ポータル方式の共通ドロップダウン
   *
   * @param {string} id メニュー要素のID
   * @param {string} ariaLabel メニューのaria-label
   * @param {'start'|'end'} align ボタンに対する左右の配置
   * @param {number} gap ボタンとメニューの間隔
   * @param {number} viewportPadding 画面端との余白
   * @param {number} zIndex メニューのz-index
   * @param {string} menuClassName メニューに適用するclassName
   * @param {Function} trigger トリガーを描画する関数
   * @param {Function|React.ReactNode} children メニュー内容
   */
  export default function PortalDropdown({
    id,
    ariaLabel,
    align = 'start',
    gap = DEFAULT_GAP,
    viewportPadding = DEFAULT_VIEWPORT_PADDING,
    zIndex = DEFAULT_Z_INDEX,
    menuClassName = '',
    trigger,
    children,
  }) {
    const [isOpen, setIsOpen] = useState(false);
  
    const [isPositioned, setIsPositioned] =
      useState(false);
  
    const [menuPosition, setMenuPosition] =
      useState({
        top: 0,
        left: 0,
      });
  
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
  
    /**
     * メニューを閉じる
     */
    const closeMenu = useCallback(() => {
      setIsOpen(false);
      setIsPositioned(false);
    }, []);
  
    /**
     * メニューを開く
     */
    const openMenu = useCallback(() => {
      setIsPositioned(false);
      setIsOpen(true);
    }, []);
  
    /**
     * メニューを開閉する
     */
    const toggleMenu = useCallback((event) => {
      event?.stopPropagation();
  
      setIsPositioned(false);
  
      setIsOpen((currentValue) => {
        return !currentValue;
      });
    }, []);
  
    /**
     * ボタン位置とメニューサイズから表示位置を計算する
     */
    const updateMenuPosition =
      useCallback(() => {
        if (typeof window === 'undefined') {
          return;
        }
  
        const triggerElement =
          triggerRef.current;
  
        const menuElement =
          menuRef.current;
  
        if (
          !triggerElement ||
          !menuElement
        ) {
          return;
        }
  
        const triggerRect =
          triggerElement.getBoundingClientRect();
  
        const menuWidth =
          menuElement.offsetWidth;
  
        const menuHeight =
          menuElement.offsetHeight;
  
        /*
         * 横方向の位置
         */
        const preferredLeft =
          align === 'end'
            ? triggerRect.right - menuWidth
            : triggerRect.left;
  
        const maximumLeft = Math.max(
          viewportPadding,
          window.innerWidth -
            menuWidth -
            viewportPadding,
        );
  
        const nextLeft = Math.min(
          Math.max(
            preferredLeft,
            viewportPadding,
          ),
          maximumLeft,
        );
  
        /*
         * 縦方向の位置
         */
        const bottomPosition =
          triggerRect.bottom + gap;
  
        const topPosition =
          triggerRect.top -
          menuHeight -
          gap;
  
        const availableBottom =
          window.innerHeight -
          viewportPadding;
  
        const overflowsBottom =
          bottomPosition + menuHeight >
          availableBottom;
  
        const canDisplayAbove =
          topPosition >= viewportPadding;
  
        let nextTop = bottomPosition;
  
        if (
          overflowsBottom &&
          canDisplayAbove
        ) {
          nextTop = topPosition;
        } else {
          const maximumTop = Math.max(
            viewportPadding,
            window.innerHeight -
              menuHeight -
              viewportPadding,
          );
  
          nextTop = Math.min(
            Math.max(
              bottomPosition,
              viewportPadding,
            ),
            maximumTop,
          );
        }
  
        setMenuPosition({
          top: nextTop,
          left: nextLeft,
        });
  
        setIsPositioned(true);
      }, [
        align,
        gap,
        viewportPadding,
      ]);
  
    /**
     * メニュー表示中のイベント監視
     */
    useEffect(() => {
      if (!isOpen) {
        return undefined;
      }
  
      const animationFrameId =
        requestAnimationFrame(() => {
          updateMenuPosition();
        });
  
      /**
       * メニュー外をクリックしたら閉じる
       */
      const handleOutsideClick = (
        event,
      ) => {
        const clickedElement =
          event.target;
  
        if (
          !(clickedElement instanceof Node)
        ) {
          return;
        }
  
        const clickedTrigger =
          triggerRef.current?.contains(
            clickedElement,
          );
  
        const clickedMenu =
          menuRef.current?.contains(
            clickedElement,
          );
  
        if (
          !clickedTrigger &&
          !clickedMenu
        ) {
          closeMenu();
        }
      };
  
      /**
       * Escapeキーで閉じる
       */
      const handleKeyDown = (event) => {
        if (event.key !== 'Escape') {
          return;
        }
  
        closeMenu();
  
        requestAnimationFrame(() => {
          triggerRef.current?.focus();
        });
      };
  
      /**
       * スクロール・リサイズ時に再配置
       */
      const handleWindowChange = () => {
        updateMenuPosition();
      };
  
      document.addEventListener(
        'mousedown',
        handleOutsideClick,
      );
  
      document.addEventListener(
        'keydown',
        handleKeyDown,
      );
  
      window.addEventListener(
        'resize',
        handleWindowChange,
      );
  
      window.addEventListener(
        'scroll',
        handleWindowChange,
        true,
      );
  
      /*
       * メニュー内容の高さや幅が変わった場合も再配置する
       */
      let resizeObserver = null;
  
      if (
        typeof ResizeObserver !==
        'undefined'
      ) {
        resizeObserver =
          new ResizeObserver(() => {
            updateMenuPosition();
          });
  
        if (menuRef.current) {
          resizeObserver.observe(
            menuRef.current,
          );
        }
  
        if (triggerRef.current) {
          resizeObserver.observe(
            triggerRef.current,
          );
        }
      }
  
      return () => {
        cancelAnimationFrame(
          animationFrameId,
        );
  
        resizeObserver?.disconnect();
  
        document.removeEventListener(
          'mousedown',
          handleOutsideClick,
        );
  
        document.removeEventListener(
          'keydown',
          handleKeyDown,
        );
  
        window.removeEventListener(
          'resize',
          handleWindowChange,
        );
  
        window.removeEventListener(
          'scroll',
          handleWindowChange,
          true,
        );
      };
    }, [
      isOpen,
      closeMenu,
      updateMenuPosition,
    ]);
  
    const menuPortal =
      isOpen &&
      typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={menuRef}
              id={id}
              role="menu"
              aria-label={ariaLabel}
              style={{
                position: 'fixed',
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                zIndex,
                visibility: isPositioned
                  ? 'visible'
                  : 'hidden',
              }}
              className={menuClassName}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {typeof children ===
              'function'
                ? children({
                    closeMenu,
                    openMenu,
                    toggleMenu,
                    isOpen,
                  })
                : children}
            </div>,
            document.body,
          )
        : null;
  
    return (
      <>
        {trigger({
          isOpen,
          triggerRef,
          menuId: id,
          openMenu,
          closeMenu,
          toggleMenu,
        })}
  
        {menuPortal}
      </>
    );
  }