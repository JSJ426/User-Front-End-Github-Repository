import { useMemo, useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AuthHeader from './AuthHeader';
import { login as apiLogin } from '../api/auth';
import { Footer } from './Footer';

type PageType =
  | 'login'
  | 'findId'
  | 'findPassword'
  | 'signUpStudent'
  | 'app';

interface LoginPageProps {
  onNavigate: (page: PageType) => void;
}

// 이메일 형식 검증
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEmail = useMemo(() => EMAIL_REGEX.test(userId.trim()), [userId]);

  const canLogin = useMemo(
    () => userId.trim().length > 0 && password.trim().length > 0 && isEmail,
    [userId, password, isEmail]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const email = userId.trim();
    const pw = password.trim();

    if (!email || !pw) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      alert('이메일 형식으로 입력해주세요. (예: example@domain.com)');
      return;
    }

    try {
      setIsLoading(true);
      await apiLogin({ id: email, pw: password });

      localStorage.setItem('username', email);
      onNavigate('app');
    } catch (err: any) {
      alert(err?.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen bg-[#F6F7F8] flex flex-col">
      <AuthHeader onNavigate={onNavigate} />

      <main className="auth-main max-w-6xl mx-auto w-full px-6 py-12 flex-grow">
        <div className="auth-panel bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="auth-grid grid grid-cols-1 lg:grid-cols-2">
            {/* Left panel */}
            <div className="auth-left p-10 bg-gradient-to-b from-gray-50 to-white border-b lg:border-b-0 lg:border-r">
              <h1 className="auth-title text-3xl font-extrabold text-gray-900 mb-4">로그인</h1>
              <p className="auth-subtitle text-gray-600 leading-relaxed mb-8">
                학교 급식 관리 시스템에 접속하려면 계정 정보로 로그인하세요.
              </p>

              <div className="auth-card bg-white rounded-2xl border shadow-sm p-6">
                <div className="auth-card-title font-bold text-gray-900 mb-1">한눈에 보는 오늘의 급식</div>
                <div className="auth-card-desc text-sm text-gray-600 mb-5">
                  요일 탭으로 빠르게 중식/석식 정보를 확인할 수 있어요.
                </div>

                <div className="auth-sample rounded-xl border bg-gray-100 h-52 flex items-center justify-center text-gray-500 text-sm">
                  (예시 화면)
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="auth-right p-10 flex items-center justify-center">
              <div className="w-full max-w-md">
                <h2 className="auth-form-title text-3xl font-extrabold text-gray-900 mb-8">로그인</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* ✅ 아이디 -> 이메일 라벨 변경 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>

                    {/* ✅ 아이콘 제거: relative/left icon span 삭제하고 padding도 pl-4로 */}
                    <input
                      value={userId}
                      disabled={isLoading}
                      onChange={(e) => setUserId(e.target.value)}
                      className="auth-input w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B3A4]/40 focus:border-[#00B3A4]"
                      placeholder="이메일을 입력하세요"
                      autoComplete="username"
                      inputMode="email"
                    />

                    {userId && !isEmail && (
                      <div className="mt-2 text-xs text-red-500">이메일 형식으로 입력해주세요.</div>
                    )}
                  </div>

                  {/* 비밀번호 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>

                    {/* ✅ 아이콘 제거: 왼쪽 아이콘 span 삭제, 오른쪽 eye만 유지 */}
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        disabled={isLoading}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input w-full h-12 px-4 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B3A4]/40 focus:border-[#00B3A4]"
                        placeholder="비밀번호를 입력하세요"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        title={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                      >
                        {showPw ? (
                          <EyeOff className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !canLogin}
                    className={`auth-btn auth-btn-primary w-full h-14 rounded-2xl font-bold text-white shadow-sm transition ${
                      canLogin ? 'bg-[#00B3A4] hover:bg-[#009E91]' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? '로그인 중...' : '로그인'}
                  </button>

                  {/* 하단 링크: 아이디 찾기 제거 상태 유지 */}
                  <div className="text-center text-sm text-gray-600">
                    <button type="button" className="hover:text-gray-900" onClick={() => onNavigate('findPassword')}>
                      비밀번호 찾기
                    </button>
                    <span className="mx-2 text-gray-300">|</span>
                    <button type="button" className="hover:text-gray-900" onClick={() => onNavigate('signUpStudent')}>
                      회원가입
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
