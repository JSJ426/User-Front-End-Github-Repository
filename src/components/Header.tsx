import { LogOut, Menu, Home } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  darkMode?: boolean;
  onHomeClick: () => void;
  onLogout: () => void;
}

export function Header({
  onMenuClick,
  darkMode = false,
  onHomeClick,
  onLogout,
}: HeaderProps) {
  const schoolName =
    localStorage.getItem('school_name') ||
    localStorage.getItem('schoolName') ||
    '';

  return (
    <header
      className={`${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b sticky top-0 z-40 shadow-sm`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 홈 아이콘 + 앱 정보 */}
          <div className="flex items-center gap-3">
            {/* ✅ AIVLE 텍스트 → 홈 아이콘 */}
            <button
              onClick={onHomeClick}
              className="bg-teal-500 text-white p-2 rounded-md flex items-center justify-center hover:bg-teal-600 transition cursor-pointer"
              title="홈으로 이동"
              aria-label="홈으로 이동"
            >
              <Home className="w-5 h-5" />
            </button>

            <div>
              <h1
                className={`font-semibold ${
                  darkMode ? 'text-gray-100' : 'text-gray-800'
                } text-lg`}
              >
                학교 급식 관리 시스템
              </h1>
              {schoolName ? (
                <p
                  className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {schoolName}
                </p>
              ) : null}
            </div>
          </div>

          {/* 오른쪽: 로그아웃, 햄버거 메뉴 (기존 그대로) */}
          <div className="flex items-center gap-2">
            {/* 로그아웃 버튼 */}
            <button
              className={`p-2 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } rounded-full transition`}
              title="로그아웃"
              onClick={onLogout}
            >
              <LogOut
                className={`w-6 h-6 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              />
            </button>

            {/* 햄버거 메뉴 버튼 */}
            <button
              onClick={onMenuClick}
              className={`p-2 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } rounded-full transition`}
              title="메뉴"
            >
              <Menu
                className={`w-6 h-6 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
