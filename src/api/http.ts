// src/api/http.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const API_KEY = 'api_key';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export function getAccessToken() {
  return localStorage.getItem('access_token');
}

export function setAccessToken(token: string) {
  localStorage.setItem('access_token', token);
}

export function clearAccessToken() {
  localStorage.removeItem('access_token');
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export async function requestJson<T>(
  method: HttpMethod,
  path: string,
  options?: {
    body?: any;
    headers?: Record<string, string>;
    returnResponse?: boolean;
    skipAuth?: boolean; // ✅ 핵심
  }
): Promise<T>;
export async function requestJson(
  method: HttpMethod,
  path: string,
  options?: {
    body?: any;
    headers?: Record<string, string>;
    returnResponse?: boolean;
    skipAuth?: boolean;
  }
): Promise<any> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    // ✅ 백엔드에서 API-KEY를 요구하는 경우가 있어 기본으로 포함
    'API-KEY': API_KEY,
    'api-key': API_KEY,
    'Content-Type': 'application/json',
    ...(options?.headers ?? {}),
  };

  // ✅ 회원가입/로그인 요청이면 Authorization 절대 붙이지 않음
  if (!options?.skipAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && String((data as any).message)) ||
      (typeof data === 'string' && data.trim()
        ? data
        : `요청 실패 (HTTP ${res.status})`);

    throw new ApiError(message, res.status, data);
  }

  if (options?.returnResponse) {
    return { data, response: res };
  }

  return data;
}
