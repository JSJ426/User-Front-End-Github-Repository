import { requestJson } from './http';

/**
 * 학교검색(학생용) 결과 타입
 *
 * 백엔드: SchoolSearchDto (camelCase)
 * 프론트: 기존 화면들이 snake_case를 사용 중이라
 * 이 파일에서 snake_case로 변환해서 반환한다.
 */
export interface SchoolSearchItem {
  school_name: string;
  region_code: string;
  school_code: string;
  address: string;
  school_id: number | null; // 우리 서비스에 등록(가입 가능)된 학교만 값이 존재
  // 아래 필드는 화면에서 안 쓰면 null로 내려도 OK
  school_type: string | null;
  dietitian_name: string | null;
  is_registered: boolean;
  message: string | null;
}

// 백엔드 원본(DTO) 타입 (camelCase)
type BackendSchoolSearchDto = {
  schoolId: number | null;
  schoolCode: string;
  regionCode: string;
  schoolName: string;
  address: string;
  schoolType: string | null;
  isRegistered: boolean;
  dietitianName: string | null;
  message: string | null;
};

// 🔎 학교 이름 일부로 검색
// GET /api/schools/search?keyword=...
export async function searchSchools(keyword: string): Promise<SchoolSearchItem[]> {
  const q = (keyword || '').trim();
  if (!q) return [];

  // 학교검색은 로그인 전에도 쓰므로 skipAuth
  const rows = (await requestJson(
    'GET',
    `/api/schools/search?keyword=${encodeURIComponent(q)}`,
    {
    skipAuth: true,
    }
  )) as BackendSchoolSearchDto[];

  // camelCase -> snake_case 변환
  return (rows || []).map((x) => ({
    school_name: x.schoolName,
    region_code: x.regionCode,
    school_code: x.schoolCode,
    address: x.address,
    school_id: x.schoolId,
    school_type: x.schoolType ?? null,
    dietitian_name: x.dietitianName ?? null,
    is_registered: !!x.isRegistered,
    message: x.message ?? null,
  }));
}
