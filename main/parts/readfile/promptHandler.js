// main/parts/readfile/promptHandler.js
const fs = require("fs");
const path = require("path");
const { ipcMain } = require("electron");
const { getPromptDir, getPromptsConfigPath } = require("../utils/pathResolver");

function getPromptConfigPath() {
  return getPromptsConfigPath();
}

function getPromptDirLocal() {
  return getPromptDir();
}


// ----------------------------------------------------
//  🔹 デフォルト prompts.json 作成
// ----------------------------------------------------
function createDefaultPromptsJson() {
  return {
    personalRecord: {
      file: "personalRecord.txt",
      description: "個人記録用プロンプト"
    },
    professional1: {
      file: "professional1.txt",
      description: "専門的支援加算用プロンプト1"
    },
    professional2: {
      file: "professional2.txt",
      description: "専門的支援加算用プロンプト2"
    }
  };
}

// ----------------------------------------------------
// 🔹 デフォルト TXT 内容
// ----------------------------------------------------
const DEFAULT_PERSONAL_TEXT =
`放課後等デイサービスの児童対応の記録として文章を下記の文章を整えて`;

const DEFAULT_PROFESSIONAL_TEXT =
`上記の内容に含まれる部分を下記の内容から抽出して`;


// ----------------------------------------------------
// 🔹 prompts.json + txt を自動生成（存在しなければ）
// ----------------------------------------------------
function ensurePromptFiles() {
  const cfgPath = getPromptConfigPath();
  const promptDir = getPromptDirLocal();

  // フォルダ作成
  if (!fs.existsSync(promptDir)) {
    fs.mkdirSync(promptDir, { recursive: true });
  }

  // ---------- prompts.json がない場合、自動生成 ----------
  if (!fs.existsSync(cfgPath)) {
    const defaultData = createDefaultPromptsJson();
    fs.writeFileSync(cfgPath, JSON.stringify(defaultData, null, 2), "utf8");
  }

  // ---------- 各 txt を生成 ----------
  const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));

  for (const key of Object.keys(cfg)) {
    const fileName = cfg[key].file;
    const fullPath = path.join(promptDir, fileName);

    if (!fs.existsSync(fullPath)) {
      let initialContent = "";

      if (key === "personalRecord") {
        initialContent = DEFAULT_PERSONAL_TEXT;
      } else if (key === "professional") {
        initialContent = DEFAULT_PROFESSIONAL_TEXT;
      } else {
        initialContent = `${key} 用のプロンプト内容をここに記述してください。`;
      }

      fs.writeFileSync(fullPath, initialContent, "utf8");
    }
  }
}



// ----------------------------------------------------
//  🔹 prompts.json + 各 txt を同期で読み込む
// ----------------------------------------------------
function loadPromptsSync() {
  try {
    // まず自動生成チェック
    ensurePromptFiles();

    const configPath = getPromptConfigPath();
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


  // ---------- AI プロンプトを取得 ----------
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


  // ---------- AI プロンプト + userText 合体 ----------
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
