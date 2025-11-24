// renderer/src/components/common/WeekDayButton.jsx

export default function WeekDayButton({ dayId, label }) {
  const dayColor = {
    1: "bg-purple-200 text-purple-700 border-purple-300", // 月
    2: "bg-red-200 text-red-700 border-red-300",           // 火
    3: "bg-sky-300 text-sky-700 border-sky-300",          // 水
    4: "bg-green-100 text-green-700 border-green-300",    // 木
    5: "bg-yellow-300 text-yellow-700 border-yellow-300", // 金
    6: "bg-orange-100 text-orange-700 border-orange-300", // 土
    7: "bg-pink-100 text-pink-700 border-pink-300",       // 日
  };

  const className = dayColor[dayId] || "bg-gray-100 text-gray-700 border-gray-300";

  return (
    <span className={`p-2 text-xs rounded-xl font-semibold border ${className}`}>
      {label}
    </span>
  );
}
