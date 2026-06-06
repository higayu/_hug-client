import { History, Settings, PlayCircle, Save } from 'lucide-react'

function DashboardPage(props) {
  const {
    activePage,
  } = props

  return (
<section id="page-dashboard" className={`page ${activePage === 'dashboard' ? 'active' : ''}`}>
          <div className="responsive-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                {
                  title: '📊 AIプロンプト（解析用）',
                  text: 'この児童のメンタル不調の傾向やデイを解約しそうな兆候がないか解析し、要約してください。',
                },
                {
                  title: '📊 AIプロンプト（校正用）',
                  text: '放課後等デイサービスの支援記録について、以下の文章をF-SOAIPに沿った形式に校正してください。',
                },
                {
                  title: '📊 AIプロンプト（問い合わせ用）',
                  text: '提供された過去の支援記録の事実のみに基づいて回答すること。推測で嘘をつかないこと。',
                },
              ].map((item) => (
                <div key={item.title} className="card">
                  <h3 className="flex items-center gap-2" style={{ margin: '0 0 1rem' }}>
                    <Settings size={18} /> {item.title}
                  </h3>
                  <textarea className="input-field mb-4" defaultValue={item.text} />
                  <div className="flex justify-end gap-2">
                    <button type="button" className="btn btn-secondary">
                      <History size={16} /> 変更履歴
                    </button>
                    <button type="button" className="btn btn-primary">
                      <Save size={16} /> 保存
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card">
                <h3 className="mb-4">⚙️ バッチ処理コントロール</h3>
                <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div className="flex justify-between mb-4">
                    <span className="label" style={{ margin: 0 }}>現在のステータス</span>
                    <span className="badge badge-success">🟢 待機中</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="label" style={{ margin: 0 }}>前回の実行日時</span>
                    <span style={{ fontSize: '0.875rem' }}>2026/03/01 02:00 (成功)</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="button" className="btn btn-primary" style={{ width: '100%' }}>
                    <PlayCircle size={16} /> バッチ起動
                  </button>
                </div>
              </div>
              <div className="card">
                <h3 className="mb-4">📊 AI API 使用状況（今月）</h3>
                {[
                  { name: 'Gemini 3.1 Pro', value: '$12.50', width: '40%', color: 'primary' },
                  { name: 'Gemini 3.1 Flash Lite', value: '$3.20', width: '15%', color: 'secondary' },
                ].map((item) => (
                  <div key={item.name} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex justify-between items-center mb-4">
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: item.color === 'primary' ? 'var(--primary-color)' : 'var(--secondary-color)' }}>
                        {item.value}
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: 8, background: 'var(--border-color)', borderRadius: '999px' }}>
                      <div className={`progress-fill ${item.color}`} style={{ width: item.width, height: '100%', borderRadius: '999px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
  )
}

export default DashboardPage
