import AttendancePanel from './AttendancePanel'
import PersonalRecordPanel from './PersonalRecordPanel'

const tabButtonBase =
  'm-0 flex-1 cursor-pointer border-0 border-b-[3px] bg-transparent px-3 py-2.5 text-[13px] font-semibold transition-colors hover:bg-white/5 hover:text-[#eceff1]'

function SidePanel(props) {
  const { setSidePanelTab, sidePanelTab } = props

  const attendanceTabActive = sidePanelTab === 'attendance'
  const personalRecordTabActive = sidePanelTab === 'personal-record'

  return (
    <div
      id="hug-sidepanel-host"
      className="box-border flex h-screen w-full flex-col bg-[#f5f5f5]"
      aria-label="HUGサイドパネル"
    >
      <nav
        className="flex shrink-0 gap-0 border-b-2 border-black bg-[#263238]"
        role="tablist"
        aria-label="サイドパネル切り替え"
      >
        <button
          type="button"
          className={`${tabButtonBase} ${
            attendanceTabActive
              ? 'border-b-[#4fc3f7] bg-white/10 text-white'
              : 'border-transparent text-[#b0bec5]'
          }`}
          role="tab"
          data-tab="attendance"
          aria-selected={attendanceTabActive}
          aria-controls="hug-tab-attendance"
          id="hug-tab-button-attendance"
          onClick={() => setSidePanelTab('attendance')}
        >
          今日の利用者
        </button>

        <button
          type="button"
          className={`${tabButtonBase} ${
            personalRecordTabActive
              ? 'border-b-[#ce93d8] bg-white/10 text-white'
              : 'border-transparent text-[#b0bec5]'
          }`}
          role="tab"
          data-tab="personal-record"
          aria-selected={personalRecordTabActive}
          aria-controls="hug-tab-personal-record"
          id="hug-tab-button-personal-record"
          onClick={() => setSidePanelTab('personal-record')}
        >
          個人記録
        </button>
      </nav>

      <div className="min-h-0 flex-1 overflow-hidden">
        <AttendancePanel {...props} />
        <PersonalRecordPanel {...props} />
      </div>
    </div>
  )
}

export default SidePanel