const DEFAULT_MODEL = "gemini-3.5-flash";

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

export async function sendPromptToGemini({ textValue, apiKey, model = DEFAULT_MODEL }) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!textValue || !textValue.trim()) {
    throw new Error("Prompt is empty");
  }

  const normalizedModel = model.replace(/^models\//, "");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${normalizedModel}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: textValue }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = await response.json();
  const text = extractText(data);

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return text;
}
