import { useMemo, useRef, useState } from 'react'

const ATTENDANCE_URL = 'https://www.hug-ayumu.link/hug/wm/attendance.php'
const PROCEEDINGS_URL = 'https://www.hug-ayumu.link/hug/wm/record_proceedings.php'

function waitForLoad(webview, nextUrl) {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      webview.removeEventListener('did-stop-loading', handleLoaded)
      reject(new Error('ページの読み込みがタイムアウトしました'))
    }, 30000)

    function handleLoaded() {
      window.clearTimeout(timeoutId)
      resolve()
    }

    webview.addEventListener('did-stop-loading', handleLoaded, { once: true })
    if (nextUrl) webview.src = nextUrl
  })
}

function ResultTable({ title, headers, rows }) {
  return (
    <section className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 border-l-4 border-blue-500 pl-3 text-base font-semibold text-gray-800">
        {title}
      </h2>
      <div className="max-h-[calc(100vh-240px)] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-gray-100">
            <tr>
              {headers.map((header) => (
                <th key={header} className="border border-gray-300 px-3 py-2 text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="even:bg-gray-50">
                {headers.map((header) => (
                  <td key={header} className="border border-gray-300 px-3 py-2 align-top">
                    {row[header] ?? ''}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={headers.length} className="border border-gray-300 px-3 py-6 text-center text-gray-500">
                  データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function AdditionCompareWindow() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const [facilityId, setFacilityId] = useState(params.get('FACILITY_ID') ?? '')
  const [dateStr, setDateStr] = useState(params.get('DATE_STR') ?? '')
  const [activeTab, setActiveTab] = useState('pages')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [leftRows, setLeftRows] = useState([])
  const [rightResult, setRightResult] = useState({ headers: ['氏名', '内容'], rows: [] })
  const leftRef = useRef(null)
  const rightRef = useRef(null)

  const handleGetData = async () => {
    const left = leftRef.current
    const right = rightRef.current
    if (!left || !right) return

    setIsLoading(true)
    setError('')

    try {
      const attendanceUrl = `${ATTENDANCE_URL}?mode=detail&f_id=${encodeURIComponent(facilityId)}&date=${encodeURIComponent(dateStr)}`
      await waitForLoad(left, attendanceUrl)

      const nextLeftRows = await left.executeJavaScript(`
        (() => {
          document.querySelector('input[type="radio"][name="tableChange"][value="2"]')?.click();
          const table = document.querySelector('table.js_adding_table') || document.querySelector('table');
          if (!table) return [];
          return Array.from(table.querySelectorAll('tr')).slice(1).flatMap((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length <= 5 || !cells[5].textContent.includes('専門的支援実施加算')) return [];
            const link = cells[0].querySelector('a[href*="id="]');
            return [{
              ID: link?.href.match(/id=(\\d+)/)?.[1] || '',
              氏名: cells[0].querySelector('p')?.textContent.trim() || cells[0].textContent.trim(),
              加算内容: cells[5].textContent.replace(/\\s+/g, ' ').trim()
            }];
          });
        })()
      `)

      const rightReady = waitForLoad(right)
      await right.executeJavaScript(`
        (() => {
          document.querySelectorAll('input[type="checkbox"][name^="f_ary"]').forEach((checkbox) => {
            checkbox.checked = false;
          });
          const target = document.querySelector('input[data-fid="${facilityId}"]');
          if (target) target.checked = true;
          const addition = document.querySelector('select[name="adding_children_id"]');
          if (addition) addition.value = '55';
          const from = document.getElementById('dp1');
          const to = document.getElementById('dp2');
          if (from) from.value = '${dateStr}';
          if (to) to.value = '${dateStr}';
          document.querySelector('button.btn.search[type="submit"]')?.click();
        })()
      `)
      await rightReady

      const nextRightResult = await right.executeJavaScript(`
        (() => {
          const table = document.querySelector('table');
          if (!table) return { headers: ['氏名', '内容'], rows: [] };
          const headerCells = table.querySelectorAll('tr:first-child th, tr:first-child td');
          const headers = [
            headerCells[1]?.textContent.trim() || '氏名',
            headerCells[2]?.textContent.trim() || '内容'
          ];
          const rows = Array.from(table.querySelectorAll('tr')).slice(1).flatMap((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length <= 2) return [];
            return [{ [headers[0]]: cells[1].textContent.replace(/\\s+/g, ' ').trim(), [headers[1]]: cells[2].textContent.replace(/\\s+/g, ' ').trim() }];
          });
          return { headers, rows };
        })()
      `)

      setLeftRows(Array.isArray(nextLeftRows) ? nextLeftRows : [])
      setRightResult(nextRightResult)
      setActiveTab('results')
    } catch (fetchError) {
      console.error('[AdditionCompareWindow] データ取得エラー:', fetchError)
      setError(fetchError?.message || 'データ取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 text-gray-800">
      <header className="flex flex-wrap items-end gap-4 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <label className="text-sm font-semibold">
          <span className="mb-1 block">施設ID</span>
          <input value={facilityId} onChange={(event) => setFacilityId(event.target.value)} className="rounded border border-gray-300 px-3 py-2 font-normal" />
        </label>
        <label className="text-sm font-semibold">
          <span className="mb-1 block">日付</span>
          <input type="date" value={dateStr} onChange={(event) => setDateStr(event.target.value)} className="rounded border border-gray-300 px-3 py-2 font-normal" />
        </label>
        <button type="button" onClick={handleGetData} disabled={isLoading || !facilityId || !dateStr} className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          {isLoading ? '取得中...' : '📥 データ取得'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </header>

      <nav className="flex border-b border-gray-300 bg-gray-100">
        <button type="button" onClick={() => setActiveTab('pages')} className={`flex-1 px-4 py-2.5 text-sm font-medium ${activeTab === 'pages' ? 'border-t-2 border-blue-600 bg-white text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}>📄 ページ表示</button>
        <button type="button" onClick={() => setActiveTab('results')} className={`flex-1 px-4 py-2.5 text-sm font-medium ${activeTab === 'results' ? 'border-t-2 border-blue-600 bg-white text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}>📊 取得結果</button>
      </nav>

      <main className="min-h-0 flex-1">
        <div className={`h-full ${activeTab === 'pages' ? 'flex' : 'hidden'}`}>
          <webview ref={leftRef} src={params.get('URL1') || ATTENDANCE_URL} allowpopups="true" className="h-full flex-1 border-r-2 border-gray-300" />
          <webview ref={rightRef} src={params.get('URL2') || PROCEEDINGS_URL} allowpopups="true" className="h-full flex-1" />
        </div>
        {activeTab === 'results' && (
          <div className="flex h-full gap-4 overflow-auto p-4">
            <ResultTable title="📘 左ページ（加算登録）" headers={['ID', '氏名', '加算内容']} rows={leftRows} />
            <ResultTable title="📙 右ページ（計画状況）" headers={rightResult.headers} rows={rightResult.rows} />
          </div>
        )}
      </main>
    </div>
  )
}
