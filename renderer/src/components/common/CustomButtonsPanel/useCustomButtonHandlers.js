// src/components/CustomButtonsPanel/useCustomButtonHandlers.js

import { useAppState } from '@/contexts/appState'
import { useSelector } from 'react-redux'
import {
  handleAdditionCompare,
  handleCustomAction1,
  handleProfessionalSupportSearch
} from './webviewActions'

export function useCustomButtonHandlers() {
  const { appState } = useAppState()
  const facilitys = useSelector((state) => state.database.facilitys)

  const handleButtonClick = (buttonConfig) => {
    switch (buttonConfig.action) {
      case 'customAction1':
        handleCustomAction1(buttonConfig, appState)
        break
      case 'professionalSupportSearch':
        handleProfessionalSupportSearch(appState, facilitys)
        break
      case 'additionCompare':
        handleAdditionCompare(appState, facilitys)
        break
      default:
        alert(`ボタンがクリックされました：${buttonConfig.text}`)
    }
  }

  return { handleButtonClick }
}
