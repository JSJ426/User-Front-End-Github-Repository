import { useMemo, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import AuthHeader from './AuthHeader';
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

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const canLogin = useMemo(() => userId.trim().length > 0 && password.trim().length > 0, [userId, password]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!canLogin) {
      alert('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    // TODO: 실제 인증 API 연결 시 여기서 호출
    onNavigate('app');
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

                {/* 스크린샷 자리(원본 UI처럼) */}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">아이디</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400" />
                      </span>
                      <input
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="auth-input w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B3A4]/40 focus:border-[#00B3A4]"
                        placeholder="아이디"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </span>
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input w-full h-12 pl-12 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B3A4]/40 focus:border-[#00B3A4]"
                        placeholder="비밀번호"
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
                    disabled={!canLogin}
                    className={`auth-btn auth-btn-primary w-full h-14 rounded-2xl font-bold text-white shadow-sm transition ${
                      canLogin ? 'bg-[#00B3A4] hover:bg-[#009E91]' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    로그인
                  </button>

                  <div className="text-center text-sm text-gray-600">
                    <button type="button" className="hover:text-gray-900" onClick={() => onNavigate('findId')}>
                      아이디 찾기
                    </button>
                    <span className="mx-2 text-gray-300">|</span>
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
