import React, { useEffect } from "react"
import { useAppState } from "@/contexts/appState"
import PromptBox from "./PromptBox"
import AccountInfoPanel from "./common/AccountInfoPanel"
import OpenAiTabButton from "@/components/common/OpenAiTabButton"

export default function OpenAiContent() {
  const { appState, PROMPTS } = useAppState()

  useEffect(() => {
    console.log("🟦 OpenAiContent コンポーネント初期化（マウント）")
    console.log(" appState:", appState)
    console.log("PROMPTSのデータ", PROMPTS)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center w-full p-2 space-y-3">
      <OpenAiTabButton />

      <PromptBox />
      <AccountInfoPanel
        title="OpenAI アカウント情報"
        items={[
          { label: "MAIL", value: appState.OPENAI_MAIL },
          { label: "PASSWORD", value: appState.OPENAI_PASSWORD },
        ]}
      />
    </div>
  )
}
