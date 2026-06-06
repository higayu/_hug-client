import { Search, ArrowLeft, Send } from 'lucide-react'

function ChatPage(props) {
  const {
    activePage,
    chatEndDate,
    chatInput,
    chatMessages,
    chatModel,
    chatStarted,
    chatStartDate,
    facilities,
    handleChatBack,
    handleChatSend,
    handleChatStart,
    handleFacilityChange,
    selectedChildId,
    selectedChildren,
    selectedFacilityId,
    setChatEndDate,
    setChatInput,
    setChatModel,
    setChatStartDate,
    setSelectedChildId,
  } = props

  return (
<section id="page-chat" className={`page ${activePage === 'chat' ? 'active' : ''}`}>
          <div className={`card chat-selection-card ${chatStarted ? 'hidden' : ''}`}>
            <h2 className="mb-4">対象データ選択</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label className="label">事業所</label>
                <select id="chat-facility" className="input-field" value={selectedFacilityId} onChange={(event) => handleFacilityChange(event.target.value)}>
                  {facilities.map((facility) => (
                    <option key={facility.facility_id} value={facility.facility_id}>{facility.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">児童</label>
                <select id="chat-child" className="input-field" value={selectedChildId} onChange={(event) => setSelectedChildId(Number(event.target.value))}>
                  {selectedChildren.map((child) => (
                    <option key={child.child_id} value={child.child_id}>{child.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">取得期間</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="date" id="chat-start-date" className="input-field" value={chatStartDate} onChange={(event) => setChatStartDate(event.target.value)} />
                  <span>～</span>
                  <input type="date" id="chat-end-date" className="input-field" value={chatEndDate} onChange={(event) => setChatEndDate(event.target.value)} />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button id="btn-chat-start" type="button" className="btn btn-primary" onClick={handleChatStart}>
                <Search size={16} /> チャット開始
              </button>
            </div>
          </div>

          <div id="chat-room" className={`card chat-container ${chatStarted ? '' : 'hidden'}`}>
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <button id="btn-chat-back" type="button" className="btn btn-secondary" style={{ padding: '0.4rem', flexShrink: 0 }} onClick={handleChatBack}>
                  <ArrowLeft size={16} />
                </button>
                <h3 id="chat-room-title" className="chat-header-title">会話ルーム</h3>
              </div>
              <select
                className="input-field"
                style={{ padding: '0.3rem', width: 'auto', fontSize: '0.875rem' }}
                value={chatModel}
                onChange={(event) => setChatModel(event.target.value)}
              >
                <option>Gemini 3.1 Flash</option>
                <option>Gemini 3.1 Pro (複雑用)</option>
              </select>
            </div>
            <div id="chat-messages" className="chat-messages" style={{ minHeight: '12rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              {chatMessages.map((message, index) => (
                <div key={index} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{message.role === 'assistant' ? 'AI' : 'ユーザー'}</strong>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{message.content}</div>
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <div className="chat-input-row" style={{ display: 'flex', gap: '0.75rem' }}>
                <textarea
                  id="chat-input"
                  className="input-field"
                  rows="2"
                  style={{ flex: 1, minHeight: 'auto', resize: 'none', padding: '0.75rem' }}
                  placeholder="質問や指示を入力..."
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      handleChatSend()
                    }
                  }}
                />
                <button id="btn-chat-send" type="button" className="btn btn-primary" style={{ padding: '0 1rem', height: 42, flexShrink: 0 }} onClick={handleChatSend}>
                  <Send size={16} />
                </button>
              </div>
              <p className="chat-hint" style={{ marginTop: '0.5rem', color: 'var(--text-light)' }}>
                Shift + Enter で改行、Enter で送信
              </p>
            </div>
          </div>
        </section>
  )
}

export default ChatPage
