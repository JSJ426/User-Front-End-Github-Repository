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
  school_id: number;         // ✅ 필수 (백엔드 NotNull)
  username: string;          // -> email
  pw: string;                // -> password
  name: string;
  phone: string;
  grade: number;
  class_no: number;          // -> classNo
  allergy_codes: number[];   // -> allergyCodes
}) {
  // ✅ 백엔드 DTO가 요구하는 키로 변환
  const body = {
    schoolId: payload.school_id, // ✅ 핵심: null이면 백에서 Validation 실패
    email: payload.username,
    password: payload.pw,
    name: payload.name,
    phone: payload.phone,
    grade: payload.grade,
    classNo: payload.class_no,
    allergyCodes: Array.isArray(payload.allergy_codes) ? payload.allergy_codes : [],
  };

  // ✅ 안전장치: schoolId 없으면 프론트에서 즉시 중단
  if (!body.schoolId || !Number.isFinite(Number(body.schoolId))) {
    throw new Error("학교를 검색해서 목록에서 선택해주세요. (schoolId가 비어있음)");
  }

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
   - 환경마다 경로가 달라서 "있는 것"을 맞출 때까지 순차 시도
   ====================== */
export async function findId(payload: { name: string; phone: string }) {
  const body = {
    name: payload.name,
    phone: payload.phone,
  };

  // ✅ 백엔드(NutriAssistant-Back) 기준 실제 엔드포인트
  // - 학생:   POST /api/auth/student/find-id
  // - 영양사: POST /api/auth/dietitian/find-id
  // (기존 화면/컴포넌트 수정 없이 auth.ts만 고치기 위해 순차 시도 유지)
  const tries = [
    "/api/auth/student/find-id",
    "/api/auth/dietitian/find-id",

    // 아래는 환경/버전 차이 대비용 fallback
    "/api/student/find-id",
    "/api/auth/find-id/student",
    "/api/student/find-id/student",
    "/api/auth/find-id",
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

  // ✅ 백엔드(NutriAssistant-Back) 실제 엔드포인트 우선
  // - 학생:   POST /api/auth/student/find-pw
  // - 영양사: POST /api/auth/dietitian/find-pw
  // 환경/버전 차이를 고려해 fallback도 같이 둠
  const tries = [
    "/api/auth/student/find-pw",
    "/api/auth/dietitian/find-pw",

    // fallback 후보들(구버전/환경차)
    "/api/student/find-pw",
    "/api/dietitian/find-pw",
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

/* ======================
   ✅ FindPasswordPage.tsx 호환용 export
   - “export named” 문제 방지용으로 const로도 제공
   ====================== */
export const findStudentTempPassword = findPassword;

/* ======================
   ✅ ProfileEdit.tsx 호환: 학생 회원탈퇴
   - 백엔드 실제 경로 우선: POST /api/student/me/withdraw  { password }
   - (환경마다 다를 수 있어 fallback도 같이 둠)
   ====================== */
export async function withdrawStudentAccount(payload: { pw: string }) {
  // 백엔드 DTO가 password 를 받는 케이스가 많음
  const body1 = { password: payload.pw };
  const body2 = { pw: payload.pw }; // fallback용

  const tries: Array<{ method: "POST" | "DELETE"; url: string; body: any }> = [
    // ✅ 가장 우선(백엔드 실제 매핑)
    { method: "POST", url: "/api/student/me/withdraw", body: body1 },

    // fallback 후보들
    { method: "POST", url: "/api/student/withdraw", body: body2 },
    { method: "POST", url: "/api/student/withdrawal", body: body2 },
    { method: "POST", url: "/api/student/delete", body: body2 },
    { method: "DELETE", url: "/api/auth/withdraw/student", body: body2 },
    { method: "POST", url: "/api/auth/withdraw/student", body: body2 },
    { method: "POST", url: "/api/auth/withdrawal/student", body: body2 },
    { method: "POST", url: "/api/auth/withdraw", body: body2 },
    { method: "POST", url: "/api/auth/withdrawal", body: body2 },
  ];

  let lastErr: unknown = null;

  for (const t of tries) {
    try {
      const res = await requestJson<any>(t.method, t.url, {
        headers: { "API-KEY": API_KEY, "api-key": API_KEY },
        body: t.body,
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
