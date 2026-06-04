import { useState, useRef, useEffect } from 'react';
import { Send, Search, Bot, User, ArrowLeft } from 'lucide-react';
import { fetchJson } from '../lib/api';
import { getApiBase } from '../lib/aiConfig';
import { buildChatMessages, callAi } from '../lib/ai';
import {
  useFacilities,
  useHugChildren,
  getFacilityName,
  getChildName,
  pickValidChildId,
} from '../hooks/useFacilityChildren';
import {
  loadPrefs,
  savePrefs,
  applyPeriodPrefs,
  mergePrefs,
} from '../lib/prefs';
import { getDefaultPeriod } from '../lib/records';
import { MOCK_RECORDS, type SupportRecord } from '../lib/mockData';

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
};

const ChatPage = () => {
  const defaults = getDefaultPeriod();
  const period = applyPeriodPrefs(loadPrefs().chat, defaults);

  const { facilities } = useFacilities();
  const [step, setStep] = useState<'selection' | 'chat'>('selection');
  const [facilityId, setFacilityId] = useState<number | ''>(period.facilityId);
  const [childId, setChildId] = useState<number | ''>(period.childId);
  const [startDate, setStartDate] = useState(period.startDate);
  const [endDate, setEndDate] = useState(period.endDate);

  const { childrenList, loading: childrenLoading } = useHugChildren(facilityId, {
    date: startDate,
    dateEnd: endDate,
  });

  const [chatRecords, setChatRecords] = useState<SupportRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (facilities.length > 0 && !facilityId) {
      setFacilityId(facilities[0].facility_id);
    }
  }, [facilities, facilityId]);

  useEffect(() => {
    setChildId((prev) => pickValidChildId(childrenList, prev));
  }, [childrenList]);

  const persistPrefs = (overrides?: Record<string, unknown>) => {
    savePrefs(
      mergePrefs(loadPrefs(), 'chat', {
        facilityId: facilityId || undefined,
        childId: childId || undefined,
        startDate,
        endDate,
        ...overrides,
      }),
    );
  };

  const selectedFacilityName = getFacilityName(facilities, facilityId);
  const selectedChildName = getChildName(childrenList, childId);

  const startChat = async () => {
    let records: SupportRecord[] = [];
    try {
      const all = await fetchJson<SupportRecord[]>(
        `${getApiBase()}/support_records/_search?pk=child_id&values=${childId}`,
      );
      records = all.filter((r) => {
        const d = r.target_date ? r.target_date.split('T')[0] : '';
        return d >= startDate && d <= endDate;
      });
    } catch {
      records = MOCK_RECORDS.filter((r) => {
        const d = r.target_date ? r.target_date.split('T')[0] : '';
        return d >= startDate && d <= endDate;
      });
    }

    let initialMessage = `${selectedFacilityName}：${selectedChildName}さんの支援記録データを取得しました（${records.length}件）。\n\n`;

    if (records.length > 0) {
      initialMessage += '【取得した記録のプレビュー】\n';
      records.slice(0, 5).forEach((r) => {
        const dateStr = r.target_date ? r.target_date.split('T')[0] : '不明';
        initialMessage += `・${dateStr}: ${r.content}\n`;
      });
      if (records.length > 5) initialMessage += '（他略）\n';
    } else {
      initialMessage += '※指定された期間の記録は見つかりませんでした。\n';
    }
    initialMessage += '\n記録の検索や要約作成が可能です。何をなさいますか？';

    setChatRecords(records);
    setMessages([{ id: '1', sender: 'ai', text: initialMessage }]);
    setStep('chat');
    persistPrefs();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);
    setInputValue('');
    setIsLoading(true);

    const loadingId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: loadingId, sender: 'ai', text: '考え中...' }]);

    const apiMessages = buildChatMessages({
      childName: selectedChildName,
      startDate,
      endDate,
      records: chatRecords,
      messages: [
        ...messages.filter((m) => m.text !== '考え中...'),
        { sender: 'user', text: userText },
      ],
    });

    try {
      const reply = await callAi(apiMessages);
      setMessages((prev) =>
        prev.map((m) => (m.id === loadingId ? { ...m, text: reply } : m)),
      );
    } catch (err) {
      console.error('[sendChatMessage]', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                ...m,
                text: `AI応答の取得に失敗しました: ${(err as Error).message}\n\nOllama が起動しているか、.env の設定を確認してください。`,
              }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="w-full flex" style={{ flexDirection: 'column', height: '100%' }}>
      <header className="mb-6">
        <h1>AI問い合わせ機能（チャットボット）</h1>
        <p style={{ color: 'var(--text-light)' }}>過去のデータをもとにAIと対話を行います。</p>
      </header>

      {step === 'selection' ? (
        <div className="card chat-selection-card">
          <h2 className="mb-4">対象データ選択</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label className="label">事業所</label>
              <select
                className="input-field"
                value={facilityId}
                onChange={(e) => {
                  setFacilityId(Number(e.target.value));
                  persistPrefs({ facilityId: Number(e.target.value) });
                }}
              >
                {facilities.map((f) => (
                  <option key={f.facility_id} value={f.facility_id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">児童</label>
              {childrenLoading && (
                <p className="child-fetch-status" role="status" aria-live="polite">
                  取得中…
                </p>
              )}
              <select
                className="input-field"
                value={childId}
                disabled={childrenLoading}
                onChange={(e) => {
                  setChildId(Number(e.target.value));
                  persistPrefs({ childId: Number(e.target.value) });
                }}
              >
                {childrenList.map((c) => (
                  <option key={c.child_id} value={c.child_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">取得期間</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="date"
                  className="input-field"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    persistPrefs({ startDate: e.target.value });
                  }}
                />
                <span>～</span>
                <input
                  type="date"
                  className="input-field"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    persistPrefs({ endDate: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="btn btn-primary" onClick={startChat}>
              <Search size={18} /> チャット開始
            </button>
          </div>
        </div>
      ) : (
        <div className="card chat-container">
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.4rem', flexShrink: 0 }}
                onClick={() => setStep('selection')}
              >
                <ArrowLeft size={18} />
              </button>
              <h3 className="chat-header-title">
                💬 {selectedFacilityName}：{selectedChildName}さん
              </h3>
            </div>
            <select className="input-field" style={{ padding: '0.3rem', width: 'auto', fontSize: '0.875rem' }}>
              <option>Gemini 3.1 Flash</option>
              <option>Gemini 3.1 Pro (複雑用)</option>
            </select>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                {msg.sender === 'ai' && (
                  <div className="msg-avatar ai">
                    <Bot size={24} />
                  </div>
                )}
                <div className={`msg-bubble ${msg.sender}`}>{msg.text}</div>
                {msg.sender === 'user' && (
                  <div className="msg-avatar user">
                    <User size={24} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="chat-input-row">
              <textarea
                className="input-field"
                rows={2}
                style={{ flex: 1, minHeight: 'auto', resize: 'none', padding: '0.75rem' }}
                placeholder="質問や指示を入力..."
                value={inputValue}
                disabled={isLoading}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0 1rem', height: '42px', flexShrink: 0 }}
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                <Send size={20} />
              </button>
            </div>
            <p className="chat-hint">Shift + Enter で改行、Enter で送信</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
