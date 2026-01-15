import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getActiveWebview } from "@/utils/webviewState.js";
import { setCurrentUrl } from "@/store/slices/webviewSlice";

export default function UrlContent() {
  const dispatch = useDispatch();
  const currentUrl = useSelector(
    (state) => state.webview.currentUrl
  );

  useEffect(() => {
    let cleanupWebviewListeners = null;

    const readUrl = async (vw) => {
      if (!vw) {
        dispatch(setCurrentUrl(""));
        return;
      }

      try {
        const maybe = vw.getURL?.();
        const url = typeof maybe === "string" ? maybe : await maybe;
        const fallback = vw.getAttribute?.("src") || "";
        dispatch(setCurrentUrl(url || fallback || ""));
      } catch {
        // dom-ready 前は読まない
      }
    };

    const attachWebviewListeners = (vw) => {
      if (!vw) return () => {};

      const onNavigate = () => readUrl(vw);

      vw.addEventListener("dom-ready", onNavigate);
      vw.addEventListener("did-navigate", onNavigate);
      vw.addEventListener("did-navigate-in-page", onNavigate);
      vw.addEventListener("did-finish-load", onNavigate);

      return () => {
        vw.removeEventListener("dom-ready", onNavigate);
        vw.removeEventListener("did-navigate", onNavigate);
        vw.removeEventListener("did-navigate-in-page", onNavigate);
        vw.removeEventListener("did-finish-load", onNavigate);
      };
    };

    const initial = getActiveWebview();
    cleanupWebviewListeners = attachWebviewListeners(initial);

    const onActiveChanged = (e) => {
      const vw = e?.detail?.webview || getActiveWebview();
      if (cleanupWebviewListeners) cleanupWebviewListeners();
      cleanupWebviewListeners = attachWebviewListeners(vw);
    };

    document.addEventListener(
      "active-webview-changed",
      onActiveChanged
    );

    return () => {
      document.removeEventListener(
        "active-webview-changed",
        onActiveChanged
      );
      if (cleanupWebviewListeners) cleanupWebviewListeners();
    };
  }, [dispatch]);

  return (
    <div className="flex items-center w-full">
      <input
        type="text"
        readOnly
        value={currentUrl}
        className="w-full font-medium text-gray-600 bg-slate-50 px-3 py-2 border border-gray-300 rounded-md text-sm"
        placeholder="URLを取得中..."
      />
    </div>
  );
}
