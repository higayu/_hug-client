export const PREFS_STORAGE_KEY = 'hug_bansou_navi_moc_selection';

export type PrefsSectionKey = 'correction' | 'chat' | 'personalRecord' | 'hugPersonalRecord';

export type CorrectionPrefs = {
  facilityId?: number;
  childId?: number;
  targetDate?: string;
};

export type PeriodPrefs = {
  facilityId?: number;
  childId?: number;
  startDate?: string;
  endDate?: string;
};

export type StoredPrefs = {
  v?: number;
  correction?: CorrectionPrefs;
  chat?: PeriodPrefs;
  personalRecord?: PeriodPrefs;
  hugPersonalRecord?: PeriodPrefs;
};

function applySavedNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function applySavedString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s || null;
}

export function loadPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredPrefs;
  } catch (error) {
    console.warn('[prefs] localStorage の読み込みに失敗:', error);
    return {};
  }
}

export function savePrefs(prefs: StoredPrefs) {
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({ v: 1, ...prefs }));
  } catch (error) {
    console.warn('[prefs] localStorage の保存に失敗:', error);
  }
}

type IdSelection = number | '';

export function applyCorrectionPrefs(
  prefs: CorrectionPrefs | undefined,
  defaults: { targetDate: string },
): { facilityId: IdSelection; childId: IdSelection; targetDate: string } {
  const fid = applySavedNumber(prefs?.facilityId);
  const cid = applySavedNumber(prefs?.childId);
  const td = applySavedString(prefs?.targetDate);
  return {
    facilityId: (fid ?? '') as IdSelection,
    childId: (cid ?? '') as IdSelection,
    targetDate: td ?? defaults.targetDate,
  };
}

export function applyPeriodPrefs(
  prefs: PeriodPrefs | undefined,
  defaults: { startDate: string; endDate: string },
): { facilityId: IdSelection; childId: IdSelection; startDate: string; endDate: string } {
  const fid = applySavedNumber(prefs?.facilityId);
  const cid = applySavedNumber(prefs?.childId);
  const start = applySavedString(prefs?.startDate);
  const end = applySavedString(prefs?.endDate);
  return {
    facilityId: (fid ?? '') as IdSelection,
    childId: (cid ?? '') as IdSelection,
    startDate: start ?? defaults.startDate,
    endDate: end ?? defaults.endDate,
  };
}

export function mergePrefs(current: StoredPrefs, section: PrefsSectionKey, value: unknown): StoredPrefs {
  return { ...current, [section]: value };
}
