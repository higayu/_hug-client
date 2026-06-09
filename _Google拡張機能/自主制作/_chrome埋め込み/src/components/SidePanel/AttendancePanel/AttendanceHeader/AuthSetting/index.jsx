import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const labelClassName = 'block text-xs text-[#444]'

const inputClassName =
  'mt-0.5 block w-full box-border rounded border border-[#ccc] bg-white p-1'

const checkboxClassName = 'mb-0 ml-0 mr-1 mt-0 align-middle'

const buttonClassName =
  'cursor-pointer rounded border border-[#ccc] bg-white px-2.5 py-1.5 text-xs disabled:cursor-default disabled:opacity-60'

const panelButtonClassName =
  'flex w-full cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left text-xs font-bold text-[#333]'

const loginStatusLabelMap = {
  authenticated: 'ログイン済み',
  unauthenticated: '未ログイン',
  unknown: '未確認',
}

export default function AuthSetting({
  handleHugAuthCredentialsClear,
  handleHugAuthCredentialsSave,
  handleHugAutoLoginExecute,
  hugAutoLoginEnabled,
  hugLoginCheckLoading,
  hugKeepSession,
  hugLoginId,
  hugLoginStatus,
  hugPassword,
  setHugAutoLoginEnabled,
  setHugKeepSession,
  setHugLoginId,
  setHugPassword,
}) {
  const [isOpen, setIsOpen] = useState(false)

  const loginStatusLabel = loginStatusLabelMap[hugLoginStatus] ?? loginStatusLabelMap.unknown

  return (
    <div className="rounded border border-[#c5cae9] bg-[#f3f4fb] px-2 py-1.5">
      <button
        type="button"
        className={panelButtonClassName}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="attendance-auth-setting-panel"
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        HUG WM 自動ログイン
        <span className="ml-1 text-[11px] font-normal text-[#666]">
          （{hugLoginCheckLoading ? '確認中...' : loginStatusLabel}）
        </span>
      </button>

      <div
        id="attendance-auth-setting-panel"
        className="overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.2s ease',
        }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mt-1.5 flex flex-col gap-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className={labelClassName}>
                ログインID
                <input
                  type="text"
                  className={inputClassName}
                  value={hugLoginId}
                  autoComplete="username"
                  placeholder="ログインID"
                  onChange={(event) => setHugLoginId(event.target.value)}
                />
              </label>

              <label className={labelClassName}>
                パスワード
                <input
                  type="password"
                  className={inputClassName}
                  value={hugPassword}
                  autoComplete="current-password"
                  placeholder="パスワード"
                  onChange={(event) => setHugPassword(event.target.value)}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <label className="inline-flex items-center whitespace-nowrap text-xs text-[#444]">
                <input
                  type="checkbox"
                  className={checkboxClassName}
                  checked={hugAutoLoginEnabled}
                  onChange={(event) => setHugAutoLoginEnabled(event.target.checked)}
                />
                自動ログインを有効にする
              </label>

              <label className="inline-flex items-center whitespace-nowrap text-xs text-[#444]">
                <input
                  type="checkbox"
                  className={checkboxClassName}
                  checked={hugKeepSession}
                  onChange={(event) => setHugKeepSession(event.target.checked)}
                />
                ブラウザを閉じてもログアウトしない
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={`${buttonClassName} border-[#1565c0] bg-[#e3f2fd] font-bold text-[#0d47a1]`}
                onClick={handleHugAuthCredentialsSave}
                disabled={hugLoginCheckLoading}
              >
                保存
              </button>
              <button
                type="button"
                className={`${buttonClassName} border-[#2e7d32] bg-[#e8f5e9] font-bold text-[#1b5e20]`}
                onClick={handleHugAutoLoginExecute}
                disabled={hugLoginCheckLoading || !hugLoginId || !hugPassword}
              >
                {hugLoginCheckLoading ? 'ログイン中...' : 'ログイン実行'}
              </button>
              <button
                type="button"
                className={buttonClassName}
                onClick={handleHugAuthCredentialsClear}
                disabled={hugLoginCheckLoading}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
