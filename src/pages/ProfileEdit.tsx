import { useEffect, useMemo, useState } from 'react';
import { withdrawStudentAccount } from '../api/auth';
import { updateStudentMe, getStudentMe, changePassword } from '../api/student';

type AllergyItem = { code: number; label: string };

// (기존 프로젝트에서 쓰던 알레르기 코드 표준 1~19)
const ALLERGIES: AllergyItem[] = [
  { code: 1, label: '난류(가금류)' },
  { code: 2, label: '우유' },
  { code: 3, label: '메밀' },
  { code: 4, label: '땅콩' },
  { code: 5, label: '대두' },
  { code: 6, label: '밀' },
  { code: 7, label: '고등어' },
  { code: 8, label: '게' },
  { code: 9, label: '새우' },
  { code: 10, label: '돼지고기' },
  { code: 11, label: '복숭아' },
  { code: 12, label: '토마토' },
  { code: 13, label: '아황산류' },
  { code: 14, label: '호두' },
  { code: 15, label: '닭고기' },
  { code: 16, label: '쇠고기' },
  { code: 17, label: '오징어' },
  { code: 18, label: '조개류(굴/전복/홍합 포함)' },
  { code: 19, label: '잣' },
];

interface ProfileForm {
  name: string;
  phone: string;
  grade: number;
  classNo: number;
  allergyCodes: number[];
}

export default function ProfileEdit() {
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    phone: '',
    grade: 1,
    classNo: 1,
    allergyCodes: [],
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 비밀번호 변경 폼
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPassword2: '',
  });

  const allergySet = useMemo(() => new Set(form.allergyCodes), [form.allergyCodes]);

  useEffect(() => {
    let mounted = true;

    async function loadMe() {
      try {
        setLoading(true);
        setError(null);

        const res = await getStudentMe(); // ApiResponse<StudentMe>

        if (!mounted) return;

        // 알레르기: 서버/캐시값 + localStorage 값을 합쳐서 “안 사라지게”
        const fromRes = res.data?.allergy_codes ?? [];
        const fromLS = safeJsonParse<number[]>(localStorage.getItem('student_allergy_codes')) ?? [];
        const mergedAllergy = uniqNumbers([...(fromRes || []), ...(fromLS || [])]);

        setForm({
          name: res.data?.name ?? '',
          phone: res.data?.phone ?? '',
          grade: res.data?.grade ?? 1,
          classNo: res.data?.class_no ?? 1,
          allergyCodes: mergedAllergy,
        });
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || '회원 정보를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMe();
    return () => {
      mounted = false;
    };
  }, []);

  /* ======================
     공통 핸들러
     ====================== */
  const setField = (k: keyof ProfileForm, v: any) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };

  const toggleAllergy = (code: number) => {
    setForm((prev) => {
      const next = new Set(prev.allergyCodes);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      const arr = Array.from(next).sort((a, b) => a - b);

      // ✅ 메인/다른 화면에서도 쓰는 키: student_allergy_codes (바로 반영)
      try {
        localStorage.setItem('student_allergy_codes', JSON.stringify(arr));
      } catch {}

      return { ...prev, allergyCodes: arr };
    });
  };

  const clearAllergy = () => {
    setForm((prev) => {
      try {
        localStorage.setItem('student_allergy_codes', JSON.stringify([]));
      } catch {}
      return { ...prev, allergyCodes: [] };
    });
  };

  /* ======================
     1) 회원정보 + 알레르기 저장
     ====================== */
  const onSaveProfile = async () => {
    try {
      setSavingProfile(true);
      setError(null);

      await updateStudentMe({
        name: form.name,
        phone: form.phone,
        grade: form.grade,
        class_no: form.classNo,
        allergy_codes: form.allergyCodes,
      });

      alert('회원정보가 저장되었습니다.');
    } catch (e: any) {
      setError(e?.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSavingProfile(false);
    }
  };

  /* ======================
     2) 비밀번호 변경
     ====================== */
  const onChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setError('현재 비밀번호와 새 비밀번호를 입력해주세요.');
      return;
    }
    if (pwForm.newPassword !== pwForm.newPassword2) {
      setError('새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      setSavingPw(true);
      setError(null);

      await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });

      alert('비밀번호가 변경되었습니다.');
      setPwForm({ currentPassword: '', newPassword: '', newPassword2: '' });
    } catch (e: any) {
      setError(e?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setSavingPw(false);
    }
  };

  /* ======================
     3) 회원 탈퇴
     ====================== */
  const onWithdraw = async () => {
    const pw = prompt('비밀번호를 입력해주세요.');
    if (!pw) return;

    if (!confirm('정말 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    try {
      await withdrawStudentAccount({ pw });
      alert('회원 탈퇴가 완료되었습니다.');
      window.location.href = '/';
    } catch (e: any) {
      alert(e?.message || '회원 탈퇴에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">불러오는 중...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-6">회원정보 수정</h1>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      {/* ======================
          섹션 1) 회원정보 수정
         ====================== */}
      <section className="mb-8 border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold mb-4">회원정보 수정</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">이름</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">전화번호</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setField('phone', formatPhoneNumber(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            placeholder="010-0000-0000"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">학년</label>
            <select
              value={form.grade}
              onChange={(e) => setField('grade', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            >
              {[1, 2, 3].map((g) => (
                <option key={g} value={g}>
                  {g}학년
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">반</label>
            <select
              value={form.classNo}
              onChange={(e) => setField('classNo', Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            >
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <option key={c} value={c}>
                  {c}반
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onSaveProfile}
            disabled={savingProfile}
            className="px-5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {savingProfile ? '저장 중...' : '저장'}
          </button>
        </div>
      </section>

      {/* ======================
          섹션 2) 알레르기 정보 수정
         ====================== */}
      <section className="mb-8 border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">알레르기 정보 수정</h2>
          <button
            type="button"
            onClick={clearAllergy}
            className="text-xs px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            전체 해제
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALLERGIES.map((a) => {
            const checked = allergySet.has(a.code);
            return (
              <label
                key={a.code}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer select-none
                  ${checked ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAllergy(a.code)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-900">
                  {a.code}. {a.label}
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-2 text-xs text-gray-500">
          선택됨: {form.allergyCodes.length ? form.allergyCodes.join(', ') : '없음'}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onSaveProfile}
            disabled={savingProfile}
            className="px-5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {savingProfile ? '저장 중...' : '저장'}
          </button>
        </div>
      </section>

      {/* ======================
          섹션 3) 비밀번호 변경
         ====================== */}
      <section className="mb-8 border border-gray-200 rounded-xl p-5">
        <h2 className="text-base font-semibold mb-4">비밀번호 변경</h2>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">현재 비밀번호</label>
          <input
            type="password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">새 비밀번호</label>
          <input
            type="password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">새 비밀번호 확인</label>
          <input
            type="password"
            value={pwForm.newPassword2}
            onChange={(e) => setPwForm((p) => ({ ...p, newPassword2: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onChangePassword}
            disabled={savingPw}
            className="px-5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {savingPw ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </section>

      {/* ======================
          섹션 4) 회원 탈퇴
         ====================== */}
      <section className="border border-red-200 rounded-xl p-5">
        <h2 className="text-base font-semibold mb-2 text-red-600">회원 탈퇴</h2>
        <p className="text-sm text-gray-600 mb-4">
          회원 탈퇴 시 계정 정보가 삭제되며, 되돌릴 수 없습니다.
        </p>

        <button
          onClick={onWithdraw}
          className="w-full border border-red-400 text-red-500 py-2 rounded-lg hover:bg-red-50"
        >
          회원 탈퇴
        </button>
      </section>
    </div>
  );
}

/* ======================
   Utils
   ====================== */
function formatPhoneNumber(value: string) {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function uniqNumbers(arr: number[]) {
  const set = new Set<number>();
  for (const v of arr) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) set.add(n);
  }
  return Array.from(set).sort((a, b) => a - b);
}
