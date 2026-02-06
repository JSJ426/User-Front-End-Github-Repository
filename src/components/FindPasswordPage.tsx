import { useState } from 'react';
import { ArrowLeft, Copy, KeyRound, Mail, Phone, User } from 'lucide-react';
import AuthHeader from './AuthHeader';
import { Footer } from './Footer';
import { toast } from 'sonner@2.0.3';
import { findStudentTempPassword } from '../api/auth';
import { formatPhoneNumber } from '../utils/phone';

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
  const [username, setUsername] = useState(''); // 아이디(이메일)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [temporaryPassword, setTemporaryPassword] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const u = username.trim();
    const n = name.trim();
    const p = phone.trim();

    if (!u || !n || !p) {
      toast.error('아이디(이메일), 이름, 전화번호를 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await findStudentTempPassword({ email: u, name: n, phone: p });

      const temp =
        (res && (res as any).temporaryPassword) ||
        (res && (res as any).data?.temporaryPassword) ||
        '';

      if (!temp) {
        toast.error('임시 비밀번호를 받지 못했습니다. (응답 형식을 확인해주세요)');
        return;
      }

      setTemporaryPassword(String(temp));
      // 로그인 화면에서 편하게 쓸 수 있도록 저장(선택)
      try {
        localStorage.setItem('prefill_login_username', u);
        localStorage.setItem('prefill_login_password', String(temp));
      } catch {}

      toast.success('임시 비밀번호가 발급되었습니다.');
    } catch (err: any) {
      toast.error(err?.message || '비밀번호 찾기에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTemp = async () => {
    if (!temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      toast.success('임시 비밀번호가 복사되었습니다.');
    } catch {
      toast.error('복사에 실패했습니다. 직접 선택해 복사해주세요.');
    }
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

          {!temporaryPassword ? (
            <>
              <p className="text-gray-600 mb-8">
                아이디(이메일), 이름, 전화번호가 모두 일치하면 <b>임시 비밀번호</b>가 발급됩니다.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">아이디(이메일)</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">이름</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                      placeholder="홍길동"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">전화번호</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B3A4] focus:border-transparent transition-all"
                      placeholder="010-1234-5678"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-[#00B3A4] text-white rounded-xl hover:bg-[#009688] transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '확인 중...' : '임시 비밀번호 발급'}
                </button>
              </form>

              <div className="mt-6 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  발급된 임시 비밀번호로 로그인한 뒤, <b>설정 → 비밀번호 변경</b>에서 원하는 비밀번호로 변경하세요.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                임시 비밀번호가 발급되었습니다. 아래 비밀번호로 로그인 후, 설정에서 비밀번호를 변경해주세요.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-xs text-gray-500">임시 비밀번호</div>
                    <div className="text-lg font-bold text-gray-800 tracking-wider">
                      {temporaryPassword}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyTemp}
                  className="px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition flex items-center gap-2 text-sm"
                >
                  <Copy className="w-4 h-4" /> 복사
                </button>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="w-full px-6 py-3 bg-[#00B3A4] text-white rounded-xl hover:bg-[#009688] transition-colors font-semibold"
                >
                  로그인하러 가기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTemporaryPassword('');
                    setUsername('');
                    setName('');
                    setPhone('');
                  }}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  다시 찾기
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
