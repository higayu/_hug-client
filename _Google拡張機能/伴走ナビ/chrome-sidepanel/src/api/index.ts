import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';
import { formatFetchError } from '../lib/api';
import { getApiBase } from '../lib/aiConfig';
import { getToken, saveAuth, getAuthUser, type AuthUser } from '../lib/authStorage';

type ApiFetchResponse = {
  ok: boolean;
  status?: number;
  body?: unknown;
  error?: string;
};

export type AuthSession = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};

function headersToRecord(headers: InternalAxiosRequestConfig['headers']): Record<string, string> {
  const result: Record<string, string> = {};
  if (headers == null) {
    return result;
  }

  const axiosHeaders = AxiosHeaders.from(headers);
  const raw =
    typeof axiosHeaders.toJSON === 'function'
      ? (axiosHeaders.toJSON() as Record<string, unknown>)
      : (headers as Record<string, unknown>);

  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined || value === null) {
      continue;
    }
    result[key] = Array.isArray(value) ? value.map(String).join(', ') : String(value);
  }

  return result;
}

const chromeExtensionAdapter: AxiosAdapter = async (config) => {
  const url = axios.getUri(config);
  const method = (config.method ?? 'get').toUpperCase();
  const headers = headersToRecord(config.headers);

  let body: string | undefined;
  if (config.data !== undefined && method !== 'GET' && method !== 'HEAD') {
    body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
  }

  const response = (await chrome.runtime!.sendMessage({
    type: 'api-fetch',
    url,
    options: { method, headers, body },
  })) as ApiFetchResponse;

  if (!response?.ok) {
    const message = formatFetchError({ ...response, url });
    throw new AxiosError(message, String(response?.status ?? ''), config, undefined, {
      data: response?.body,
      status: response?.status ?? 0,
      statusText: message,
      headers: {},
      config,
    });
  }

  return {
    data: response.body,
    status: response.status ?? 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {},
  };
};

const useChromeAdapter =
  typeof chrome !== 'undefined' && typeof chrome.runtime?.sendMessage === 'function';

export const apiClient = axios.create({
  baseURL: getApiBase(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  ...(useChromeAdapter ? { adapter: chromeExtensionAdapter } : {}),
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response && error.config) {
      const body = error.response.data;
      throw new Error(
        formatFetchError({
          ok: false,
          status: error.response.status,
          body,
          error: body?.message ?? body?.error ?? error.message,
          url: axios.getUri(error.config),
        }),
      );
    }

    throw new Error(error.message || 'リクエストに失敗しました。');
  },
);

export async function login(email: string, password: string): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthSession>('/auth/login', { email, password });
  saveAuth(data.access_token, data.user);
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me');
  const token = getToken();
  if (token) {
    saveAuth(token, data.user);
  }
  return data.user;
}

export type SupportRecordInput = {
  child_id: number;
  target_date: string;
  content: string;
};

export type SupportRecordBulkResult = {
  created: number;
  updated: number;
  total: number;
};

export async function saveSupportRecordsBulk(
  records: SupportRecordInput[],
): Promise<SupportRecordBulkResult> {
  const { data } = await apiClient.post<SupportRecordBulkResult>('/support_records/bulk', {
    records,
  });
  return data;
}

export async function saveSupportRecord(record: SupportRecordInput): Promise<void> {
  await apiClient.post('/support_records', {
    ...record,
    user_id: getAuthUser()?.user_id,
  });
}

export type { AuthUser } from '../lib/authStorage';
