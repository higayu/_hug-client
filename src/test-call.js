const path = require("path");
const fs = require("fs");
const apiClient = require("./apiClient");

async function main() {
  try {
    // ✅ config.json の正しいパス（1つ上の階層にある data フォルダ）
    const configPath = path.join(__dirname, "..", "data", "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    console.log("✅ config.json 読み込み成功:", config);

    const staffId = config.STAFF_ID || 73;
    const weekday = "土";

    console.log("🚀 callProcedure 実行中...");
    const result = await apiClient.callProcedure("GetChildrenByStaffAndDay", [
      { name: "staff_id", value: staffId },
      { name: "weekday", value: weekday },
    ]);

    console.log("🎯 結果:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ エラー:", err.response?.data || err.message);
  }
}

main();
