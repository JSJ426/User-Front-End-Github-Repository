import { X, Bell, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
  darkMode?: boolean;
}

export function NotificationPanel({ isOpen, onClose, notifications, onNotificationRead, darkMode = false }: NotificationPanelProps) {
  // 외부 클릭 감지를 위한 useEffect
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const panel = document.getElementById('notification-panel');
      const bellButton = document.getElementById('notification-bell-button');
      
      if (panel && !panel.contains(target) && bellButton && !bellButton.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // 알림 클릭 시 읽음 처리
  const handleNotificationClick = (id: string) => {
    onNotificationRead(id);
  };

  // 시간 포맷팅 함수
  const formatTime = (time: string) => {
    const now = new Date();
    const notificationTime = new Date(time);
    const diff = Math.floor((now.getTime() - notificationTime.getTime()) / 1000 / 60);

    if (diff < 1) return '방금 전';
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return `${Math.floor(diff / 1440)}일 전`;
  };

  return (
    <>
      {/* 패널 */}
      <div
        id="notification-panel"
        className={`fixed top-0 right-0 h-full w-96 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <Bell className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            <h2 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>알림</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} rounded-full transition`}
            aria-label="닫기"
          >
            <X className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* 알림 목록 */}
        <div className="overflow-y-auto h-[calc(100vh-73px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Bell className={`w-12 h-12 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mb-3`} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>새로운 알림이 없습니다</p>
            </div>
          ) : (
            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`px-6 py-4 cursor-pointer transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} ${
                    !notification.isRead ? (darkMode ? 'bg-teal-900/30' : 'bg-teal-50/50') : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* 읽음/읽지 않음 표시 */}
                    <div className="flex-shrink-0 mt-1">
                      {notification.isRead ? (
                        <CheckCircle2 className={`w-5 h-5 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      ) : (
                        <div className="w-2.5 h-2.5 bg-teal-500 rounded-full mt-1"></div>
                      )}
                    </div>

                    {/* 알림 내용 */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-sm mb-1 ${
                          notification.isRead ? (darkMode ? 'text-gray-300' : 'text-gray-700') : (darkMode ? 'font-semibold text-gray-100' : 'font-semibold text-gray-900')
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 line-clamp-2`}>
                        {notification.description}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatTime(notification.time)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}