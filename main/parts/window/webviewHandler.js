// main/parts/webviewHandler.js

/**
 * WebViewで加算登録ラジオボタンをクリックする
 * @param {WebView} webview - 対象のWebView
 * @returns {Promise<boolean>} クリックが成功したかどうか
 */
async function clickAdditionRadio(webview) {
  try {
    console.log("🟢 加算登録ラジオボタンをクリック中...");
    
    const success = await webview.executeJavaScript(`
      const radio = document.querySelector('input[type="radio"][name="tableChange"][value="2"]');
      if (radio) {
        radio.click();
        console.log("✅ 加算登録ラジオボタンをクリックしました");
        true;
      } else {
        console.log("❌ 加算登録ラジオボタンが見つかりません");
        false;
      }
    `);
    
    if (success) {
      console.log("✅ 加算登録ラジオボタンのクリックが完了しました");
    } else {
      console.log("⚠️ 加算登録ラジオボタンのクリックに失敗しました");
    }
    
    return success;
  } catch (error) {
    console.error("❌ 加算登録ラジオボタンクリック中にエラー:", error);
    return false;
  }
}

/**
 * WebViewのページが完全に読み込まれるまで待機する
 * @param {WebView} webview - 対象のWebView
 * @param {number} maxAttempts - 最大試行回数（デフォルト: 30）
 * @param {number} interval - 待機間隔（ミリ秒、デフォルト: 500）
 * @returns {Promise<boolean>} 読み込みが完了したかどうか
 */
async function waitForPageReady(webview, maxAttempts = 30, interval = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    const state = await webview.executeJavaScript('document.readyState');
    if (state === "complete") return true;
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error("ページロードが完了しませんでした");
}

/**
 * WebViewからテーブルデータを取得する
 * @param {WebView} webview - 対象のWebView
 * @param {string} selector - テーブルセレクター（デフォルト: "table"）
 * @param {string} pageName - ページ名（ログ用）
 * @returns {Promise<string>} テーブルのHTML
 */
async function extractTableData(webview, selector = "table", pageName = "ページ") {
  return await webview.executeJavaScript(`
    console.log("🔍 ${pageName}:", document.title);
    let el = document.querySelector("${selector}");
    if (!el) {
      console.log("⚠️ ${selector}が見つかりません。通常のtableを探します...");
      el = document.querySelector("table");
      if (!el) throw new Error("${pageName}にテーブルが見つかりません");
    }
    console.log("✅ テーブルを取得しました:", el.className);
    el.outerHTML;
  `);
}

/**
 * 左側のWebViewから加算登録テーブルを取得する
 * @param {WebView} webview - 対象のWebView
 * @returns {Promise<string>} テーブルのHTML
 */
async function extractAdditionTable(webview) {
  return await extractTableData(webview, "table.js_adding_table", "左ページ");
}

/**
 * 右側のWebViewからテーブルを取得する
 * @param {WebView} webview - 対象のWebView
 * @returns {Promise<string>} テーブルのHTML
 */
async function extractRightTable(webview) {
  return await extractTableData(webview, "table", "右ページ");
}

module.exports = {
  clickAdditionRadio,
  waitForPageReady,
  extractTableData,
  extractAdditionTable,
  extractRightTable
};
