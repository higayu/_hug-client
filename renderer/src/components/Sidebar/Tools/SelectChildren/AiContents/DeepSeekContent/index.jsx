import React, { useEffect } from "react"
import { useAppState } from "@/contexts/appState"
import PromptBox from "@/components/common/PromptBox"
import AccountInfoPanel from "@/components/common/AccountInfoPanel"
import DeepseekTabButton from "@/components/common/DeepseekTabButton"
import { AI_PROMPT_COMPONENT_MAP } from "./PromptBox"

export default function DeepSeekContent() {
  const { appState, PROMPTS } = useAppState()

  useEffect(() => {
    console.log("🟦 OpenAiContent コンポーネント初期化（マウント）")
    console.log(" appState:", appState)
    console.log("PROMPTSのデータ", PROMPTS)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center w-full p-2 space-y-3">
      <DeepseekTabButton />

      <PromptBox componentMap={AI_PROMPT_COMPONENT_MAP} />
      <AccountInfoPanel
        title="OpenAI アカウント情報"
        items={[
          { label: "MAIL", value: appState.DEEPSEEK_MAIL },
          { label: "PASSWORD", value: appState.DEEPSEEK_PASSWORD },
        ]}
      />
    </div>
  )
}
