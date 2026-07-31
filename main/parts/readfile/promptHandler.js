// main/parts/readfile/promptHandler.js
const fs = require("fs");
const path = require("path");
const { ipcMain } = require("electron");
const { getPromptDir, getPromptsConfigPath } = require("../utils/pathResolver");

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

// 現在配布している各ファイルの内容を、新規作成時の初期値として使用する。
const DEFAULT_PROMPT_TEXTS = {
  personalRecord:
    "放課後等デイサービスの児童対応の記録として文章を下記の文章を整えて",
  professional1:
    "上記の内容に含まれる部分を下記の内容から抽出して",
  professional2:
    "抽出結果をまとめて文章を作成して"
};

/**
 * prompts.json と各プロンプトファイルを、存在しない場合に限り作成する。
 * 既存ファイルは上書きしない。
 */
function ensurePromptFiles() {
  const configPath = getPromptsConfigPath();
  const promptDir = getPromptDir();

  fs.mkdirSync(promptDir, { recursive: true });

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      JSON.stringify(createDefaultPromptsJson(), null, 2),
      "utf8"
    );
  }

  const promptsConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

  for (const [key, config] of Object.entries(promptsConfig)) {
    const fullPath = path.join(promptDir, config.file);

    if (!fs.existsSync(fullPath)) {
      const initialContent =
        DEFAULT_PROMPT_TEXTS[key] ||
        `${key} 用のプロンプト内容をここに記述してください。`;

      fs.writeFileSync(fullPath, initialContent, "utf8");
    }
  }
}

function loadPromptsSync() {
  try {
    ensurePromptFiles();

    const promptsConfig = JSON.parse(
      fs.readFileSync(getPromptsConfigPath(), "utf8")
    );
    const result = {};

    for (const [key, config] of Object.entries(promptsConfig)) {
      const fullPath = path.join(getPromptDir(), config.file);

      if (!fs.existsSync(fullPath)) {
        result[key] = {
          success: false,
          error: `${config.file} が見つかりません: ${fullPath}`
        };
        continue;
      }

      result[key] = {
        success: true,
        content: fs.readFileSync(fullPath, "utf8"),
        description: config.description || ""
      };
    }

    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function savePromptsSync(promptTexts) {
  try {
    ensurePromptFiles();

    if (!promptTexts || typeof promptTexts !== "object" || Array.isArray(promptTexts)) {
      throw new Error("保存するプロンプトの形式が正しくありません。");
    }

    const promptsConfig = JSON.parse(
      fs.readFileSync(getPromptsConfigPath(), "utf8")
    );

    for (const [key, content] of Object.entries(promptTexts)) {
      const config = promptsConfig[key];

      if (!config) {
        throw new Error(`指定されたプロンプト '${key}' は保存できません。`);
      }

      if (typeof content !== "string") {
        throw new Error(`プロンプト '${key}' の内容が文字列ではありません。`);
      }

      fs.writeFileSync(path.join(getPromptDir(), config.file), content, "utf8");
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function handlePromptAccess() {
  ipcMain.handle("load-prompts", async () => loadPromptsSync());
  ipcMain.handle("save-prompts", async (event, promptTexts) =>
    savePromptsSync(promptTexts)
  );

  ipcMain.handle("get-ai-prompt", async (event, promptKey) => {
    const prompts = loadPromptsSync();
    if (!prompts.success) return prompts;

    if (!prompts.data[promptKey]) {
      return {
        success: false,
        error: `指定されたプロンプト '${promptKey}' が存在しません。`
      };
    }

    return {
      success: true,
      prompt: prompts.data[promptKey].content,
      description: prompts.data[promptKey].description
    };
  });

  ipcMain.handle("build-ai-prompt", async (event, promptKey, userText) => {
    const prompts = loadPromptsSync();
    if (!prompts.success) return prompts;

    const base = prompts.data[promptKey];
    if (!base) {
      return {
        success: false,
        error: `指定されたプロンプト '${promptKey}' が存在しません。`
      };
    }

    return {
      success: true,
      finalPrompt: `${base.content}\n\n【ユーザー入力】\n${userText}`
    };
  });
}

module.exports = { handlePromptAccess, loadPromptsSync, savePromptsSync };
