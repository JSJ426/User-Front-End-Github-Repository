import { Bell, Moon, Globe } from 'lucide-react';
import { useState } from 'react';

interface SettingsProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export function Settings({ darkMode, setDarkMode }: SettingsProps) {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('ko');

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>설정</h1>
        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>앱 설정 및 환경을 관리하세요</p>
      </div>

      <div className="space-y-4">
        {/* 알림 설정 */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>알림 설정</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>급식 알림을 받을지 설정합니다</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-14 h-8 rounded-full transition ${
                notifications ? 'bg-teal-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {notifications && (
            <div className={`pl-9 space-y-2 border-l-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'} ml-3`}>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>급식 메뉴 변경 알림</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>알레르기 식품 포함 알림</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>만족도 평가 알림</span>
              </label>
            </div>
          )}
        </div>

        {/* 화면 설정 */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-6 h-6 text-indigo-500" />
              <div>
                <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>다크 모드</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>어두운 테마를 사용합니다</p>
              </div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-14 h-8 rounded-full transition ${
                darkMode ? 'bg-teal-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 언어 설정 */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6 text-blue-500" />
            <div>
              <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>언어 설정</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>앱 표시 언어를 선택합니다</p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>
    </div>
  );
}