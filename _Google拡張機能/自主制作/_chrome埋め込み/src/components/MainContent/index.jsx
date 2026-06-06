import ChatPage from './ChatPage'
import AttendancePage  from './AttendancePage'
import DashboardPage from './DashboardPage'
import HugPersonalRecordPage from './HugPersonalRecordPage'
import PersonalRecordPage from './PersonalRecordPage'

function MainContent(props) {
  const { pageDescription } = props

  return (
    <main
      id="main-content"
      className="min-h-screen overflow-x-hidden px-4 py-4 md:px-6"
    >
      <header className="mb-4">
        <p className="text-sm text-slate-500">
          {pageDescription}
        </p>
      </header>

      <ChatPage {...props} />
      <AttendancePage {...props} />
      <DashboardPage {...props} />
      <PersonalRecordPage {...props} />
      <HugPersonalRecordPage {...props} />
    </main>
  )
}

export default MainContent