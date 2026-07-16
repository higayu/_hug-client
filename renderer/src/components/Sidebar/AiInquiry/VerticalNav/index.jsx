import {
  Home,
  Search,
  PlusCircle,
  User,
  Bell,
} from "lucide-react";

const defaultItems = [
  { id: "home", icon: Home, label: "ホーム" },
  { id: "search", icon: Search, label: "検索" },
  { id: "create", icon: PlusCircle, label: "作成" },
  { id: "profile", icon: User, label: "プロフィール" },
];

const defaultFooterItems = [
  { id: "notifications", icon: Bell, label: "更新情報" },
];

/**
 * 埋め込み可能な縦型ナビゲーション。
 * 固定配置や画面サイズには依存せず、親要素の高さに合わせて表示します。
 */
export default function VerticalNav({
  items = defaultItems,
  footerItems = defaultFooterItems,
  activeId,
  onItemClick,
  header,
  width = 72,
  className = "",
  buttonClassName = "",
  ariaLabel = "メインナビゲーション",
}) {
  const renderItem = ({ id, icon: Icon, label, disabled = false }) => {
    const isActive = activeId === id;

    return (
      <button
        key={id}
        type="button"
        disabled={disabled}
        onClick={() => onItemClick?.(id)}
        className={`
          flex h-12 w-12 shrink-0 items-center justify-center rounded-full
          text-[#33332e] transition-colors
          hover:bg-[#f0f0ed]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#76766f]
          disabled:cursor-not-allowed disabled:opacity-40
          ${isActive ? "bg-[#f0f0ed] text-[#111111]" : ""}
          ${buttonClassName}
        `}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        title={label}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </button>
    );
  };

  return (
    <nav
      className={`
        flex h-full shrink-0 flex-col items-center gap-3
        border-r border-[#e5e5e0] bg-white px-3 py-4
        ${className}
      `}
      style={{ width }}
      aria-label={ariaLabel}
    >
      {header && <div className="shrink-0">{header}</div>}

      <div className="flex min-h-0 flex-1 flex-col items-center gap-3 overflow-y-auto">
        {items.map(renderItem)}
      </div>

      {footerItems.length > 0 && (
        <div className="flex shrink-0 flex-col items-center gap-3">
          {footerItems.map(renderItem)}
        </div>
      )}
    </nav>
  );
}