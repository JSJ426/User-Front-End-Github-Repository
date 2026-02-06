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

// -----------------------------
// Response normalizer
// 백/프 DTO 필드명이 조금씩 달라도 화면이 비지 않도록, 최대한 안전하게 매핑합니다.
// -----------------------------
function toNumberOrNull(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeAllergyCodes(v: any): number[] {
  // [1,2] | ["1","2"] | "1,2" | [{id:1},{allergyCode:2}] 등 최대한 대응
  if (Array.isArray(v)) {
    const nums = v
      .map((x) => {
        if (typeof x === 'number' || typeof x === 'string') return toNumberOrNull(x);
        if (x && typeof x === 'object') return toNumberOrNull((x as any).id ?? (x as any).allergyCode ?? (x as any).code);
        return null;
      })
      .filter((x): x is number => x !== null);
    return Array.from(new Set(nums));
  }
  if (typeof v === 'string') {
    const nums = v
      .split(',')
      .map((s) => toNumberOrNull(s.trim()))
      .filter((x): x is number => x !== null);
    return Array.from(new Set(nums));
  }
  return [];
}

function normalizeStudentMe(raw: any): StudentMe {
  const src = raw && typeof raw === 'object' ? raw : {};
  const name = src.name ?? src.studentName ?? src.username ?? src.userName ?? '';
  const phone = src.phone ?? src.phoneNumber ?? src.tel ?? src.mobile ?? '';
  const grade = toNumberOrNull(src.grade ?? src.schoolGrade) ?? 1;
  const classNo = toNumberOrNull(src.class_no ?? src.classNo ?? src.class) ?? 1;
  const allergy_codes = normalizeAllergyCodes(src.allergy_codes ?? src.allergyCodes ?? src.allergies);

  return {
    name: String(name ?? ''),
    email: src.email ? String(src.email) : undefined,
    phone: String(phone ?? ''),
    grade,
    class_no: classNo,
    allergy_codes,
  };
}

function unwrapData(raw: any, maxDepth = 5): any {
  let cur = raw;
  for (let i = 0; i < maxDepth; i++) {
    if (cur && typeof cur === 'object' && 'data' in cur) cur = (cur as any).data;
    else break;
  }
  return cur;
}

export async function getStudentMe() {
  // ✅ 백이 GET /api/student/me 를 지원하지 않는 환경이 있어 캐시 폴백
  try {
    const raw = await requestJson<any>('GET', '/api/student/me');
    const unwrapped = unwrapData(raw);
    const me = normalizeStudentMe(unwrapped);
    // 캐시 업데이트
    try {
      localStorage.setItem('student_me_cache', JSON.stringify(me));
    } catch {}
    return {
      status: (raw as any)?.status ?? 'success',
      message: (raw as any)?.message ?? '',
      data: me,
      details: (raw as any)?.details,
    } as ApiResponse<StudentMe>;
  } catch (e: any) {
    // 405/500 등으로 GET이 막힌 경우 -> 캐시 사용
    const cached = getStudentMeCache();
    if (cached) {
      return { status: 'success', message: 'cached', data: cached } as ApiResponse<StudentMe>;
    }
    throw e;
  }
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
  // ✅ 중요: 백엔드 StudentUpdateRequest가 name/phone/grade/classNo 등을 NotNull/NotBlank로 검증함
  //    따라서 프론트에서 "부분 업데이트"(예: allergy_codes만)로 PUT을 보내면 null 검증 실패가 발생한다.
  //    -> 캐시(또는 GET /api/student/me)에서 기존 값을 끌어와서 "회원정보 수정 + 알레르기"를
  //       한 번에(풀 바디) 제출하도록 보정한다.

  // 1) 우선 캐시에서 기존 값 확보
  const cached = getStudentMeCache();
  let merged: StudentMe = {
    name: String((cached as any)?.name ?? ''),
    phone: String((cached as any)?.phone ?? ''),
    grade: Number((cached as any)?.grade ?? 0) || 1,
    class_no: Number((cached as any)?.class_no ?? 0) || 1,
    allergy_codes: Array.isArray((cached as any)?.allergy_codes) ? (cached as any).allergy_codes : [],
    email: (cached as any)?.email,
  };
  merged = { ...merged, ...body } as StudentMe;

  // 2) 필수값이 비어있다면(캐시가 없었거나 초기 상태) -> 가능하면 서버에서 최신 조회 후 병합
  if (!merged.name || !merged.phone || merged.grade == null || merged.class_no == null) {
    try {
      const rawMe = await requestJson<any>('GET', '/api/student/me');
      const unwrappedMe = unwrapData(rawMe);
      const me = normalizeStudentMe(unwrappedMe);
      merged = { ...me, ...body } as StudentMe;
    } catch {
      // GET이 막힌 환경(405 등)에서는 여기로 떨어질 수 있음
    }
  }

  // 3) 최종적으로 백엔드 DTO가 요구하는 필수 필드를 항상 포함해서 제출
  const payload = {
    name: String(merged.name ?? ''),
    phone: String(merged.phone ?? ''),
    grade: Number(merged.grade ?? 1),
    class_no: Number(merged.class_no ?? 1),
    allergy_codes: Array.isArray(merged.allergy_codes) ? merged.allergy_codes : [],
  } as Partial<StudentMe>;

  // 백엔드가 PATCH를 지원하지 않아서 PUT으로 고정
  const raw = await requestJson<any>('PUT', '/api/student/me', { body: payload });
  const unwrapped = unwrapData(raw);
  const me = normalizeStudentMe(unwrapped);
  // ✅ 저장 성공 시 캐시 갱신
  setStudentMeCache(me);
  return {
    status: (raw as any)?.status ?? 'success',
    message: (raw as any)?.message ?? '',
    data: me,
    details: (raw as any)?.details,
  } as ApiResponse<StudentMe>;
}

export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
};

export async function changePassword(body: ChangePasswordBody) {
  // 백엔드: PUT /api/auth/password/change/student
  // DTO: { current_password, new_password }
  const payload = {
    current_password: body.currentPassword,
    new_password: body.newPassword,
  };
  return await requestJson<ApiResponse<any>>('PUT', '/api/auth/password/change/student', { body: payload });
}
