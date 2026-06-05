export const AUTH_STORAGE_KEY = 'hug_bansou_navi_auth';

export type AuthUser = {
  user_id: number;
  name: string;
  email: string;
  role: string;
  facility_id: number;
  facility_name?: string;
};

type StoredAuth = {
  access_token: string;
  user: AuthUser;
};

export function getStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.access_token || !parsed?.user?.user_id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return getStoredAuth()?.access_token ?? null;
}

export function getAuthUser(): AuthUser | null {
  return getStoredAuth()?.user ?? null;
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function saveAuth(access_token: string, user: AuthUser): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ access_token, user }));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
