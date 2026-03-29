import { setAuthTokenGetter } from "@workspace/api-client-react";

const TOKEN_KEY = "avishu_auth_token";

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  setAuthTokenGetter(() => token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  setAuthTokenGetter(null);
}

export function initAuthToken(): void {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    setAuthTokenGetter(() => token);
  }
}
