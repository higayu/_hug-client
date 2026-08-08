import { getActiveWebviewHtml } from './gethtml'

export default function GetWebViewHtmlButton({
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={getActiveWebviewHtml}
      disabled={disabled}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
    >
      HTMLを取得
    </button>
  )
}
