// renderer/src/components/Sidebar/Tools/SelectChildren/MemoTool/Parts/AiContents/GeminiContent/GeminiContent.jsx
import React, { useState } from 'react'
//import { useAppState } from '@/contexts/AppStateContext.jsx'
import { useAppState } from '@/contexts/appState'

export default function GeminiContent() {
  const { appState } = useAppState()
  const { PROMPTS } = useAppState() // テキストを共有する状態
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // 固定プロンプトと引数
  const FIXED_PROMPT = "以下の内容を要約して、簡潔な文章で返してください。"
  const FIXED_INPUT = "今日は児童の出席記録を処理しました。"

  // Gemini API 呼び出し関数
  const handleGeminiRequest = async () => {
    if (!appState.GEMINI_API_KEY) {
      setError("GEMINI_API_KEY が設定されていません。config.json を確認してください。")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const body = {
        contents: [
          {
            parts: [
              { text: `${FIXED_PROMPT}\n${FIXED_INPUT}` }
            ]
          }
        ]
      }

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': appState.GEMINI_API_KEY
          },
          body: JSON.stringify(body)
        }
      )

      if (!response.ok) throw new Error(`HTTPエラー: ${response.status}`)
      const data = await response.json()

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '（応答なし）'
      setResult(text)

      // テキストファイルを生成・保存
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'gemini_result.txt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setError(`エラー: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-3 border rounded-lg shadow-sm bg-white space-y-2">
      <h3 className="font-semibold text-gray-700">Gemini API テスト</h3>
      <button
        onClick={handleGeminiRequest}
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-white ${
          loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? '処理中...' : 'Gemini API 実行'}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {result && (
        <div className="bg-gray-50 border p-2 rounded text-sm text-gray-800">
          <strong>返却値:</strong>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  )
}
