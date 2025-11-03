// src/hooks/useTabs/common/createTabButton.js
// タブボタンを作成する共通関数

/**
 * タブボタンを作成する共通関数
 * @param {string} targetId - 対象のwebview ID
 * @param {string} label - タブのラベル
 * @param {boolean} closeButtonsVisible - 閉じるボタンを表示するか
 * @returns {HTMLElement|null} 作成されたタブボタン要素
 */
export function createTabButton(targetId, label, closeButtonsVisible) {
  const tabsContainer = document.getElementById('tabs')
  if (!tabsContainer) return null

  const tabButton = document.createElement('button')
  tabButton.className = 'mr-1 px-2.5 py-1 border-none cursor-pointer bg-[#777] text-black rounded font-bold shadow-sm'
  tabButton.innerHTML = `
    ${label}
    <span class="close-btn"${closeButtonsVisible ? '' : " style='display:none'"}>❌</span>
  `
  tabButton.dataset.target = targetId
  
  return tabButton
}
