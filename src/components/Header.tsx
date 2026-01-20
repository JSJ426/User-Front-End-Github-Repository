import { Bell, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onNotificationClick: () => void;
  unreadCount: number;
  darkMode?: boolean;
}

export function Header({ onMenuClick, onNotificationClick, unreadCount, darkMode = false }: HeaderProps) {
  return (
    <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-40 shadow-sm`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 로고 및 앱 이름 */}
          <div className="flex items-center gap-3">
            <div className="bg-teal-500 text-white px-3 py-2 rounded-md font-bold flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 5L12 19L19 5H5Z" fill="currentColor"/>
              </svg>
              AIVLE
            </div>
            <div>
              <h1 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} text-lg`}>학교 급식 관리 시스템</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>부산 고등학교</p>
            </div>
          </div>

          {/* 오른쪽: Notify, 로그아웃, 햄버거 메뉴 */}
          <div className="flex items-center gap-2">
            {/* 알림 버튼 */}
            <button 
              id="notification-bell-button"
              onClick={onNotificationClick}
              className={`relative p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition`}
            >
              <Bell className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* 로그아웃 버튼 */}
            <button 
              className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition`}
              title="로그아웃"
            >
              <LogOut className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
            
            {/* 햄버거 메뉴 버튼 */}
            <button 
              onClick={onMenuClick}
              className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition`}
              title="메뉴"
            >
              <Menu className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}