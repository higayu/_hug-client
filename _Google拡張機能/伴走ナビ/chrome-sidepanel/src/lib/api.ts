import { getToken } from './authStorage';
import { getApiBase } from './aiConfig';
import { MOCK_FACILITIES, type Facility } from './mockData';

type ApiFetchResponse = {
  ok: boolean;
  status?: number;
  body?: unknown;
  error?: string;
  url?: string;
};

export function formatFetchError(response: ApiFetchResponse & { url?: string }): string {
  const status = response?.status;
  const body = response?.body;
  const url = response?.url || '';
  let bodyMsg =
    typeof body === 'object' && body !== null
      ? (body as { message?: string; error?: string; sqlMessage?: string }).message ||
        (body as { error?: string }).error ||
        (body as { sqlMessage?: string }).sqlMessage
      : typeof body === 'string'
        ? body
        : '';
  if (bodyMsg && bodyMsg.includes('<') && bodyMsg.includes('>')) {
    const plain = bodyMsg.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    bodyMsg = plain || bodyMsg;
  }
  const msg = response?.error || bodyMsg || `HTTP ${status}`;

  if (/not allowed by cors/i.test(msg)) {
    return (
      'APIサーバーが Chrome 拡張機能からのリクエストを拒否しました (CORS)。\n' +
      'Laravel backend の CorsMiddleware で chrome-extension:// を許可しているか確認してください。'
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

function withAuthHeaders(options: RequestInit = {}): RequestInit {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return { ...options, headers };
}

export async function fetchJson<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const requestOptions = withAuthHeaders(options);

  if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
    const response = (await chrome.runtime.sendMessage({
      type: 'api-fetch',
      url,
      options: requestOptions,
    })) as ApiFetchResponse;
    if (!response?.ok) {
      throw new Error(formatFetchError({ ...response, url }));
    }
    return response.body as T;
  }

  const res = await fetch(url, requestOptions);
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    throw new Error(
      formatFetchError({
        ok: false,
        status: res.status,
        error: (body as { error?: string })?.error,
        body,
        url,
      }),
    );
  }
  return res.json() as Promise<T>;
}

export async function loadFacilities(): Promise<Facility[]> {
  try {
    const data = await fetchJson<Facility[]>(`${getApiBase()}/facilities`);
    console.log('[loadFacilities] APIから取得した事業所データ:', data);
    return data;
  } catch (error) {
    console.warn('[loadFacilities] API取得に失敗したため、MOCK_FACILITIESを使用します:', error);
    return MOCK_FACILITIES;
  }
}
