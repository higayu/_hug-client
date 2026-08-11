// main/parts/handlers/laravelAuthHandler/auth/fetchAllTables.js

const laravelApiClient = require("../../../../../src/laravelApiClient");
const { executeAuthenticatedOperation } = require("./authenticated");  // ← ここを修正
const { formatError, unwrapData, isPlainObject } = require("./utils");

async function handler(params = {}) {
  const result = await executeAuthenticatedOperation(
    () => laravelApiClient.fetchTableAll(params),
    "全テーブルの取得に失敗しました。"
  );

  if (result?.success === false) {
    return result;
  }

  const tables = unwrapData(result);

  if (!isPlainObject(tables)) {
    return {
      success: false,
      connected: true,
      message: "Laravel APIから受信したテーブルデータの形式が正しくありません。",
      data: null,
      meta: { authenticated: true },
      error: {
        status: null,
        statusText: null,
        code: "INVALID_TABLE_RESPONSE",
        validationErrors: null,
        details: result ?? null,
      },
    };
  }

  return {
    success: true,
    connected: true,
    message: "Laravelから全テーブルを取得しました。",
    data: tables,
    meta: {
      authenticated: true,
      tableCount: Object.keys(tables).length,
      reauthenticated: result?.meta?.reauthenticated ?? false,
    },
    error: null,
  };
}

module.exports = { handler };