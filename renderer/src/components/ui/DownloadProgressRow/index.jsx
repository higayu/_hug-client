function normalizeProgress(value) {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Math.min(
    100,
    Math.max(0, numericValue)
  )
}

function DownloadProgressRow({
  value = 0,
  isLoading = false,
  label = '📥 ダウンロード進捗:',
}) {
  const progress =
    normalizeProgress(value)

  const isDownloading =
    progress > 0 && progress < 100

  const isCompleted =
    progress >= 100

  let statusText =
    'ダウンロード待機中'

  if (isDownloading) {
    statusText =
      'ダウンロード中'
  }

  if (isCompleted) {
    statusText =
      'ダウンロード完了'
  }

  return (
    <div className="border-b border-gray-200 py-3 font-mono text-sm last:border-b-0">
      <div className="mb-2 flex items-center justify-between gap-4">
        <strong className="min-w-[180px] text-gray-700">
          {label}
        </strong>

        <span className="font-medium text-gray-600">
          {isLoading
            ? '読み込み中...'
            : `${progress.toFixed(1)}%`}
        </span>
      </div>

      <div
        className="h-4 w-full overflow-hidden rounded-full border border-gray-300 bg-gray-200"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={
          isLoading
            ? undefined
            : progress
        }
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-[width] duration-300 ease-out"
          style={{
            width: isLoading
              ? '0%'
              : `${progress}%`,
          }}
        />
      </div>

      {!isLoading && (
        <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500">
          <span>
            {statusText}
          </span>

          {isDownloading && (
            <span className="animate-pulse">
              受信中...
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default DownloadProgressRow