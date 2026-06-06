import { Download } from 'lucide-react'

function HugPersonalRecordPage(props) {
  const {
    activePage,
    facilities,
    handleFacilityChange,
    handleHugFetch,
    hprEndDate,
    hprLoading,
    hprResults,
    hprStartDate,
    hugStatus,
    selectedChildId,
    selectedChildren,
    selectedFacilityId,
    setHprEndDate,
    setHprStartDate,
    setSelectedChildId,
  } = props

  return (
<section id="page-hug-personal-record" className={`page ${activePage === 'hug-personal-record' ? 'active' : ''}`}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>検索条件</h2>
            <div className="responsive-flex" style={{ marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="label">事業所（f_id）</label>
                <select id="hpr-facility" className="input-field" value={selectedFacilityId} onChange={(event) => handleFacilityChange(event.target.value)}>
                  {facilities.map((facility) => (
                    <option key={facility.facility_id} value={facility.facility_id}>{facility.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">児童（id）</label>
                <select id="hpr-child" className="input-field" value={selectedChildId} onChange={(event) => setSelectedChildId(Number(event.target.value))}>
                  {selectedChildren.map((child) => (
                    <option key={child.child_id} value={child.child_id}>{child.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">取得期間</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input type="date" id="hpr-start-date" className="input-field" style={{ flex: 1, minWidth: '10rem' }} value={hprStartDate} onChange={(event) => setHprStartDate(event.target.value)} />
                <span>～</span>
                <input type="date" id="hpr-end-date" className="input-field" style={{ flex: 1, minWidth: '10rem' }} value={hprEndDate} onChange={(event) => setHprEndDate(event.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <button id="btn-hpr-fetch" type="button" className="btn btn-primary" onClick={handleHugFetch} disabled={hprLoading}>
                <Download size={16} /> {hprLoading ? '取得中...' : '取得'}
              </button>
            </div>
          </div>
          <div className="card">
            <div className="flex justify-between items-center mb-4" style={{ marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem' }}>取得結果</h2>
              <span className="badge badge-primary">{hprResults.length}件</span>
            </div>
            <p style={{ color: 'var(--text-light)', marginBottom: '1rem', fontSize: '0.9rem' }}>{hugStatus}</p>
            <div className={`table-wrap ${hprResults.length === 0 ? 'hidden' : ''}`}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '7rem' }}>日付</th>
                    <th style={{ width: '8rem' }}>児童名</th>
                    <th>活動内容（note）</th>
                  </tr>
                </thead>
                <tbody>
                  {hprResults.map((record, index) => (
                    <tr key={`${record.date}-${index}`}>
                      <td>{record.date}</td>
                      <td>{record.childName}</td>
                      <td style={{ whiteSpace: 'pre-wrap' }}>{record.note || '取得できませんでした。'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
  )
}

export default HugPersonalRecordPage
