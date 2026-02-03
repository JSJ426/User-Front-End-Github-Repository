// src/api/auth.ts
import { API_KEY, clearAccessToken, requestJson, setAccessToken } from './http';

export type LoginResponseBody = {
  status: string;
  message: string;
  userId?: string | number;
};

export async function login(payload: { id: string; pw: string }) {
  // Need the response headers to read Authorization: Bearer <token>
  const { data, response } = await requestJson('POST', '/api/auth/login', {
    body: payload,
    returnResponse: true,
  });

  const authHeader = response.headers.get('Authorization') || response.headers.get('authorization');
  if (authHeader) {
    // Expected: "Bearer JWT_ACCESS_TOKEN"
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token) setAccessToken(token);
  }

  return data as LoginResponseBody;
}

export type SignupResponseBody = {
  status: string;
  message: string;
};

export async function signup(payload: { id: string; pw: string; name: string }) {
  // Spec: requires API-KEY header
  return (await requestJson('POST', '/api/auth/signup', {
    headers: { 'API-KEY': API_KEY },
    body: payload,
  })) as SignupResponseBody;
}

export async function logout() {
  try {
    await requestJson('POST', '/api/auth/logout');
  } finally {
    clearAccessToken();
  }
}
