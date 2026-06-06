import ChatPage from './ChatPage'
import CorrectionPage from './CorrectionPage'
import DashboardPage from './DashboardPage'
import HugPersonalRecordPage from './HugPersonalRecordPage'
import PersonalRecordPage from './PersonalRecordPage'

function MainContent(props) {
  const { pageDescription, pageHeader } = props

  return (
    <main id="main-content" className="main-content">
      <header className="mb-4">
        <h1>{pageHeader}</h1>
        <p style={{ color: 'var(--text-light)' }}>{pageDescription}</p>
      </header>

      <ChatPage {...props} />
      <CorrectionPage {...props} />
      <DashboardPage {...props} />
      <PersonalRecordPage {...props} />
      <HugPersonalRecordPage {...props} />
    </main>
  )
}

export default MainContent
