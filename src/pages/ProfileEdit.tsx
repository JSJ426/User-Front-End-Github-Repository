import { useEffect, useState } from 'react';
import { User, Mail, Phone, School, Save, AlertTriangle, Key, Trash2, Eye, EyeOff } from 'lucide-react';
import { PageType } from '../App';
import { updateStudentMe } from '../api/student';
import { requestJson } from '../api/http';
import { withdrawStudentAccount } from '../api/auth';
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
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawPw, setWithdrawPw] = useState('');
  const [showWithdrawPw, setShowWithdrawPw] = useState(false);
  const [original, setOriginal] = useState<{ name: string; phone: string; grade: string; class: string; email: string } | null>(null);
  // "변경 전" 값을 입력칸 안에 회색 텍스트로 보여주고,
  // 최초 포커스 시 자동으로 지우기 위한 플래그
  const [nameDirty, setNameDirty] = useState(false);
  const [phoneDirty, setPhoneDirty] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '', // 백에서 내려주지 않아서 표시용(비활성)
    phone: '',
    grade: '1',
    class: '1',
  });


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // ✅ 무조건 백엔드에서 최신 정보 조회
        const raw = await requestJson<any>('GET', '/api/student/me');

        const name = String(raw?.name ?? raw?.studentName ?? raw?.student_name ?? '').trim();
        const phone = String(raw?.phone ?? raw?.phoneNumber ?? raw?.tel ?? '').trim();
        const grade = String(raw?.grade ?? raw?.schoolGrade ?? 1);
        const classNo = String(raw?.class_no ?? raw?.classNo ?? 1);
        const email = String(raw?.email ?? raw?.loginId ?? raw?.username ?? '').trim();

        const o = {
          name,
          phone: formatPhoneNumber(phone),
          grade,
          class: classNo,
          email,
        };

        if (mounted) {
          setOriginal(o);
          setNameDirty(false);
          setPhoneDirty(false);
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
    if (field === 'name') setNameDirty(true);
    if (field === 'phone') {
      setPhoneDirty(true);
      value = formatPhoneNumber(value);
    }
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const safeName = (() => {
        const v = formData.name.trim();
        // 사용자가 "변경 전" 값을 지우고 입력을 안 한 경우(빈 값 저장 방지)
        if (nameDirty && v === '' && original?.name) return original.name;
        return v;
      })();

      const safePhone = (() => {
        const v = formData.phone.trim();
        if (phoneDirty && v === '' && original?.phone) return original.phone;
        return v;
      })();

      const payload = {
        name: safeName,
        phone: safePhone,
        grade: Number(formData.grade),
        class_no: Number(formData.class),
      };
      await updateStudentMe(payload);
      toast.success('회원정보가 수정되었습니다!');
    } catch (e: any) {
      toast.error(e?.message || '회원정보 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async () => {
    const pw = withdrawPw.trim();
    if (!pw) {
      toast.error('탈퇴를 위해 비밀번호를 입력해 주세요.');
      return;
    }

    const ok = window.confirm('정말 회원탈퇴 하시겠습니까?\n탈퇴 후에는 복구할 수 없습니다.');
    if (!ok) return;

    try {
      setWithdrawing(true);
      await withdrawStudentAccount({ pw });
      toast.success('회원탈퇴가 완료되었습니다.');

      // ✅ 로그아웃/초기화 후 로그인으로 이동
      try {
        // App.tsx의 hash-router와 맞춤
        window.location.hash = '/login';
      } catch {}
    } catch (e: any) {
      toast.error(e?.message || '회원탈퇴에 실패했습니다.');
    } finally {
      setWithdrawing(false);
      setWithdrawPw('');
      setShowWithdrawPw(false);
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
              <p className="text-sm text-gray-600">{formData.grade}학년 {formData.class}반</p>
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
                onFocus={() => {
                  if (!nameDirty) setNameDirty(true);
                }}
                onChange={(e) => {
                  setNameDirty(true);
                  handleChange('name', e.target.value);
                }}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  !nameDirty ? 'text-gray-400' : 'text-gray-900'
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
                onFocus={() => {
                  if (!phoneDirty) setPhoneDirty(true);
                }}
                onChange={(e) => {
                  setPhoneDirty(true);
                  handleChange('phone', e.target.value);
                }}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  !phoneDirty ? 'text-gray-400' : 'text-gray-900'
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
                  value={formData.class}
                  onChange={(e) => handleChange('class', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}반</option>
                  ))}
                </select>
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

      {/* 알레르기 정보 */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">알레르기 정보</h2>
        <p className="text-sm text-gray-600 mb-4">
          급식 메뉴에서 알레르기 유발 식품을 확인하고 관리할 수 있습니다.
        </p>
        <button
          onClick={() => onPageChange('allergyEdit')}
          className="w-full px-6 py-3 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-5 h-5" />
          알레르기 설정으로 이동
        </button>
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

      {/* 회원 탈퇴 */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl border border-red-200">
        <h2 className="text-xl font-bold text-gray-800 mb-2">회원탈퇴</h2>
        <p className="text-sm text-gray-600 mb-4">
          탈퇴 시 계정 정보가 삭제되며, 복구할 수 없습니다.
          <br />
          회원탈퇴를 진행하려면 비밀번호를 입력해주세요.
        </p>

        <label className="block text-sm font-semibold text-gray-700 mb-2">
          비밀번호 확인
        </label>

        <div className="relative mb-4">
          <input
            type={showWithdrawPw ? 'text' : 'password'}
            value={withdrawPw}
            onChange={(e) => setWithdrawPw(e.target.value)}
            placeholder="현재 비밀번호를 입력"
            className="w-full pr-12 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <button
            type="button"
            onClick={() => setShowWithdrawPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showWithdrawPw ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showWithdrawPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={withdrawing}
          className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Trash2 className="w-5 h-5" />
          {withdrawing ? '처리 중…' : '회원탈퇴'}
        </button>
      </div>
    </div>
  );
}