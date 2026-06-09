import { apiClient } from './client';
import { getToken, saveAuth, type AuthUser } from '../lib/authStorage';

export type AuthSession = {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};

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
