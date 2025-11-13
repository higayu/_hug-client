// src/apiClient.js
const axios = require("axios");
const { loadIni } = require("./iniUtils");

// ✅ axiosクライアント生成（baseURLは動的に設定）
const apiClient = axios.create({
  headers: { "Content-Type": "application/json" },
});

/**
 * ini.jsonからbaseURLを取得してapiClientのbaseURLを更新
 */
function updateBaseURL() {
  try {
    const ini = loadIni();
    const baseURL = ini?.apiSettings?.baseURL || "http://192.168.1.229:3001/api";
    apiClient.defaults.baseURL = baseURL;
    console.log("🔧 [apiClient] baseURL更新:", baseURL);
    return baseURL;
  } catch (err) {
    console.error("❌ [apiClient] baseURL更新エラー:", err);
    apiClient.defaults.baseURL = "http://192.168.1.229:3001/api";
    return apiClient.defaults.baseURL;
  }
}

// ⚠️ 初回読み込み時にbaseURLを設定
updateBaseURL();

/* ------------------------------
   全件
------------------------------ */
async function fetchTableAll() {
  // ⚠️ リクエスト前にbaseURLを更新（ini.jsonの変更に対応）
  updateBaseURL();
  const res = await apiClient.get("/houday/__all");
  return res.data;
}


/* ------------------------------
   Stored Procedures
------------------------------ */
/**
 * ストアドプロシージャ呼び出し用ユーティリティ
 * @param {string} procname - プロシージャ名
 * @param {object|array} params - パラメータ（オブジェクト or [{name, value}]）
 */
async function callProcedure(procname, params = []) {
  console.log("📡 callProcedure:", procname, params);

  try {
    updateBaseURL();
    // ✅ name/value配列 → 値だけの配列に変換
    const values = params.map(p => p.value);

    // ✅ APIが期待する { params: [1, "土"] } に変換して送信
    const res = await apiClient.post(`/houday/procedure/${procname}`, { params: values });

    console.log("📬 API応答:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ API呼び出しエラー:", err.response?.data || err.message);
    throw err;
  }
}

/* ------------------------------
   エクスポート
------------------------------ */
module.exports = {
  fetchTableAll,
  callProcedure,
  updateBaseURL, // ⚠️ 外部からbaseURLを更新できるようにエクスポート
};
