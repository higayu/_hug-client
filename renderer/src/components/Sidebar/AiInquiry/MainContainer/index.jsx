// renderer/src/components/Sidebar/AiInquiry/MainContainer/index.jsx

import { useAppState } from '@/AppStateContext'

import Home from './Home'
import Search from './Search'
import Create from './Create'
import Profile from './Profile'

export default function MainContainer() {
  const {
    CURRENT_SELECTED_ITEM_ID,
  } = useAppState()

  const renderContent = () => {
    switch (CURRENT_SELECTED_ITEM_ID) {
      case 'search':
        return <Search />

      case 'create':
        return <Create />

      case 'profile':
        return <Profile />

      case 'home':
      default:
        return <Home />
    }
  }

  return (
    <main
      className="
        min-h-0
        min-w-0
        flex-1
        overflow-hidden
        bg-gray-50
      "
    >
      {renderContent()}
    </main>
  )
}