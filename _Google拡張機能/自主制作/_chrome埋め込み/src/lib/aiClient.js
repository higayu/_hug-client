import { fetchJson } from '@/lib/apiClient'

const getAiSettings = () => {
  const cfg = window.AI_CONFIG || {}
  const provider = String(cfg.AI_PROVIDER || import.meta.env.VITE_AI_PROVIDER || 'ollama').toLowerCase()
  const defaultModel = cfg.AI_MODEL || import.meta.env.VITE_AI_MODEL || 'jp-assistant:latest'
  return {
    provider,
    model:
      provider === 'gemini'
        ? cfg.GEMINI_MODEL || import.meta.env.VITE_GEMINI_MODEL || defaultModel || 'gemini-2.0-flash'
        : cfg.OLLAMA_MODEL || import.meta.env.VITE_OLLAMA_MODEL || defaultModel,
    ollamaBaseUrl: (cfg.OLLAMA_BASE_URL || import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, ''),
    geminiApiKey: cfg.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '',
  }
}

const callGemini = async (messages, model, apiKey) => {
  if (!apiKey) throw new Error('GEMINI_API_KEY が設定されていません。')
  const contents = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }))
  const systemMessage = messages.find((message) => message.role === 'system')
  if (systemMessage && contents[0]) {
    contents[0].parts[0].text = `${systemMessage.content}\n\n${contents[0].parts[0].text}`
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
  const data = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  })
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Geminiからの応答が空でした。')
  return text
}

const callOllama = async (messages, model, baseUrl) => {
  const data = await fetchJson(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false }),
  })
  const text = data?.message?.content
  if (!text) throw new Error('Ollamaからの応答が空でした。')
  return text
}

export const callAi = async (messages) => {
  const { provider, model, ollamaBaseUrl, geminiApiKey } = getAiSettings()
  return provider === 'gemini'
    ? callGemini(messages, model, geminiApiKey)
    : callOllama(messages, model, ollamaBaseUrl)
}
