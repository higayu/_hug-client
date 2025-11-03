// src/utils/attendanceTable.js
// 出勤データテーブルの取得機能

import { getActiveWebview } from './webviewState.js'

/**
 * WebViewのページが完全に読み込まれるまで待機する
 * @param {WebView} webview - 対象のWebView
 * @param {number} maxAttempts - 最大試行回数（デフォルト: 30）
 * @param {number} interval - 待機間隔（ミリ秒、デフォルト: 500）
 * @returns {Promise<boolean>} 読み込みが完了したかどうか
 */
async function waitForPageReady(webview, maxAttempts = 30, interval = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const state = await webview.executeJavaScript('document.readyState')
      if (state === 'complete') {
        // さらに少し待機して、動的コンテンツが読み込まれるのを待つ
        await new Promise(r => setTimeout(r, 500))
        return true
      }
    } catch (error) {
      console.warn(`⚠️ [ATTENDANCE] ページ読み込み確認エラー (${i + 1}/${maxAttempts}):`, error)
    }
    await new Promise(r => setTimeout(r, interval))
  }
  throw new Error('ページロードが完了しませんでした')
}

/**
 * 指定したURLのテーブルデータを取得する
 * @param {string} facility_id - 施設ID
 * @param {string} date_str - 日付文字列（例: "2025-10-21"）
 * @param {Object} options - オプション
 * @param {string} options.selector - テーブルセレクター（デフォルト: "table"）
 * @param {boolean} options.useMainWebview - メインwebviewを使用するか（デフォルト: true）
 * @param {boolean} options.showToast - トースト通知を表示するか（デフォルト: true）
 * @param {string} options.facilityId - 施設ID（AppStateの代わりに使用）
 * @param {string} options.dateStr - 日付文字列（AppStateの代わりに使用）
 * @returns {Promise<Object>} テーブルデータ {html: string, tableElement: string}
 */
export async function fetchAttendanceTableData(
  facility_id,
  date_str,
  options = {}
) {
  const {
    selector = 'table',
    useMainWebview = true,
    showToast = true
  } = options

  let webview
  
  try {
    if (useMainWebview) {
      // メインwebviewを使用
      webview = getActiveWebview()
      if (!webview) {
        throw new Error('メインwebviewが見つかりません')
      }
    } else {
      throw new Error('メインwebview以外は現在サポートしていません')
    }

    const targetUrl = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${facility_id}&date=${date_str}`
    
    console.log('📥 [ATTENDANCE] テーブルデータ取得開始:', targetUrl)
    if (showToast && window.showInfoToast) {
      window.showInfoToast('📥 データ取得中...', 2000)
    }

    // 現在のURLを保存（必要に応じて復元できるように）
    const originalUrl = webview.getURL()

    // 指定URLを読み込む
    console.log('🔄 [ATTENDANCE] URLを読み込み中:', targetUrl)
    webview.src = targetUrl

    // ページが読み込まれるまで待機
    console.log('⏳ [ATTENDANCE] ページ読み込みを待機中...')
    await waitForPageReady(webview)

    // ログインページかどうかチェック
    const isLoginPage = await webview.executeJavaScript(`
      document.querySelector('input[name="username"]') !== null ||
      document.title.includes('ログイン') ||
      document.URL.includes('login')
    `)

    if (isLoginPage) {
      throw new Error('ログインページが表示されました。自動ログインを実行してください。')
    }

    console.log('✅ [ATTENDANCE] ページ読み込み完了')

    // webviewの状態を確認
    const currentUrl = webview.getURL()
    console.log('🔍 [ATTENDANCE] webview URL:', currentUrl)
    
    if (!currentUrl || currentUrl === 'about:blank') {
      throw new Error('webviewがまだ読み込まれていません')
    }

    // テーブルデータを取得
    console.log('🔍 [ATTENDANCE] テーブルデータを取得中...')
    
    // まず簡単なテストを実行して、JavaScriptが実行できるか確認
    try {
      const testResult = await webview.executeJavaScript('document.readyState')
      console.log('🔍 [ATTENDANCE] JavaScript実行テスト成功:', testResult)
    } catch (testError) {
      console.error('❌ [ATTENDANCE] JavaScript実行テスト失敗:', testError)
      throw new Error(`JavaScriptが実行できません: ${testError.message}`)
    }
    
    // シンプルなアプローチ：段階的に実行
    // まずテーブルを探す
    let tableHTML
    try {
      // セレクターをJSON.stringifyで安全にエスケープ
      const selectorStr = JSON.stringify(selector)
      
      // シンプルなコードでテーブルを取得
      tableHTML = await webview.executeJavaScript(`
        (function() {
          try {
            var selector = ${selectorStr};
            var table = null;
            
            // 指定されたセレクターでテーブルを探す
            try {
              table = document.querySelector(selector);
            } catch (e) {
              console.warn("⚠️ [ATTENDANCE] セレクターエラー:", e.message);
            }
            
            // セレクターで見つからない場合、通常のtableを探す
            if (!table) {
              table = document.querySelector("table");
            }
            
            // それでも見つからない場合、最初のtableを取得
            if (!table) {
              var tables = document.querySelectorAll("table");
              if (tables.length > 0) {
                table = tables[0];
              }
            }
            
            if (!table) {
              return {
                success: false,
                error: "テーブルが見つかりません",
                html: null,
                pageTitle: document.title || "",
                pageUrl: window.location.href || "",
                debugInfo: {
                  bodyHTMLLength: document.body ? document.body.innerHTML.length : 0,
                  allElementsCount: document.querySelectorAll('*').length,
                  readyState: document.readyState
                }
              };
            }
            
            var rows = table.querySelectorAll("tr");
            var htmlString = table.outerHTML;
            var htmlSize = htmlString.length;
            
            return {
              success: true,
              html: htmlString,
              className: table.className || "",
              rowCount: rows.length,
              pageTitle: document.title || "",
              pageUrl: window.location.href || "",
              htmlSize: htmlSize
            };
          } catch (error) {
            return {
              success: false,
              error: "JavaScript実行エラー: " + (error.message || String(error)),
              html: null,
              pageTitle: document.title || "不明",
              pageUrl: window.location.href || "不明",
              debugInfo: {
                errorName: error.name || "",
                errorMessage: error.message || String(error),
                readyState: document.readyState || ""
              }
            };
          }
        })();
      `)
    } catch (jsError) {
      console.error('❌ [ATTENDANCE] executeJavaScript実行エラー:', jsError)
      throw new Error(`JavaScript実行エラー: ${jsError.message}`)
    }

    // エラーチェック（tableHTMLが未定義の場合も含む）
    if (!tableHTML) {
      console.error('❌ [ATTENDANCE] executeJavaScriptがnullまたはundefinedを返しました')
      throw new Error('JavaScript実行結果が取得できませんでした')
    }

    if (!tableHTML.success) {
      const errorMsg = tableHTML.error || 'テーブルデータの取得に失敗しました'
      console.error('❌ [ATTENDANCE] テーブルデータ取得失敗:', errorMsg)
      console.error('❌ [ATTENDANCE] デバッグ情報:', tableHTML.debugInfo)
      throw new Error(errorMsg)
    }

    console.log('✅ [ATTENDANCE] テーブルデータ取得完了')
    console.log('📊 [ATTENDANCE] 取得結果:', {
      rowCount: tableHTML.rowCount,
      className: tableHTML.className,
      pageTitle: tableHTML.pageTitle,
      htmlSize: tableHTML.htmlSize
    })

    if (showToast && window.showSuccessToast) {
      window.showSuccessToast(`✅ データ取得完了\n行数: ${tableHTML.rowCount}`, 3000)
    }

    return {
      success: true,
      html: tableHTML.html,
      className: tableHTML.className,
      rowCount: tableHTML.rowCount,
      pageTitle: tableHTML.pageTitle,
      pageUrl: tableHTML.pageUrl,
      facility_id,
      date_str
    }

  } catch (error) {
    console.error('❌ [ATTENDANCE] テーブルデータ取得エラー:', error)
    
    if (showToast && window.showErrorToast) {
      window.showErrorToast(`❌ データ取得失敗\n${error.message}`, 4000)
    }

    return {
      success: false,
      error: error.message,
      html: null,
      facility_id,
      date_str
    }
  }
}

/**
 * テーブルデータをパースして構造化データとして返す
 * @param {string} tableHTML - テーブルのHTML
 * @returns {Promise<Object>} パースされたテーブルデータ
 */
export async function parseAttendanceTable(tableHTML) {
  if (!tableHTML) {
    throw new Error('テーブルHTMLが提供されていません')
  }

  try {
    // DOMパーサーを使用してテーブルを解析
    const parser = new DOMParser()
    const doc = parser.parseFromString(tableHTML, 'text/html')
    const table = doc.querySelector('table')

    if (!table) {
      throw new Error('テーブル要素が見つかりません')
    }

    const rows = table.querySelectorAll('tr')
    const data = []

    rows.forEach((row, index) => {
      const cells = row.querySelectorAll('td, th')
      const rowData = {
        index,
        cells: Array.from(cells).map(cell => ({
          text: cell.textContent.trim(),
          html: cell.innerHTML.trim()
        }))
      }
      data.push(rowData)
    })

    return {
      success: true,
      data,
      rowCount: data.length
    }
  } catch (error) {
    console.error('❌ [ATTENDANCE] テーブルパースエラー:', error)
    return {
      success: false,
      error: error.message,
      data: []
    }
  }
}

/**
 * 施設IDと日付から出勤データを取得する（簡易版）
 * @param {string} facility_id - 施設ID（省略時は引数から取得）
 * @param {string} date_str - 日付文字列（省略時は引数から取得）
 * @param {Object} options - オプション
 * @param {string} options.facilityId - 施設ID（AppStateの代わりに使用）
 * @param {string} options.dateStr - 日付文字列（AppStateの代わりに使用）
 * @returns {Promise<Object>} テーブルデータ
 */
export async function fetchAttendanceData(
  facility_id = null,
  date_str = null,
  options = {}
) {
  // AppStateの代わりに、引数またはoptionsから取得
  const facilityId = facility_id || options.facilityId || null
  const dateStr = date_str || options.dateStr || null

  if (!facilityId || !dateStr) {
    throw new Error('施設IDまたは日付が設定されていません')
  }

  return await fetchAttendanceTableData(facilityId, dateStr, options)
}

