// src/utils/attendanceButtonClick.js
// 出勤データの入室・欠席ボタンを自動クリックする機能

import { getActiveWebview, setActiveWebview } from './webviewState.js'
import store from '../store/store.js'
import { activateHugViewFirstButton } from '../hooks/useTabs/common/index.js'

const FIRST_BUTTON_ID = 'hugview-first-button';

// 👇 共通ヘルパー: hugview-first-button をクリック
/**
 * WebView が DOM に接続され、dom-ready イベントが発火するのを待つ
 * @param {Electron.WebviewTag} webview 
 * @returns {Promise<void>}
 */
async function waitForWebviewReady(webview) {
  return new Promise((resolve) => {
    if (!webview) return resolve(false);

    // 既にDOMに接続済み & 読み込み中でない場合は即解決
    if (webview.isConnected && !webview.isLoading()) {
      resolve(true);
      return;
    }

    // DOM接続を監視して、接続されたらdom-readyを待つ
    if (!webview.isConnected) {
      const observer = new MutationObserver(() => {
        if (webview.isConnected) {
          observer.disconnect();
          webview.addEventListener('dom-ready', () => resolve(true), { once: true });
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      webview.addEventListener('dom-ready', () => resolve(true), { once: true });
    }
  });
}



/**
 * column5Htmlから入室ボタンのonclick関数を抽出する
 * @param {string} column5Html - column5Htmlの文字列
 * @returns {string|null} onclick関数のコード（nullの場合は見つからなかった）
 */
function extractEnterButtonOnclick(column5Html) {
  if (!column5Html) return null
  
  // 入室ボタンのonclick属性を抽出
  // 例: onclick="sendEnterMail('26776',0,84,3,1,0,'2025-11-04',0,0,0);"
  const onclickMatch = column5Html.match(/onclick\s*=\s*["']([^"']+)["']/i)
  if (onclickMatch && onclickMatch[1]) {
    return onclickMatch[1]
  }
  
  return null
}

/**
 * column5Htmlから欠席ボタンのIDを抽出する
 * @param {string} column5Html - column5Htmlの文字列
 * @returns {string|null} 欠席ボタンのID（nullの場合は見つからなかった）
 */
function extractAbsenceButtonId(column5Html) {
  if (!column5Html) return null
  
  // 欠席ボタンのIDを抽出
  // 例: id="absence_26776_84_3_2025-11-04_0_0"
  const idMatch = column5Html.match(/id\s*=\s*["']([^"']*absence[^"']*)["']/i)
  if (idMatch && idMatch[1]) {
    return idMatch[1]
  }
  
  return null
}

/**
 * column5Htmlから欠席ボタンのname属性を抽出する
 * @param {string} column5Html - column5Htmlの文字列
 * @returns {string|null} 欠席ボタンのname属性（nullの場合は見つからなかった）
 */
function extractAbsenceButtonName(column5Html) {
  if (!column5Html) return null
  
  // 欠席ボタンのname属性を抽出
  // 例: name="absence_26776"
  const nameMatch = column5Html.match(/name\s*=\s*["']([^"']*absence[^"']*)["']/i)
  if (nameMatch && nameMatch[1]) {
    return nameMatch[1]
  }
  
  return null
}

/**
 * column6Htmlから退室ボタンのonclick関数を抽出する
 * @param {string} column6Html - column6Htmlの文字列
 * @returns {string|null} onclick関数のコード（nullの場合は見つからなかった）
 */
function extractExitButtonOnclick(column6Html) {
  if (!column6Html) return null
  
  // 退室ボタンのonclick属性を抽出
  // 例: onclick="sendExitMail('26776',0,84,3,1,0,'2025-11-04',0,0,0);"
  const onclickMatch = column6Html.match(/onclick\s*=\s*["']([^"']+)["']/i)
  if (onclickMatch && onclickMatch[1]) {
    return onclickMatch[1]
  }
  
  return null
}

/**
 * 専用タブ（hugview）を使用してURLに移動し、WebViewを返す
 * @returns {Promise<HTMLElement>} 専用タブのWebView要素
 */
async function useDedicatedTabAndNavigate() {
  const state = store.getState()
  const facilityId = state.appState.FACILITY_ID
  const dateStr = state.appState.DATE_STR
  
  if (!facilityId || !dateStr) {
    throw new Error('FACILITY_IDまたはDATE_STRが設定されていません')
  }
  
  // 専用タブ（hugview-first-button）を強制的にアクティブにする
  activateHugViewFirstButton()
  
  // hugviewのwebviewを取得
  const hugWebview = document.getElementById('hugview')
  if (!hugWebview) {
    throw new Error('hugview webviewが見つかりません')
  }
  
  const url = `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${facilityId}&date=${dateStr}`
  
  // 現在のURLを確認
  const currentSrc = hugWebview.getURL?.() || ""
  
  // URLが変更される場合のみ再読み込み
  if (!currentSrc.includes(url)) {
    hugWebview.src = url
  } else {
    console.log('⚡ 既に同じURLを読み込み中のため再ロードをスキップ:', currentSrc)
  }
  
  setActiveWebview(hugWebview)
  
  // dom-ready を確実に待つ
  await waitForWebviewReady(hugWebview)
  
  // ページが読み込まれるまで待機
  await new Promise((resolve) => {
    const waitForLoad = () => {
      // ページのロード完了を待つ
      hugWebview.addEventListener('did-finish-load', () => {
        // URLが一致する場合のみ解決
        const loadedUrl = hugWebview.getURL?.() || ""
        if (loadedUrl.includes(url)) {
          resolve()
        } else {
          // URLが異なる場合は再度待機
          waitForLoad()
        }
      }, { once: true })
    }
    
    if (hugWebview.isLoading()) {
      waitForLoad()
    } else {
      // 既に読み込み済みの場合も確認
      const loadedUrl = hugWebview.getURL?.() || ""
      if (loadedUrl.includes(url)) {
        resolve()
      } else {
        waitForLoad()
      }
    }
  })
  
  return hugWebview
}

/**
 * 入室ボタンをWebViewで自動クリックする
 * @param {string} column5Html - column5Htmlの文字列
 * @returns {Promise<Object>} 実行結果 {success: boolean, error: string}
 */
export async function clickEnterButton(column5Html) {
  let webview = null;

  try {
    console.log('🔘 [ATTENDANCE] 専用タブで入室ボタンをクリックします');
    webview = await useDedicatedTabAndNavigate();

    // 入室ボタンの onclick 抽出
    const onclickCode = extractEnterButtonOnclick(column5Html);

    if (onclickCode) {
      console.log('🔘 [ATTENDANCE] 入室ボタンクリック実行:', onclickCode);

      const execResult = await webview.executeJavaScript(`
        (function() {
          try {
            ${onclickCode}
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })();
      `);

      if (execResult.success) {
        console.log('✅ [ATTENDANCE] 入室ボタンクリック完了');
        window.showSuccessToast?.('✅ 入室ボタンをクリックしました', 2000);
        return { success: true };
      } else {
        throw new Error(execResult.error || 'onclickコードの実行に失敗しました');
      }
    } else {
      console.log('🔍 [ATTENDANCE] onclickが見つからないため、入室ボタンを検索してクリック');
      const result = await webview.executeJavaScript(`
        (function() {
          try {
            const buttons = Array.from(document.querySelectorAll('button'));
            const enterButton = buttons.find(btn => btn.textContent.trim() === '入室');
            if (enterButton) {
              enterButton.click();
              return { success: true, method: 'button_click' };
            }
            return { success: false, error: '入室ボタンが見つかりません' };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })();
      `);

      if (result.success) {
        console.log('✅ [ATTENDANCE] 入室ボタンクリック完了（ボタン検索）');
        window.showSuccessToast?.('✅ 入室ボタンをクリックしました', 2000);
        return { success: true };
      } else {
        throw new Error(result.error || '入室ボタンのクリックに失敗しました');
      }
    }
  } catch (error) {
    console.error('❌ [ATTENDANCE] 入室ボタンクリックエラー:', error);
    window.showErrorToast?.(`❌ 入室ボタンクリック失敗\n${error.message}`, 3000);
    return { success: false, error: error.message || '入室ボタンのクリックに失敗しました' };
  }
}


/**
 * 欠席ボタンをWebViewで自動クリックする
 * @param {string} column5Html - column5Htmlの文字列
 * @returns {Promise<Object>} 実行結果 {success: boolean, error: string}
 */
export async function clickAbsenceButton(column5Html) {
  const webview = getActiveWebview()
  if (!webview) {
    return {
      success: false,
      error: 'アクティブなWebViewが見つかりません'
    }
  }

  try {
    // ページが読み込まれるまで待機
    await new Promise((resolve) => {
      if (webview.isLoading()) {
        webview.addEventListener('did-finish-load', resolve, { once: true })
      } else {
        resolve()
      }
    })

    // 欠席ボタンのIDまたはname属性を抽出
    const buttonId = extractAbsenceButtonId(column5Html)
    const buttonName = extractAbsenceButtonName(column5Html)
    
    console.log('🔘 [ATTENDANCE] 欠席ボタンクリック実行:', { buttonId, buttonName })
    
    // IDまたはname属性でボタンを探してクリック
    const buttonIdStr = buttonId ? JSON.stringify(buttonId) : 'null'
    const buttonNameStr = buttonName ? JSON.stringify(buttonName) : 'null'
    
    const result = await webview.executeJavaScript(`
      (function() {
        try {
          let button = null;
          const buttonId = ${buttonIdStr};
          const buttonName = ${buttonNameStr};
          
          // IDで検索
          if (buttonId) {
            button = document.getElementById(buttonId);
          }
          
          // name属性で検索（IDが見つからない場合）
          if (!button && buttonName) {
            const buttons = Array.from(document.querySelectorAll('button[name="' + buttonName + '"]'));
            if (buttons.length > 0) {
              button = buttons[0];
            }
          }
          
          // フォールバック: テキストが"欠席"のボタンを探す
          if (!button) {
            const buttons = Array.from(document.querySelectorAll('button'));
            button = buttons.find(btn => btn.textContent.trim() === '欠席' && btn.classList.contains('jqeryui-absence'));
          }
          
          if (button) {
            button.click();
            return { success: true, method: buttonId ? 'id' : buttonName ? 'name' : 'fallback' };
          }
          
          return { success: false, error: '欠席ボタンが見つかりません' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })();
    `)
    
    if (result.success) {
      console.log('✅ [ATTENDANCE] 欠席ボタンクリック完了:', result.method)
      if (window.showSuccessToast) {
        window.showSuccessToast('✅ 欠席ボタンをクリックしました', 2000)
      }
      return { success: true }
    } else {
      throw new Error(result.error || '欠席ボタンのクリックに失敗しました')
    }
  } catch (error) {
    console.error('❌ [ATTENDANCE] 欠席ボタンクリックエラー:', error)
    
    if (window.showErrorToast) {
      window.showErrorToast(`❌ 欠席ボタンクリック失敗\n${error.message}`, 3000)
    }
    
    return {
      success: false,
      error: error.message || '欠席ボタンのクリックに失敗しました'
    }
  }
}

/**
 * 退室ボタンをWebViewで自動クリックする
 * @param {string} column6Html - column6Htmlの文字列
 * @returns {Promise<Object>} 実行結果 {success: boolean, error: string}
 */
export async function clickExitButton(column6Html) {
  let webview = null;

  try {
    console.log('🔘 [ATTENDANCE] 専用タブで退室ボタンをクリックします');
    webview = await useDedicatedTabAndNavigate();

    const onclickCode = extractExitButtonOnclick(column6Html);

    if (onclickCode) {
      console.log('🔘 [ATTENDANCE] 退室ボタンクリック実行:', onclickCode);

      const execResult = await webview.executeJavaScript(`
        (function() {
          try {
            ${onclickCode}
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })();
      `);

      if (execResult.success) {
        console.log('✅ [ATTENDANCE] 退室ボタンクリック完了');
        window.showSuccessToast?.('✅ 退室ボタンをクリックしました', 2000);
        return { success: true };
      } else {
        throw new Error(execResult.error || 'onclickコードの実行に失敗しました');
      }
    } else {
      console.log('🔍 [ATTENDANCE] onclickが見つからないため、退室ボタンを検索してクリック');
      const result = await webview.executeJavaScript(`
        (function() {
          try {
            const buttons = Array.from(document.querySelectorAll('button'));
            const exitButton = buttons.find(btn => btn.textContent.trim() === '退室');
            if (exitButton) {
              exitButton.click();
              return { success: true, method: 'button_click' };
            }
            return { success: false, error: '退室ボタンが見つかりません' };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })();
      `);

      if (result.success) {
        console.log('✅ [ATTENDANCE] 退室ボタンクリック完了（ボタン検索）');
        window.showSuccessToast?.('✅ 退室ボタンをクリックしました', 2000);
        return { success: true };
      } else {
        throw new Error(result.error || '退室ボタンのクリックに失敗しました');
      }
    }
  } catch (error) {
    console.error('❌ [ATTENDANCE] 退室ボタンクリックエラー:', error);
    window.showErrorToast?.(`❌ 退室ボタンクリック失敗\n${error.message}`, 3000);
    return { success: false, error: error.message || '退室ボタンのクリックに失敗しました' };
  }
}

