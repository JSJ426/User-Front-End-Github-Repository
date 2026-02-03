import { useState } from 'react';
import { User, Lock, Mail, Phone, Eye, EyeOff, Calendar, Building2, Check, Search } from 'lucide-react';
import AuthHeader from './AuthHeader';
import TermsModal from './TermsModal';
import PrivacyModal from './PrivacyModal';
import { Footer } from './Footer';

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

// 학교 목록
const schools = [
  '부산고등학교',
  '부산제일고등학교',
  '부산중앙고등학교',
  '부산여자고등학교',
  '해운대고등학교',
  '동래고등학교',
  '경남고등학교',
  '개성고등학교',
  '부산중학교',
  '부산제일중학교',
  '해운대중학교',
  '동래중학교',
  '부산초등학교',
  '해운대초등학교',
  '동래초등학교',
];

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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  
  // 학교 검색 관련 상태
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);

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
      formData.school.trim() !== '' &&
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms || !agreedToPrivacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    console.log('학생 회원가입 시도:', {
      ...formData,
      allergies: selectedAllergies,
    });
    alert('회원가입이 완료되었습니다!');
    onNavigate('login');
  };

  // 학교 검색 핸들러
  const handleSchoolSearch = (query: string) => {
    setSchoolSearchQuery(query);
    // 입력값을 formData에도 실시간 반영
    setFormData((prev) => ({ ...prev, school: query }));
    
    if (query) {
      const filtered = schools.filter((school) =>
        school.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSchools(filtered);
      setShowSchoolDropdown(true);
    } else {
      setFilteredSchools([]);
      setShowSchoolDropdown(false);
    }
  };

  const handleSchoolSelect = (school: string) => {
    setFormData((prev) => ({ ...prev, school }));
    setSchoolSearchQuery(school);
    setFilteredSchools([]);
    setShowSchoolDropdown(false);
  };

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
                        onChange={(e) => handleSchoolSearch(e.target.value)}
                        onFocus={() => {
                          if (schoolSearchQuery && filteredSchools.length > 0) {
                            setShowSchoolDropdown(true);
                          }
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
                      {showSchoolDropdown && schoolSearchQuery && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {filteredSchools.length > 0 ? (
                            filteredSchools.map((school) => (
                              <button
                                key={school}
                                type="button"
                                onClick={() => handleSchoolSelect(school)}
                                className="w-full px-4 py-3 text-left hover:bg-[#00B3A4]/5 transition-colors text-gray-700 border-b border-gray-100 last:border-b-0"
                              >
                                {school}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500 text-sm">
                              검색 결과가 없습니다. 학교명을 직접 입력해주세요.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
                  disabled={!isStep1Valid()}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md mt-6 ${
                    isStep1Valid()
                      ? 'bg-[#00B3A4] text-white hover:bg-[#009688]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  다음
                </button>

                {/* Links */}
                <div className="text-center text-sm text-gray-600 mt-4">
                  이미 계정이 있으신가요?{' '}
                  <button onClick={() => onNavigate('login')} className="text-[#00B3A4] hover:underline font-medium">
                    로그인
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 2: 알레르기 선택 */}
          {step === 2 && (
            <>
              <p className="text-gray-600 mb-8">
                알레르기 정보를 선택하고 약관에 동의해주세요.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Allergy Selection Section */}
                <div className="space-y-5">
                  <h3 className="font-semibold text-gray-800 text-lg pb-2 border-b-2 border-[#00B3A4]">
                    알레르기 정보 선택
                  </h3>
                  <p className="text-sm text-gray-600">
                    해당하는 알레르기 항목을 모두 선택해주세요.
                  </p>

                  {/* Allergy Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {allergyItems.map((allergy) => (
                      <button
                        key={allergy.id}
                        type="button"
                        onClick={() => toggleAllergy(allergy.id)}
                        className={`relative px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                          selectedAllergies.includes(allergy.id)
                            ? 'border-[#00B3A4] bg-[#00B3A4]/5 text-[#00B3A4]'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span>{allergy.name}</span>
                        {selectedAllergies.includes(allergy.id) && (
                          <Check className="h-5 w-5 text-[#00B3A4] absolute top-2 right-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="space-y-3 pt-4">
                  <h3 className="font-semibold text-gray-800 text-lg pb-2 border-b-2 border-[#00B3A4]">
                    약관 동의
                  </h3>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#00B3A4] focus:ring-[#00B3A4]"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="text-red-500">*</span> 이용약관에 동의합니다.{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsTermsModalOpen(true);
                        }}
                        className="text-[#00B3A4] hover:underline"
                      >
                        자세히 보기
                      </button>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToPrivacy}
                      onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[#00B3A4] focus:ring-[#00B3A4]"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="text-red-500">*</span> 개인정보 처리방침에 동의합니다.{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsPrivacyModalOpen(true);
                        }}
                        className="text-[#00B3A4] hover:underline"
                      >
                        자세히 보기
                      </button>
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    이전
                  </button>
                  <button
                    type="submit"
                    disabled={!agreedToTerms || !agreedToPrivacy}
                    className={`flex-1 py-3.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md ${
                      agreedToTerms && agreedToPrivacy
                        ? 'bg-[#00B3A4] text-white hover:bg-[#009688]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    가입 완료
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
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