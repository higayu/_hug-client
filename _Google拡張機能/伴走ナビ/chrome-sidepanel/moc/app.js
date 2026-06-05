/* 伴走ナビ - 静的HTMLモック (React App.tsx + pages の移植) */

const API_BASE =
  window.AI_CONFIG?.API_BASE ||
  'http://127.0.0.1:8000/api';

const CORRECTION_SYSTEM_PROMPT =
  'あなたは児童支援記録の校正アシスタントです。入力された記録を【S】【O】【A】【P】形式（状況・観察・評価・計画）で整理・校正し、日本語で出力してください。';

const CHAT_SYSTEM_PROMPT =
  'あなたは児童支援記録の分析アシスタントです。提供された支援記録をもとに、職員の質問に丁寧に答えてください。';

function getAiSettings() {
  const cfg = window.AI_CONFIG || {};
  const provider = String(cfg.AI_PROVIDER || 'ollama').toLowerCase();
  const defaultModel = cfg.AI_MODEL || 'jp-assistant:latest';
  const model =
    provider === 'ollama'
      ? cfg.OLLAMA_MODEL || defaultModel
      : cfg.GEMINI_MODEL || defaultModel || 'gemini-2.0-flash';
  return {
    provider,
    model,
    ollamaBaseUrl: (cfg.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, ''),
    geminiApiKey: cfg.GEMINI_API_KEY || '',
  };
}

async function callOllama(messages, model, baseUrl) {
  const data = await fetchJson(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: false }),
  });
  const text = data?.message?.content;
  if (!text) throw new Error('Ollama からの応答が空です');
  return text;
}

async function callGemini(messages, model, apiKey) {
  if (!apiKey) throw new Error('GEMINI_API_KEY が設定されていません（ai-config.js を確認）');

  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemMsg = messages.find((m) => m.role === 'system');
  if (systemMsg && contents.length > 0) {
    contents[0].parts[0].text = `${systemMsg.content}\n\n${contents[0].parts[0].text}`;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const data = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini からの応答が空です');
  return text;
}

async function callAi(messages) {
  const { provider, model, ollamaBaseUrl, geminiApiKey } = getAiSettings();
  console.log(`[AI] provider=${provider}, model=${model}`);

  if (provider === 'gemini') {
    return callGemini(messages, model, geminiApiKey);
  }
  return callOllama(messages, model, ollamaBaseUrl);
}

function buildCorrectionMessages(correction) {
  const userParts = [`【原文】\n${correction.originalText}`];
  if (correction.additionalPrompt.trim()) {
    userParts.push(`【追加指示】\n${correction.additionalPrompt}`);
  }
  return [
    { role: 'system', content: CORRECTION_SYSTEM_PROMPT },
    { role: 'user', content: userParts.join('\n\n') },
  ];
}

function buildChatMessages(chat) {
  const childName = getChildName(chat.facilityId, chat.childId);
  const recordsText =
    chat.records.length > 0
      ? chat.records
          .map((r) => {
            const dateStr = r.target_date ? r.target_date.split('T')[0] : '不明';
            return `- ${dateStr}: ${r.content}`;
          })
          .join('\n')
      : '（記録なし）';

  const systemContent = `${CHAT_SYSTEM_PROMPT}\n\n児童名: ${childName}さん\n期間: ${chat.startDate} 〜 ${chat.endDate}\n\n【支援記録】\n${recordsText}`;

  const messages = [{ role: 'system', content: systemContent }];
  chat.messages.forEach((msg) => {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    });
  });
  return messages;
}

const MOCK_FACILITIES = [
  { facility_id: 1, name: '吉島事業所' },
  { facility_id: 2, name: 'ひまわり教室' },
];

const MOCK_CHILDREN = {
  1: [
    { child_id: 1, name: '山田 太郎' },
    { child_id: 2, name: '佐藤 花子' },
  ],
  2: [{ child_id: 3, name: '鈴木 一郎' }],
};

/** 施設・児童・取得期間（index.html 各画面の選択値） */
const PREFS_STORAGE_KEY = 'hug_bansou_navi_moc_selection';

const MOCK_RECORDS = [
  {
    record_id: 101,
    target_date: '2026-05-01T00:00:00.000Z',
    content: '公園で遊び、笑顔が多かった。',
  },
  {
    record_id: 102,
    target_date: '2026-05-02T00:00:00.000Z',
    content: '新しい職員に少し緊張した様子。',
  },
  {
    record_id: 103,
    target_date: '2026-05-03T00:00:00.000Z',
    content: '工作活動に積極的に参加。',
  },
];

const state = {
  route: '/chat',
  mobileMenuOpen: false,
  facilities: [],
  childrenByFacility: {},
  correction: {
    activeTab: 'simple',
    modalOpen: false,
    targetDate: new Date().toISOString().split('T')[0],
    facilityId: '',
    childId: '',
    originalText: '今日は公園で遊んだ。少し疲れた様子だった。',
    correctedText: '',
    additionalPrompt: '',
    isLoading: false,
    expanded: { original: true, systemPrompt: true, additionalPrompt: true, corrected: true },
  },
  chat: {
    step: 'selection',
    facilityId: '',
    childId: '',
    startDate: '',
    endDate: '',
    records: [],
    messages: [],
    inputValue: '',
    isLoading: false,
  },
  personalRecord: {
    facilityId: '',
    childId: '',
    startDate: '',
    endDate: '',
    records: [],
    selectedRecordId: null,
    isLoading: false,
    hasSearched: false,
  },
  hugPersonalRecord: {
    facilityId: '',
    childId: '',
    startDate: '',
    endDate: '',
    records: [],
    isLoading: false,
    hasSearched: false,
    statusMessage: '',
  },
};

function getFormattedDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function initDates() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  state.chat.endDate = getFormattedDate(end);
  state.chat.startDate = getFormattedDate(start);
  state.personalRecord.endDate = state.chat.endDate;
  state.personalRecord.startDate = state.chat.startDate;
  state.hugPersonalRecord.endDate = state.chat.endDate;
  state.hugPersonalRecord.startDate = state.chat.startDate;
}

function getStateSectionByFacilitySelect(facilitySelectId) {
  const map = {
    'correction-facility': state.correction,
    'chat-facility': state.chat,
    'pr-facility': state.personalRecord,
    'hpr-facility': state.hugPersonalRecord,
  };
  return map[facilitySelectId] || null;
}

function applySavedNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function applySavedString(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const s = String(value).trim();
  return s || null;
}

function loadPrefsFromStorage() {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) {
      return;
    }
    const prefs = JSON.parse(raw);

    const c = prefs.correction;
    if (c) {
      const fid = applySavedNumber(c.facilityId);
      const cid = applySavedNumber(c.childId);
      const td = applySavedString(c.targetDate);
      if (fid) state.correction.facilityId = fid;
      if (cid) state.correction.childId = cid;
      if (td) state.correction.targetDate = td;
    }

    const applyPeriodSection = (section, saved) => {
      if (!saved) return;
      const fid = applySavedNumber(saved.facilityId);
      const cid = applySavedNumber(saved.childId);
      const start = applySavedString(saved.startDate);
      const end = applySavedString(saved.endDate);
      if (fid) section.facilityId = fid;
      if (cid) section.childId = cid;
      if (start) section.startDate = start;
      if (end) section.endDate = end;
    };

    applyPeriodSection(state.chat, prefs.chat);
    applyPeriodSection(state.personalRecord, prefs.personalRecord);
    applyPeriodSection(state.hugPersonalRecord, prefs.hugPersonalRecord);
  } catch (error) {
    console.warn('[prefs] localStorage の読み込みに失敗:', error);
  }
}

function savePrefsToStorage() {
  try {
    const payload = {
      v: 1,
      correction: {
        facilityId: state.correction.facilityId,
        childId: state.correction.childId,
        targetDate: state.correction.targetDate,
      },
      chat: {
        facilityId: state.chat.facilityId,
        childId: state.chat.childId,
        startDate: state.chat.startDate,
        endDate: state.chat.endDate,
      },
      personalRecord: {
        facilityId: state.personalRecord.facilityId,
        childId: state.personalRecord.childId,
        startDate: state.personalRecord.startDate,
        endDate: state.personalRecord.endDate,
      },
      hugPersonalRecord: {
        facilityId: state.hugPersonalRecord.facilityId,
        childId: state.hugPersonalRecord.childId,
        startDate: state.hugPersonalRecord.startDate,
        endDate: state.hugPersonalRecord.endDate,
      },
    };
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[prefs] localStorage の保存に失敗:', error);
  }
}

function ensureFacilityIdsFromList() {
  if (state.facilities.length === 0) {
    return;
  }
  const defaultFid = state.facilities[0].facility_id;
  const isValidFid = (fid) => state.facilities.some((f) => f.facility_id === fid);

  for (const section of [
    state.correction,
    state.chat,
    state.personalRecord,
    state.hugPersonalRecord,
  ]) {
    if (!section.facilityId || !isValidFid(section.facilityId)) {
      section.facilityId = defaultFid;
    }
  }
}

function formatFetchError(response) {
  const status = response?.status;
  const body = response?.body;
  const url = response?.url || '';
  let bodyMsg =
    typeof body === 'object' && body !== null
      ? body.message || body.error || body.sqlMessage
      : typeof body === 'string'
        ? body
        : '';
  if (bodyMsg.includes('<') && bodyMsg.includes('>')) {
    const plain = bodyMsg.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    bodyMsg = plain || bodyMsg;
  }
  const msg = response?.error || bodyMsg || `HTTP ${status}`;

  if (/not allowed by cors/i.test(msg)) {
    return (
      'APIサーバーが Chrome 拡張機能からのリクエストを拒否しました (CORS)。\n' +
      '192.168.1.229 の node-db-api/index.js で chrome-extension:// を許可してください。'
    );
  }
  if (status === 403 && /11434|ollama/i.test(msg + url)) {
    return (
      'Ollama がリクエストを拒否しました (403)。\n' +
      'タスクバーの Ollama を終了し、環境変数 OLLAMA_ORIGINS=* を設定してから再起動してください。'
    );
  }
  if (status === 403) {
    return `アクセスが拒否されました (403): ${msg}`;
  }
  return msg;
}

async function fetchJson(url, options = {}) {
  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    const response = await chrome.runtime.sendMessage({ type: 'api-fetch', url, options });
    if (!response?.ok) {
      throw new Error(formatFetchError({ ...response, url }));
    }
    return response.body;
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    throw new Error(formatFetchError({ status: res.status, error: body?.error, body, url }));
  }
  return res.json();
}

async function loadFacilities() {
  try {
    const data = await fetchJson(`${API_BASE}/facilities`);
    console.log('[loadFacilities] APIから取得した事業所データ:', data );
    state.facilities = data;
  } catch (error) {
    console.warn('[loadFacilities] API取得に失敗したため、MOCK_FACILITIESを使用します:', error);
    state.facilities = MOCK_FACILITIES;
  }
  ensureFacilityIdsFromList();
}

function getFacilityIdFromSelect(facilitySelectId) {
  const value = document.getElementById(facilitySelectId)?.value;
  if (!value) return null;
  const facilityId = Number(value);
  return Number.isFinite(facilityId) ? facilityId : null;
}

const CHILD_FETCH_STATUS_IDS = {
  'correction-facility': 'correction-child-status',
  'chat-facility': 'chat-child-status',
  'pr-facility': 'pr-child-status',
  'hpr-facility': 'hpr-child-status',
};

function setChildrenFetchLoading(facilitySelectId, isLoading) {
  const statusId = CHILD_FETCH_STATUS_IDS[facilitySelectId];
  const childSelectId = facilitySelectId.replace('-facility', '-child');
  const statusEl = statusId ? document.getElementById(statusId) : null;
  const selectEl = document.getElementById(childSelectId);

  if (statusEl) {
    statusEl.classList.toggle('hidden', !isLoading);
  }
  if (selectEl) {
    selectEl.disabled = isLoading;
  }
}

function getChildListFetchParams(facilitySelectId, facilityId) {
  const today = getFormattedDate(new Date());

  switch (facilitySelectId) {
    case 'correction-facility': {
      const d = state.correction.targetDate || today;
      return { facilityId, date: d, dateEnd: d };
    }
    case 'chat-facility':
      return {
        facilityId,
        date: state.chat.startDate || today,
        dateEnd: state.chat.endDate || today,
      };
    case 'pr-facility':
      return {
        facilityId,
        date: state.personalRecord.startDate || today,
        dateEnd: state.personalRecord.endDate || today,
      };
    case 'hpr-facility':
      return {
        facilityId,
        date: state.hugPersonalRecord.startDate || today,
        dateEnd: state.hugPersonalRecord.endDate || today,
      };
    default:
      return { facilityId, date: today, dateEnd: today };
  }
}

async function loadChildren(facilitySelectId) {
  const section = getStateSectionByFacilitySelect(facilitySelectId);
  const facilityId =
    getFacilityIdFromSelect(facilitySelectId) ||
    (section?.facilityId && Number(section.facilityId) > 0 ? Number(section.facilityId) : null);

  if (!facilityId) {
    console.warn('[loadChildren] 施設が未選択:', facilitySelectId);
    return;
  }

  if (section) {
    section.facilityId = facilityId;
  }

  setChildrenFetchLoading(facilitySelectId, true);

  try {
    const fetchParams = getChildListFetchParams(facilitySelectId, facilityId);
    const data = await window.HugWm.fetchChildrenFromHugWm(fetchParams);
    state.childrenByFacility[facilityId] = data;
    console.log('[loadChildren] HUG WMから取得:', facilitySelectId, fetchParams, data);
  } catch (error) {
    console.warn('[loadChildren] HUG取得に失敗したため、MOCK_CHILDRENを使用します:', error);
    state.childrenByFacility[facilityId] = MOCK_CHILDREN[facilityId] || [];
  } finally {
    setChildrenFetchLoading(facilitySelectId, false);
  }

  const list = state.childrenByFacility[facilityId] || [];
  if (section && list.length > 0) {
    if (!section.childId || !list.find((c) => c.child_id === section.childId)) {
      section.childId = list[0].child_id;
    }
  }

  savePrefsToStorage();
}

function getChildrenList(facilityId) {
  return state.childrenByFacility[facilityId] || [];
}

function getFacilityName(id) {
  return state.facilities.find((f) => f.facility_id === id)?.name || '';
}

function getChildName(facilityId, childId) {
  return getChildrenList(facilityId).find((c) => c.child_id === childId)?.name || '';
}

function formatRecordDate(targetDate) {
  if (!targetDate) return '—';
  return String(targetDate).split('T')[0];
}

function filterRecordsByDateRange(records, startDate, endDate) {
  return records.filter((r) => {
    const d = formatRecordDate(r.target_date);
    return d >= startDate && d <= endDate;
  });
}

function sortRecordsByDateDesc(records) {
  return [...records].sort((a, b) => {
    const da = formatRecordDate(a.target_date);
    const db = formatRecordDate(b.target_date);
    return db.localeCompare(da);
  });
}

function navigate(path) {
  state.route = path;
  state.mobileMenuOpen = false;
  window.location.hash = path;
  render();
}

function getRouteFromHash() {
  const hash = window.location.hash.slice(1) || '/chat';
  return hash.startsWith('/') ? hash : `/${hash}`;
}

function setMobileMenu(open) {
  state.mobileMenuOpen = open;
  const overlay = document.getElementById('mobile-overlay');
  const sidebar = document.getElementById('sidebar');
  overlay?.classList.toggle('visible', open);
  sidebar?.classList.toggle('open', open);
}

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

function renderShell() {
  const isLogin = state.route === '/login';
  document.getElementById('mobile-header')?.classList.toggle('hidden', isLogin);
  document.getElementById('sidebar-wrap')?.classList.toggle('hidden', isLogin);
  document.getElementById('mobile-overlay')?.classList.toggle('hidden', isLogin);
  const main = document.getElementById('main-content');
  if (main) main.classList.toggle('login-layout', isLogin);

  document.querySelectorAll('.nav-link').forEach((el) => {
    el.classList.toggle('active', el.dataset.route === state.route);
  });

  document.querySelectorAll('.page').forEach((el) => {
    el.classList.toggle('active', el.id === `page-${state.route.slice(1)}`);
  });

  setMobileMenu(state.mobileMenuOpen);
}

function fillSelect(selectId, items, valueKey, labelKey, selectedId) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = items
    .map(
      (item) =>
        `<option value="${item[valueKey]}" ${item[valueKey] === selectedId ? 'selected' : ''}>${item[labelKey]}</option>`
    )
    .join('');
}

function renderCorrection() {
  const c = state.correction;
  fillSelect('correction-facility', state.facilities, 'facility_id', 'name', c.facilityId);
  fillSelect('correction-child', getChildrenList(c.facilityId), 'child_id', 'name', c.childId);

  const dateEl = document.getElementById('correction-date');
  if (dateEl) dateEl.value = c.targetDate;

  const origEl = document.getElementById('correction-original');
  if (origEl) origEl.value = c.originalText;

  const addEl = document.getElementById('correction-additional');
  if (addEl) addEl.value = c.additionalPrompt;

  document.getElementById('correction-simple-panel')?.classList.toggle('hidden', c.activeTab !== 'simple');
  document.getElementById('correction-advanced-panel')?.classList.toggle('hidden', c.activeTab !== 'advanced');

  document.getElementById('tab-simple')?.classList.toggle('active-simple', c.activeTab === 'simple');
  document.getElementById('tab-advanced')?.classList.toggle('active-advanced', c.activeTab === 'advanced');

  const modal = document.getElementById('correction-modal');
  modal?.classList.toggle('open', c.modalOpen);

  const correctedEl = document.getElementById('correction-corrected');
  if (correctedEl) correctedEl.value = c.correctedText;

  const modalOrig = document.getElementById('modal-original-text');
  if (modalOrig) modalOrig.textContent = c.originalText;

  const modalOrigTextarea = document.getElementById('modal-original-textarea');
  if (modalOrigTextarea) modalOrigTextarea.value = c.originalText;

  const modalAdd = document.getElementById('modal-additional-textarea');
  if (modalAdd) modalAdd.value = c.additionalPrompt;

  document.getElementById('modal-advanced-sections')?.classList.toggle('hidden', c.activeTab !== 'advanced');
  document.getElementById('modal-simple-original')?.classList.toggle('hidden', c.activeTab !== 'simple');
  document.getElementById('modal-advanced-clear')?.classList.toggle('hidden', c.activeTab !== 'advanced');

  ['original', 'systemPrompt', 'additionalPrompt', 'corrected'].forEach((sec) => {
    const content = document.getElementById(`collapse-${sec}`);
    if (content) content.classList.toggle('hidden', !c.expanded[sec]);
  });

  const correctBtn = document.getElementById('btn-correct');
  if (correctBtn) correctBtn.disabled = c.isLoading;
}

function renderChat() {
  const ch = state.chat;
  fillSelect('chat-facility', state.facilities, 'facility_id', 'name', ch.facilityId);
  fillSelect('chat-child', getChildrenList(ch.facilityId), 'child_id', 'name', ch.childId);

  const startEl = document.getElementById('chat-start-date');
  const endEl = document.getElementById('chat-end-date');
  if (startEl) startEl.value = ch.startDate;
  if (endEl) endEl.value = ch.endDate;

  document.getElementById('chat-selection')?.classList.toggle('hidden', ch.step !== 'selection');
  document.getElementById('chat-room')?.classList.toggle('hidden', ch.step !== 'chat');

  const title = document.getElementById('chat-room-title');
  if (title) {
    title.textContent = `💬 ${getFacilityName(ch.facilityId)}：${getChildName(ch.facilityId, ch.childId)}さん`;
  }

  const area = document.getElementById('chat-messages');
  if (area) {
    area.innerHTML = '';
    ch.messages.forEach((msg) => {
      const isUser = msg.sender === 'user';
      const row = document.createElement('div');
      row.className = `chat-message ${isUser ? 'user' : 'ai'}`;
      if (!isUser) {
        const av = document.createElement('div');
        av.className = 'msg-avatar ai';
        av.innerHTML = '<i data-lucide="bot"></i>';
        row.appendChild(av);
      }
      const bubble = document.createElement('div');
      bubble.className = `msg-bubble ${isUser ? 'user' : 'ai'}`;
      bubble.textContent = msg.text;
      row.appendChild(bubble);
      if (isUser) {
        const av = document.createElement('div');
        av.className = 'msg-avatar user';
        av.innerHTML = '<i data-lucide="user"></i>';
        row.appendChild(av);
      }
      area.appendChild(row);
    });
    area.scrollTop = area.scrollHeight;
  }

  const input = document.getElementById('chat-input');
  if (input) {
    input.value = ch.inputValue;
    input.disabled = ch.isLoading;
  }

  const sendBtn = document.getElementById('btn-chat-send');
  if (sendBtn) sendBtn.disabled = ch.isLoading;
}

function renderPersonalRecordDetail(pr) {
  const selected = pr.records.find((r) => r.record_id === pr.selectedRecordId);
  const detailCard = document.getElementById('pr-detail-card');
  if (!detailCard) return;

  if (!selected) {
    detailCard.classList.add('hidden');
    return;
  }

  detailCard.classList.remove('hidden');
  const idEl = document.getElementById('pr-detail-id');
  const dateEl = document.getElementById('pr-detail-date');
  const childEl = document.getElementById('pr-detail-child');
  const contentEl = document.getElementById('pr-detail-content');
  if (idEl) idEl.textContent = selected.record_id ?? '—';
  if (dateEl) dateEl.textContent = formatRecordDate(selected.target_date);
  if (childEl) {
    childEl.textContent = `${getChildName(pr.facilityId, pr.childId)}さん`;
  }
  if (contentEl) contentEl.textContent = selected.content || '';
}

function renderPersonalRecord() {
  const pr = state.personalRecord;
  fillSelect('pr-facility', state.facilities, 'facility_id', 'name', pr.facilityId);
  fillSelect('pr-child', getChildrenList(pr.facilityId), 'child_id', 'name', pr.childId);

  const startEl = document.getElementById('pr-start-date');
  const endEl = document.getElementById('pr-end-date');
  if (startEl) startEl.value = pr.startDate;
  if (endEl) endEl.value = pr.endDate;

  const searchBtn = document.getElementById('btn-pr-search');
  if (searchBtn) searchBtn.disabled = pr.isLoading;

  const badge = document.getElementById('pr-count-badge');
  if (badge) badge.textContent = `${pr.records.length}件`;

  const hint = document.getElementById('pr-status-hint');
  const tableWrap = document.getElementById('pr-table-wrap');
  const tbody = document.getElementById('pr-tbody');

  if (pr.isLoading) {
    if (hint) hint.textContent = '記録を読み込んでいます...';
    tableWrap?.classList.add('hidden');
  } else if (!pr.hasSearched) {
    if (hint) hint.textContent = '条件を指定して「一覧を取得」を押してください。';
    tableWrap?.classList.add('hidden');
  } else if (pr.records.length === 0) {
    if (hint) {
      hint.textContent = `指定条件の記録は見つかりませんでした（${pr.startDate} ～ ${pr.endDate}）。`;
    }
    tableWrap?.classList.add('hidden');
  } else {
    if (hint) {
      hint.textContent = `${getFacilityName(pr.facilityId)}：${getChildName(pr.facilityId, pr.childId)}さん（${pr.startDate} ～ ${pr.endDate}）`;
    }
    tableWrap?.classList.remove('hidden');
  }

  if (tbody) {
    tbody.innerHTML = '';
    pr.records.forEach((rec) => {
      const tr = document.createElement('tr');
      tr.dataset.recordId = String(rec.record_id ?? '');
      if (pr.selectedRecordId === rec.record_id) tr.classList.add('selected');

      const tdDate = document.createElement('td');
      tdDate.textContent = formatRecordDate(rec.target_date);

      const tdContent = document.createElement('td');
      const preview = document.createElement('div');
      preview.className = 'record-preview';
      preview.textContent = rec.content || '';
      tdContent.appendChild(preview);

      const tdId = document.createElement('td');
      tdId.textContent = rec.record_id != null ? String(rec.record_id) : '—';

      tr.append(tdDate, tdContent, tdId);
      tr.addEventListener('click', () => {
        pr.selectedRecordId = rec.record_id;
        renderPersonalRecord();
        refreshIcons();
      });
      tbody.appendChild(tr);
    });
  }

  renderPersonalRecordDetail(pr);
}

function renderHugPersonalRecord() {
  const hpr = state.hugPersonalRecord;
  fillSelect('hpr-facility', state.facilities, 'facility_id', 'name', hpr.facilityId);
  fillSelect('hpr-child', getChildrenList(hpr.facilityId), 'child_id', 'name', hpr.childId);

  const startEl = document.getElementById('hpr-start-date');
  const endEl = document.getElementById('hpr-end-date');
  if (startEl && startEl.value !== hpr.startDate) startEl.value = hpr.startDate;
  if (endEl && endEl.value !== hpr.endDate) endEl.value = hpr.endDate;

  const btn = document.getElementById('btn-hpr-fetch');
  if (btn) {
    btn.disabled = hpr.isLoading;
    btn.innerHTML = hpr.isLoading
      ? '<span>取得中…</span>'
      : '<i data-lucide="download"></i> HUGから取得';
  }

  const badge = document.getElementById('hpr-count-badge');
  if (badge) badge.textContent = `${hpr.records.length}件`;

  const hint = document.getElementById('hpr-status-hint');
  if (hint) {
    if (hpr.isLoading && hpr.statusMessage) {
      hint.textContent = hpr.statusMessage;
    } else if (hpr.isLoading) {
      hint.textContent = 'HUG WM からデータを取得しています…';
    } else if (hpr.hasSearched) {
      hint.textContent =
        hpr.records.length > 0
          ? '取得が完了しました。'
          : '該当する出席日の記録は見つかりませんでした。';
    } else {
      hint.textContent = '条件を指定して「HUGから取得」を押してください。';
    }
  }

  const wrap = document.getElementById('hpr-table-wrap');
  const tbody = document.getElementById('hpr-tbody');
  if (!wrap || !tbody) return;

  if (!hpr.hasSearched || hpr.records.length === 0) {
    wrap.classList.add('hidden');
    tbody.innerHTML = '';
    return;
  }

  wrap.classList.remove('hidden');
  tbody.innerHTML = '';
  hpr.records.forEach((row) => {
    const tr = document.createElement('tr');
    const noteCell = document.createElement('td');
    noteCell.textContent = row.note || '（取得できませんでした）';
    noteCell.style.whiteSpace = 'pre-wrap';
    tr.innerHTML = `<td>${escapeHtml(row.date)}</td><td>${escapeHtml(row.childName)}</td>`;
    tr.appendChild(noteCell);
    tbody.appendChild(tr);
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadHugPersonalRecords() {
  const hpr = state.hugPersonalRecord;
  if (!window.HugWm?.fetchHugPersonalRecordsFromWm) {
    alert('hug-wm.js が読み込まれていません。');
    return;
  }
  if (!hpr.childId) {
    alert('児童を選択してください');
    return;
  }
  if (!hpr.startDate || !hpr.endDate) {
    alert('取得期間を指定してください');
    return;
  }
  if (hpr.startDate > hpr.endDate) {
    alert('開始日は終了日以前にしてください');
    return;
  }

  hpr.isLoading = true;
  hpr.records = [];
  hpr.statusMessage = '';
  renderHugPersonalRecord();

  try {
    hpr.records = await window.HugWm.fetchHugPersonalRecordsFromWm({
      facilityId: Number(hpr.facilityId),
      date: hpr.startDate,
      dateEnd: hpr.endDate,
      childId: Number(hpr.childId),
      onProgress: (msg) => {
        hpr.statusMessage = msg;
        renderHugPersonalRecord();
      },
    });
    hpr.hasSearched = true;
  } catch (err) {
    console.error('[loadHugPersonalRecords]', err);
    alert(
      `HUGからの取得に失敗しました: ${err.message}\n\n` +
        '・伴走ナビ拡張機能から開いているか\n' +
        '・HUG WM にログイン済みか\n' +
        '・事業所・児童IDが HUG 上の f_id / id と一致しているか\nを確認してください。'
    );
    hpr.hasSearched = true;
    hpr.records = [];
  } finally {
    hpr.isLoading = false;
    hpr.statusMessage = '';
    renderHugPersonalRecord();
    refreshIcons();
  }
}

async function loadPersonalRecords() {
  const pr = state.personalRecord;
  if (!pr.childId) {
    alert('児童を選択してください');
    return;
  }
  if (!pr.startDate || !pr.endDate) {
    alert('取得期間を指定してください');
    return;
  }
  if (pr.startDate > pr.endDate) {
    alert('開始日は終了日以前にしてください');
    return;
  }

  pr.isLoading = true;
  pr.selectedRecordId = null;
  renderPersonalRecord();

  let records = [];
  try {
    const all = await fetchJson(
      `${API_BASE}/support_records/_search?pk=child_id&values=${pr.childId}`
    );
    records = filterRecordsByDateRange(all, pr.startDate, pr.endDate);
  } catch (err) {
    console.warn('[loadPersonalRecords] API取得に失敗、MOCKを使用:', err);
    records = filterRecordsByDateRange(MOCK_RECORDS, pr.startDate, pr.endDate);
  }

  pr.records = sortRecordsByDateDesc(records);
  pr.hasSearched = true;
  pr.isLoading = false;
  renderPersonalRecord();
  refreshIcons();
}

function render() {
  state.route = getRouteFromHash();
  if (state.route === '/' || state.route === '') {
    navigate('/chat');
    return;
  }
  renderShell();
  if (state.route === '/correction') renderCorrection();
  if (state.route === '/chat') renderChat();
  if (state.route === '/personal-record') renderPersonalRecord();
  if (state.route === '/hug-personal-record') renderHugPersonalRecord();
  refreshIcons();
}

async function startChat() {
  const ch = state.chat;
  const facilityName = getFacilityName(ch.facilityId);
  const childName = getChildName(ch.facilityId, ch.childId);

  let records = [];
  try {
    const all = await fetchJson(
      `${API_BASE}/support_records/_search?pk=child_id&values=${ch.childId}`
    );
    records = all.filter((r) => {
      const d = r.target_date ? r.target_date.split('T')[0] : '';
      return d >= ch.startDate && d <= ch.endDate;
    });
  } catch {
    records = MOCK_RECORDS;
  }

  let initialMessage = `${facilityName}：${childName}さんの支援記録データを取得しました（${records.length}件）。\n\n`;

  if (records.length > 0) {
    initialMessage += '【取得した記録のプレビュー】\n';
    records.slice(0, 5).forEach((r) => {
      const dateStr = r.target_date ? r.target_date.split('T')[0] : '不明';
      initialMessage += `・${dateStr}: ${r.content}\n`;
    });
    if (records.length > 5) initialMessage += '（他略）\n';
  } else {
    initialMessage += '※指定された期間の記録は見つかりませんでした。\n';
  }
  initialMessage += '\n記録の検索や要約作成が可能です。何をなさいますか？';

  ch.records = records;
  ch.messages = [{ id: '1', sender: 'ai', text: initialMessage }];
  ch.step = 'chat';
  render();
}

async function sendChatMessage() {
  const ch = state.chat;
  if (!ch.inputValue.trim() || ch.isLoading) return;

  ch.messages.push({ id: Date.now().toString(), sender: 'user', text: ch.inputValue });
  ch.inputValue = '';
  ch.isLoading = true;

  const apiMessages = buildChatMessages(ch);
  const loadingId = (Date.now() + 1).toString();
  ch.messages.push({ id: loadingId, sender: 'ai', text: '考え中...' });
  render();

  try {
    const reply = await callAi(apiMessages);
    const loadingMsg = ch.messages.find((m) => m.id === loadingId);
    if (loadingMsg) loadingMsg.text = reply;
  } catch (err) {
    console.error('[sendChatMessage]', err);
    const loadingMsg = ch.messages.find((m) => m.id === loadingId);
    if (loadingMsg) {
      loadingMsg.text = `AI応答の取得に失敗しました: ${err.message}\n\nOllama が起動しているか、ai-config.js の設定を確認してください。`;
    }
  } finally {
    ch.isLoading = false;
    render();
  }
}

async function handleCorrect() {
  const c = state.correction;
  if (!c.originalText.trim()) {
    alert('校正するテキストを入力してください');
    return;
  }

  const btn = document.getElementById('btn-correct');
  c.isLoading = true;
  if (btn) btn.disabled = true;
  renderCorrection();

  try {
    c.correctedText = await callAi(buildCorrectionMessages(c));
    c.modalOpen = true;
    renderCorrection();
    refreshIcons();
  } catch (err) {
    console.error('[handleCorrect]', err);
    alert(`AI校正に失敗しました: ${err.message}\n\nOllama が起動しているか、ai-config.js の設定を確認してください。`);
  } finally {
    c.isLoading = false;
    if (btn) btn.disabled = false;
    renderCorrection();
  }
}

function getRegisterContent(correction) {
  return (correction.correctedText.trim() || correction.originalText.trim());
}

async function handleRegister() {
  const c = state.correction;
  const facilityName = getFacilityName(c.facilityId);
  const childName = getChildName(c.facilityId, c.childId);
  const content = getRegisterContent(c);

  if (!content) {
    alert('登録する記録内容がありません。原文を入力するか、AI校正を行ってください。');
    return;
  }

  const contentSource = c.correctedText.trim() ? '校正後の記録' : '原文';

  if (
    !window.confirm(
      `【登録内容の確認】\n・事業所: ${facilityName}\n・児童: ${childName}\n・支援日: ${c.targetDate}\n・登録内容: ${contentSource}\n\nこの内容で記録を登録します。よろしいですか？`
    )
  ) {
    return;
  }

  try {
    await fetchJson(`${API_BASE}/support_records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_id: c.childId,
        user_id: 1,
        content,
        target_date: c.targetDate,
      }),
    });
    alert('DBへの登録が完了しました！');
    c.originalText = '';
    c.correctedText = '';
    c.modalOpen = false;
    renderCorrection();
  } catch (err) {
    console.error('[handleRegister]', err);
    alert(`登録に失敗しました: ${err.message}`);
  }
}

function bindEvents() {
  window.addEventListener('hashchange', render);

  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => setMobileMenu(true));
  document.getElementById('mobile-overlay')?.addEventListener('click', () => setMobileMenu(false));
  document.getElementById('sidebar-close')?.addEventListener('click', () => setMobileMenu(false));

  document.querySelectorAll('.nav-link').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(el.dataset.route);
    });
  });

  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    navigate('/correction');
  });

  document.getElementById('tab-simple')?.addEventListener('click', () => {
    state.correction.activeTab = 'simple';
    renderCorrection();
  });
  document.getElementById('tab-advanced')?.addEventListener('click', () => {
    state.correction.activeTab = 'advanced';
    renderCorrection();
  });

  document.getElementById('correction-facility')?.addEventListener('change', async (e) => {
    state.correction.facilityId = Number(e.target.value);
    await loadChildren('correction-facility');
    renderCorrection();
  });
  document.getElementById('correction-child')?.addEventListener('change', (e) => {
    state.correction.childId = Number(e.target.value);
    savePrefsToStorage();
  });
  document.getElementById('correction-date')?.addEventListener('change', async (e) => {
    state.correction.targetDate = e.target.value;
    await loadChildren('correction-facility');
    renderCorrection();
  });
  document.getElementById('correction-original')?.addEventListener('input', (e) => {
    state.correction.originalText = e.target.value;
  });
  document.getElementById('correction-additional')?.addEventListener('input', (e) => {
    state.correction.additionalPrompt = e.target.value;
  });

  document.getElementById('btn-correct')?.addEventListener('click', handleCorrect);
  document.getElementById('btn-register')?.addEventListener('click', handleRegister);

  document.getElementById('modal-close')?.addEventListener('click', () => {
    state.correction.modalOpen = false;
    renderCorrection();
  });
  document.getElementById('modal-cancel')?.addEventListener('click', () => {
    state.correction.modalOpen = false;
    renderCorrection();
  });
  document.getElementById('modal-apply')?.addEventListener('click', () => {
    state.correction.originalText = state.correction.correctedText;
    state.correction.modalOpen = false;
    renderCorrection();
  });
  document.getElementById('correction-corrected')?.addEventListener('input', (e) => {
    state.correction.correctedText = e.target.value;
  });
  document.getElementById('modal-original-textarea')?.addEventListener('input', (e) => {
    state.correction.originalText = e.target.value;
  });
  document.getElementById('modal-additional-textarea')?.addEventListener('input', (e) => {
    state.correction.additionalPrompt = e.target.value;
  });

  document.querySelectorAll('[data-collapse]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.collapse;
      state.correction.expanded[key] = !state.correction.expanded[key];
      renderCorrection();
      refreshIcons();
    });
  });

  document.getElementById('chat-facility')?.addEventListener('change', async (e) => {
    state.chat.facilityId = Number(e.target.value);
    await loadChildren('chat-facility');
    renderChat();
    refreshIcons();
  });
  document.getElementById('chat-child')?.addEventListener('change', (e) => {
    state.chat.childId = Number(e.target.value);
    savePrefsToStorage();
  });
  document.getElementById('chat-start-date')?.addEventListener('change', async (e) => {
    state.chat.startDate = e.target.value;
    await loadChildren('chat-facility');
    renderChat();
    refreshIcons();
  });
  document.getElementById('chat-end-date')?.addEventListener('change', async (e) => {
    state.chat.endDate = e.target.value;
    await loadChildren('chat-facility');
    renderChat();
    refreshIcons();
  });
  document.getElementById('btn-chat-start')?.addEventListener('click', startChat);
  document.getElementById('btn-chat-back')?.addEventListener('click', () => {
    state.chat.step = 'selection';
    render();
  });
  document.getElementById('btn-chat-send')?.addEventListener('click', sendChatMessage);
  document.getElementById('chat-input')?.addEventListener('input', (e) => {
    state.chat.inputValue = e.target.value;
  });
  document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });

  document.getElementById('pr-facility')?.addEventListener('change', async (e) => {
    state.personalRecord.facilityId = Number(e.target.value);
    await loadChildren('pr-facility');
    state.personalRecord.selectedRecordId = null;
    renderPersonalRecord();
    refreshIcons();
  });
  document.getElementById('pr-child')?.addEventListener('change', (e) => {
    state.personalRecord.childId = Number(e.target.value);
    state.personalRecord.selectedRecordId = null;
    savePrefsToStorage();
  });
  document.getElementById('pr-start-date')?.addEventListener('change', async (e) => {
    state.personalRecord.startDate = e.target.value;
    await loadChildren('pr-facility');
    renderPersonalRecord();
    refreshIcons();
  });
  document.getElementById('pr-end-date')?.addEventListener('change', async (e) => {
    state.personalRecord.endDate = e.target.value;
    await loadChildren('pr-facility');
    renderPersonalRecord();
    refreshIcons();
  });
  document.getElementById('btn-pr-search')?.addEventListener('click', loadPersonalRecords);
  document.getElementById('btn-pr-detail-close')?.addEventListener('click', () => {
    state.personalRecord.selectedRecordId = null;
    renderPersonalRecord();
  });

  document.getElementById('hpr-facility')?.addEventListener('change', async (e) => {
    state.hugPersonalRecord.facilityId = Number(e.target.value);
    await loadChildren('hpr-facility');
    renderHugPersonalRecord();
    refreshIcons();
  });
  document.getElementById('hpr-child')?.addEventListener('change', (e) => {
    state.hugPersonalRecord.childId = Number(e.target.value);
    savePrefsToStorage();
  });
  document.getElementById('hpr-start-date')?.addEventListener('change', async (e) => {
    state.hugPersonalRecord.startDate = e.target.value;
    await loadChildren('hpr-facility');
    renderHugPersonalRecord();
    refreshIcons();
  });
  document.getElementById('hpr-end-date')?.addEventListener('change', async (e) => {
    state.hugPersonalRecord.endDate = e.target.value;
    await loadChildren('hpr-facility');
    renderHugPersonalRecord();
    refreshIcons();
  });
  document.getElementById('btn-hpr-fetch')?.addEventListener('click', loadHugPersonalRecords);
}

async function loadAllChildrenLists() {
  await loadChildren('correction-facility');
  await loadChildren('chat-facility');
  await loadChildren('pr-facility');
  await loadChildren('hpr-facility');
}

async function init() {
  initDates();
  loadPrefsFromStorage();
  bindEvents();
  const ai = getAiSettings();
  console.log('[init] AI設定:', ai);
  console.log('[init] API_BASE:', API_BASE);
  console.log('[init] ai-config (window.AI_CONFIG):', window.AI_CONFIG);
  await loadFacilities();
  if (!window.location.hash) {
    window.location.hash = '#/chat';
  }
  render();
  if (state.facilities.length > 0) {
    await loadAllChildrenLists();
    render();
    refreshIcons();
  }
  savePrefsToStorage();
}

document.addEventListener('DOMContentLoaded', init);
