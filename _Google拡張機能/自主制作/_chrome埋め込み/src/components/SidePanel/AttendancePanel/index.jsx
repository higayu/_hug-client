function AttendancePanel(props) {
  const {
    ATTENDANCE_FACILITY_OPTIONS,
    HUG_WM_BASE_URL,
    HUG_WM_CONTACT_BOOK_LIST_URL,
    HUG_TIME_RE,
    WEEKDAY_JA,
    attendanceDate,
    attendanceFacilityMap,
    attendanceLoading,
    attendanceRows,
    attendanceStatus,
    displayAttendanceRows,
    halfTime,
    handleAlertPrefChange,
    handleAttendanceFacilityToggle,
    handleAttendanceFetch,
    handleHalfTimeChange,
    handlePostEnter,
    handlePostLeave,
    handleShowLeftRecordsChange,
    setAttendanceDate,
    showLeftRecords,
    sidePanelTab,
  } = props

  return (
<section
            id="hug-tab-attendance"
            className={`hug-sidepanel-tab-panel ${sidePanelTab === 'attendance' ? 'active' : ''}`}
            role="tabpanel"
            data-tab-panel="attendance"
            hidden={sidePanelTab !== 'attendance'}
          >
            <div id="hug-attendance-panel" className="hug-sidepanel-tab-mount hug-sidepanel-form-root">
              <div className="hug-sidepanel-toolbar">
                <div className="hug-sidepanel-toolbar-meta">
                  <div className="hug-attendance-count">
                    {displayAttendanceRows.length}件表示 / 全{attendanceRows.length}件 / 経過アラート {displayAttendanceRows.filter((row) => row.isOverTwoHours).length}件
                  </div>
                  <div className="hug-enter-mail-badge">
                    {attendanceRows.some((row) => row.isEnterMailEnabled) ? 'メール確認ありの入室があります' : 'メール確認なし'}
                  </div>
                </div>
                <button type="button" className="hug-refresh-button" onClick={handleAttendanceFetch} disabled={attendanceLoading}>
                  {attendanceLoading ? '取得中...' : '更新'}
                </button>
              </div>

              <div className="hug-attendance-status">
                <div className="hug-sidepanel-controls">
                  <label>
                    出席表日付
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(event) => setAttendanceDate(event.target.value)}
                    />
                  </label>
                  <div className="hug-facility-checks">
                    {ATTENDANCE_FACILITY_OPTIONS.map((option) => (
                      <label key={option.id}>
                        <input
                          type="checkbox"
                          checked={Boolean(attendanceFacilityMap[String(option.id)])}
                          onChange={(event) => handleAttendanceFacilityToggle(option.id, event.target.checked)}
                        />
                        {option.value}
                      </label>
                    ))}
                  </div>
                  <div className="hug-panel-settings-bar">
                    <label>
                      ハーフタイム
                      <input type="time" value={halfTime} step="60" onChange={(event) => handleHalfTimeChange(event.target.value)} />
                    </label>
                    <label>
                      退室済み
                      <select value={showLeftRecords} onChange={(event) => handleShowLeftRecordsChange(event.target.value)}>
                        <option value="1">表示</option>
                        <option value="0">非表示</option>
                      </select>
                    </label>
                  </div>
                </div>
                <div>{attendanceStatus}</div>
              </div>

              <div className="hug-attendance-body">
                {displayAttendanceRows.length === 0 ? (
                  <div className="hug-empty-message">HUG WM にログインしたうえで「更新」を押してください。</div>
                ) : (
                  <table className="hug-attendance-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>氏名</th>
                        <th title="0=オフ、1=パネル強調、2=別ウィンドウ相当">種別</th>
                        <th title="入室からこの分数経過でアラート">経過(分)</th>
                        <th>曜日</th>
                        <th>午前/午後</th>
                        <th>入室</th>
                        <th>退室</th>
                        <th>状態</th>
                        <th>入退室POST</th>
                        <th>加算記録</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayAttendanceRows.map((row) => (
                        <tr key={`${row.c_id}-${row.r_id}-${row.rowIndex}`} className={`${row.isOverTwoHours ? 'hug-over-two-hours' : ''}`}>
                          <td>{row.c_id || '-'}</td>
                          <td>
                            <button
                              type="button"
                              className="hug-name-button"
                              onClick={() => window.open(`${HUG_WM_CONTACT_BOOK_LIST_URL}?id=${encodeURIComponent(row.c_id)}&hug_auto_personal=1`, '_blank', 'noopener,noreferrer')}
                            >
                              {row.name || `ID ${row.c_id}`}
                            </button>
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max="99"
                              value={row.hugAlertPref?.alertType ?? 1}
                              onChange={(event) => handleAlertPrefChange(row, 'alertType', event.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={row.hugAlertPref?.alertAfterMinutes ?? 120}
                              onChange={(event) => handleAlertPrefChange(row, 'alertAfterMinutes', event.target.value)}
                            />
                          </td>
                          <td>{WEEKDAY_JA[row.hugWeekdayIndex] || '-'}</td>
                          <td>
                            <select
                              value={row.hugAlertPref?.amPmFlag ?? 0}
                              onChange={(event) => handleAlertPrefChange(row, 'amPmFlag', event.target.value)}
                            >
                              <option value="0">午前</option>
                              <option value="1">午後</option>
                            </select>
                          </td>
                          <td>{row.enterTime || '-'}</td>
                          <td>{row.leaveTime || '-'}</td>
                          <td>
                            {row.isAbsenceStatus ? '欠席' : row.isOverTwoHours ? `${row.hugAlertPref?.alertAfterMinutes ?? 120}分超過` : '通常'}
                          </td>
                          <td>
                            <div className="hug-post-actions">
                              <button
                                type="button"
                                className={`hug-row-action ${row.isEnterMailEnabled ? 'hug-btn-has-mail' : ''}`}
                                onClick={() => handlePostEnter(row)}
                                disabled={!row.enterOnclick || attendanceLoading}
                              >
                                入室
                              </button>
                              <button
                                type="button"
                                className={`hug-row-action ${row.isOverTwoHours ? 'hug-leave-alert' : ''}`}
                                onClick={() => handlePostLeave(row)}
                                disabled={!row.leaveOnclick || !HUG_TIME_RE.test(String(row.enterTime || '').trim()) || attendanceLoading}
                              >
                                退室
                              </button>
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="hug-row-action hug-secondary-action"
                              onClick={() => window.open(`${HUG_WM_BASE_URL}record_proceedings.php?mode=edit&select_child=${encodeURIComponent(row.c_id)}`, '_blank', 'noopener,noreferrer')}
                              disabled={!row.c_id}
                            >
                              移動
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
  )
}

export default AttendancePanel
