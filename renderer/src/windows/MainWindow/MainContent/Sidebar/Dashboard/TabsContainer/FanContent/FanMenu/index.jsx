import { useEffect, useRef, useState } from "react";

export default function FanMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const menuItems = [
    {
      id: "home",
      label: "ホーム",
      position: "translate-x-[15px] -translate-y-[145px]",
    },
    {
      id: "search",
      label: "検索",
      position: "translate-x-[65px] -translate-y-[135px]",
    },
    {
      id: "add",
      label: "追加",
      position: "translate-x-[105px] -translate-y-[110px]",
    },
    {
      id: "edit",
      label: "編集",
      position: "translate-x-[130px] -translate-y-[75px]",
    },
    {
      id: "settings",
      label: "設定",
      position: "translate-x-[145px] -translate-y-[35px]",
    },
  ];

  const handleMainButtonClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = (item) => {
    console.log("押されたボタン:", item.id);

    switch (item.id) {
      case "home":
        console.log("ホーム");
        break;

      case "search":
        console.log("検索");
        break;

      case "add":
        console.log("追加");
        break;

      case "edit":
        console.log("編集");
        break;

      case "settings":
        console.log("設定");
        break;

      default:
        break;
    }

    setIsOpen(false);
  };

  // 外側クリックで閉じる
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  return (
    <div
      ref={menuRef}
      className="pointer-events-none relative h-[320px] w-[360px]"
    >
      {/* 右上方向の扇形背景 */}
      <div
        className={`
          pointer-events-none
          absolute
          left-[48px]
          top-1/2
          h-[170px]
          w-[190px]
          -translate-y-full
          origin-bottom-left

          rounded-tr-[190px]

          bg-black/[0.04]

          transition-all
          duration-500
          ease-out

          ${
            isOpen
              ? "scale-100 opacity-100"
              : "scale-75 opacity-0"
          }
        `}
      />

      {/* 子ボタン */}
      {menuItems.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleItemClick(item)}
          className={`
            absolute
            left-5
            top-1/2
            z-10

            flex
            h-16
            w-16
            items-center
            justify-center

            rounded-full

            bg-white

            text-[13px]
            font-semibold
            text-gray-700

            shadow-lg

            transition-all
            duration-500
            ease-out

            hover:bg-gray-100
            hover:shadow-xl

            active:scale-95

            ${
              isOpen
                ? `
                    ${item.position}
                    pointer-events-auto
                    scale-100
                    opacity-100
                  `
                : `
                    pointer-events-none
                    translate-x-0
                    translate-y-0
                    scale-[0.4]
                    opacity-0
                  `
            }
          `}
        >
          {item.label}
        </button>
      ))}

      {/* 親ボタン */}
      <button
        type="button"
        onClick={handleMainButtonClick}
        aria-label={
          isOpen ? "メニューを閉じる" : "メニューを開く"
        }
        aria-expanded={isOpen}
        className={`
          pointer-events-auto

          absolute
          left-[10px]
          top-1/2
          z-20

          flex
          h-20
          w-20
          -translate-y-1/2
          items-center
          justify-center

          rounded-full

          bg-gray-900

          text-3xl
          text-white

          shadow-xl

          transition-all
          duration-300
          ease-out

          hover:bg-gray-800
          hover:shadow-2xl

          active:scale-95

          ${isOpen ? "rotate-45" : "rotate-0"}
        `}
      >
        ☰
      </button>
    </div>
  );
}