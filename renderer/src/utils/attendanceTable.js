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
  options = {},
  webviewParam = null // ← 追加
) {
  const {
    selector = 'table',
    useMainWebview = true,
    showToast = true
  } = options

  let webview
  
  try {
    // ✅ 新しく渡された webviewParam がある場合はそれを優先的に使う
    if (webviewParam) {
      webview = webviewParam
      console.log('🌐 [ATTENDANCE] 指定されたWebViewを使用:', webview.id)
    } else if (useMainWebview) {
      // メインwebviewを使用
      webview = getActiveWebview()
      if (!webview) throw new Error('メインwebviewが見つかりません')
    } else {
      throw new Error('対象webviewが指定されていません')
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
    
    const currentSrc = webview.getURL?.() || "";
    if (!currentSrc.includes(targetUrl)) {
      webview.src = targetUrl;
    } else {
      console.log("⚡ 既に同じURLを読み込み中のため再ロードをスキップ:", currentSrc);
    }

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
 * テーブルHTMLをパースしてtbody要素と行を取得する
 * @param {string} tableHTML - テーブルのHTML
 * @returns {Object} {success: boolean, tbody: HTMLElement|null, rows: NodeList|null, error: string}
 */
function parseTableHTML(tableHTML) {
  if (!tableHTML) {
    return {
      success: false,
      tbody: null,
      rows: null,
      error: 'テーブルHTMLが提供されていません'
    }
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(tableHTML, 'text/html')
    const table = doc.querySelector('table')

    if (!table) {
      return {
        success: false,
        tbody: null,
        rows: null,
        error: 'テーブル要素が見つかりません'
      }
    }

    // tbodyの行を取得（theadはスキップ）
    const tbody = table.querySelector('tbody')
    if (!tbody) {
      return {
        success: false,
        tbody: null,
        rows: null,
        error: 'tbody要素が見つかりません'
      }
    }

    const rows = tbody.querySelectorAll('tr')
    return {
      success: true,
      tbody,
      rows
    }
  } catch (error) {
    return {
      success: false,
      tbody: null,
      rows: null,
      error: error.message
    }
  }
}

/**
 * セルHTMLから児童IDと児童名を抽出する
 * @param {string} cellHtml - セルのHTML文字列（2列目の児童情報）
 * @returns {Object} {children_id: string, children_name: string}
 */
function extractChildrenInfo(cellHtml) {
  let children_id = ''
  let children_name = ''

  if (!cellHtml) {
    return { children_id, children_name }
  }

  // HTMLエンティティを通常の文字に変換（&amp; -> &）
  const decodedHtml = cellHtml.replace(/&amp;/g, '&')

  // id=パラメータを抽出（?id=, &id=, または単独のid=）
  const idMatch = decodedHtml.match(/(?:[?&]|^)id=(\d+)/)
  if (idMatch && idMatch[1]) {
    children_id = idMatch[1]
  } else {
    // フォールバック: より柔軟なパターンで検索
    const idMatchFallback = decodedHtml.match(/id=["']?(\d+)/)
    if (idMatchFallback && idMatchFallback[1]) {
      children_id = idMatchFallback[1]
    }
  }

  // デバッグ用: 抽出できなかった場合にログ出力
  if (!children_id) {
    console.warn('⚠️ [ATTENDANCE] 児童ID抽出失敗:', {
      cellHtml: cellHtml.substring(0, 200), // 最初の200文字のみ表示
      decodedHtml: decodedHtml.substring(0, 200)
    })
  }

  // 児童名を抽出（nameBox内のpタグから）
  // 例: <p>大谷　瑠壱\n                                                    さん</p> から "大谷　瑠壱 さん" を抽出
  const nameBoxMatch = cellHtml.match(/<p>([\s\S]*?)<\/p>/)
  if (nameBoxMatch && nameBoxMatch[1]) {
    // 改行や余分な空白を削除
    children_name = nameBoxMatch[1].replace(/\s+/g, ' ').trim()
  }

  return { children_id, children_name }
}

/**
 * 時間列（5列目と6列目）のデータを抽出する
 * @param {NodeList} cells - 行のセル要素のリスト
 * @returns {Object} {column5: string, column5Html: string, column6: string, column6Html: string}
 */
function extractTimeColumns(cells) {
  const column5 = cells[5]?.textContent.trim() || '' // 入室時間（6列目）
  const column5Html = cells[5]?.innerHTML.trim() || '' // 入室時間のHTML（ボタン情報など）

  // column5が時間形式（HH:MM）の場合、6列目（インデックス6）も取得
  let column6 = ''
  let column6Html = ''
  // 時間形式（HH:MM）のパターンをチェック（例: "00:00", "16:54"）
  const timePattern = /^\d{2}:\d{2}$/
  if (timePattern.test(column5) && cells.length >= 7) {
    column6 = cells[6]?.textContent.trim() || ''
    column6Html = cells[6]?.innerHTML.trim() || ''
  }

  return { column5, column5Html, column6, column6Html }
}

/**
 * 1行分の出勤データを処理する
 * @param {HTMLElement} row - テーブルの行要素
 * @param {number} rowIndex - 行のインデックス（0始まり）
 * @returns {Object|null} 行データオブジェクト（セルが5つ未満の場合はnull）
 */
function processAttendanceRow(row, rowIndex) {
  const cells = row.querySelectorAll('td, th')

  // 最小5つのセルが必要
  if (cells.length < 5) {
    return null
  }

  const cell1Html = cells[1]?.innerHTML.trim() || '' // 2列目のHTML（児童情報）
  const { children_id, children_name } = extractChildrenInfo(cell1Html)
  const { column5, column5Html, column6, column6Html } = extractTimeColumns(cells)

  const rowData = {
    rowIndex: rowIndex + 1, // 1から始まる行番号
    children_id, // 児童ID
    children_name, // 児童名
    column1Html: cell1Html, // 2列目のHTML（児童情報）
    column5, // 入室時間のテキスト
    column5Html // 入室時間のHTML（ボタン情報など）
  }

  // column6が取得された場合のみ追加
  if (column6 || column6Html) {
    rowData.column6 = column6
    rowData.column6Html = column6Html
  }

  return rowData
}

/**
 * テーブルから1列目（行番号）と5列目（入室時間）を抽出
 * @param {string} tableHTML - テーブルのHTML
 * @returns {Promise<Object>} 抽出されたデータ {success: boolean, data: Array, error: string}
 */
export async function extractColumnData(tableHTML) {
  try {
    // テーブルHTMLをパース
    const parseResult = parseTableHTML(tableHTML)
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error,
        data: []
      }
    }

    const { rows } = parseResult
    const extractedData = []

    // 各行を処理
    rows.forEach((row, rowIndex) => {
      const rowData = processAttendanceRow(row, rowIndex)
      if (rowData) {
        extractedData.push(rowData)
      }
    })

    console.log('✅ [ATTENDANCE] 列データ抽出完了:', {
      extractedCount: extractedData.length,
      sample: extractedData
    })

    return {
      success: true,
      data: extractedData,
      rowCount: extractedData.length
    }
  } catch (error) {
    console.error('❌ [ATTENDANCE] 列データ抽出エラー:', error)
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

