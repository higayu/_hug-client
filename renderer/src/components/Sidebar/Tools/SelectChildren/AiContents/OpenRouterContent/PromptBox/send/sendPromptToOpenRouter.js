const DEFAULT_MODEL = "openai/gpt-oss-120b:free";

function extractText(data) {
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("") || ""
  );
}

async function readErrorMessage(response) {
  try {
    const data = await response.json();
    return data?.error?.message || `${response.status} ${response.statusText}`;
  } catch {
    return `${response.status} ${response.statusText}`;
  }
}

export async function sendPromptToOpenRouter({ textValue, apiKey, model = DEFAULT_MODEL }) {
  if (!apiKey) {
    throw new Error("OPEN_ROUTER_API_KEY is not configured");
  }

  if (!textValue || !textValue.trim()) {
    throw new Error("Prompt is empty");
  }

  const normalizedModel = model.replace(/^models\//, "");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
    
        // 任意: OpenRouter上でアプリ名を表示したい場合
        // "HTTP-Referer": "https://your-site.com",
        // "X-Title": "Your App Name",
      },
      body: JSON.stringify({
        normalizedModel,
        messages: [
          {
            role: "system",
            content:
              "あなたは日本語の文章整形アシスタントです。箇条書きの意味を変えず、情報を追加せず、自然な1つの日本語文に整えてください。出力は文章のみ。",
          },
          {
            role: "user",
            content: `次の箇条書きを1つの自然な日本語文にしてください。\n\n${textValue}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });
    

  const resultText = data.choices?.[0]?.message?.content?.trim();    
  console.log(resultText);
  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    throw new Error(data?.error?.message ?? "OpenRouter API error");
  }
  const text = extractText(data);

  if (!text) {
    throw new Error("OpenRouter returned an empty response");
  }

  return text;
}
