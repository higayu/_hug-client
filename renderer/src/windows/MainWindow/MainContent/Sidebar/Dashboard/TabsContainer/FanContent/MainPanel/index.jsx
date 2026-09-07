import { FAN_CONTENT_PANELS, useAppState } from '@/AppStateContext'
import PersonalRecordManagerPanel2 from '@/components/common/hug_function/PersonalRecordManagerPanel2'
import AiContents from './AiContents'
import ChildKadai from './ChildKadai'

export default function MainPanel() {
  const { activeFanContentPanel } = useAppState()

  return (
    <section className="min-w-0" aria-label="メインパネル">
      <div className="min-w-0 bg-white" role="tabpanel">
        {activeFanContentPanel === FAN_CONTENT_PANELS.AI_SUPPORT && (
          <AiContents />
        )}

        {activeFanContentPanel === FAN_CONTENT_PANELS.CHILD_KADAI && (
          <ChildKadai />
        )}

        {activeFanContentPanel === FAN_CONTENT_PANELS.PERSONAL_RECORD && (
          <PersonalRecordManagerPanel2 />
        )}
      </div>
    </section>
  )
}
