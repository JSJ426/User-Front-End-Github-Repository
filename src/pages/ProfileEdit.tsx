import { useEffect, useState } from 'react';
import { User, Mail, Phone, School, Save, Key } from 'lucide-react';
import { PageType } from '../App';
import { getStudentMe, updateStudentMe } from '../api/student';
import { toast } from 'sonner@2.0.3';

// 휴대폰 번호를 입력할 때 자동으로 하이픈을 포맷팅합니다.
// - 숫자만 남김
// - 최대 11자리(010xxxxxxxx)까지만 허용
// - 010-1234-5678 형태로 표시
function formatPhoneNumber(value: string) {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
}

interface ProfileEditProps {
  onPageChange: (page: PageType) => void;
}

export function ProfileEdit({ onPageChange }: ProfileEditProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState<{ name: string; phone: string; grade: string; classNo: string; email: string; allergyCodes: number[] } | null>(null);
  // ✅ 이름/전화번호는 "회색"(변경 전처럼 보이게)으로 보여주되,
  // 실제 값은 항상 입력칸에 유지해서 빈 값 저장/검증 오류를 방지합니다.
  const [nameEdited, setNameEdited] = useState(false);
  const [phoneEdited, setPhoneEdited] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '', // 백에서 내려주지 않아서 표시용(비활성)
    phone: '',
    grade: '1',
    classNo: '1',
    allergyCodes: [] as number[],
  });

  const allergyItems = [
    { id: 1, name: '난류' },
    { id: 2, name: '우유' },
    { id: 3, name: '메밀' },
    { id: 4, name: '땅콩' },
    { id: 5, name: '대두' },
    { id: 6, name: '밀' },
    { id: 7, name: '고등어' },
    { id: 8, name: '게' },
    { id: 9, name: '새우' },
    { id: 10, name: '돼지고기' },
    { id: 11, name: '복숭아' },
    { id: 12, name: '토마토' },
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // ✅ 요구사항: 캐시 사용 X, 무조건 백에서 최신 회원정보를 조회
        const res = await getStudentMe();
        const me = res.data;
        const email = String((me as any)?.email || localStorage.getItem('username') || localStorage.getItem('user_id') || '');

        const o = {
          name: String(me?.name || ''),
          phone: formatPhoneNumber(String(me?.phone || '')),
          grade: String(me?.grade ?? 1),
          classNo: String((me as any)?.class_no ?? (me as any)?.classNo ?? 1),
          email,
          allergyCodes: Array.isArray((me as any)?.allergy_codes)
            ? (me as any).allergy_codes
            : Array.isArray((me as any)?.allergyCodes)
            ? (me as any).allergyCodes
            : [],
        };

        if (mounted) {
          setOriginal(o);
          setNameEdited(false);
          setPhoneEdited(false);
          setFormData((prev) => ({ ...prev, ...o }));
        }
      } catch (e: any) {
        toast.error(e?.message || '회원정보를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (field: string, value: string) => {
    if (field === 'name') setNameEdited(true);
    if (field === 'phone') {
      setPhoneEdited(true);
      value = formatPhoneNumber(value);
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const safeName = formData.name.trim();
      const safePhone = formData.phone.trim();
      const safeGrade = Number(formData.grade);
      const safeClassNo = Number(formData.classNo);

      if (!safeName) {
        toast.error('이름은 필수 입력입니다.');
        return;
      }
      if (!safePhone) {
        toast.error('전화번호는 필수 입력입니다.');
        return;
      }
      if (!Number.isFinite(safeGrade) || safeGrade < 1) {
        toast.error('학년을 선택해주세요.');
        return;
      }
      if (!Number.isFinite(safeClassNo) || safeClassNo < 1) {
        toast.error('반을 선택해주세요.');
        return;
      }

      // ✅ 모든 변경사항(알레르기 포함)을 한 번에 저장
      const payload = {
        name: safeName,
        phone: safePhone,
        grade: safeGrade,
        class_no: safeClassNo,
        allergy_codes: formData.allergyCodes,
      };

      await updateStudentMe(payload);
      toast.success('회원정보가 수정되었습니다!');
    } catch (e: any) {
      toast.error(e?.message || '회원정보 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">회원정보 수정</h1>
        <p className="text-gray-600">개인정보를 수정하고 관리하세요</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="space-y-6">
          {/* 프로필(사진 기능 삭제) */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{formData.name || '사용자'}</h3>
              <p className="text-sm text-gray-600">{formData.grade}학년 {formData.classNo}반</p>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  !nameEdited ? 'text-gray-400' : 'text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                전화번호
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  !phoneEdited ? 'text-gray-400' : 'text-gray-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <School className="w-4 h-4 inline mr-1" />
                  학년
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  반
                </label>
                <select
                  value={formData.classNo}
                  onChange={(e) => handleChange('classNo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}반</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 알레르기 (프로필 수정과 함께 저장) */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                알레르기 정보
              </label>
              <p className="text-xs text-gray-500 mb-3">해당하는 항목을 모두 선택하세요. (저장하기를 눌러야 반영됩니다)</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allergyItems.map((a) => {
                  const checked = formData.allergyCodes.includes(a.id);
                  return (
                    <label
                      key={a.id}
                      className={`flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        checked ? 'ring-1 ring-teal-400' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? Array.from(new Set([...formData.allergyCodes, a.id]))
                            : formData.allergyCodes.filter((c) => c !== a.id);
                          setFormData((prev) => ({ ...prev, allergyCodes: next }));
                        }}
                        className="rounded text-teal-500"
                      />
                      <span className="text-sm text-gray-700">{a.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="pt-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading || saving}
              className="flex-1 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? '저장 중…' : '저장하기'}
            </button>
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
              취소
            </button>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">비밀번호 변경</h2>
        <p className="text-sm text-gray-600 mb-4">
          비밀번호 변경을 위해 본인 인증이 필요합니다.
        </p>
        <button 
          onClick={() => onPageChange('passwordVerify')}
          className="w-full px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-2"
        >
          <Key className="w-5 h-5" />
          비밀번호 변경
        </button>
      </div>
    </div>
  );
}