// renderer/src/components/Sidebar/Tools/ToolsContainer.jsx
import React, { useState } from 'react'
import OpenAiButton from './Parts/OpenAiButton'
import GeminiApiButton from './Parts/GeminiApiButton'
import AiInputBox from './Parts/AiInputBox'
import { useAppState } from '@/contexts/AppStateContext.jsx'

export default function MemoContainer() {
  const [prompt, setPrompt] = useState('') // テキストを共有する状態
  const { USE_AI } = useAppState()

  console.log('🔍 [MemoContainer] USE_AI:', USE_AI)
  return (
    <div className="flex flex-col gap-3 p-3">
      <AiInputBox value={prompt} onChange={setPrompt} />
      {USE_AI === 'gemini' ? <GeminiApiButton /> : <OpenAiButton text={prompt} />}
    </div>
  )
}
