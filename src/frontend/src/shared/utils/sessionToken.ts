// Browser fingerprint — persistence across page reloads
const SESSION_TOKEN_KEY = 'wixi-session-token';

export function getSessionToken(): string {
  let token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    token = `${Date.now()}-${Math.random().toString(36).slice(2)}-${navigator.userAgent.length}`;
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
}
