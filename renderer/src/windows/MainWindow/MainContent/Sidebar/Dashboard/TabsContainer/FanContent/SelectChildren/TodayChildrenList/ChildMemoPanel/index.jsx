import { useEffect, useState } from 'react'
import './index.css'

const nowTime = () => new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

export default function ChildMemoPanel({ selectedChild }) {
  const [status, setStatus] = useState({ enter: '', leave: '', absent: false })

  useEffect(() => {
    if (!selectedChild) {
      setStatus({ enter: '', leave: '', absent: false })
      return
    }

    setStatus({
      enter: /^\d{2}:\d{2}$/.test(selectedChild.enter || '') ? selectedChild.enter : '',
      leave: /^\d{2}:\d{2}$/.test(selectedChild.leave || '') ? selectedChild.leave : '',
      absent: selectedChild.status === 'absent',
    })
  }, [selectedChild])

  if (!selectedChild) {
    return (
      <div className="child-memo-panel flex h-full flex-1 items-center justify-center border-l border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        児童を選択してください
      </div>
    )
  }

  const enter = () => setStatus({ enter: nowTime(), leave: '', absent: false })
  const leave = () => setStatus((current) => ({ ...current, leave: nowTime(), absent: false }))
  const absence = () => setStatus({ enter: '', leave: '', absent: true })

  return (
    <div className="child-memo-panel flex h-full flex-1 flex-col border-l border-gray-300 bg-gray-50">

      <div className="flex-1 overflow-y-auto p-4">
        <div className="child-memo-attendance-form rounded border bg-white p-3">
          <div className="mb-3 flex gap-3 text-sm">
            <span>入室: <strong>{status.absent ? '欠席' : status.enter || '--:--'}</strong></span>
            <span>退室: <strong>{status.leave || '--:--'}</strong></span>
          </div>

          <div className="hug-post-actions">
            <button type="button" className="hug-btn-post-enter" onClick={enter}>入室</button>
            <button type="button" className="hug-btn-post-leave" onClick={leave} disabled={!status.enter}>退室</button>
            <button type="button" className="hug-btn-absence" onClick={absence}>欠席</button>
            {status.absent && <span className="hug-absence-badge">欠席</span>}
          </div>
        </div>


      </div>
    </div>
  )
}
