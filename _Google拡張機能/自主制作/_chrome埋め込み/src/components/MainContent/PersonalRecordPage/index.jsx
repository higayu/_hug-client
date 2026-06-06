import { Search } from 'lucide-react'

function PersonalRecordPage(props) {
  const {
    activePage,
    facilities,
    handleFacilityChange,
    handlePrClose,
    handlePrSearch,
    handlePrSelect,
    prEndDate,
    prResults,
    prStartDate,
    prStatus,
    selectedChildId,
    selectedChildren,
    selectedFacilityId,
    selectedPr,
    setPrEndDate,
    setPrStartDate,
    setSelectedChildId,
  } = props

  return (
<section id="page-personal-record" className={`page ${activePage === 'personal-record' ? 'active' : ''}`}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>検索条件</h2>
            <div className="responsive-flex" style={{ marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="label">事業所</label>
                <select id="pr-facility" className="input-field" value={selectedFacilityId} onChange={(event) => handleFacilityChange(event.target.value)}>
                  {facilities.map((facility) => (
                    <option key={facility.facility_id} value={facility.facility_id}>{facility.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">児童</label>
                <select id="pr-child" className="input-field" value={selectedChildId} onChange={(event) => setSelectedChildId(Number(event.target.value))}>
                  {selectedChildren.map((child) => (
                    <option key={child.child_id} value={child.child_id}>{child.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">取得期間</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input type="date" id="pr-start-date" className="input-field" style={{ flex: 1, minWidth: '10rem' }} value={prStartDate} onChange={(event) => setPrStartDate(event.target.value)} />
                <span>～</span>
                <input type="date" id="pr-end-date" className="input-field" style={{ flex: 1, minWidth: '10rem' }} value={prEndDate} onChange={(event) => setPrEndDate(event.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <button id="btn-pr-search" type="button" className="btn btn-primary" onClick={handlePrSearch}>
                <Search size={16} /> 一覧を取得
              </button>
            </div>
          </div>
          <div className="card">
            <div className="flex justify-between items-center mb-4" style={{ marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem' }}>記録一覧</h2>
              <span className="badge badge-primary">{prResults.length}件</span>
            </div>
            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem' }}>{prStatus}</p>
            <div id="pr-table-wrap" className={`table-wrap ${prResults.length === 0 ? 'hidden' : ''}`}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '7rem' }}>支援日</th>
                    <th>記録内容</th>
                    <th style={{ width: '5rem' }}>ID</th>
                  </tr>
                </thead>
                <tbody id="pr-tbody">
                  {prResults.map((record) => (
                    <tr key={record.id} className={selectedPr?.id === record.id ? 'selected' : ''} onClick={() => handlePrSelect(record)}>
                      <td>{record.date}</td>
                      <td>{record.content}</td>
                      <td>{record.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div id="pr-detail-card" className={`card ${selectedPr ? '' : 'hidden'}`} style={{ marginTop: '1.5rem' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ margin: 0 }}>記録の詳細</h3>
              <button id="btn-pr-detail-close" type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem' }} onClick={handlePrClose}>
                閉じる
              </button>
            </div>
            {selectedPr && (
              <dl className="record-detail-dl">
                <dt>記録ID</dt>
                <dd>{selectedPr.id}</dd>
                <dt>支援日</dt>
                <dd>{selectedPr.date}</dd>
                <dt>児童</dt>
                <dd>{selectedPr.child}</dd>
                <dt>記録内容</dt>
                <dd className="record-detail-content">{selectedPr.content}</dd>
              </dl>
            )}
          </div>
        </section>
  )
}

export default PersonalRecordPage
