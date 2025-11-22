// renderer/src/sql/useManager/updateManager/parts/mariadb.js

export async function handleMariaDBUpdate(
  child,
  {
    managersData,
    STAFF_ID,
    WEEK_DAY,
  }
) {
  console.log("====== MariaDB Update START ======");

  // 数値 ←→ 日本語変換テーブル
  const WDAY_TO_NUM = { "月":1, "火":2, "水":3, "木":4, "金":5, "土":6, "日":7 };

  const existing = managersData.find(
    m => String(m.children_id) === String(child.children_id)
      && String(m.staff_id) === String(STAFF_ID)
  );

  let numericDays = [];

  // -----------------------------------------
  // ① 既存 JSON を日本語→数値へ正規化
  // -----------------------------------------
  if (existing?.day_of_week) {
    try {
      const parsed = JSON.parse(existing.day_of_week);

      numericDays = (parsed.days || []).map(d => {
        // d が数値ならそのまま、文字列なら辞書で変換
        return typeof d === "number" ? d : WDAY_TO_NUM[d];
      }).filter(Boolean);

    } catch (e) {
      console.error("既存 JSON の変換失敗", e);
    }
  }

  // -----------------------------------------
  // ② 今回の曜日を数値に変更して追加
  // -----------------------------------------
  const newNum = WDAY_TO_NUM[WEEK_DAY];

  if (!numericDays.includes(newNum)) {
    numericDays.push(newNum);
  }

  const dayOfWeekJson = JSON.stringify({ days: numericDays });

  const payload = {
    children_id: Number(child.children_id),
    staff_id: Number(STAFF_ID),
    day_of_week: dayOfWeekJson,  // 完全に数値JSON
  };

  console.log("📡 Renderer → Main:", payload);

  try {
    const result = await window.electronAPI.update_manager_p(payload);
    console.log("✅ update success", result);

  } catch (err) {
    console.error("❌ update failed", err);
  }

  console.log("====== MariaDB Update END ======");
}
