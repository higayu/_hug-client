import { useEffect, useRef, useState } from "react";

export default function SpeechToText() {
  const recognitionRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("この環境では音声認識APIが使えません。");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "ja-JP";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalText) {
        setText((prev) => prev + finalText + "\n");
      }

      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      setError(`音声認識エラー: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const startRecognition = () => {
    setError("");

    if (!recognitionRef.current) {
      setError("音声認識を初期化できませんでした。");
      return;
    }

    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) {
      setError("すでに音声認識が開始されています。");
    }
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const clearText = () => {
    setText("");
    setInterimText("");
    setError("");
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          音声文字起こし
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          マイクに向かって話すと、日本語で文字起こしします。
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={startRecognition}
          disabled={listening}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
            listening
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          開始
        </button>

        <button
          onClick={stopRecognition}
          disabled={!listening}
          className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
            !listening
              ? "cursor-not-allowed bg-gray-400"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          停止
        </button>

        <button
          onClick={clearText}
          className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          クリア
        </button>
      </div>

      <div className="mb-4">
        {listening ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
            認識中
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
            停止中
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            文字起こし結果
          </h3>
          <span className="text-xs text-gray-400">
            {text.length + interimText.length} 文字
          </span>
        </div>

        <div className="min-h-64 whitespace-pre-wrap rounded-xl bg-white p-4 text-base leading-7 text-gray-800 shadow-inner">
          {text || interimText ? (
            <>
              <span>{text}</span>
              {interimText && (
                <span className="text-gray-400">{interimText}</span>
              )}
            </>
          ) : (
            <span className="text-gray-400">
              ここに文字起こし結果が表示されます。
            </span>
          )}
        </div>
      </div>
    </div>
  );
}