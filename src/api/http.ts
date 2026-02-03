// src/api/http.ts
// Fetch wrapper for this project (no extra dependencies).
// - baseURL is controlled by VITE_API_BASE_URL
// - access token is stored in localStorage
// - refresh token is expected to be HttpOnly cookie (credentials: include)

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_KEY =
  (import.meta as any).env?.VITE_API_KEY || 'api_key';

const ACCESS_TOKEN_KEY = 'access_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export async function requestJson<T>(
  method: HttpMethod,
  path: string,
  options?: {
    body?: any;
    headers?: Record<string, string>;
    // Set to true if you want the raw Response too (e.g., to read headers)
    returnResponse?: boolean;
  }
): Promise<T>;
export async function requestJson(
  method: HttpMethod,
  path: string,
  options?: {
    body?: any;
    headers?: Record<string, string>;
    returnResponse?: boolean;
  }
): Promise<any> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // Try JSON first; fall back to text for non-JSON responses
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && String((data as any).message)) ||
      `요청 실패 (HTTP ${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  if (options?.returnResponse) return { data, response: res };
  return data;
}
