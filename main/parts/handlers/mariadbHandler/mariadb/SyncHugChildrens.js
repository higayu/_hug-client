const apiClient = require("../../../../../src/apiClient");

const PROCEDURE_NAME = "register_facility_children";

function validateHugChildrenResult(result) {
  if (!result || typeof result !== "object") {
    throw new Error("送信データが不正です。児童データを取得し直してください。");
  }

  if (!Array.isArray(result.children) || result.children.length === 0) {
    throw new Error("送信する児童データがありません。");
  }

  return result;
}

async function syncHugChildrens(result) {
  const safeResult = validateHugChildrenResult(result);

  try {
    return await apiClient.callProcedure(PROCEDURE_NAME, [
      JSON.stringify(safeResult),
    ]);
  } catch (error) {
    console.error("syncHugChildrens ERROR:", error);
    throw error;
  }
}

module.exports = {
  PROCEDURE_NAME,
  syncHugChildrens,
  validateHugChildrenResult,
};
