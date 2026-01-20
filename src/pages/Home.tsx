import { TodayMeal } from '../components/TodayMeal';
import { PageType } from '../App';

interface HomeProps {
  userAllergies: string[];
  onPageChange: (page: PageType) => void;
}

export function Home({ userAllergies, onPageChange }: HomeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">오늘의 급식</h1>
        <p className="text-gray-600">오늘의 급식 메뉴를 확인하세요</p>
      </div>

      <TodayMeal 
        userAllergies={userAllergies} 
        onNavigateToSchedule={() => onPageChange('schedule')}
      />
    </div>
  );
}
