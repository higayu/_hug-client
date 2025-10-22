// renderer/modules/reloadSettings.js
import { loadConfig } from "./config.js";
import { loadIni } from "./ini.js";

/**
 * config.json と ini.json の両方を再読み込みしてUIに反映
 * @returns {Promise<boolean>} 成功なら true
 */
export async function loadAllReload() {
  try {
    console.log("🔄 全設定リロード開始...");

    // ✅ config.json の読み込み
    const configOk = await loadConfig();
    if (!configOk) {
      console.warn("⚠️ config.json の読み込みに失敗しました");
      return false;
    }

    // ✅ ini.json の読み込み
    const iniOk = await loadIni();
    if (iniOk) {
      console.log("✅ ini.json の読み込み成功");
      // updateButtonVisibility() は mainRenderer.js で呼び出される
    } else {
      console.warn("⚠️ ini.json の読み込みに失敗しました");
    }

    console.log("✅ 全設定リロード完了");
    return true;

  } catch (err) {
    console.error("❌ 全設定リロード中にエラー:", err);
    return false;
  }
}
