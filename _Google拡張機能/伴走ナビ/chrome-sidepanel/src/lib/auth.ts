import { fetchJson } from './api';
import { getApiBase } from './aiConfig';
import {
  clearAuth,
  getAuthUser,
  getToken,
  isAuthenticated,
  saveAuth,
  type AuthUser,
} from './authStorage';

export type { AuthUser } from './authStorage';
export { clearAuth, getAuthUser, getToken, isAuthenticated };

export type AuthSession = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};

export async function login(email: string, password: string): Promise<AuthSession> {
  const session = await fetchJson<AuthSession>(`${getApiBase()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  saveAuth(session.access_token, session.user);
  return session;
}

export async function fetchMe(): Promise<AuthUser> {
  const data = await fetchJson<{ user: AuthUser }>(`${getApiBase()}/auth/me`);
  const token = getToken();
  if (token) {
    saveAuth(token, data.user);
  }
  return data.user;
}
