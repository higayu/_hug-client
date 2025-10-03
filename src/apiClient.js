const axios = require("axios");

// API クライアントを作る関数（毎回 env を取得して作る）
async function createClient(getEnv) {
  const { apiBaseUrl } = await getEnv();
  return axios.create({
    baseURL: apiBaseUrl,
    headers: { "Content-Type": "application/json" },
  });
}

/* ------------------------------
   Staffs
------------------------------ */
async function fetchStaff(getEnv) {
  const client = await createClient(getEnv);
  const res = await client.get("/houday/staffs");
  return res.data;
}

/* ------------------------------
   Managers
------------------------------ */
async function getManager(getEnv) {
  const client = await createClient(getEnv);
  const res = await client.get("/houday/managers");
  return res.data;
}

/* ------------------------------
   Children
------------------------------ */
async function fetchChildren(getEnv) {
  const client = await createClient(getEnv);
  const res = await client.get("/houday/Children");
  return res.data;
}

async function fetchChildById(getEnv, id) {
  const client = await createClient(getEnv);
  const res = await client.get("/houday/Children/search", {
    params: { pk: "child_id", values: id },
  });
  return res.data[0];
}

async function createChild(getEnv, child) {
  const client = await createClient(getEnv);
  const res = await client.post("/houday/Children", child);
  return res.data;
}

async function updateChild(getEnv, id, child) {
  const client = await createClient(getEnv);
  const res = await client.put("/houday/Children", child, {
    params: { pk: "child_id", values: id },
  });
  return res.data;
}

async function deleteChild(getEnv, id) {
  const client = await createClient(getEnv);
  const res = await client.delete("/houday/Children", {
    params: { pk: "child_id", values: id },
  });
  return res.data;
}

/* ------------------------------
   Stored Procedures
------------------------------ */
async function callProcedure(getEnv, procname, params = []) {
  const client = await createClient(getEnv);
  const res = await client.post(`/houday/procedure/${procname}`, { params });
  return res.data;
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
