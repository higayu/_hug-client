// src/apiClient.js
const axios = require("axios");
const { loadIni } = require("./iniUtils");

// axiosインスタンス
const apiClient = axios.create({
  headers: { "Content-Type": "application/json" },
});

const PORT = ":3001/api";

/**
 * ini.json から baseURL を更新
 */
function updateBaseURL() {
  try {
    const ini = loadIni();
    const baseURL = ini?.apiSettings?.baseURL  || "http://192.168.1.229";
    apiClient.defaults.baseURL = baseURL + PORT;
    console.log("🔧 [apiClient] baseURL 更新:", baseURL);
    return baseURL;
  } catch (err) {
    apiClient.defaults.baseURL = "http://192.168.1.229" + PORT;
    console.error("❌ [apiClient] baseURL更新エラー:", err);
    return apiClient.defaults.baseURL;
  }
}

// 初期設定
updateBaseURL();

/* ------------------------------
   DELETE（PK 指定）
   dbname は固定：houday
------------------------------ */
async function deleteByPk({ table, pk, values }) {
  updateBaseURL();
  const res = await apiClient.delete(`/houday/${table}`, {
    params: { pk, values },
  });
  return res.data;
}

/* ------------------------------
   全テーブル取得
   dbname は固定：houday
------------------------------ */
async function fetchTableAll() {
  updateBaseURL();
  const res = await apiClient.get(`/houday/__all`);
  return res.data;
}

/* ------------------------------
   Stored Procedure
   dbname は固定：houday
------------------------------ */
async function callProcedure(procname, params = []) {
  updateBaseURL();

  // パラメータは value 配列に変換
  const values = params.map((p) => p.value);

  const res = await apiClient.post(`/houday/procedure/${procname}`, {
    params: values,
  });

  return res.data;
}

module.exports = {
  fetchTableAll,
  callProcedure,
  deleteByPk,
  updateBaseURL,
};
