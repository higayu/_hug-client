// renderer/src/components/Sidebar/Tools/SelectChildren/MemoTool/Parts/AiContents/index.jsx
import React from 'react'
import OpenAiContent from './AiContents/OpenAiContent/OpenAiContent.jsx'
import GeminiContent from './AiContents/GeminiContent/GeminiContent.jsx'
import { useAppState } from '@/contexts/AppStateContext.jsx'


export default function AiContents() {
  const { USE_AI } = useAppState()
  return (
    <div>
      {USE_AI === 'gemini' ? <GeminiContent /> : <OpenAiContent />}
    </div>
  )
}


