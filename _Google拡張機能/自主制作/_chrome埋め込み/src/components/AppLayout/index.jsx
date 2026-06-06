import CorrectionModal from '../CorrectionModal'
import MainContent from '../MainContent'
import NavigationShell from '../NavigationShell'
import SidePanel from '../SidePanel'

function AppLayout(props) {
  return (
    <div className="app-container min-h-screen">
      <NavigationShell {...props} />
      <MainContent {...props} />
      <SidePanel {...props} />
      <CorrectionModal {...props} />
    </div>
  )
}

export default AppLayout
