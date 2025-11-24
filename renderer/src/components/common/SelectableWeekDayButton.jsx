// renderer/src/components/common/SelectableWeekDayButton.jsx

export default function SelectableWeekDayButton({
  dayId,
  label,
  active,
  onClick,
}) {
  // ★ 統一の曜日カラー（あなたの dayColor）
  const dayColor = {
    1: "bg-purple-200 text-purple-700 border-purple-300",
    2: "bg-red-200 text-red-700 border-red-300",
    3: "bg-sky-300 text-sky-700 border-sky-300",
    4: "bg-green-100 text-green-700 border-green-300",
    5: "bg-yellow-300 text-yellow-700 border-yellow-300",
    6: "bg-orange-100 text-orange-700 border-orange-300",
    7: "bg-pink-100 text-pink-700 border-pink-300",
  };

  // アクティブ時の強調カラー（あなたの色をベース）
  const activeStyle = `font-bold ring-2 ring-offset-1 ${dayColor[dayId]}`;

  const inactiveStyle =
    "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-3 py-1 text-xs rounded-full border transition 
        ${active ? activeStyle : inactiveStyle}
      `}
    >
      {label}
    </button>
  );
}
