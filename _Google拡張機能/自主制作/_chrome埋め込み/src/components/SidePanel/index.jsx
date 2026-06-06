import AttendancePanel from './AttendancePanel'
import PersonalRecordPanel from './PersonalRecordPanel'

function SidePanel(props) {
  const { setSidePanelTab, sidePanelTab } = props

  return (
    <div id="hug-sidepanel-host" className="hug-sidepanel-host box-border flex h-screen w-full flex-col bg-[#f5f5f5]" aria-label="HUG?????">
      <nav className="hug-sidepanel-tabs flex shrink-0 gap-0 border-b-2 border-black bg-[#263238]" role="tablist" aria-label="??????">
        <button
          type="button"
          className={`hug-sidepanel-tab-btn m-0 flex-1 cursor-pointer border-0 border-b-[3px] bg-transparent px-3 py-2.5 text-[13px] font-semibold transition-colors hover:bg-white/5 hover:text-[#eceff1] ${
            sidePanelTab === 'attendance'
              ? 'active border-b-[#4fc3f7] bg-white/10 text-white'
              : 'border-transparent text-[#b0bec5]'
          }`}
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
          className={`hug-sidepanel-tab-btn m-0 flex-1 cursor-pointer border-0 border-b-[3px] bg-transparent px-3 py-2.5 text-[13px] font-semibold transition-colors hover:bg-white/5 hover:text-[#eceff1] ${
            sidePanelTab === 'personal-record'
              ? 'active border-b-[#ce93d8] bg-white/10 text-white'
              : 'border-transparent text-[#b0bec5]'
          }`}
          role="tab"
          data-tab="personal-record"
          aria-selected={sidePanelTab === 'personal-record' ? 'true' : 'false'}
          aria-controls="hug-tab-personal-record"
          onClick={() => setSidePanelTab('personal-record')}
        >
          個人記録
        </button>
      </nav>

      <div className="hug-sidepanel-panels min-h-0 flex-1 overflow-hidden">
        <AttendancePanel {...props} />
        <PersonalRecordPanel {...props} />
      </div>
    </div>
  )
}

export default SidePanel
