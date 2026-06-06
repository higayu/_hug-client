import AttendancePanel from './AttendancePanel'
import PersonalRecordPanel from './PersonalRecordPanel'

function SidePanel(props) {
  const { setSidePanelTab, sidePanelTab } = props

  return (
    <div id="hug-sidepanel-host" className="hug-sidepanel-host" aria-label="HUG?????">
      <nav className="hug-sidepanel-tabs" role="tablist" aria-label="??????">
        <button
          type="button"
          className={`hug-sidepanel-tab-btn ${sidePanelTab === 'attendance' ? 'active' : ''}`}
          role="tab"
          data-tab="attendance"
          aria-selected={sidePanelTab === 'attendance' ? 'true' : 'false'}
          aria-controls="hug-tab-attendance"
          onClick={() => setSidePanelTab('attendance')}
        >
          今日の利用者
        </button>
        <button
          type="button"
          className={`hug-sidepanel-tab-btn ${sidePanelTab === 'personal-record' ? 'active' : ''}`}
          role="tab"
          data-tab="personal-record"
          aria-selected={sidePanelTab === 'personal-record' ? 'true' : 'false'}
          aria-controls="hug-tab-personal-record"
          onClick={() => setSidePanelTab('personal-record')}
        >
          個人記録
        </button>
      </nav>

      <div className="hug-sidepanel-panels">
        <AttendancePanel {...props} />
        <PersonalRecordPanel {...props} />
      </div>
    </div>
  )
}

export default SidePanel
