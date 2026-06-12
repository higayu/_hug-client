// main/whisperTranscriber.js
const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");

/**
 * whisper.cpp を使って wav 音声を文字起こしする
 */
function transcribeWithWhisper(audioArrayBuffer) {
  const whisperDir = path.join(__dirname, "..", "whisper.cpp");

  const exePath = path.join(
    whisperDir,
    "build",
    "bin",
    "Release",
    "whisper-cli.exe"
  );

  const modelPath = path.join(whisperDir, "ggml-small.bin");

  if (!fs.existsSync(exePath)) {
    throw new Error(`whisper-cli.exe が見つかりません: ${exePath}`);
  }

  if (!fs.existsSync(modelPath)) {
    throw new Error(`モデルファイルが見つかりません: ${modelPath}`);
  }

  const tempDir = path.join(os.tmpdir(), "hug-whisper");
  fs.mkdirSync(tempDir, { recursive: true });

  const baseName = `audio-${Date.now()}`;
  const wavPath = path.join(tempDir, `${baseName}.wav`);
  const outputBasePath = path.join(tempDir, `${baseName}-result`);
  const outputTxtPath = `${outputBasePath}.txt`;

  const audioBuffer = Buffer.isBuffer(audioArrayBuffer)
    ? audioArrayBuffer
    : Buffer.from(new Uint8Array(audioArrayBuffer));

  fs.writeFileSync(wavPath, audioBuffer);

  return new Promise((resolve, reject) => {
    const child = spawn(exePath, [
      "-m",
      modelPath,
      "-f",
      wavPath,
      "-l",
      "ja",
      "-nt",
      "-otxt",
      "-of",
      outputBasePath,
    ]);

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString("utf8");
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString("utf8");
    });

    child.on("error", (err) => {
      cleanupTempFiles(wavPath, outputTxtPath);
      reject(err);
    });

    child.on("close", (code) => {
      try {
        if (code !== 0) {
          cleanupTempFiles(wavPath, outputTxtPath);

          reject(
            new Error(
              stderr ||
                stdout ||
                `whisper-cli.exe が異常終了しました。code: ${code}`
            )
          );
          return;
        }

        if (!fs.existsSync(outputTxtPath)) {
          cleanupTempFiles(wavPath, outputTxtPath);

          reject(
            new Error(
              `文字起こし結果ファイルが作成されませんでした: ${outputTxtPath}`
            )
          );
          return;
        }

        const resultText = fs.readFileSync(outputTxtPath, "utf8").trim();

        cleanupTempFiles(wavPath, outputTxtPath);

        resolve(resultText);
      } catch (e) {
        cleanupTempFiles(wavPath, outputTxtPath);
        reject(e);
      }
    });
  });
}

/**
 * IPC登録
 */
function registerWhisperTranscriber() {
  ipcMain.handle("whisper:transcribe", async (event, audioArrayBuffer) => {
    return await transcribeWithWhisper(audioArrayBuffer);
  });
}

/**
 * 一時ファイル削除
 */
function cleanupTempFiles(...filePaths) {
  for (const filePath of filePaths) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      // 一時ファイル削除失敗は無視
    }
  }
}

module.exports = {
  registerWhisperTranscriber,
  transcribeWithWhisper,
};