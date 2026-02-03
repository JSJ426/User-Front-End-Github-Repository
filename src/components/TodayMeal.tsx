import { useState } from 'react';
import { Utensils, AlertTriangle } from 'lucide-react';
import { weeklyMealData } from '../data/mealData';
import { MealDetailModal } from './MealDetailModal';

interface TodayMealProps {
  userAllergies: string[];
  onNavigateToSchedule: () => void;
  darkMode?: boolean;
}

export function TodayMeal({ userAllergies, onNavigateToSchedule, darkMode = false }: TodayMealProps) {
  // 현재 요일 인덱스 가져오기 (월=0, 화=1, ..., 금=4)
  const today = new Date();
  const dayIndex = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const selectedDayIndex = dayIndex >= 1 && dayIndex <= 5 ? dayIndex - 1 : 0;
  
  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'lunch' | 'dinner'>('lunch');
  
  const currentWeek = weeklyMealData[0];
  const selectedMeal = currentWeek.days[selectedDayIndex];

  // 급식 이미지 (중식/석식용)
  const lunchImage = "https://images.unsplash.com/photo-1646299501330-c46c84c0c936?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjByaWNlJTIwbWVhbHxlbnwxfHx8fDE3Njc5NDI3MTh8MA&ixlib=rb-4.1.0&q=80&w=400";
  const dinnerImage = "https://images.unsplash.com/photo-1761303506087-9788d0a98e87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBzaWRlJTIwZGlzaGVzJTIwYmFuY2hhbnxlbnwxfHx8fDE3Njc5NDI3MTl8MA&ixlib=rb-4.1.0&q=80&w=400";

  // 알레르기 항목에 사용자 알레르기가 포함되어 있는지 확인
  const hasUserAllergy = (allergens: string | undefined): boolean => {
    if (!allergens) return false;
    const allergenList = allergens.split(',').map(a => a.trim());
    return allergenList.some(allergen => userAllergies.includes(allergen));
  };

  // 알레르기 텍스트를 렌더링하는 함수
  const renderAllergens = (allergens: string | undefined) => {
    if (!allergens) return null;
    
    const allergenList = allergens.split(',').map(a => a.trim());
    
    return (
      <span className="text-xs ml-1">
        (
        {allergenList.map((allergen, idx) => {
          const isUserAllergy = userAllergies.includes(allergen);
          return (
            <span key={idx}>
              <span className={isUserAllergy ? 'text-red-600 font-semibold' : 'text-gray-400'}>
                {allergen}
              </span>
              {idx < allergenList.length - 1 && ', '}
            </span>
          );
        })}
        )
      </span>
    );
  };

  // 급식 데이터가 없는 경우
  if (!selectedMeal) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <div className="text-center py-12">
          <Utensils className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>급식 정보가 없습니다.</p>
        </div>
      </div>
    );
  }

  const openModal = (mealType: 'lunch' | 'dinner') => {
    setSelectedMealType(mealType);
    setModalOpen(true);
  };

  return (
    <>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <div className="space-y-4">
          {/* 선택된 날짜 표시 (요일 탭 제거) */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-teal-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                {selectedMeal.day}요일
              </div>
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{selectedMeal.date}</span>
            </div>
          </div>

          {/* 중식과 석식 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 중식 카드 */}
            <div className="relative pt-3">
              {/* 중식 라벨 - 카드 상단 외곽에 배치 */}
              <div className="absolute -top-0 left-4 z-10">
                <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-md font-semibold shadow-sm">
                  중식
                </span>
              </div>
              
              <button
                onClick={() => openModal('lunch')}
                className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 border-2 border-orange-200 hover:border-orange-300 hover:shadow-md transition cursor-pointer text-left min-h-[300px] md:min-h-0`}
              >
                <img
                  src={lunchImage}
                  alt="중식"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />

                {/* 메뉴 리스트 */}
                <div className="space-y-1 mb-3">
                  {selectedMeal.lunch && selectedMeal.lunch.length > 0 ? (
                    selectedMeal.lunch.map((item, idx) => (
                      <div key={idx} className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-1 flex-wrap`}>
                        <span>• {item.name}</span>
                        {item.allergens && renderAllergens(item.allergens)}
                        {item.allergens && hasUserAllergy(item.allergens) && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>오늘은 제공되지 않습니다</p>
                  )}
                </div>

                {/* 영양성분 정보 */}
                {selectedMeal.lunchNutrition && (
                  <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                      칼로리: {selectedMeal.lunchNutrition.calories} kcal · 탄수화물 {selectedMeal.lunchNutrition.carbs} g · 단백질 {selectedMeal.lunchNutrition.protein} g · 지방 {selectedMeal.lunchNutrition.fat} g
                    </p>
                  </div>
                )}
              </button>
            </div>

            {/* 석식 카드 */}
            <div className="relative pt-3">
              {/* 석식 라벨 - 카드 상단 외곽에 배치 */}
              <div className="absolute -top-0 left-4 z-10">
                <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-md font-semibold shadow-sm">
                  석식
                </span>
              </div>
              
              <button
                onClick={() => openModal('dinner')}
                className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 border-2 border-blue-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer text-left min-h-[300px] md:min-h-0`}
              >
                <img
                  src={dinnerImage}
                  alt="석식"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />

                {/* 메뉴 리스트 */}
                <div className="space-y-1 mb-3">
                  {selectedMeal.dinner && selectedMeal.dinner.length > 0 ? (
                    selectedMeal.dinner.map((item, idx) => (
                      <div key={idx} className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-1 flex-wrap`}>
                        <span>• {item.name}</span>
                        {item.allergens && renderAllergens(item.allergens)}
                        {item.allergens && hasUserAllergy(item.allergens) && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>오늘은 제공되지 않습니다</p>
                  )}
                </div>

                {/* 영양성분 정보 */}
                {selectedMeal.dinnerNutrition && (
                  <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                      칼로리: {selectedMeal.dinnerNutrition.calories} kcal · 탄수화물 {selectedMeal.dinnerNutrition.carbs} g · 단백질 {selectedMeal.dinnerNutrition.protein} g · 지방 {selectedMeal.dinnerNutrition.fat} g
                    </p>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 모달 */}
      <MealDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mealType={selectedMealType}
        weekInfo={currentWeek.week}
        day={selectedMeal.day}
        date={selectedMeal.date}
        menuItems={selectedMealType === 'lunch' ? selectedMeal.lunch : selectedMeal.dinner}
        nutrition={selectedMealType === 'lunch' ? selectedMeal.lunchNutrition : selectedMeal.dinnerNutrition}
        userAllergies={userAllergies}
      />
    </>
  );
}