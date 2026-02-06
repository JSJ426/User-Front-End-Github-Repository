import { useState } from 'react';
import { Mail, Phone, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import AuthHeader from './AuthHeader';
import { Footer } from './Footer';

type PageType =
  | 'login'
  | 'findId'
  | 'findPassword'
  | 'signUpStudent'
  | 'app';

interface FindPasswordPageProps {
  onNavigate: (page: PageType) => void;
}

export default function FindPasswordPage({ onNavigate }: FindPasswordPageProps) {
  const [step, setStep] = useState<'verify' | 'reset'>('verify');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock verification success
    setStep('reset');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    alert('비밀번호가 성공적으로 변경되었습니다.');
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-[#F6F7F8] flex flex-col">
      <AuthHeader onNavigate={onNavigate} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8 lg:p-12">
          {/* Header with back button */}
          <div className="flex items-center gap-3 mb-2">
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="로그인으로 돌아가기"
              title="로그인으로 돌아가기"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">비밀번호 찾기</h2>
          </div>
          <p className="text-gray-600 mb-8">
            {step === 'verify'
              ? '가입 시 입력한 정보로 본인 확인을 진행합니다.'
              : '새로운 비밀번호를 설정해주세요.'}
          </p>

          {step === 'verify' ? (
            <>
              {/* Method Selection */}
              <div className="flex gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    method === 'email'
                      ? 'bg-[#00B3A4] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  이메일로 찾기
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('phone')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                    method === 'phone'
                      ? 'bg-[#00B3A4] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  휴대폰으로 찾기
                </button>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleVerify} className="space-y-5">
                {/* User ID Input */}
                <div>
                  <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                    아이디
                  </label>
                  <input
                    id="userId"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="아이디를 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    이름
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                    required
                  />
                </div>

                {method === 'email' ? (
                  /* Email Input */
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@school.com"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  /* Phone Input */
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      휴대폰 번호
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010-1234-5678"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#00B3A4] text-white py-3.5 rounded-xl font-semibold hover:bg-[#009688] transition-colors shadow-sm hover:shadow-md mt-6"
                >
                  본인 확인
                </button>

                {/* Links */}
                <div className="text-center text-sm text-gray-600 mt-4">
                  <button onClick={() => onNavigate('login')} className="hover:text-[#00B3A4] transition-colors">
                    로그인
                  </button>
                  <span className="mx-2">|</span>
                  <button onClick={() => onNavigate('findId')} className="hover:text-[#00B3A4] transition-colors">
                    아이디 찾기
                  </button>
                  <span className="mx-2">|</span>
                  <button onClick={() => onNavigate('signUpStudent')} className="hover:text-[#00B3A4] transition-colors">
                    회원가입
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Password Reset Form */
            <form onSubmit={handleReset} className="space-y-5">
              {/* New Password Input */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 (8자 이상)"
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
                <p className="mt-1.5 text-xs text-gray-500">
                  영문, 숫자, 특수문자를 조합하여 8자 이상 입력해주세요.
                </p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#00B3A4] text-white py-3.5 rounded-xl font-semibold hover:bg-[#009688] transition-colors shadow-sm hover:shadow-md mt-6"
              >
                비밀번호 변경
              </button>

              {/* Links */}
              <div className="text-center text-sm text-gray-600 mt-4">
                <button onClick={() => onNavigate('login')} className="hover:text-[#00B3A4] transition-colors">
                  로그인
                </button>
                <span className="mx-2">|</span>
                <button onClick={() => onNavigate('findId')} className="hover:text-[#00B3A4] transition-colors">
                  아이디 찾기
                </button>
                <span className="mx-2">|</span>
                <button onClick={() => onNavigate('signUpStudent')} className="hover:text-[#00B3A4] transition-colors">
                  회원가입
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}