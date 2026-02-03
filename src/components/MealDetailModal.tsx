import { X, AlertTriangle } from 'lucide-react';
import { MenuItem, NutritionInfo } from '../data/mealData';

interface MealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: 'lunch' | 'dinner';
  weekInfo: string;
  day: string;
  date: string;
  menuItems: MenuItem[];
  nutrition?: NutritionInfo;
  userAllergies: string[];
}

// 알레르기 유발 식품 번호 매핑
const allergenNumberMap: { [key: string]: number } = {
  '난류': 1,
  '우유': 2,
  '메밀': 3,
  '땅콩': 4,
  '대두': 5,
  '밀': 6,
  '고등어': 7,
  '게': 8,
  '새우': 9,
  '돼지고기': 10,
  '복숭아': 11,
  '토마토': 12,
  '아황산류': 13,
  '호두': 14,
  '닭고기': 15,
  '쇠고기': 16,
  '오징어': 17,
  '조개류': 18,
};

// 알레르기 텍스트를 숫자로 변환
const getAllergenNumbers = (allergens: string | undefined): number[] => {
  if (!allergens) return [];
  const allergenList = allergens.split(',').map(a => a.trim());
  return allergenList
    .map(allergen => allergenNumberMap[allergen])
    .filter(num => num !== undefined);
};

export function MealDetailModal({
  isOpen,
  onClose,
  mealType,
  weekInfo,
  day,
  date,
  menuItems,
  nutrition,
  userAllergies,
}: MealDetailModalProps) {
  if (!isOpen) return null;

  const mealTypeText = mealType === 'lunch' ? '중식' : '석식';
  const mealTypeColor = mealType === 'lunch' ? 'orange' : 'blue';

  // 사용자 알레르기가 포함된 메뉴인지 확인
  const hasUserAllergy = (allergens: string | undefined): boolean => {
    if (!allergens) return false;
    const allergenList = allergens.split(',').map(a => a.trim());
    return allergenList.some(allergen => userAllergies.includes(allergen));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">식단 상세 정보</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-600 text-sm">{weekInfo} · {day}요일 ({date})</span>
              <span className={`bg-${mealTypeColor}-500 text-white text-xs px-3 py-1 rounded-md font-semibold`}>
                {mealTypeText}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="닫기"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* 메뉴 목록 */}
        <div className="px-6 py-4 space-y-3">
          <h3 className="font-semibold text-gray-800 mb-3">메뉴</h3>
          {menuItems.length > 0 ? (
            menuItems.map((item, idx) => {
              const allergenNumbers = getAllergenNumbers(item.allergens);
              const isUserAllergyItem = hasUserAllergy(item.allergens);

              return (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${
                    isUserAllergyItem
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        {isUserAllergyItem && (
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      {item.allergens && (
                        <p className="text-xs text-gray-500 mt-1">
                          알레르기 유발 식품: {item.allergens}
                        </p>
                      )}
                    </div>
                    {allergenNumbers.length > 0 && (
                      <div className="flex flex-wrap gap-1 ml-2">
                        {allergenNumbers.map((num) => (
                          <span
                            key={num}
                            className={`text-xs px-2 py-1 rounded font-semibold ${
                              isUserAllergyItem
                                ? 'bg-red-200 text-red-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-6">메뉴 정보가 없습니다.</p>
          )}
        </div>

        {/* 영양 정보 */}
        {nutrition && (
          <div className="px-6 py-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">영양 정보</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">총열량</p>
                <p className="text-lg font-semibold text-gray-800">{nutrition.calories} kcal</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">탄수화물</p>
                <p className="text-lg font-semibold text-gray-800">{nutrition.carbs} g</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">단백질</p>
                <p className="text-lg font-semibold text-gray-800">{nutrition.protein} g</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">지방</p>
                <p className="text-lg font-semibold text-gray-800">{nutrition.fat} g</p>
              </div>
            </div>
          </div>
        )}

        {/* 알레르기 표시 번호 안내 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-blue-50">
          <h3 className="font-semibold text-gray-800 text-sm mb-2">알레르기 표시 번호</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            1. 난류, 2. 우유, 3. 메밀, 4. 땅콩, 5. 대두, 6. 밀, 7. 고등어, 8. 게, 9. 새우, 
            10. 돼지고기, 11. 복숭아, 12. 토마토, 13. 아황산류, 14. 호두, 15. 닭고기, 
            16. 쇠고기, 17. 오징어, 18. 조개류
          </p>
        </div>
      </div>
    </div>
  );
}
