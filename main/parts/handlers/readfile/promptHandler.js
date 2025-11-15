// main/parts/handlers/readfile/promptHandler.js
const fs = require("fs");
const path = require("path");
const { ipcMain } = require("electron");
const { getPromptDir, getPromptsConfigPath } = require("../../utils/pathResolver");

function getPromptConfigPath() {
  return getPromptsConfigPath();
}

function getPromptDirLocal() {
  return getPromptDir();
}


// ----------------------------------------------------
//  🔹 prompts.json + 各 txt を同期で読み込む関数（内部用 & IPC用）
// ----------------------------------------------------
function loadPromptsSync() {
  try {
    const configPath = getPromptConfigPath();

    if (!fs.existsSync(configPath)) {
      return { success: false, error: "prompts.json が存在しません" };
    }

    const promptsConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const result = {};

    for (const key of Object.keys(promptsConfig)) {
      const fileName = promptsConfig[key].file;
      const fullPath = path.join(getPromptDirLocal(), fileName);

      if (!fs.existsSync(fullPath)) {
        result[key] = {
          success: false,
          error: `${fileName} が見つかりません: ${fullPath}`
        };
        continue;
      }

      const text = fs.readFileSync(fullPath, "utf8");

      result[key] = {
        success: true,
        content: text,
        description: promptsConfig[key].description || ""
      };
    }

    return { success: true, data: result };

  } catch (err) {
    return { success: false, error: err.message };
  }
}



// ----------------------------------------------------
//  🔹 IPC 登録
// ----------------------------------------------------
function handlePromptAccess() {

  // prompts 全読み込み
  ipcMain.handle("load-prompts", async () => {
    return loadPromptsSync();
  });


  // ---------- AI プロンプトを取得する（personalRecord / professional） ----------
  ipcMain.handle("get-ai-prompt", async (event, promptKey) => {
    const prompts = loadPromptsSync();
    if (!prompts.success) return prompts;

    if (!prompts.data[promptKey]) {
      return { success: false, error: `指定されたプロンプト '${promptKey}' が存在しません。` };
    }

    return {
      success: true,
      prompt: prompts.data[promptKey].content,
      description: prompts.data[promptKey].description
    };
  });


  // ---------- AI プロンプトを組み立てる（ベースprompt + userText） ----------
  ipcMain.handle("build-ai-prompt", async (event, promptKey, userText) => {
    const prompts = loadPromptsSync();
    if (!prompts.success) return prompts;

    const base = prompts.data[promptKey];
    if (!base) {
      return { success: false, error: `指定されたプロンプト '${promptKey}' が存在しません。` };
    }

    const finalPrompt = `${base.content}\n\n【ユーザー入力】\n${userText}`;

    return {
      success: true,
      finalPrompt
    };
  });

}


// ----------------------------------------------------
//  module.exports
// ----------------------------------------------------
module.exports = { handlePromptAccess, loadPromptsSync };
