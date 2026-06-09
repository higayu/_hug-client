import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fetchJson } from '../lib/api';
import { getApiBase } from '../lib/aiConfig';
import {
  useFacilities,
  useHugChildren,
  getFacilityName,
  getChildName,
  pickValidChildId,
} from '../hooks/useFacilityChildren';
import {
  loadPrefs,
  savePrefs,
  applyPeriodPrefs,
  mergePrefs,
} from '../lib/prefs';
import {
  filterRecordsByDateRange,
  getDefaultPeriod,
  formatRecordDate,
  sortRecordsByDateDesc,
  getSupportRecordKey,
} from '../lib/records';
import { MOCK_RECORDS, type SupportRecord } from '../lib/mockData';

const PersonalRecordPage = () => {
  const defaults = getDefaultPeriod();
  const prefs = loadPrefs();
  const period = applyPeriodPrefs(prefs.personalRecord, defaults);

  const { facilities } = useFacilities();
  const [facilityId, setFacilityId] = useState<number | ''>(period.facilityId);
  const [childId, setChildId] = useState<number | ''>(period.childId);
  const [startDate, setStartDate] = useState(period.startDate);
  const [endDate, setEndDate] = useState(period.endDate);

  const { childrenList, loading: childrenLoading } = useHugChildren(facilityId, {
    date: startDate,
    dateEnd: endDate,
  });

  const [records, setRecords] = useState<SupportRecord[]>([]);
  const [selectedRecordKey, setSelectedRecordKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (facilities.length > 0 && !facilityId) {
      setFacilityId(facilities[0].facility_id);
    }
  }, [facilities, facilityId]);

  useEffect(() => {
    setChildId((prev) => pickValidChildId(childrenList, prev));
  }, [childrenList]);

  const persistPrefs = (overrides?: Partial<typeof period>) => {
    const next = {
      facilityId: facilityId || undefined,
      childId: childId || undefined,
      startDate,
      endDate,
      ...overrides,
    };
    savePrefs(mergePrefs(loadPrefs(), 'personalRecord', next));
  };

  const handleSearch = async () => {
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
    setSelectedRecordKey(null);

    let result: SupportRecord[] = [];
    try {
      const all = await fetchJson<SupportRecord[]>(
        `${getApiBase()}/support_records/_search?pk=child_id&values=${childId}`,
      );
      result = filterRecordsByDateRange(all, startDate, endDate);
    } catch (err) {
      console.warn('[loadPersonalRecords] API取得に失敗、MOCKを使用:', err);
      result = filterRecordsByDateRange(MOCK_RECORDS, startDate, endDate);
    }

    setRecords(sortRecordsByDateDesc(result));
    setHasSearched(true);
    setIsLoading(false);
    persistPrefs();
  };

  const selected = records.find(
    (r) => getSupportRecordKey(r, childId) === selectedRecordKey,
  );
  const facilityName = getFacilityName(facilities, facilityId);
  const childName = getChildName(childrenList, childId);

  let statusHint = '条件を指定して「一覧を取得」を押してください。';
  if (isLoading) statusHint = '記録を読み込んでいます...';
  else if (hasSearched && records.length === 0) {
    statusHint = `指定条件の記録は見つかりませんでした（${startDate} ～ ${endDate}）。`;
  } else if (hasSearched) {
    statusHint = `${facilityName}：${childName}さん（${startDate} ～ ${endDate}）`;
  }

  return (
    <div className="w-full">
      <header className="mb-4">
        <h1>個人記録一覧</h1>
        <p style={{ color: 'var(--text-light)' }}>
          児童ごとの支援記録（support_records）を期間指定で表示します。
        </p>
      </header>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="mb-4" style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
          検索条件
        </h2>
        <div className="responsive-flex" style={{ marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label className="label">事業所</label>
            <select
              className="input-field"
              value={facilityId}
              onChange={async (e) => {
                const id = Number(e.target.value);
                setFacilityId(id);
                setSelectedRecordKey(null);
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
            <label className="label">児童</label>
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
                setSelectedRecordKey(null);
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
          <button type="button" className="btn btn-primary" onClick={handleSearch} disabled={isLoading}>
            <Search size={18} /> 一覧を取得
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4" style={{ marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem' }}>記録一覧</h2>
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
                  <th style={{ width: '7rem' }}>支援日</th>
                  <th>記録内容</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => {
                  const key = getSupportRecordKey(rec, childId);
                  return (
                  <tr
                    key={key}
                    className={selectedRecordKey === key ? 'selected' : ''}
                    onClick={() => setSelectedRecordKey(key)}
                  >
                    <td>{formatRecordDate(rec.target_date)}</td>
                    <td>
                      <div className="record-preview">{rec.content || ''}</div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ margin: 0 }}>記録の詳細</h3>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem' }}
              onClick={() => setSelectedRecordKey(null)}
            >
              閉じる
            </button>
          </div>
          <dl className="record-detail-dl">
            <dt>支援日</dt>
            <dd>{formatRecordDate(selected.target_date)}</dd>
            <dt>児童ID</dt>
            <dd>{selected.child_id ?? childId ?? '—'}</dd>
            <dt>児童</dt>
            <dd>{childName}さん</dd>
            <dt>記録内容</dt>
            <dd className="record-detail-content">{selected.content || ''}</dd>
          </dl>
        </div>
      )}
    </div>
  );
};

export default PersonalRecordPage;
