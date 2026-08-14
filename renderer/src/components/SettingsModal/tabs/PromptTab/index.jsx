import { useCallback, useEffect, useState } from 'react'

import { useToast } from '@/provider/ToastProvider/ToastContext'

const PROMPT_ORDER = [
  'personalRecord',
  'professional1',
  'professional2',
]

const PROMPT_LABELS = {
  personalRecord: '個人記録',
  professional1: '専門的支援加算 1',
  professional2: '専門的支援加算 2',
}

function PromptTab() {
  const [prompts, setPrompts] = useState({})
  const [savedPrompts, setSavedPrompts] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { showSuccessToast, showErrorToast } = useToast()

  const loadPrompts = useCallback(async (showToast = false) => {
    setIsLoading(true)

    try {
      if (typeof window.electronAPI?.loadPrompts !== 'function') {
        throw new Error('プロンプト読み込みAPIを利用できません。')
      }

      const result = await window.electronAPI.loadPrompts()
      if (!result?.success) {
        throw new Error(result?.error || 'プロンプトを読み込めませんでした。')
      }

      const nextPrompts = {}
      for (const key of PROMPT_ORDER) {
        nextPrompts[key] = result.data?.[key]?.content ?? ''
      }

      setPrompts(nextPrompts)
      setSavedPrompts(nextPrompts)

      if (showToast) {
        showSuccessToast('プロンプトを再読み込みしました。')
      }
    } catch (error) {
      console.error('[PromptTab] 読み込みエラー:', error)
      showErrorToast(error?.message || 'プロンプトの読み込みに失敗しました。')
    } finally {
      setIsLoading(false)
    }
  }, [showErrorToast, showSuccessToast])

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])

  const handleSave = async () => {
    if (isLoading || isSaving) return
    setIsSaving(true)

    try {
      if (typeof window.electronAPI?.savePrompts !== 'function') {
        throw new Error('プロンプト保存APIを利用できません。')
      }

      const result = await window.electronAPI.savePrompts(prompts)
      if (!result?.success) {
        throw new Error(result?.error || 'プロンプトを保存できませんでした。')
      }

      setSavedPrompts({ ...prompts })
      showSuccessToast('プロンプトを保存しました。')
    } catch (error) {
      console.error('[PromptTab] 保存エラー:', error)
      showErrorToast(error?.message || 'プロンプトの保存に失敗しました。')
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = PROMPT_ORDER.some(
    (key) => prompts[key] !== savedPrompts[key]
  )

  return (
    <div>
      <h3 className="mb-2 border-b border-gray-200 pb-2 text-lg text-gray-700">
        AIプロンプト設定
      </h3>

      <p className="mb-5 text-sm text-gray-600">
        AIへの指示文を編集できます。変更後は「保存」を押してください。
      </p>

      {isLoading ? (
        <p className="py-8 text-center text-gray-500">
          プロンプトを読み込んでいます...
        </p>
      ) : (
        <div className="space-y-5">
          {PROMPT_ORDER.map((key) => (
            <div key={key}>
              <label
                htmlFor={`prompt-${key}`}
                className="mb-2 block font-semibold text-gray-700"
              >
                {PROMPT_LABELS[key]}
              </label>

              <textarea
                id={`prompt-${key}`}
                value={prompts[key] ?? ''}
                onChange={(event) => {
                  setPrompts((previous) => ({
                    ...previous,
                    [key]: event.target.value,
                  }))
                }}
                rows={5}
                disabled={isSaving}
                className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm leading-6 text-gray-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => loadPrompts(true)}
          disabled={isLoading || isSaving}
          className="rounded-md bg-gray-600 px-5 py-2.5 text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          再読み込み
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading || isSaving || !hasChanges}
          className="rounded-md bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? '保存中...' : '保存'}
        </button>

        {hasChanges && (
          <span className="text-sm text-amber-700">未保存の変更があります</span>
        )}
      </div>
    </div>
  )
}

export default PromptTab
