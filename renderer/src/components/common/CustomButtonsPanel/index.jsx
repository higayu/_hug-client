// src/components/CustomButtonsPanel/index.jsx

import { useEffect, useState } from 'react'
import { useCustomButtons } from '@/components/common/CustomButtonsContext.jsx'
import CustomButtonItem from './CustomButtonItem'
import { useCustomButtonHandlers } from './useCustomButtonHandlers'

function CustomButtonsPanel() {
  const { customButtons, getCustomButtons } = useCustomButtons()
  const [buttons, setButtons] = useState([])
  const { handleButtonClick } = useCustomButtonHandlers()

  useEffect(() => {
    setButtons(getCustomButtons())
  }, [customButtons, getCustomButtons])

  return (
    <ul className="list-none m-0 p-0 py-1.25">
      {buttons.map((buttonConfig) => (
        <CustomButtonItem
          key={buttonConfig.id}
          buttonConfig={buttonConfig}
          onClick={handleButtonClick}
        />
      ))}
    </ul>
  )
}

export default CustomButtonsPanel
