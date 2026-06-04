import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import {
  useFacilities,
  useHugChildren,
  pickValidChildId,
} from '../hooks/useFacilityChildren';
import { fetchHugPersonalRecordsFromWm, type HugPersonalRecord } from '../lib/hugWm';
import {
  loadPrefs,
  savePrefs,
  applyPeriodPrefs,
  mergePrefs,
} from '../lib/prefs';
import { getDefaultPeriod } from '../lib/records';

const HugPersonalRecordPage = () => {
  const defaults = getDefaultPeriod();
  const prefs = loadPrefs();
  const period = applyPeriodPrefs(prefs.hugPersonalRecord, defaults);

  const { facilities } = useFacilities();
  const [facilityId, setFacilityId] = useState<number | ''>(period.facilityId);
  const [childId, setChildId] = useState<number | ''>(period.childId);
  const [startDate, setStartDate] = useState(period.startDate);
  const [endDate, setEndDate] = useState(period.endDate);

  const { childrenList, loading: childrenLoading } = useHugChildren(facilityId, {
    date: startDate,
    dateEnd: endDate,
  });

  const [records, setRecords] = useState<HugPersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (facilities.length > 0 && !facilityId) {
      setFacilityId(facilities[0].facility_id);
    }
  }, [facilities, facilityId]);

  useEffect(() => {
    setChildId((prev) => pickValidChildId(childrenList, prev));
  }, [childrenList]);

  const persistPrefs = (overrides?: Record<string, unknown>) => {
    savePrefs(
      mergePrefs(loadPrefs(), 'hugPersonalRecord', {
        facilityId: facilityId || undefined,
        childId: childId || undefined,
        startDate,
        endDate,
        ...overrides,
      }),
    );
  };

  const handleFetch = async () => {
    if (!childId) {
      alert('児童を選択してください');
      return;
    }
    if (!startDate || !endDate) {
      alert('取得期間を指定してください');
      return;
    }
    if (startDate > endDate) {
      alert('開始日は終了日以前にしてください');
      return;
    }

    setIsLoading(true);
    setRecords([]);
    setStatusMessage('');

    try {
      const result = await fetchHugPersonalRecordsFromWm({
        facilityId: Number(facilityId),
        date: startDate,
        dateEnd: endDate,
        childId: Number(childId),
        onProgress: setStatusMessage,
      });
      setRecords(result);
      setHasSearched(true);
    } catch (err) {
      console.error('[loadHugPersonalRecords]', err);
      alert(
        `HUGからの取得に失敗しました: ${(err as Error).message}\n\n` +
          '・伴走ナビ拡張機能から開いているか\n' +
          '・HUG WM にログイン済みか\n' +
          '・事業所・児童IDが HUG 上の f_id / id と一致しているか\nを確認してください。',
      );
      setHasSearched(true);
      setRecords([]);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
      persistPrefs();
    }
  };

  let statusHint = '条件を指定して「HUGから取得」を押してください。';
  if (isLoading && statusMessage) statusHint = statusMessage;
  else if (isLoading) statusHint = 'HUG WM からデータを取得しています…';
  else if (hasSearched) {
    statusHint =
      records.length > 0 ? '取得が完了しました。' : '該当する出席日の記録は見つかりませんでした。';
  }

  return (
    <div className="w-full">
      <header className="mb-4">
        <h1>hugから個人記録取得</h1>
        <p style={{ color: 'var(--text-light)' }}>
          HUG WM の連絡帳一覧から「出席」の日のみ編集画面を開き、活動内容（note）を取得します。
          ブラウザで{' '}
          <a href="https://www.hug-ayumu.link/hug/wm/" target="_blank" rel="noopener noreferrer">
            HUG WM
          </a>{' '}
          にログインしたうえで実行してください。
        </p>
      </header>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="mb-4" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
          検索条件
        </h2>
        <div className="responsive-flex" style={{ marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label className="label">事業所（f_id）</label>
            <select
              className="input-field"
              value={facilityId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setFacilityId(id);
                persistPrefs({ facilityId: id });
              }}
            >
              {facilities.map((f) => (
                <option key={f.facility_id} value={f.facility_id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="label">児童（id）</label>
            {childrenLoading && (
              <p className="child-fetch-status" role="status" aria-live="polite">
                取得中…
              </p>
            )}
            <select
              className="input-field"
              value={childId}
              disabled={childrenLoading}
              onChange={(e) => {
                const id = Number(e.target.value);
                setChildId(id);
                persistPrefs({ childId: id });
              }}
            >
              {childrenList.map((c) => (
                <option key={c.child_id} value={c.child_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label">取得期間</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="date"
              className="input-field"
              style={{ flex: 1, minWidth: '10rem' }}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                persistPrefs({ startDate: e.target.value });
              }}
            />
            <span>～</span>
            <input
              type="date"
              className="input-field"
              style={{ flex: 1, minWidth: '10rem' }}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                persistPrefs({ endDate: e.target.value });
              }}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleFetch}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>取得中…</span>
            ) : (
              <>
                <Download size={18} /> HUGから取得
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4" style={{ marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem' }}>取得結果</h2>
          <span className="badge badge-primary">{records.length}件</span>
        </div>
        <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {statusHint}
        </p>
        {hasSearched && records.length > 0 && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '7rem' }}>日付</th>
                  <th style={{ width: '8rem' }}>児童</th>
                  <th>活動内容（note）</th>
                </tr>
              </thead>
              <tbody>
                {records.map((row, i) => (
                  <tr key={`${row.date}-${i}`}>
                    <td>{row.date}</td>
                    <td>{row.childName}</td>
                    <td style={{ whiteSpace: 'pre-wrap' }}>
                      {row.note || '（取得できませんでした）'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HugPersonalRecordPage;
