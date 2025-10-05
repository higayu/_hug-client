// src/apiClient.js
const axios = require("axios");
require("dotenv").config();

const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/* ------------------------------
   Staffs
------------------------------ */
async function fetchStaff() {
  const res = await apiClient.get("/houday/staffs");
  return res.data;
}

/* ------------------------------
   Managers
------------------------------ */
async function getManager() {
  const res = await apiClient.get("/houday/managers");
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
    params: { pk: "child_id", values: id },
  });
  return res.data[0];
}

async function createChild(child) {
  const res = await apiClient.post("/houday/Children", child);
  return res.data;
}

async function updateChild(id, child) {
  const res = await apiClient.put("/houday/Children", child, {
    params: { pk: "child_id", values: id },
  });
  return res.data;
}

async function deleteChild(id) {
  const res = await apiClient.delete("/houday/Children", {
    params: { pk: "child_id", values: id },
  });
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
    // ✅ サーバー側が params配列を期待している
    const res = await apiClient.post(`/houday/procedure/${procname}`, { params });
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
  getManager,
  fetchChildren,
  fetchChildById,
  createChild,
  updateChild,
  deleteChild,
  callProcedure,
};
