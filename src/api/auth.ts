// src/api/auth.ts
import {
  API_KEY,
  clearAccessToken,
  requestJson,
  setAccessToken,
} from "./http";

/**
 * ✅ 컴포넌트 수정 없이 동작하도록
 * - 기존 export: login, signup, logout, findId, findPassword 유지
 * - 백엔드 엔드포인트는 student 기준으로 맞춤
 */

/* ======================
   로그인
   ====================== */
export async function login(payload: { id: string; pw: string }) {
  const body = {
    username: payload.id,
    pw: payload.pw,
  };

  const { data, response } = await requestJson("POST", "/api/auth/login/student", {
    headers: {
      "API-KEY": API_KEY,
      "api-key": API_KEY,
    },
    body,
    returnResponse: true,
    skipAuth: true,
  });

  // 토큰 저장(헤더/바디 모두 대응)
  const authHeader =
    response.headers.get("Authorization") || response.headers.get("authorization");

  const tokenFromHeader = authHeader
    ? authHeader.replace(/^Bearer\s+/i, "").trim()
    : "";

  const tokenFromBody =
    (data as any)?.accessToken ||
    (data as any)?.token ||
    (data as any)?.jwt ||
    (data as any)?.access_token ||
    (data as any)?.data?.accessToken ||
    (data as any)?.data?.token ||
    "";

  const token = String(tokenFromHeader || tokenFromBody || "").trim();
  if (token) setAccessToken(token);

  // (선택) 캐시 유지
  try {
    localStorage.setItem("username", payload.id);
  } catch {}

  return data;
}

/* ======================
   회원가입 (학생)
   ====================== */
export async function signup(payload: {
  school_id: number;         // 필요 없으면 무시
  username: string;          // -> email
  pw: string;                // -> password
  name: string;
  phone: string;
  grade: number;
  class_no: number;          // -> classNo
  allergy_codes: number[];   // -> allergyCodes
}) {
  const body = {
    email: payload.username,
    password: payload.pw,
    name: payload.name,
    phone: payload.phone,
    grade: payload.grade,
    classNo: payload.class_no,
    allergyCodes: Array.isArray(payload.allergy_codes) ? payload.allergy_codes : [],
  };

  const data = await requestJson<any>("POST", "/api/auth/signup/student", {
    headers: {
      "API-KEY": API_KEY,
      "api-key": API_KEY,
    },
    body,
    skipAuth: true,
  });

  return data;
}

/* ======================
   아이디 찾기 (findId)
   - 백엔드가 /api/auth/find-id or /api/auth/find-id/student 둘 중 하나일 수 있어서
     둘 다 시도하는 fallback 포함
   ====================== */
export async function findId(payload: { name: string; phone: string }) {
  const body = {
    name: payload.name,
    phone: payload.phone,
  };

  // 1) 우선: /api/auth/find-id/student
  try {
    return await requestJson<any>("POST", "/api/auth/find-id/student", {
      headers: {
        "API-KEY": API_KEY,
        "api-key": API_KEY,
      },
      body,
      skipAuth: true,
    });
  } catch (e) {
    // 2) fallback: /api/auth/find-id
    return await requestJson<any>("POST", "/api/auth/find-id", {
      headers: {
        "API-KEY": API_KEY,
        "api-key": API_KEY,
      },
      body,
      skipAuth: true,
    });
  }
}

/* ======================
   비밀번호 찾기 (findPassword)
   - 백엔드가 /api/auth/find-pw, /find-password 등 변형이 많아서
     가장 흔한 경로들을 순서대로 시도
   ====================== */
export async function findPassword(payload: { email: string; name: string; phone: string }) {
  const body = {
    email: payload.email,
    name: payload.name,
    phone: payload.phone,
  };

  const tries = [
    "/api/auth/find-pw/student",
    "/api/auth/find-password/student",
    "/api/auth/find-pw",
    "/api/auth/find-password",
  ];

  let lastErr: unknown = null;
  for (const url of tries) {
    try {
      return await requestJson<any>("POST", url, {
        headers: {
          "API-KEY": API_KEY,
          "api-key": API_KEY,
        },
        body,
        skipAuth: true,
      });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/* ======================
   로그아웃
   ====================== */
export async function logout() {
  try {
    await requestJson("POST", "/api/auth/logout");
  } finally {
    clearAccessToken();
  }
}
// ✅ FindPasswordPage.tsx 호환용 export
export async function findStudentTempPassword(payload: {
  email: string;
  name: string;
  phone: string;
}) {
  // 내부적으로 기존 findPassword를 재사용
  return findPassword(payload);
}

// ✅ ProfileEdit.tsx 호환: 학생 회원탈퇴
export async function withdrawStudentAccount(payload: { pw: string }) {
  const body = { pw: payload.pw };

  // 백엔드가 어떤 경로를 쓰는지 케이스가 많아서 흔한 것들 순서대로 시도
  const tries = [
    "/api/student/withdraw",          // 학생 컨트롤러 기반
    "/api/student/withdrawal",
    "/api/student/delete",
    "/api/auth/withdraw/student",     // auth 하위로 분리된 케이스
    "/api/auth/withdrawal/student",
    "/api/auth/withdraw",             // 단일 엔드포인트 케이스
    "/api/auth/withdrawal",
  ];

  let lastErr: unknown = null;
  for (const url of tries) {
    try {
      const res = await requestJson<any>("POST", url, {
        headers: { "API-KEY": API_KEY, "api-key": API_KEY },
        body,
        // 탈퇴는 보통 인증 필요. requestJson이 자동으로 토큰 붙이면 skipAuth는 false(기본)
      });

      // 성공하면 토큰/캐시 정리
      try {
        clearAccessToken();
        localStorage.removeItem("student_me_cache");
        localStorage.removeItem("student_allergy_codes");
      } catch {}

      return res;
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr;
}
