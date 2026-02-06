// src/api/auth.ts
import {
  API_KEY,
  clearAccessToken,
  requestJson,
  setAccessToken,
} from './http';

/* ======================
   로그인
   ====================== */
export async function login(payload: {
  id: string;
  pw: string;
}) {
  // ✅ 백엔드가 `username` 필드를 기대하는 경우가 많습니다.
  // (학생 회원가입에서도 username을 사용 중)
  // 프론트 입력(id)을 username으로 매핑해서 전송합니다.
  const body = {
    username: payload.id,
    pw: payload.pw,
  };

  const { data, response } = await requestJson('POST', '/api/auth/login', {
    headers: {
      'API-KEY': API_KEY,
      'api-key': API_KEY,
    },
    body,
    returnResponse: true,
    skipAuth: true, // ✅ 중요
  });

  // -------------------------------------------------------------------
  // ✅ 토큰 저장 로직 (백엔드 구현에 따라 헤더/바디 둘 다 대응)
  // 1) Authorization 헤더: "Bearer <token>"
  // 2) JSON 바디: accessToken / token / jwt / access_token 등
  // -------------------------------------------------------------------

  // 1) Authorization 헤더에서 토큰 추출
  const authHeader =
    response.headers.get('Authorization') ||
    response.headers.get('authorization');

  const tokenFromHeader = authHeader
    ? authHeader.replace(/^Bearer\s+/i, '').trim()
    : '';

  // 2) 바디에서 토큰 추출 (키 이름이 환경마다 다를 수 있어 폭넓게 대응)
  const tokenFromBody =
    (data && (data as any).accessToken) ||
    (data && (data as any).token) ||
    (data && (data as any).jwt) ||
    (data && (data as any).access_token) ||
    (data && (data as any).data?.accessToken) ||
    (data && (data as any).data?.token) ||
    '';

  const token = String(tokenFromHeader || tokenFromBody || '').trim();
  if (token) {
    setAccessToken(token);
  }

  // ✅ 아이디(이메일)도 함께 저장해두면 회원정보 수정 화면에서 표시 가능
  try {
    localStorage.setItem('username', payload.id);
  } catch {}

  // ✅ (가능하면) 로그인 응답에서 사용자 정보를 캐싱
  // 백엔드 구현이 환경마다 달라서 여러 키로 탐색
  try {
    const me =
      (data && (data as any).student) ||
      (data && (data as any).data?.student) ||
      (data && (data as any).data?.me) ||
      (data && (data as any).me) ||
      null;

    const cached = {
      // 최소한 이메일(아이디)은 프론트 입력값으로라도 저장
      email: payload.id,
      ...(me && typeof me === 'object' ? me : {}),
    };
    localStorage.setItem('student_me_cache', JSON.stringify(cached));
  } catch {
    // 캐시 실패는 무시
  }

  return data;
}

/* ======================
   회원가입
   ====================== */
export async function signup(payload: {
  // 학생 회원가입(현재 StudentSignUpPage에서 사용)
  school_id: number;
  username: string; // 이메일(아이디)
  pw: string;
  name: string;
  phone: string;
  grade: number;
  class_no: number;
  allergy_codes: number[];
}) {
  const data = await requestJson<any>('POST', '/api/auth/signup', {
    headers: {
      'API-KEY': API_KEY,
      'api-key': API_KEY, // 서버가 대소문자 민감할 경우 대비
    },
    body: payload,
    skipAuth: true, // ✅ 403 해결 핵심
  });

  // ✅ 백엔드에는 GET /api/student/me 가 없어서(또는 막혀있어서)
  // 프로필 수정 화면에서 "변경 전" 값을 보여주려면
  // 회원가입/수정 성공 시점에 프론트가 캐시를 만들어 둬야 합니다.
  try {
    // SignUpResponse는 student 정보가 최상위로 내려옵니다.
    const me = (data && (data as any).data) || data;

    const cached = {
      email: payload.username,
      name: String(me?.name ?? payload.name ?? ''),
      phone: String(me?.phone ?? payload.phone ?? ''),
      grade: Number(me?.grade ?? payload.grade ?? 1),
      class_no: Number(me?.class_no ?? me?.classNo ?? payload.class_no ?? 1),
      // 백 응답의 allergy_codes는 문자열일 수 있어, 프론트 선택값으로 보관
      allergy_codes: Array.isArray(payload.allergy_codes) ? payload.allergy_codes : [],
    };
    localStorage.setItem('student_me_cache', JSON.stringify(cached));

    // 얇은 키 캐시(프로필 페이지 폴백)
    localStorage.setItem('username', payload.username);
    localStorage.setItem('student_name', cached.name);
    localStorage.setItem('student_phone', cached.phone);
    localStorage.setItem('student_grade', String(cached.grade));
    localStorage.setItem('student_class_no', String(cached.class_no));
    localStorage.setItem('student_allergy_codes', JSON.stringify(cached.allergy_codes));
  } catch {
    // 캐시 실패는 무시
  }

  return data;
}

/* ======================
   로그아웃
   ====================== */
export async function logout() {
  try {
    await requestJson('POST', '/api/auth/logout');
  } finally {
    clearAccessToken();
  }
}
