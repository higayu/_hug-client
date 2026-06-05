// @/components/common/ToggleSecretText.jsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * ToggleSecretText
 * @param {object} props
 * @param {string} props.label - ラベル表示用テキスト
 * @param {string} props.value - メイン表示テキスト（秘匿対象）
 */
export default function ToggleSecretText({ label, value }) {
  const [visible, setVisible] = useState(false);

  const displayValue = value || "（未設定）";

  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold">{label}:</span>

      <span className="font-mono">
        {visible ? displayValue : "••••••••"}
      </span>

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "非表示" : "表示"}
        className="ml-1 inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
