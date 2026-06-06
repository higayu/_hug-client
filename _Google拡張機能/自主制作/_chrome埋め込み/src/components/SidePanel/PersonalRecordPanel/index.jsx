function PersonalRecordPanel(props) {
  const {
    attendanceDate,
    attendanceLoading,
    facilities,
    handleAttendanceFetch,
    handleFacilityChange,
    handleHugFetch,
    handleHugMonthFetch,
    handleHugSave,
    hprCachedRecord,
    hprEndDate,
    hprLoading,
    hprNote,
    hprRecordStaff,
    hprResults,
    hprStartDate,
    hugStatus,
    selectedChildId,
    selectedChildren,
    selectedFacilityId,
    setAttendanceDate,
    setHprEndDate,
    setHprNote,
    setHprRecordStaff,
    setHprStartDate,
    setSelectedChildId,
    sidePanelTab,
  } = props

  return (
<section
            id="hug-tab-personal-record"
            className={`hug-sidepanel-tab-panel ${sidePanelTab === 'personal-record' ? 'active' : ''}`}
            role="tabpanel"
            data-tab-panel="personal-record"
            hidden={sidePanelTab !== 'personal-record'}
          >
            <div id="hug-personal-record-form" className="hug-sidepanel-tab-mount hug-sidepanel-form-root">
              <section className="hug-form-section hug-form-section-attendance">
                <div className="hug-form-section-title">出席表・児童一覧</div>
                <div className="hug-pr-grid">
                  <label>
                    出席表日付
                    <input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} />
                  </label>
                  <button type="button" onClick={handleAttendanceFetch} disabled={attendanceLoading}>
                    児童を再取得
                  </button>
                </div>
              </section>

              <section className="hug-form-section hug-form-section-personal">
                <div className="hug-form-section-title">個人記録</div>
                <div className="hug-pr-grid">
                  <label>
                    事業所
                    <select value={selectedFacilityId} onChange={(event) => handleFacilityChange(event.target.value)}>
                      {facilities.map((facility) => (
                        <option key={facility.facility_id} value={facility.facility_id}>{facility.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    児童
                    <select value={selectedChildId} onChange={(event) => setSelectedChildId(Number(event.target.value))}>
                      {selectedChildren.map((child) => (
                        <option key={child.child_id} value={child.child_id}>{child.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="hug-pr-grid">
                  <label>
                    開始日
                    <input type="date" value={hprStartDate} onChange={(event) => setHprStartDate(event.target.value)} />
                  </label>
                  <label>
                    終了日
                    <input type="date" value={hprEndDate} onChange={(event) => setHprEndDate(event.target.value)} />
                  </label>
                </div>
                <div className="hug-pr-actions">
                  <button type="button" onClick={handleHugMonthFetch} disabled={hprLoading}>
                    過去の自動検索
                  </button>
                  <button type="button" className="hug-pr-fetch-btn" onClick={handleHugFetch} disabled={hprLoading}>
                    {hprLoading ? '取得中...' : '個人記録を取得'}
                  </button>
                </div>
                <div className="hug-pr-status">{hugStatus}</div>
                <label className="hug-record-staff-label">
                  記録者
                  <select value={hprRecordStaff} onChange={(event) => setHprRecordStaff(event.target.value)} disabled={!hprCachedRecord?.recordStaff?.options?.length}>
                    {hprCachedRecord?.recordStaff?.options?.length ? (
                      hprCachedRecord.recordStaff.options.map((option) => (
                        <option key={option.value} value={option.value}>{option.text}</option>
                      ))
                    ) : (
                      <option value="">取得後に表示されます</option>
                    )}
                  </select>
                </label>
                <textarea
                  id="hug-form-note"
                  rows="12"
                  spellCheck="false"
                  value={hprNote}
                  onChange={(event) => setHprNote(event.target.value)}
                  placeholder="取得後に表示されます。"
                />
                <div className="hug-pr-save-actions">
                  <button type="button" onClick={() => handleHugSave('1')} disabled={!hprCachedRecord?.editHtml || hprLoading}>
                    下書きで更新
                  </button>
                  <button type="button" onClick={() => handleHugSave('2')} disabled={!hprCachedRecord?.editHtml || hprLoading}>
                    公開で更新
                  </button>
                </div>
                {hprResults.length > 0 && (
                  <div className="hug-pr-result-meta">
                    {hprResults.map((row) => (
                      <div key={`${row.date}-${row.editPath}`}>{row.date} / {row.childName} / {row.attendance}</div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </section>
  )
}

export default PersonalRecordPanel
