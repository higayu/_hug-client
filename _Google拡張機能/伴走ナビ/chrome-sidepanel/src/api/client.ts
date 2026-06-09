import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';
import { formatFetchError } from './formatFetchError';
import { getApiBase } from './config';
import { getToken } from '../lib/authStorage';

type ApiFetchResponse = {
  ok: boolean;
  status?: number;
  body?: unknown;
  error?: string;
};

const DEBUG_API = true;

const debugApi = (...args: unknown[]) => {
  if (DEBUG_API) {
    console.log('[apiClient]', ...args);
  }
};

function headersToRecord(headers: InternalAxiosRequestConfig['headers']): Record<string, string> {
  const result: Record<string, string> = {};

  if (headers == null) {
    return result;
  }

  const axiosHeaders = AxiosHeaders.from(headers);
  const raw = axiosHeaders.toJSON() as Record<string, unknown>;

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
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!headers.Accept) {
    headers.Accept = 'application/json';
  }

  if (!headers['Content-Type'] && method !== 'GET' && method !== 'HEAD') {
    headers['Content-Type'] = 'application/json';
  }

  debugApi('chromeExtensionAdapter request:', { url, method, hasAuthorization: Boolean(headers.Authorization) });

  let body: string | undefined;

  if (config.data !== undefined && method !== 'GET' && method !== 'HEAD') {
    body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
  }

  const response = (await chrome.runtime!.sendMessage({
    type: 'api-fetch',
    url,
    options: { method, headers, body },
  })) as ApiFetchResponse;

  debugApi('chromeExtensionAdapter response:', {
    url,
    ok: response?.ok,
    status: response?.status,
    error: response?.error,
  });

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

debugApi('initialize:', { apiBase: getApiBase(), useChromeAdapter });

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
  const headers = AxiosHeaders.from(config.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  config.headers = headers;
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
