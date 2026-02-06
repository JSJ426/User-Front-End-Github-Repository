import { requestJson } from './http';

export type StudentMe = {
  name: string;
  email?: string;
  phone: string;
  grade: number;
  class_no: number;
  allergy_codes: number[];
};

// -----------------------------
// Local cache helpers
// 백엔드 GET /api/student/me 가 막혀있는 환경(405)에서
// 프론트만으로 "변경 전" 값을 보여주기 위한 캐시/토큰 파서입니다.
// -----------------------------
function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string | null): any | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function buildCacheFallback(): StudentMe | null {
  // 1) 얇은 키 캐시(저장 성공 시 setStudentMeCache가 같이 저장)
  const thin = {
    name: localStorage.getItem('student_name') || '',
    phone: localStorage.getItem('student_phone') || '',
    grade: Number(localStorage.getItem('student_grade') || '0'),
    class_no: Number(localStorage.getItem('student_class_no') || '0'),
    allergy_codes: safeJsonParse<number[]>(localStorage.getItem('student_allergy_codes')) || [],
  };
  const hasThin = !!(thin.name || thin.phone || thin.grade || thin.class_no || (thin.allergy_codes?.length ?? 0) > 0);
  if (hasThin) {
    return {
      name: thin.name,
      phone: thin.phone,
      grade: thin.grade || 1,
      class_no: thin.class_no || 1,
      allergy_codes: thin.allergy_codes || [],
    };
  }

  // 2) 토큰(JWT) 안에 사용자 정보가 포함된 경우(환경에 따라 있을 수 있음)
  const token = localStorage.getItem('access_token');
  const payload = decodeJwtPayload(token);
  if (payload && typeof payload === 'object') {
    const me: Partial<StudentMe> = {
      name: payload.name || payload.username || payload.user_name || '',
      phone: payload.phone || payload.tel || payload.mobile || '',
      grade: Number(payload.grade ?? payload.schoolGrade ?? 0),
      class_no: Number(payload.class_no ?? payload.classNo ?? payload.class ?? 0),
      allergy_codes: Array.isArray(payload.allergy_codes)
        ? payload.allergy_codes
        : Array.isArray(payload.allergyCodes)
        ? payload.allergyCodes
        : [],
    };
    const ok = !!(me.name || me.phone || me.grade || me.class_no || (me.allergy_codes?.length ?? 0) > 0);
    if (ok) {
      return {
        name: String(me.name || ''),
        phone: String(me.phone || ''),
        grade: Number(me.grade || 1),
        class_no: Number(me.class_no || 1),
        allergy_codes: (me.allergy_codes as number[]) || [],
      };
    }
  }

  return null;
}

export type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
  details?: any;
};

// 백 응답 형태가 환경마다 달라(중첩 data, 다른 필드명 등) 화면이 빈칸이 되는 문제가 있어
// 여기서 최대한 정규화합니다.
function unwrapData(raw: any) {
  let cur: any = raw;
  for (let i = 0; i < 5; i++) {
    if (!cur || typeof cur !== 'object') break;

    // 흔한 래퍼: { status, message, data }
    if ('data' in cur && (('status' in cur) || ('message' in cur) || ('details' in cur))) {
      cur = (cur as any).data;
      continue;
    }

    // 어떤 환경에서는 { data: { ... } } 로만 오는 경우도 있음
    if ('data' in cur && Object.keys(cur).length === 1) {
      cur = (cur as any).data;
      continue;
    }
    break;
  }
  return cur;
}

function normalizeAllergyCodes(input: any): number[] {
  if (!input) return [];

  // [1,2,3]
  if (Array.isArray(input) && input.every((x) => typeof x === 'number')) return input as number[];

  // ['1','2']
  if (Array.isArray(input) && input.every((x) => typeof x === 'string')) {
    return (input as string[])
      .map((s) => Number(String(s).trim()))
      .filter((n) => Number.isFinite(n));
  }

  // [{id:1}, {code:2}] 같은 형태
  if (Array.isArray(input)) {
    return input
      .map((x) => Number((x as any)?.id ?? (x as any)?.code ?? (x as any)?.allergyCode ?? (x as any)?.value))
      .filter((n) => Number.isFinite(n));
  }

  return [];
}

function normalizeStudentMe(raw: any): StudentMe {
  const me = unwrapData(raw);
  const name = String((me as any)?.name ?? (me as any)?.studentName ?? (me as any)?.username ?? '');
  const phone = String((me as any)?.phone ?? (me as any)?.phoneNumber ?? (me as any)?.tel ?? (me as any)?.mobile ?? '');
  const grade = Number((me as any)?.grade ?? (me as any)?.schoolGrade ?? (me as any)?.school_grade ?? 1);
  const class_no = Number(
    (me as any)?.class_no ?? (me as any)?.classNo ?? (me as any)?.classNO ?? (me as any)?.class ?? (me as any)?.classNumber ?? 1
  );
  const allergy_codes = normalizeAllergyCodes(
    (me as any)?.allergy_codes ?? (me as any)?.allergyCodes ?? (me as any)?.allergies ?? (me as any)?.allergyList
  );

  return {
    name,
    phone,
    grade: Number.isFinite(grade) ? grade : 1,
    class_no: Number.isFinite(class_no) ? class_no : 1,
    allergy_codes,
    email: (me as any)?.email,
  };
}

export async function getStudentMe() {
  // ✅ 회원정보 화면은 "항상 백에서 최신값"을 보여줘야 하므로 캐시 폴백 없이 그대로 호출
  const raw = await requestJson<any>('GET', '/api/student/me');

  // 어떤 래퍼 형태로 오든 StudentMe 로 정규화해서 반환
  const me = normalizeStudentMe(raw);
  return { status: 'success', message: '', data: me } as ApiResponse<StudentMe>;
}

export function getStudentMeCache(): StudentMe | null {
  const parsed = safeJsonParse<StudentMe>(localStorage.getItem('student_me_cache'));
  if (parsed && typeof parsed === 'object') return parsed as StudentMe;

  // GET이 막힌 환경에서라도 화면에 "변경 전" 값을 보여주기 위한 폴백
  return buildCacheFallback();
}

export function setStudentMeCache(next: Partial<StudentMe>) {
  const prev = getStudentMeCache() || ({} as StudentMe);
  const merged = { ...prev, ...next } as StudentMe;
  try {
    localStorage.setItem('student_me_cache', JSON.stringify(merged));
  } catch {}

  // 얇은 키도 같이 저장 (GET 미지원 환경 대비)
  try {
    if (merged.name !== undefined) localStorage.setItem('student_name', String(merged.name ?? ''));
    if (merged.phone !== undefined) localStorage.setItem('student_phone', String(merged.phone ?? ''));
    if (merged.grade !== undefined) localStorage.setItem('student_grade', String(merged.grade ?? ''));
    if (merged.class_no !== undefined) localStorage.setItem('student_class_no', String(merged.class_no ?? ''));
    if (merged.allergy_codes !== undefined) localStorage.setItem('student_allergy_codes', JSON.stringify(merged.allergy_codes ?? []));
  } catch {}
  return merged;
}

export async function updateStudentMe(body: Partial<StudentMe>) {
  // 백엔드가 PATCH를 지원하지 않아서 PUT으로 고정
  const raw = await requestJson<any>('PUT', '/api/student/me', { body });

  // 저장 응답도 정규화
  const me = normalizeStudentMe(raw);
  // ✅ 저장 성공 시 캐시 갱신
  setStudentMeCache(me);
  return { status: 'success', message: '', data: me } as ApiResponse<StudentMe>;
}

export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export async function changePassword(body: ChangePasswordBody) {
  return await requestJson<ApiResponse<any>>('PUT', '/api/student/me/password', { body });
}
