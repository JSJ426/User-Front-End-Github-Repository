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
          <div className="h-9 px-4 rounded-xl bg-[#00B3A4] text-white font-extrabold flex items-center">
            AIVLE
          </div>
          <div className="leading-tight text-left">
            <div className="text-sm text-gray-500">부산 고등학교</div>
            <div className="text-base font-semibold text-gray-900">학교 급식 관리 시스템</div>
          </div>
        </button>
      </div>
    </header>
  );
}
