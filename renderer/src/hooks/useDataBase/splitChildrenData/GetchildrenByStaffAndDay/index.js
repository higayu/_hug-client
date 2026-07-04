// src/hooks/useDataBase/splitChildrenData/GetchildrenByStaffAndDay/index.js

import { DAY_OF_WEEK_MASTER } from "@/utils/date/dateUtils.js"

/**
 * TIME値を表示・判定しやすい文字列に正規化する
 *
 * 対応例:
 * - "09:30:00" → "09:30:00"
 * - "09:30"    → "09:30:00"
 * - "930"      → "09:30:00"
 * - "1200"     → "12:00:00"
 */
function normalizeTimeValue(value) {
  if (value == null || value === "") {
    return null
  }

  const text = String(value).trim()

  if (!text) {
    return null
  }

  // MariaDB TIME / SQLite TEXT 想定: HH:mm:ss / HH:mm
  if (text.includes(":")) {
    const [hourText, minuteText = "0", secondText = "0"] = text.split(":")

    const hour = Number(hourText)
    const minute = Number(minuteText)
    const second = Number(secondText)

    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      Number.isNaN(second)
    ) {
      return null
    }

    return [
      String(hour).padStart(2, "0"),
      String(minute).padStart(2, "0"),
      String(second).padStart(2, "0"),
    ].join(":")
  }

  // 1200 / 0930 / 930 形式にも対応
  const digits = text.replace(/\D/g, "")

  if (!digits) {
    return null
  }

  const normalized = digits.padStart(4, "0")
  const hour = Number(normalized.slice(0, -2))
  const minute = Number(normalized.slice(-2))

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null
  }

  return [
    String(hour).padStart(2, "0"),
    String(minute).padStart(2, "0"),
    "00",
  ].join(":")
}

/**
 * スタッフ・曜日で子ども一覧を取得（managers2 対応）
 * 新仕様：weekdayId が唯一の正
 */
export async function GetchildrenByStaffAndDay({
  tables,
  staffId,
  weekdayId,
}) {
  if (!tables) {
    console.error("❌ GetchildrenByStaffAndDay: テーブルデータが未定義です")
    return []
  }

  if (!weekdayId) {
    console.warn("⚠️ 対象曜日IDが取得できません:", weekdayId)
    return []
  }

  const {
    children = [],
    staffs = [],
    managers2 = [],
    pc = [],
    pc_to_children = [],
    pronunciation = [],
    children_type = [],
  } = tables

  console.group("🔗 [GetchildrenByStaffAndDay / managers2] JOIN処理開始")
  console.log("🔍 staffId:", staffId)
  console.log("🔍 weekdayId:", weekdayId)
  console.log("🔍 managers2 count:", managers2.length)

  const staffIdText = String(staffId)
  const weekdayIdNum = Number(weekdayId)

  const weekdayObj = DAY_OF_WEEK_MASTER.find(
    (w) => Number(w.id) === weekdayIdNum
  )

  // ----------------------------------------
  // JOIN処理（managers2 前提）
  // ----------------------------------------
  const joined = managers2
    // 曜日ID一致のみ
    .filter((m) => Number(m.day_of_week_id) === weekdayIdNum)
    .map((m) => {
      const child = children.find(
        (c) => String(c.id) === String(m.children_id)
      )

      const staff = staffs.find(
        (s) => String(s.id) === String(m.staff_id)
      )

      if (!child || !staff) {
        console.warn("⚠️ managers2 JOIN失敗:", {
          manager: m,
          childFound: Boolean(child),
          staffFound: Boolean(staff),
        })

        return null
      }

      // PC JOIN
      const ptc = pc_to_children.find(
        (p) => String(p.children_id) === String(child.id)
      )

      const pcItem = ptc
        ? pc.find((p) => String(p.id) === String(ptc.pc_id))
        : null

      const pronun = pronunciation.find(
        (p) => String(p.id) === String(child.pronunciation_id)
      )

      const ctype = children_type.find(
        (t) => String(t.id) === String(child.children_type_id)
      )

      const supportStartTime = normalizeTimeValue(m.support_start_time)
      const supportEndTime = normalizeTimeValue(m.support_end_time)

      return {
        children_id: child.id,
        children_name: child.name,
        notes: child.notes ?? "",
        notes2: child.notes2 ?? "",
        personal_tmp: child.personal_tmp ?? "",
        pronunciation_id: child.pronunciation_id ?? null,
        is_delete: child.is_delete ?? 0,
        leaving_at: child.leaving_at ?? null,

        staff_id: staff.id,
        staff_name: staff.name,

        // 表示用
        weekday_id: weekdayIdNum,
        weekday_name: weekdayObj?.label_jp ?? "",

        // managers2
        day_of_week_id: m.day_of_week_id,
        priority: Number(m.priority ?? 0),

        // 新規追加カラム
        // MariaDB TIME / SQLite TEXT の差を吸収して HH:mm:ss に寄せる
        support_start_time: supportStartTime,
        support_end_time: supportEndTime,

        children_type_id: child.children_type_id,
        children_type_name: ctype?.name ?? "",

        children_pronunciation_id: child.pronunciation_id,
        children_pronunciation: pronun?.pronunciation ?? "",

        pc_id: pcItem?.id ?? null,
        pc_name: pcItem?.name ?? "",
        pc_day_of_week: ptc?.day_of_week ?? "",

        /** 専門的支援の利用日数（HUG取得前は null） */
        useSpeDate: null,
      }
    })
    .filter(Boolean)
    .sort((a, b) =>
      String(a.children_name ?? "").localeCompare(
        String(b.children_name ?? ""),
        "ja"
      )
    )

  // ----------------------------------------
  // 自分の担当のみ
  // ----------------------------------------
  const myChildren = joined.filter(
    (c) => String(c.staff_id) === staffIdText
  )

  console.log(`✅ 自分の担当: ${myChildren.length} 件`)
  console.log("🔍 抽出結果:", myChildren)

  console.groupEnd()

  return myChildren
}