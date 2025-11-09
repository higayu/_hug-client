// renderer/src/components/Sidebar/Tools/ToolsContainer.jsx
import React, { useState } from 'react'
import OpenAiButton from './Parts/OpenAiButton'
import AiInputBox from './Parts/AiInputBox'

export default function MemoContainer() {
  const [prompt, setPrompt] = useState('') // テキストを共有する状態

  return (
    <div className="flex flex-col gap-3 p-3">
      <AiInputBox value={prompt} onChange={setPrompt} />
      <OpenAiButton text={prompt} />
    </div>
  )
}
