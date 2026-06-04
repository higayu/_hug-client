/** AI 設定（.env と同等。テスト時はここを編集）
 *
 * Chrome 拡張機能から Ollama を使う場合、Ollama 側で Origin 許可が必要です:
 *   環境変数 OLLAMA_ORIGINS=* を設定 → Ollama アプリを再起動
 */
window.AI_CONFIG = {
  AI_PROVIDER: 'ollama',
  AI_MODEL: 'jp-assistant:latest',
  OLLAMA_MODEL: '',
  GEMINI_MODEL: '',
  OLLAMA_BASE_URL: 'http://localhost:11434',
  GEMINI_API_KEY: '',
  API_BASE: 'http://192.168.1.229:3001/api/sql/hug_ai_support',
};
