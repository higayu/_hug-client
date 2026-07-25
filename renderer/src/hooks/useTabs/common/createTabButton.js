// renderer/src/hooks/useTabs/common/createTabButton.js
// タブボタンを作成する共通関数

/**
 * タブボタンを作成する共通関数
 *
 * @param {string} targetId 対象のwebview ID
 * @param {string} label タブのラベル
 * @param {boolean} closeButtonsVisible 閉じるボタンを表示するか
 * @returns {HTMLButtonElement|null} 作成されたタブボタン要素
 */
export function createTabButton(
  targetId,
  label,
  closeButtonsVisible,
) {
  const tabsContainer = document.getElementById("tabs")

  if (!tabsContainer) {
    console.error(
      "[createTabButton] tabs要素が見つかりません",
    )
    return null
  }

  const tabButton = document.createElement("button")

  tabButton.type = "button"
  tabButton.className = [
    "mr-1",
    "px-2.5",
    "py-1",
    "border-none",
    "cursor-pointer",
    "bg-[#777]",
    "text-black",
    "rounded",
    "font-bold",
    "shadow-sm",
    "inline-flex",
    "items-center",
    "gap-1",
  ].join(" ")

  tabButton.dataset.target = targetId
  tabButton.setAttribute("aria-label", `${label}タブ`)

  const labelElement = document.createElement("span")
  labelElement.className = "tab-label"
  labelElement.textContent = label

  const closeButton = document.createElement("span")

  closeButton.className = [
    "close-btn",
    "inline-flex",
    "items-center",
    "justify-center",
    "cursor-pointer",
    "select-none",
  ].join(" ")

  closeButton.textContent = "❌"
  closeButton.setAttribute("role", "button")
  closeButton.setAttribute("aria-label", `${label}タブを閉じる`)
  closeButton.setAttribute("tabindex", "-1")

  if (!closeButtonsVisible) {
    closeButton.style.display = "none"
  }

  /*
   * close-btnを押した瞬間に親buttonへ
   * フォーカスが移るのをできるだけ防ぐ。
   *
   * clickイベントは呼び出し側へそのまま渡す。
   */
  closeButton.addEventListener("mousedown", (event) => {
    event.preventDefault()
    event.stopPropagation()
  })

  closeButton.addEventListener("pointerdown", (event) => {
    event.preventDefault()
    event.stopPropagation()
  })

  tabButton.appendChild(labelElement)
  tabButton.appendChild(closeButton)

  return tabButton
}