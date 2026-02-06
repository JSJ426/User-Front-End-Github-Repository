import { useEffect, useMemo, useState } from 'react';
import { User, Lock, Mail, Phone, Eye, EyeOff, Calendar, Building2, Check, Search } from 'lucide-react';
import AuthHeader from './AuthHeader';
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal';
import { Footer } from './Footer';
import { signup as apiSignup } from '../api/auth';
import { searchSchools, type SchoolSearchItem } from '../api/schools';

type PageType =
  | 'login'
  | 'findId'
  | 'findPassword'
  | 'signUpStudent'
  | 'app';

interface StudentSignUpPageProps {
  onNavigate: (page: PageType) => void;
}

// 알레르기 항목 리스트
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

// ✅ 학교는 나이스 검색 API로 가져온다 (school_id 없는 학교는 선택 불가)

export default function StudentSignUpPage({ onNavigate }: StudentSignUpPageProps) {
  const [step, setStep] = useState(1); // 1 or 2
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    school: '',
    grade: '',
    class: '',
    number: '',
  });
  
  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  
  // 학교 검색 관련 상태
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [schoolResults, setSchoolResults] = useState<SchoolSearchItem[]>([]);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<SchoolSearchItem | null>(null);

  const selectableSchools = useMemo(
    () => schoolResults.filter((s) => s.school_id !== null),
    [schoolResults]
  );

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAllergy = (allergyId: number) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergyId)
        ? prev.filter((id) => id !== allergyId)
        : [...prev, allergyId]
    );
  };

  // Step 1 유효성 검사
  const isStep1Valid = () => {
    return (
      formData.email.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== '' &&
      formData.password === formData.confirmPassword &&
      formData.name.trim() !== '' &&
      formData.phone.trim() !== '' &&
      selectedSchool?.school_id != null &&
      formData.grade.trim() !== '' &&
      formData.class.trim() !== '' &&
      formData.number.trim() !== ''
    );
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!isStep1Valid()) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    setStep(2);
  };

  const handlePreviousStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!agreedToTerms || !agreedToPrivacy) {
    alert('필수 약관에 동의해주세요.');
    return;
  }

  // ✅ 학교 선택 필수 (school_id가 있는 학교만 가입 가능)
  if (!selectedSchool?.school_id) {
    alert('학교를 검색해서 목록에서 선택해주세요. (가입 가능한 학교만 표시됩니다)');
    return;
  }

  const username = (formData.email || '').trim();
  const pw = formData.password;
  const name = (formData.name || '').trim();
  const phone = (formData.phone || '').trim();
  const grade = Number(formData.grade);
  const class_no = Number(formData.class);

  if (!username || !pw || !name) {
    alert('이메일(아이디), 비밀번호, 이름은 필수입니다.');
    return;
  }

  if (!phone) {
    alert('전화번호는 필수입니다.');
    return;
  }

  if (!Number.isFinite(grade) || grade <= 0) {
    alert('학년을 선택해주세요.');
    return;
  }

  if (!Number.isFinite(class_no) || class_no <= 0) {
    alert('반을 입력해주세요.');
    return;
  }

  if (pw !== formData.confirmPassword) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }

  try {
    setIsSubmitting(true);
    // ✅ 학교검색 API에서 확보한 school_id를 기반으로 가입
    await apiSignup({
      school_id: selectedSchool.school_id,
      username,
      pw,
      name,
      phone,
      grade,
      class_no,
      allergy_codes: selectedAllergies,
    });
    alert('회원가입이 완료되었습니다! 이제 로그인해주세요.');
    onNavigate('login');
  } catch (err: any) {
    const msg = err?.message || '회원가입에 실패했습니다.';
    alert(msg);
  } finally {
    setIsSubmitting(false);
  }
};

  // 학교 입력 변경: 타이핑은 가능하지만, "선택"을 해야 가입 가능
  const handleSchoolInputChange = (query: string) => {
    setSchoolSearchQuery(query);
    setFormData((prev) => ({ ...prev, school: query }));
    setSelectedSchool(null); // 타이핑하면 선택 해제
    setSchoolError(null);
    if (!query.trim()) {
      setSchoolResults([]);
      setShowSchoolDropdown(false);
    } else {
      setShowSchoolDropdown(true);
    }
  };

  const handleSchoolSelect = (item: SchoolSearchItem) => {
    setSelectedSchool(item);
    setFormData((prev) => ({ ...prev, school: item.school_name }));
    setSchoolSearchQuery(item.school_name);
    setShowSchoolDropdown(false);
  };

  // 학교 검색 (디바운스)
  useEffect(() => {
    const q = schoolSearchQuery.trim();
    if (!q) return;

    const t = setTimeout(async () => {
      try {
        setSchoolLoading(true);
        setSchoolError(null);
        const res = await searchSchools(q);
        setSchoolResults(res);
      } catch (e: any) {
        setSchoolError(e?.message || '학교 검색에 실패했습니다.');
        setSchoolResults([]);
      } finally {
        setSchoolLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [schoolSearchQuery]);

  return (
    <div className="min-h-screen bg-[#F6F7F8] flex flex-col">
      <AuthHeader onNavigate={onNavigate} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8 lg:p-12">
          {/* Header with back button and progress */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => (step === 1 ? onNavigate('login') : handlePreviousStep())}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-gray-800">학생 회원가입</h2>
            </div>
            <div className="bg-[#00B3A4] text-white px-4 py-1.5 rounded-full text-sm font-semibold">
              {step}/2
            </div>
          </div>

          {/* Step 1: 회원가입 정보 입력 */}
          {step === 1 && (
            <>
              <p className="text-gray-600 mb-8">
                학교 급식 관리 시스템을 이용하려면 회원가입이 필요합니다.
              </p>

              <form onSubmit={handleNextStep} className="space-y-6">
                {/* Account Information Section */}
                <div className="space-y-5">
                  <h3 className="font-semibold text-gray-800 text-lg pb-2 border-b-2 border-[#00B3A4]">
                    계정 정보
                  </h3>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      메일주소(이메일) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="example@school.com"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="영문, 숫자, 특수문자 조합 8자 이상"
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      비밀번호 확인 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        placeholder="비밀번호 재입력"
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="mt-1.5 text-xs text-red-500">
                        비밀번호가 일치하지 않습니다.
                      </p>
                    )}
                  </div>
                </div>

                {/* Personal Information Section */}
                <div className="space-y-5">
                  <h3 className="font-semibold text-gray-800 text-lg pb-2 border-b-2 border-[#00B3A4]">
                    개인 정보
                  </h3>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="이름을 입력하세요"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      전화번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="010-1234-5678"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* School Information Section */}
                <div className="space-y-5">
                  <h3 className="font-semibold text-gray-800 text-lg pb-2 border-b-2 border-[#00B3A4]">
                    소속 정보(학교)
                  </h3>

                  {/* School */}
                  <div>
                    <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">
                      학교 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="school"
                        type="text"
                        value={schoolSearchQuery}
                        onChange={(e) => handleSchoolInputChange(e.target.value)}
                        onFocus={() => {
                          if (schoolSearchQuery.trim()) setShowSchoolDropdown(true);
                        }}
                        onBlur={() => {
                          // 드롭다운 클릭을 위해 딜레이 추가
                          setTimeout(() => setShowSchoolDropdown(false), 200);
                        }}
                        placeholder="학교명을 입력하세요"
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      
                      {/* Dropdown for search results */}
                      {showSchoolDropdown && schoolSearchQuery.trim() && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {schoolLoading ? (
                            <div className="px-4 py-3 text-gray-500 text-sm">검색 중...</div>
                          ) : schoolError ? (
                            <div className="px-4 py-3 text-red-600 text-sm">{schoolError}</div>
                          ) : selectableSchools.length > 0 ? (
                            selectableSchools.map((item) => (
                              <button
                                key={`${item.region_code}-${item.school_code}`}
                                type="button"
                                onClick={() => handleSchoolSelect(item)}
                                className="w-full px-4 py-3 text-left hover:bg-[#00B3A4]/5 transition-colors text-gray-700 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">{item.school_name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{item.address}</div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500 text-sm">
                              가입 가능한 학교가 없습니다. (학교 계정/영양사 가입으로 school_id가 생성된 학교만 표시됩니다)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* 선택된 학교 표시 (school_id 기반) */}
                    {selectedSchool?.school_id && (
                      <div className="mt-2 text-xs text-gray-500">
                        선택됨: <span className="font-medium text-gray-700">{selectedSchool.school_name}</span>
                        <span className="ml-2">(school_id: {selectedSchool.school_id})</span>
                      </div>
                    )}
                  </div>

                  {/* Grade, Class, Number */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                        학년 <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="grade"
                        value={formData.grade}
                        onChange={(e) => handleChange('grade', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all appearance-none bg-white"
                        required
                      >
                        <option value="">선택</option>
                        <option value="1">1학년</option>
                        <option value="2">2학년</option>
                        <option value="3">3학년</option>
                        <option value="4">4학년</option>
                        <option value="5">5학년</option>
                        <option value="6">6학년</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                        반 <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="class"
                        type="number"
                        value={formData.class}
                        onChange={(e) => handleChange('class', e.target.value)}
                        placeholder="1-10"
                        min="1"
                        max="20"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                        번호 <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="number"
                        type="number"
                        value={formData.number}
                        onChange={(e) => handleChange('number', e.target.value)}
                        placeholder="1-40"
                        min="1"
                        max="40"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                  {/* Next Button */}
  <button
    type="submit"
    disabled={isSubmitting || !isStep1Valid()}
    className={`w-full py-3.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md ${
      isStep1Valid()
        ? 'bg-[#00B3A4] text-white hover:bg-[#009688]'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }`}
  >
    다음
  </button>
</form>
            </>
          )}


{/* Step 2: 알레르기 선택 + 약관 동의 */}
{step === 2 && (
  <>
    <p className="text-gray-600 mb-8">
      알레르기 정보를 선택하고 필수 약관에 동의해주세요.
    </p>

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Allergy Section (optional) */}
      <div className="space-y-5">
        <h3 className="font-semibold text-gray-800 text-lg pb-2 border-b-2 border-[#00B3A4]">
          알레르기 선택 (선택)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allergyItems.map((item) => {
            const selected = selectedAllergies.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleAllergy(item.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  selected
                    ? 'border-[#00B3A4] bg-[#00B3A4]/5 text-gray-800'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">{item.name}</span>
                {selected && <Check className="w-5 h-5 text-[#00B3A4]" />}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-gray-500">
          선택한 알레르기: {selectedAllergies.length ? selectedAllergies.join(', ') : '없음'}
        </p>
      </div>

      {/* Agreements */}
      <div className="space-y-5">
        <h3 className="font-semibold text-gray-800 text-lg pb-2 border-b-2 border-[#00B3A4]">
          약관 동의
        </h3>

        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[#00B3A4]"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-gray-800">
                  이용약관 동의 <span className="text-red-500">(필수)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(true)}
                  className="text-sm text-[#00B3A4] hover:underline"
                >
                  보기
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                서비스 이용을 위해 이용약관에 동의해주세요.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-[#00B3A4]"
              checked={agreedToPrivacy}
              onChange={(e) => setAgreedToPrivacy(e.target.checked)}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-gray-800">
                  개인정보 처리방침 동의 <span className="text-red-500">(필수)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="text-sm text-[#00B3A4] hover:underline"
                >
                  보기
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                개인정보 수집·이용에 동의해주세요.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handlePreviousStep}
          className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors shadow-sm"
        >
          이전
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !agreedToTerms || !agreedToPrivacy}
          className={`flex-1 py-3.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md ${
            agreedToTerms && agreedToPrivacy
              ? 'bg-[#00B3A4] text-white hover:bg-[#009688]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? '가입 중...' : '가입 완료'}
        </button>
      </div>
    </form>
  </>
)}        </div>
      </main>

      {/* Terms Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAgree={() => setAgreedToTerms(true)}
      />

      {/* Privacy Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onAgree={() => setAgreedToPrivacy(true)}
      />

      <Footer />
    </div>
  );
}