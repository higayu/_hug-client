import { useState, useRef, useEffect } from "react";
import { Send, Search, Bot, User, ArrowLeft } from "lucide-react";

type Message = {
  id: string;
  sender: "ai" | "user";
  text: string;
};

const getFormattedDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const ChatPage = () => {
  const [step, setStep] = useState<"selection" | "chat">("selection");
  const [facilities, setFacilities] = useState<any[]>([]);
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [facilityId, setFacilityId] = useState<number | "">("");
  const [childId, setChildId] = useState<number | "">("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return getFormattedDate(d);
  });
  const [endDate, setEndDate] = useState(() => getFormattedDate(new Date()));

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/facilities")
      .then(res => res.json())
      .then(data => {
        setFacilities(data);
        if (data.length > 0) setFacilityId(data[0].facility_id);
      })
      .catch(err => console.error("Failed to fetch facilities", err));
  }, []);

  useEffect(() => {
    if (facilityId) {
      fetch(`http://localhost:3000/api/children?facility_id=${facilityId}`)
        .then(res => res.json())
        .then(data => {
          setChildrenList(data);
          if (data.length > 0) setChildId(data[0].child_id);
        })
        .catch(err => console.error("Failed to fetch children", err));
    } else {
      setChildrenList([]);
    }
  }, [facilityId]);

  const selectedFacilityName = facilities.find(f => f.facility_id === facilityId)?.name || "";
  const selectedChildName = childrenList.find(c => c.child_id === childId)?.name || "";

  const startChat = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/support_records?child_id=${childId}&start_date=${startDate}&end_date=${endDate}`);
      const records = await response.json();
      
      let initialMessage = `${selectedFacilityName}：${selectedChildName}さんの支援記録データを取得しました（${records.length}件）。\n\n`;
      
      if (records.length > 0) {
        initialMessage += "【取得した記録のプレビュー】\n";
        records.slice(0, 5).forEach((r: any) => {
           // target_dateは "2026-05-02T15:00:00.000Z" のような形式のため日付部分だけ切り出し
           const dateStr = r.target_date ? r.target_date.split('T')[0] : '不明';
           initialMessage += `・${dateStr}: ${r.content}\n`;
        });
        if (records.length > 5) {
           initialMessage += "（他略）\n";
        }
      } else {
        initialMessage += "※指定された期間の記録は見つかりませんでした。\n";
      }
      initialMessage += "\n記録の検索や要約作成が可能です。何をなさいますか？";

      setMessages([
        {
          id: "1",
          sender: "ai",
          text: initialMessage,
        },
      ]);
      setStep("chat");
    } catch (error) {
      console.error("Error fetching records:", error);
      alert("データの取得に失敗しました。サーバーが起動しているか確認してください。");
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");

    // モック応答
    setTimeout(() => {
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `【要約】\nここ1ヶ月の${selectedChildName}さんの記録を分析した結果、全体的に落ち着いて活動に参加できていますが、環境の変化（新しい職員や突然の予定変更）に対して少し不安を感じる傾向が見られます。`,
      };
      setMessages((prev) => [...prev, newAiMsg]);
    }, 1000);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      className="w-full flex"
      style={{ flexDirection: "column", height: "100%" }}
    >
      <header className="mb-6">
        <h1>AI問い合わせ機能（チャットボット）</h1>
        <p style={{ color: "var(--text-light)" }}>
          過去のデータをもとにAIと対話を行います。
        </p>
      </header>

      {step === "selection" ? (
        <div
          className="card"
          style={{ maxWidth: "600px", margin: "30px auto" }}
        >
          <h2 className="mb-4">対象データ選択</h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div>
              <label className="label">事業所</label>
              <select
                className="input-field"
                value={facilityId}
                onChange={(e) => setFacilityId(Number(e.target.value))}
              >
                {facilities.map(f => (
                  <option key={f.facility_id} value={f.facility_id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">児童</label>
              <select
                className="input-field"
                value={childId}
                onChange={(e) => setChildId(Number(e.target.value))}
              >
                {childrenList.map(c => (
                  <option key={c.child_id} value={c.child_id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">取得期間</label>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="date"
                  className="input-field"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span>～</span>
                <input
                  type="date"
                  className="input-field"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="btn btn-primary" onClick={startChat}>
              <Search size={18} /> チャット開始
            </button>
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: 0,
          }}
        >
          {/* チャットヘッダー */}
          <div
            style={{
              padding: "0.75rem 1rem",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "var(--bg-color)",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
              <button
                className="btn btn-secondary"
                style={{ padding: "0.4rem", flexShrink: 0 }}
                onClick={() => setStep("selection")}
              >
                <ArrowLeft size={18} />
              </button>
              <h3 style={{ margin: 0, fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                💬 {selectedFacilityName}：{selectedChildName}さん
              </h3>
            </div>
            <div style={{ flexShrink: 0 }}>
              <select
                className="input-field"
                style={{ padding: "0.3rem", width: "auto", fontSize: "0.875rem" }}
              >
                <option>Gemini 3.1 Flash</option>
                <option>Gemini 3.1 Pro (複雑用)</option>
              </select>
            </div>
          </div>

          {/* チャットエリア */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "95%",
                }}
              >
                {msg.sender === "ai" && (
                  <div
                    style={{
                      minWidth: "36px",
                      width: "36px",
                      height: "36px",
                      flexShrink: 0,
                      borderRadius: "50%",
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Bot size={24} />
                  </div>
                )}

                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor:
                      msg.sender === "user"
                        ? "var(--primary-light)"
                        : "#f1f5f9",
                    color:
                      msg.sender === "user"
                        ? "var(--primary-hover)"
                        : "var(--text-main)",
                    border:
                      msg.sender === "user"
                        ? "1px solid #bae6fd"
                        : "1px solid var(--border-color)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>

                {msg.sender === "user" && (
                  <div
                    style={{
                      minWidth: "36px",
                      width: "36px",
                      height: "36px",
                      flexShrink: 0,
                      borderRadius: "50%",
                      backgroundColor: "var(--text-main)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <User size={24} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div
            style={{
              padding: "1rem",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
              <textarea
                className="input-field"
                rows={2}
                style={{ flex: 1, minHeight: "auto", resize: "none", padding: "0.75rem" }}
                placeholder="質問や指示を入力..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                className="btn btn-primary"
                style={{ padding: "0 1rem", height: "42px", flexShrink: 0 }}
                onClick={handleSendMessage}
              >
                <Send size={20} />
              </button>
            </div>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-light)",
                marginTop: "0.5rem",
                textAlign: "center",
              }}
            >
              Shift + Enter で改行、Enter で送信
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
