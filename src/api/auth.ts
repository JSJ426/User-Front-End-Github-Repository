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

  const { data, response } = await requestJson('POST', '/api/auth/login/student', {
  headers: {
    'API-KEY': API_KEY,
    'api-key': API_KEY,
  },
  body: {
    username: payload.id,
    pw: payload.pw,
  },
  returnResponse: true,
  skipAuth: true,
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
export async function signupStudent(payload: {
  email: string;
  password: string;
  name: string;
  phone: string;
  grade: number;
  classNo: number;
  allergyCodes: number[];
}) {
  const { data } = await requestJson('POST', '/api/auth/signup/student', {
    body: {
      email: payload.email,
      password: payload.password,
      name: payload.name,
      phone: payload.phone,
      grade: payload.grade,
      classNo: payload.classNo,
      allergyCodes: payload.allergyCodes,
    },
    skipAuth: true, // ⭐ 회원가입은 토큰 없이
  });

  return data;
}

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

/* ======================
   아이디(이메일) 찾기
   - (현재 백엔드) POST /api/auth/student/find-id
   - body: { name, phone }
   - res : { username: "..." }
   ====================== */
export async function findId(payload: { name: string; phone: string }) {
  const body = {
    name: payload.name,
    phone: payload.phone,
  };

  // ✅ 백엔드 버전에 따라 엔드포인트가 다를 수 있어 404일 때만 대체 경로를 시도합니다.
  // - 현재 백엔드: POST /api/auth/student/find-id
  // - 구버전: POST /api/auth/find-id
  // - 일부 환경: POST /auth/find-id
  const candidates = ['/api/auth/student/find-id', '/api/auth/find-id', '/auth/find-id'] as const;

  let lastErr: any = null;
  for (const path of candidates) {
    try {
      return await requestJson<any>('POST', path, {
        body,
        skipAuth: true,
      });
    } catch (e: any) {
      lastErr = e;
      // 404(매핑 없음)일 때만 다음 후보로 넘어감
      if (e?.status === 404) continue;
      throw e;
    }
  }

  throw lastErr ?? new Error('아이디 찾기 API를 찾을 수 없습니다.');
}


/* ======================
   비밀번호 찾기 (학생)
   - 백엔드: POST /api/auth/student/find-pw
   - body: { username, name, phone }
   - res : { message, temporaryPassword }
   ====================== */
export async function findStudentTempPassword(payload: {
  email: string;   // ✅ email로 받기
  name: string;
  phone: string;
}) {
  const body = {
    email: payload.email, // ✅ 백엔드 DTO 필드명과 일치
    name: payload.name,
    phone: payload.phone,
  };

  const candidates = ['/api/auth/student/find-pw', '/api/auth/find-pw', '/auth/find-pw'] as const;

  let lastErr: any = null;
  for (const path of candidates) {
    try {
      return await requestJson<any>('POST', path, {
        body,
        skipAuth: true,
      });
    } catch (e: any) {
      lastErr = e;
      if (e?.status === 404) continue;
      throw e;
    }
  }
  throw lastErr ?? new Error('비밀번호 찾기 API를 찾을 수 없습니다.');
}


/* ======================
   회원 탈퇴 (학생)
   - 백엔드: DELETE /api/auth/withdraw/student
   - body: { pw: string }
   ====================== */
export async function withdrawStudentAccount(payload: { pw: string }) {
  const data = await requestJson<any>('DELETE', '/api/auth/withdraw/student', {
    body: { pw: payload.pw },
  });

  // 탈퇴 성공 시 로컬 토큰/캐시 정리
  try {
    clearAccessToken();
    localStorage.removeItem('username');
    localStorage.removeItem('student_me_cache');
    localStorage.removeItem('student_name');
    localStorage.removeItem('student_phone');
    localStorage.removeItem('student_grade');
    localStorage.removeItem('student_class_no');
    localStorage.removeItem('student_allergy_codes');
  } catch {
    // ignore
  }

  return data;
}
/* ======================
   비밀번호 재설정(찾기/변경)
   - 백엔드 엔드포인트가 프로젝트마다 달라서
     흔한 후보들을 순서대로 시도합니다.
   - 404(없음)일 때만 다음 후보를 시도하고
     그 외 에러(400/401/500 등)는 그대로 사용자에게 보여줍니다.
   ====================== */
export async function resetPassword(payload: {
  name: string;
  email?: string;   // 이메일(아이디를 이메일로 쓰는 경우)
  phone?: string;
  newPassword: string;
}) {
  const name = payload.name?.trim();
  const email = payload.email?.trim();
  const phone = payload.phone?.trim();
  const newPassword = payload.newPassword;

  // 여러 서버 구현을 대비해서 body 키를 여러 형태로 준비
  const bodies = [
    // 케이스1: username + pw
    { username: email, name, phone, pw: newPassword },
    // 케이스2: email + pw
    { email, name, phone, pw: newPassword },
    // 케이스3: username + newPassword
    { username: email, name, phone, newPassword },
    // 케이스4: email + newPassword
    { email, name, phone, newPassword },
    // 케이스5: password 키
    { email, username: email, name, phone, password: newPassword },
  ].filter((b) => {
    // email/username 둘 다 비어있으면 의미없으니 제거
    const hasId = Boolean((b as any).email || (b as any).username || phone);
    return hasId;
  });

  const endpoints = [
    // 흔한 후보들
    '/api/auth/reset-password',
    '/api/auth/password/reset',
    '/api/auth/password',
    '/api/auth/password/change',
    '/api/student/password',
    '/api/students/password',
  ];

  let lastErr: any = null;

  for (const path of endpoints) {
    for (const body of bodies) {
      try {
        // 비밀번호 찾기/재설정은 보통 토큰 없이 진행됨
        const data = await requestJson<any>('POST', path, {
          body,
          skipAuth: true,
        });
        return data; // ✅ 성공하면 즉시 반환
      } catch (e: any) {
        lastErr = e;

        // ✅ 엔드포인트가 아예 없을 때(404)만 다음 후보 시도
        if (e?.status === 404) continue;

        // 400/401/403/500 등은 “있는데 요청이 틀림/실패”니까 바로 throw
        throw e;
      }
    }
  }

  // 여기까지 왔다는 건 후보 엔드포인트가 전부 404였거나, 모두 실패
  throw lastErr || new Error('비밀번호 재설정 API를 찾지 못했습니다.');
}

