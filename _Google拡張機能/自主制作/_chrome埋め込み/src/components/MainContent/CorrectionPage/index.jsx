import { Wand2, Save, RefreshCw } from 'lucide-react'

function CorrectionPage(props) {
  const {
    ATTENDANCE_FACILITY_OPTIONS,
    activePage,
    attendanceDate,
    attendanceFacilityMap,
    attendanceLoading,
    attendanceRows,
    attendanceStatus,
    correctionAdditional,
    correctionLoading,
    correctionMode,
    correctionOriginal,
    correctionDate,
    facilities,
    handleAttendanceFacilityToggle,
    handleAttendanceFetch,
    handleCorrect,
    handleCorrectionMode,
    handleFacilityChange,
    handlePostEnter,
    handleRegister,
    selectedChildId,
    selectedChildren,
    selectedFacilityId,
    setAttendanceDate,
    setCorrectionAdditional,
    setCorrectionDate,
    setCorrectionOriginal,
    setSelectedChildId,
  } = props

  return (
<section id="page-correction" className={`page ${activePage === 'correction' ? 'active' : ''}`}>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="flex justify-between items-center mb-4" style={{ marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem' }}>HUG WM 入退室一覧</h2>
              <button type="button" className="btn btn-primary" onClick={handleAttendanceFetch} disabled={attendanceLoading}>
                <RefreshCw size={16} /> {attendanceLoading ? '取得中...' : '一覧を取得'}
              </button>
            </div>

            <div className="responsive-flex" style={{ marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="label">出席表日付</label>
                <input
                  type="date"
                  className="input-field"
                  value={attendanceDate}
                  onChange={(event) => setAttendanceDate(event.target.value)}
                />
              </div>
              <div style={{ flex: 2 }}>
                <label className="label">施設フィルタ</label>
                <div className="attendance-filter-list">
                  {ATTENDANCE_FACILITY_OPTIONS.map((option) => (
                    <label key={option.id} className="attendance-filter-item">
                      <input
                        type="checkbox"
                        checked={Boolean(attendanceFacilityMap[String(option.id)])}
                        onChange={(event) => handleAttendanceFacilityToggle(option.id, event.target.checked)}
                      />
                      <span>{option.value}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem' }}>{attendanceStatus}</p>

            <div className={`table-wrap ${attendanceRows.length === 0 ? 'hidden' : ''}`}>
              <table className="data-table attendance-table">
                <thead>
                  <tr>
                    <th>児童</th>
                    <th style={{ width: '5.5rem' }}>入室</th>
                    <th style={{ width: '5.5rem' }}>退室</th>
                    <th>状態</th>
                    <th style={{ width: '6rem' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((row) => (
                    <tr key={`${row.c_id}-${row.r_id}-${row.rowIndex}`}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{row.name || `ID ${row.c_id}`}</div>
                        <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>c_id: {row.c_id || '-'}</div>
                      </td>
                      <td>{row.enterTime || '-'}</td>
                      <td>{row.leaveTime || '-'}</td>
                      <td>
                        {row.isAbsenceStatus ? row.absenceLabel : row.enterOnclick ? '入室登録可' : row.enterTime ? '入室済み' : '-'}
                        {row.isEnterMailEnabled ? ' / メール確認あり' : ''}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.65rem' }}
                          onClick={() => handlePostEnter(row)}
                          disabled={!row.enterOnclick || attendanceLoading}
                        >
                          入室
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>支援記録AI校正</h2>
          <div className="tab-bar">
            <button type="button" className={`btn tab-btn ${correctionMode === 'simple' ? 'active-simple' : ''}`} onClick={() => handleCorrectionMode('simple')}>
              案1: シンプル重視
            </button>
            <button type="button" className={`btn tab-btn ${correctionMode === 'advanced' ? 'active-advanced' : ''}`} onClick={() => handleCorrectionMode('advanced')}>
              案2: 多機能・利便性重視
            </button>
          </div>
          <div className="card">
            <div className="responsive-flex" style={{ marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label className="label">事業所</label>
                <select id="correction-facility" className="input-field" value={selectedFacilityId} onChange={(event) => handleFacilityChange(event.target.value)}>
                  {facilities.map((facility) => (
                    <option key={facility.facility_id} value={facility.facility_id}>{facility.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">児童</label>
                <select id="correction-child" className="input-field" value={selectedChildId} onChange={(event) => setSelectedChildId(Number(event.target.value))}>
                  {selectedChildren.map((child) => (
                    <option key={child.child_id} value={child.child_id}>{child.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">支援日</label>
                <input type="date" id="correction-date" className="input-field" value={correctionDate} onChange={(event) => setCorrectionDate(event.target.value)} />
              </div>
            </div>

            <div id="correction-simple-panel" className={correctionMode === 'simple' ? '' : 'hidden'}>
              <div className="prompt-box" style={{ marginBottom: '1.5rem' }}>
                <label className="label">校正の仕方の指示プロンプト（編集不可）</label>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', margin: 0 }}>
                  放課後等デイサービスの支援記録について、以下の文章をF-SOAIPに沿った形式に校正してください。
                </p>
              </div>
            </div>

            <div id="correction-advanced-panel" className={correctionMode === 'advanced' ? '' : 'hidden'}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="prompt-box">
                  <label className="label">校正の仕方の指示プロンプト（編集不可）</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', margin: 0 }}>
                    放課後等デイサービスの支援記録について、以下の文章をF-SOAIPに沿った形式に校正してください。
                  </p>
                </div>
                <div>
                  <label className="label">追加プロンプト（任意）</label>
                  <textarea id="correction-additional" className="input-field" rows="2" placeholder="例：保護者への感謝の気持ちを追加してください。" value={correctionAdditional} onChange={(event) => setCorrectionAdditional(event.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <label className="label">支援記録コメント欄に記載する文章</label>
              <textarea id="correction-original" className="input-field" rows="6" placeholder="記録を入力してください..." value={correctionOriginal} onChange={(event) => setCorrectionOriginal(event.target.value)} />
            </div>
            <div className="flex justify-end gap-4 mt-4" style={{ marginTop: '1rem', gap: '1rem' }}>
              <button id="btn-register" type="button" className="btn btn-secondary" onClick={handleRegister}>
                <Save size={16} /> 登録する
              </button>
              <button id="btn-correct" type="button" className="btn btn-primary" onClick={handleCorrect} disabled={correctionLoading}>
                <Wand2 size={16} /> {correctionLoading ? '校正中...' : 'AIで校正する'}
              </button>
            </div>
          </div>
        </section>
  )
}

export default CorrectionPage
