// src/apiClient.js
const axios = require("axios");
const { loadConfig } = require("./configUtils");

// ✅ 設定読み込み実行
const config = loadConfig();

// ✅ axiosクライアント生成
const apiClient = axios.create({
  baseURL: config.VITE_API_BASE_URL || "http://localhost:3000", // fallback
  headers: { "Content-Type": "application/json" },
});

/* ------------------------------
   Staffs
------------------------------ */
async function fetchStaff() {
  const res = await apiClient.get("/houday/staff_v");
  return res.data;
}

async function getStaffAndFacility() {
  const res = await apiClient.get("/houday/staff_facility_v");
  return res.data;
}

/* ------------------------------
   facilitys
------------------------------ */
async function getFacilitys() {
  const res = await apiClient.get("/houday/facilitys");
  return res.data;
}


/* ------------------------------
   facility_children
------------------------------ */
async function getFacility_children() {
  const res = await apiClient.get("/houday/facility_children");
  return res.data;
}

/* ------------------------------
   Children
------------------------------ */
async function fetchChildren() {
  const res = await apiClient.get("/houday/Children");
  return res.data;
}

async function fetchChildById(id) {
  const res = await apiClient.get("/houday/Children/search", {
    params: { pk: "children_id", values: id },
  });
  return res.data[0];
}


/* ------------------------------
   初回・体験
------------------------------ */

async function getExperience_children_v() {
  const res = await apiClient.get("/houday/experience_children_v");
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
  fetchStaff,
  getStaffAndFacility,
  getFacility_children,
  getFacilitys,
  fetchChildren,
  fetchChildById,
  getExperience_children_v,
  callProcedure,
};
