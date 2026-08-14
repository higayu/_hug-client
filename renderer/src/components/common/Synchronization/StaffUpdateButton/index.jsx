// main/parts/handlers/hug/StaffUpdateButton/index.jsx
import { useState } from "react"
import { useSelector } from "react-redux"
import { ArrowPathIcon } from "@heroicons/react/24/outline"

import { useToast } from '@/provider/ToastProvider/ToastContext'
import { selectFacilityId } from "@/store/slices/appStateSlice"
import { confirmDialog } from "@/utils/dialog/confirmDialog.js"

import { fetchStaffData } from "./fetchStaffData.js"

export default function StaffUpdateButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [label, setLabel] = useState("職員更新")

  const { showInfoToast, showResultToast } =
    useToast()

  const facilityId = useSelector(
    selectFacilityId,
  )

  const handleClick = async () => {
    if (isLoading) return

    const shouldFetch = await confirmDialog(
      "本当に実行しますか？",
    )

    if (!shouldFetch) {
      return
    }

    setIsLoading(true)
    setLabel("職員取得中...")

    showInfoToast(
      "HUGから職員データを取得しています",
      2000,
    )

    try {
      const result = await fetchStaffData(
        (page, maxPage) => {
          setLabel(`職員取得 ${page}/${maxPage}`)
        },
        facilityId,
      )

      const shouldSync = await confirmDialog(
        `HUG職員データ ${result.fetched_count}件をDBへ保存・更新します。実行しますか？`,
      )

      if (!shouldSync) {
        return
      }

      if (!window.electronAPI?.syncHugStaffs) {
        throw new Error(
          "職員同期APIを利用できません。アプリを再起動してください。",
        )
      }

      setLabel("DB更新中...")

      const syncResult =
        await window.electronAPI.syncHugStaffs(
          result,
        )

      const responseSummary =
        syncResult == null
          ? ""
          : typeof syncResult === "string"
            ? syncResult
            : JSON.stringify(
                syncResult,
                null,
                2,
              )

      showResultToast({
        title: "HUG職員同期 完了",
        message: `${result.fetched_count}件の職員データを同期しました`,
        details: [
          result.total_count != null
            ? `HUG登録件数: ${result.total_count}件`
            : "",
          `取得件数: ${result.fetched_count}件`,
          responseSummary
            ? `DB応答:\n${responseSummary}`
            : "",
        ].filter(Boolean),
        duration: 7000,
      })
    } catch (error) {
      console.error(
        "[HUG WM] 職員同期エラー:",
        error,
      )

      showResultToast({
        title: "HUG職員同期 エラー",
        message:
          "職員データを同期できませんでした",
        details: error.message || String(error),
        success: false,
        duration: 7000,
      })
    } finally {
      setIsLoading(false)
      setLabel("職員更新")
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-center bg-sky-600 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
      title="HUGの職員データを取得してDBへ同期"
    >
      <ArrowPathIcon
        className={`h-5 w-5 ${
          isLoading ? "animate-spin" : ""
        }`}
      />

      <span>{label}</span>
    </button>
  )
}