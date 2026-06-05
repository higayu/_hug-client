// components/common/CopyButton.jsx
import React, { useCallback } from "react";
import { Copy } from "lucide-react";
import { useToast } from "@/components/common/ToastContext.jsx";

export default function CopyButton({ text }) {
  const { showSuccessToast, showErrorToast } = useToast();

  const handleCopy = useCallback(async () => {
    try {
      if (typeof text !== "string") {
        throw new TypeError("CopyButton: text must be a string");
      }

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }

      showSuccessToast("コピーしました");
    } catch (e) {
      showErrorToast("コピーに失敗しました");
    }
  }, [text, showSuccessToast, showErrorToast]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="コピー"
      className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm shadow-sm transition active:scale-[0.98]"
    >
      <Copy size={16} />
      <span>コピー</span>
    </button>
  );
}
