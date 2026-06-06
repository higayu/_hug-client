import { X, Check, RefreshCw, ChevronDown } from 'lucide-react'

function CorrectionModal(props) {
  const {
    correctionLoading,
    correctionModalOpen,
    correctionOriginal,
    correctionText,
    handleCorrect,
    setCorrectionModalOpen,
    setCorrectionOriginal,
    setCorrectionText,
  } = props

  return (
<div id="correction-modal" className={`modal-backdrop ${correctionModalOpen ? 'open' : ''}`}>
        <div className="card modal-content">
          <div className="flex justify-between items-center mb-4">
            <h2 style={{ margin: 0 }}>校正結果の確認</h2>
            <button id="modal-close" type="button" className="btn btn-secondary" style={{ padding: '0.25rem' }} onClick={() => setCorrectionModalOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="modal-body">
            <div className="prompt-box">
              <button type="button" className="collapse-btn">
                <label className="label">校正前の文章</label>
                <ChevronDown size={16} />
              </button>
              <p style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{correctionOriginal}</p>
            </div>
            <div>
              <button type="button" className="collapse-btn">
                <label className="label">校正後の文章（編集可）</label>
                <ChevronDown size={16} />
              </button>
              <textarea
                id="correction-corrected"
                className="input-field corrected-textarea"
                rows="8"
                value={correctionText}
                onChange={(event) => setCorrectionText(event.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setCorrectionModalOpen(false)}>
              キャンセル
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCorrect} disabled={correctionLoading}>
              <RefreshCw size={16} /> 再校正
            </button>
            <button
              id="modal-apply"
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setCorrectionOriginal(correctionText)
                setCorrectionModalOpen(false)
              }}
            >
              <Check size={16} /> 反映して閉じる
            </button>
          </div>
        </div>
      </div>
  )
}

export default CorrectionModal
