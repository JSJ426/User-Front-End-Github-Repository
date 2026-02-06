import { X, Home, Calendar, Star, User, Settings, MessageSquare } from 'lucide-react';
import { PageType } from '../App';
import { useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  darkMode?: boolean;
  userName?: string;
}

export function Sidebar({ isOpen, onClose, currentPage, onPageChange, darkMode = false, userName }: SidebarProps) {
  const menuItems = [
    { id: 'home' as PageType, icon: Home, label: '홈', color: 'text-teal-500' },
    { id: 'schedule' as PageType, icon: Calendar, label: '식단표 조회', color: 'text-blue-500' },
    { id: 'satisfaction' as PageType, icon: Star, label: '만족도 평가', color: 'text-yellow-500' },
    { id: 'board' as PageType, icon: MessageSquare, label: '게시판', color: 'text-green-500' },
    { id: 'profile' as PageType, icon: User, label: '회원정보 수정', color: 'text-purple-500' },
    { id: 'settings' as PageType, icon: Settings, label: '설정', color: 'text-gray-500' },
  ];

  // 사이드바가 열릴 때 메인 화면 스크롤 비활성화
  useEffect(() => {
    if (isOpen) {
      // 스크롤 비활성화
      document.body.style.overflow = 'hidden';
    } else {
      // 스크롤 복원
      document.body.style.overflow = '';
    }

    // 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* 오버레이 (사이드바 외부 영역) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-40 z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>메뉴</h2>
            <button
              onClick={onClose}
              className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition`}
            >
              <X className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
          </div>

          {/* 메뉴 아이템들 */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      currentPage === item.id
                        ? `${darkMode ? 'bg-teal-900/50' : 'bg-teal-50'} border-l-4 border-teal-500`
                        : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${currentPage === item.id ? 'text-teal-500' : item.color}`} />
                    <span className={`font-medium ${currentPage === item.id ? 'text-teal-700' : darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* 푸터 */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
              안녕하세요 {userName || '사용자'}님
            </div>
          </div>
        </div>
      </div>
    </>
  );
}