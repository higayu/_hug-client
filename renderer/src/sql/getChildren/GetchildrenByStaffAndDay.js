// src/sql/getChildren/GetchildrenByStaffAndDay.js

import { DAY_OF_WEEK_MASTER } from "@/utils/date/dateUtils.js"

/**
 * スタッフ・曜日で子ども一覧を取得（managers2 対応）
 * ★ 新仕様：weekdayId が唯一の正
 */
export async function GetchildrenByStaffAndDay({
  tables,
  staffId,
  weekdayId, // ← ★ date は廃止
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

  const staffIdNum = Number(staffId)

  // 表示用（任意）
  const weekdayObj = DAY_OF_WEEK_MASTER.find(
    (w) => w.id === Number(weekdayId)
  )

  // ----------------------------------------
  // 🔥 JOIN処理（managers2 前提）
  // ----------------------------------------
  const joined = managers2
    // ★ 曜日ID一致のみ（唯一の条件）
    .filter((m) => Number(m.day_of_week_id) === Number(weekdayId))
    .map((m) => {
      const child = children.find((c) => c.id === m.children_id)
      const staff = staffs.find((s) => s.id === m.staff_id)
      if (!child || !staff) return null

      // PC JOIN
      const ptc = pc_to_children.find(
        (p) => p.children_id === child.id
      )
      const pcItem = ptc ? pc.find((p) => p.id === ptc.pc_id) : null

      const pronun = pronunciation.find(
        (p) => p.id === child.pronunciation_id
      )
      const ctype = children_type.find(
        (t) => t.id === child.children_type_id
      )

      return {
        children_id: child.id,
        children_name: child.name,

        staff_id: staff.id,
        staff_name: staff.name,

        // ★ 表示用（ロジックでは使わない）
        weekday_id: weekdayId,
        weekday_name: weekdayObj?.label_jp ?? "",

        // managers2
        day_of_week_id: m.day_of_week_id,
        priority: m.priority ?? 0,

        children_type_id: child.children_type_id,
        children_type_name: ctype?.name ?? "",

        children_pronunciation_id: child.pronunciation_id,
        children_pronunciation: pronun?.pronunciation ?? "",

        pc_id: pcItem?.id ?? null,
        pc_name: pcItem?.name ?? "",
        pc_day_of_week: ptc?.day_of_week ?? "",

        notes: child.notes ?? "",

        /** 専門的支援の利用日数（HUG取得前は null） */
        useSpeDate: null,
      }
    })
    .filter(Boolean)
    .sort((a, b) =>
      a.children_name.localeCompare(b.children_name, "ja")
    )

  // ----------------------------------------
  // 自分の担当のみ
  // ----------------------------------------
  const myChildren = joined.filter(
    (c) => Number(c.staff_id) === staffIdNum
  )

  console.log(`✅ 自分の担当: ${myChildren.length} 件`)
  console.log("🔍 抽出結果:", myChildren)

  console.groupEnd()
  return myChildren
}
