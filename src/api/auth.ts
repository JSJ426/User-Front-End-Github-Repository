// src/api/auth.ts
import {
  API_KEY,
  clearAccessToken,
  requestJson,
  setAccessToken,
} from "./http";

/* ======================
   Types
   ====================== */

export type LoginPayload = {
  id: string; // UI에서 입력받는 아이디(이메일/학번 등). 백엔드엔 username으로 전달
  pw: string;
};

export type StudentSignupPayload = {
  email: string;
  password: string;
  name: string;
  phone: string;
  grade: number;
  classNo: number;
  allergyCodes: number[];
};

export type DietitianSignupPayload = {
  email: string;
  password: string;
  name: string;
  phone: string;
  // 필요시 schoolId 등 추가
  // schoolId?: number;
};

/* ======================
   Helpers
   ====================== */

function pickTokenFromResponse(data: any): string | null {
  // 백에서 토큰 키가 달라질 수 있어서 최대한 유연하게 처리
  return (
    data?.accessToken ??
    data?.access_token ??
    data?.token ??
    data?.jwt ??
    null
  );
}

/* ======================
   로그인 (학생/영양사)
   ====================== */

export async function loginStudent(payload: LoginPayload) {
  // ✅ 백엔드: POST /api/auth/login/student
  const { data } = await requestJson("POST", "/api/auth/login/student", {
    headers: {
      "API-KEY": API_KEY,
      "api-key": API_KEY,
    },
    body: {
      username: payload.id,
      pw: payload.pw,
    },
    skipAuth: true,
  });

  const token = pickTokenFromResponse(data);
  if (token) setAccessToken(token);

  return data;
}

export async function loginDietitian(payload: LoginPayload) {
  // ✅ 백엔드: POST /api/auth/login/dietitian
  const { data } = await requestJson("POST", "/api/auth/login/dietitian", {
    headers: {
      "API-KEY": API_KEY,
      "api-key": API_KEY,
    },
    body: {
      username: payload.id,
      pw: payload.pw,
    },
    skipAuth: true,
  });

  const token = pickTokenFromResponse(data);
  if (token) setAccessToken(token);

  return data;
}

/* ======================
   로그아웃
   ====================== */

export function logout() {
  clearAccessToken();

  // 프로젝트에서 로그인 관련 캐시를 여기서 같이 비우고 싶으면 추가
  // localStorage.removeItem("student_me_cache");
  // localStorage.removeItem("student_allergy_codes");
}

/* ======================
   회원가입 (학생/영양사)
   ====================== */

export async function signupStudent(payload: StudentSignupPayload) {
  // ✅ 백엔드: POST /api/auth/signup/student
  const { data } = await requestJson("POST", "/api/auth/signup/student", {
    headers: {
      "API-KEY": API_KEY,
      "api-key": API_KEY,
    },
    body: {
      email: payload.email,
      password: payload.password,
      name: payload.name,
      phone: payload.phone,
      grade: payload.grade,
      classNo: payload.classNo,
      allergyCodes: payload.allergyCodes,
    },
    skipAuth: true,
  });

  // 회원가입 시 토큰을 같이 내려주는 구조면 자동 저장
  const token = pickTokenFromResponse(data);
  if (token) setAccessToken(token);

  return data;
}

export async function signupDietitian(payload: DietitianSignupPayload) {
  // ✅ 백엔드: POST /api/auth/signup/dietitian
  const { data } = await requestJson("POST", "/api/auth/signup/dietitian", {
    headers: {
      "API-KEY": API_KEY,
      "api-key": API_KEY,
    },
    body: {
      email: payload.email,
      password: payload.password,
      name: payload.name,
      phone: payload.phone,
      // schoolId: payload.schoolId, // 백엔드가 요구하면 활성화
    },
    skipAuth: true,
  });

  const token = pickTokenFromResponse(data);
  if (token) setAccessToken(token);

  return data;
}
