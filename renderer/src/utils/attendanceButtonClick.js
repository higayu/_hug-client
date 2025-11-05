// src/utils/attendanceButtonClick.js
// 出勤データの入室・欠席ボタンを自動クリックする機能

import { getActiveWebview } from './webviewState.js'

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
 * 入室ボタンをWebViewで自動クリックする
 * @param {string} column5Html - column5Htmlの文字列
 * @returns {Promise<Object>} 実行結果 {success: boolean, error: string}
 */
export async function clickEnterButton(column5Html) {
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

    // 入室ボタンのonclick関数を抽出
    const onclickCode = extractEnterButtonOnclick(column5Html)
    
    if (onclickCode) {
      console.log('🔘 [ATTENDANCE] 入室ボタンクリック実行:', onclickCode)
      
      // onclick関数を実行
      await webview.executeJavaScript(`
        (function() {
          try {
            ${onclickCode}
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })();
      `)
      
      console.log('✅ [ATTENDANCE] 入室ボタンクリック完了')
      
      if (window.showSuccessToast) {
        window.showSuccessToast('✅ 入室ボタンをクリックしました', 2000)
      }
      
      return { success: true }
    } else {
      // onclickが見つからない場合、入室ボタンを探してクリック
      console.log('🔍 [ATTENDANCE] onclickが見つからないため、入室ボタンを検索してクリック')
      
      const result = await webview.executeJavaScript(`
        (function() {
          try {
            // 入室ボタンを探す（テキストが"入室"のボタン）
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
      `)
      
      if (result.success) {
        console.log('✅ [ATTENDANCE] 入室ボタンクリック完了（ボタン検索）')
        if (window.showSuccessToast) {
          window.showSuccessToast('✅ 入室ボタンをクリックしました', 2000)
        }
        return { success: true }
      } else {
        throw new Error(result.error || '入室ボタンのクリックに失敗しました')
      }
    }
  } catch (error) {
    console.error('❌ [ATTENDANCE] 入室ボタンクリックエラー:', error)
    
    if (window.showErrorToast) {
      window.showErrorToast(`❌ 入室ボタンクリック失敗\n${error.message}`, 3000)
    }
    
    return {
      success: false,
      error: error.message || '入室ボタンのクリックに失敗しました'
    }
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

