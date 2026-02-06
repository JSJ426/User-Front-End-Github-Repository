import { Home } from 'lucide-react';

type PageType =
  | 'login'
  | 'findId'
  | 'findPassword'
  | 'signUpStudent'
  | 'app';

interface AuthHeaderProps {
  onNavigate: (page: PageType) => void;
}

export default function AuthHeader({ onNavigate }: AuthHeaderProps) {
  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="flex items-center gap-3"
          title="로그인으로"
        >
          <div className="h-9 w-12 rounded-xl bg-[#00B3A4] text-white flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <div className="leading-tight text-left">
          {/* 더미 학교명 제거: 실제 학교명은 로그인/내정보 기반으로 필요 시 별도 표시 */}
            <div className="text-base font-semibold text-gray-900">학교 급식 관리 시스템</div>
          </div>
        </button>
      </div>
    </header>
  );
}
