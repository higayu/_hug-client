// src/apiClient.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

// ✅ config.json のパスを取得（ユーザーディレクトリベース）
function getDataPath(...paths) {
  if (app.isPackaged) {
    // ✅ ビルド後: ユーザーディレクトリ/data/config.json
    return path.join(app.getPath("userData"), "data", ...paths);
  } else {
    // ✅ 開発時: プロジェクト直下の data/config.json
    return path.join(__dirname, "..", "data", ...paths);
  }
}

// ✅ config.json を読み込む関数
function loadConfig() {
  try {
    const configPath = getDataPath("config.json");
    
    // ファイルが存在しない場合はデフォルト設定を返す
    if (!fs.existsSync(configPath)) {
      console.log("⚠️ config.json が見つかりません。デフォルト設定を使用します。");
      return {
        HUG_USERNAME: "",
        HUG_PASSWORD: "",
        VITE_API_BASE_URL: "http://192.168.1.229:3001/api",
        STAFF_ID: "",
        FACILITY_ID: ""
      };
    }
    
    const raw = fs.readFileSync(configPath, "utf8");
    const json = JSON.parse(raw);
    console.log("✅ config.json 読み込み成功:", json);
    return json;
  } catch (err) {
    console.error("❌ config.json 読み込み失敗:", err);
    console.log("⚠️ デフォルト設定を使用します。");
    return {
      HUG_USERNAME: "",
      HUG_PASSWORD: "",
      VITE_API_BASE_URL: "http://192.168.1.229:3001/api",
      STAFF_ID: "",
      FACILITY_ID: ""
    };
  }
}

// ✅ 読み込み実行
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
  const res = await apiClient.get("/houday/staffs");
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

async function createChild(child) {
  const res = await apiClient.post("/houday/Children", child);
  return res.data;
}

async function updateChild(id, child) {
  const res = await apiClient.put("/houday/Children", child, {
    params: { pk: "children_id", values: id },
  });
  return res.data;
}

async function deleteChild(id) {
  const res = await apiClient.delete("/houday/Children", {
    params: { pk: "children_id", values: id },
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
  createChild,
  updateChild,
  deleteChild,
  callProcedure,
};
