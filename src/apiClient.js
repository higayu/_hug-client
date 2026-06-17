// src/apiClient.js
const axios = require("axios");
const { loadIni } = require("./iniUtils");

const DB_NAME = "houday";
const PORT = ":3001/api/sql";

// axios インスタンス（内部用）
const axiosInstance = axios.create({
  headers: { "Content-Type": "application/json" },
});

/**
 * ini.json から baseURL を更新
 */
function updateBaseURL() {
  try {
    const ini = loadIni();
    const baseURL = ini?.apiSettings?.baseURL || "http://192.168.1.229";
    axiosInstance.defaults.baseURL = baseURL + PORT;
    console.log("🔧 [apiClient] baseURL:", axiosInstance.defaults.baseURL);
    return axiosInstance.defaults.baseURL;
  } catch (err) {
    axiosInstance.defaults.baseURL = "http://192.168.1.229" + PORT;
    console.error("❌ [apiClient] baseURL error:", err);
    return axiosInstance.defaults.baseURL;
  }
}

// 初期設定
updateBaseURL();

/* =====================================================
   apiClient（フロント normal API と同じ形）
===================================================== */
const apiClient = {
  /* --------------------
     GET
     -------------------- */
  get: async (table, config = {}) => {
    updateBaseURL();
    const res = await axiosInstance.get(
      `/${DB_NAME}/${table}`,
      config
    );
    return res.data;
  },

  /* --------------------
     POST（INSERT）
     -------------------- */
  post: async (table, data, config = {}) => {
    updateBaseURL();
    const res = await axiosInstance.post(
      `/${DB_NAME}/${table}`,
      data,
      config
    );
    return res.data;
  },

  /* --------------------
     PUT（UPDATE）
     -------------------- */
  put: async (table, data, config = {}) => {
    updateBaseURL();
    const res = await axiosInstance.put(
      `/${DB_NAME}/${table}`,
      data,
      config
    );
    return res.data;
  },

  /* --------------------
     DELETE
     -------------------- */
  delete: async (table, config = {}) => {
    updateBaseURL();
    const res = await axiosInstance.delete(
      `/${DB_NAME}/${table}`,
      config
    );
    return res.data;
  },

  /* --------------------
     全テーブル取得
     -------------------- */
  fetchTableAll: async () => {
    updateBaseURL();
    const res = await axiosInstance.get(`/${DB_NAME}/__all`);
    return res.data;
  },

  /* --------------------
     Stored Procedure
     -------------------- */
  callProcedure: async (procname, params = []) => {
    updateBaseURL();

    // [{value}] / [value] 両対応
    const values = params.map((p) =>
      typeof p === "object" && p !== null && "value" in p ? p.value : p
    );

    const res = await axiosInstance.post(
      `/${DB_NAME}/__procedure/${procname}`,
      { params: values }
    );

    return res.data;
  },
};

module.exports = apiClient;
