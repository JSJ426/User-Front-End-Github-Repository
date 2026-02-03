import { TodayMeal } from '../components/TodayMeal';
import { PageType } from '../App';
import { Calendar, Star, MessageSquare, User } from 'lucide-react';

interface HomeProps {
  userAllergies: string[];
  onPageChange: (page: PageType) => void;
  darkMode?: boolean;
}

export function Home({ userAllergies, onPageChange, darkMode = false }: HomeProps) {
  const quickMenuItems = [
    {
      id: 'schedule',
      label: '식단표 조회',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      hoverBg: darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50',
      page: 'schedule' as PageType,
    },
    {
      id: 'satisfaction',
      label: '만족도 평가',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      hoverBg: darkMode ? 'hover:bg-gray-700' : 'hover:bg-yellow-50',
      page: 'satisfaction' as PageType,
    },
    {
      id: 'board',
      label: '게시판',
      icon: MessageSquare,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      hoverBg: darkMode ? 'hover:bg-gray-700' : 'hover:bg-green-50',
      page: 'board' as PageType,
    },
    {
      id: 'profile',
      label: '회원정보 수정',
      icon: User,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      hoverBg: darkMode ? 'hover:bg-gray-700' : 'hover:bg-purple-50',
      page: 'profile' as PageType,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>홈</h1>
      </div>

      <TodayMeal 
        userAllergies={userAllergies} 
        onNavigateToSchedule={() => onPageChange('schedule')}
        darkMode={darkMode}
      />

      {/* 바로가기 섹션 */}
      <div className={`pt-8 mt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>
          바로가기
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.page)}
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4 flex items-center gap-4 transition ${item.hoverBg} hover:shadow-md`}
              >
                <div className={`${darkMode ? 'bg-gray-700' : item.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <span className={`text-base font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}