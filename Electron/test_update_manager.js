// test_update_manager.js
const { callProcedure, updateBaseURL } = require("./src/apiClient");

// ======== 固定テストデータ（自由に変更OK） ========
const payload = {
  children_id: 80,
  staff_id: 73,
  facility_id: 1, // ★ facility_id が必要ならここを適宜変更
  day_of_week: JSON.stringify({ days: ["月", "火"] }),
};

async function main() {
  try {
    console.log("🔧 baseURL:");
    updateBaseURL();

    console.log("📡 送信データ:", payload);

    // ★★ プロシージャ呼び出し用パラメータに詰め替え ★★
    const params = [
      { value: payload.children_id },
      { value: payload.staff_id },
      // facility_id をプロシージャに追加した場合はここも追加する
      // { value: payload.facility_id },
      { value: payload.day_of_week },
    ];

    console.log("📤 CALL update_manager パラメータ:", params.map(p => p.value));

    const result = await callProcedure("update_manager", params);

    console.log("✅ SUCCESS!");
    console.log("📥 結果:", result);

  } catch (err) {
    console.error("❌ ERROR:", err.response?.data || err);
  }
}

main();
