// src/components/TodayMeal.tsx
import { useEffect, useMemo, useState } from 'react';
import { Utensils, AlertTriangle } from 'lucide-react';
import { MealDetailModal } from './MealDetailModal';
import { getDailyMeal, type DailyMenuData } from '../api/mealplan';

interface TodayMealProps {
  userAllergies: string[];
  onNavigateToSchedule: () => void;
  darkMode?: boolean;
}

// 알레르기 번호 -> 한글명 (MealDetailModal과 동일 기준)
const ALLERGEN_NAME: Record<number, string> = {
  1: '난류',
  2: '우유',
  3: '메밀',
  4: '땅콩',
  5: '대두',
  6: '밀',
  7: '고등어',
  8: '게',
  9: '새우',
  10: '돼지고기',
  11: '복숭아',
  12: '토마토',
  13: '아황산류',
  14: '호두',
  15: '닭고기',
  16: '쇠고기',
  17: '오징어',
  18: '조개류',
};

type UiMealItem = { name: string; allergens?: string };

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function toYmd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function dowKo(d: Date) {
  return ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
}
function isWeekend(d: Date) {
  const day = d.getDay(); // 0=일, 6=토
  return day === 0 || day === 6;
}
function parseStatusFromErrorMessage(msg: string): number | null {
  // getDailyMeal()이 throw new Error("404 ...") 형태일 수 있어 메시지 앞 상태코드 파싱
  const m = String(msg || '').trim().match(/^(\d{3})\b/);
  return m ? Number(m[1]) : null;
}
function apiToUiItems(menu: DailyMenuData | null): UiMealItem[] {
  if (!menu) return [];
  const items = Object.values(menu.menu_items || {}).filter(Boolean) as any[];
  return items.map((it) => {
    const names = (it.allergens || []).map((n: number) => ALLERGEN_NAME[n]).filter(Boolean);
    return {
      name: it.name,
      allergens: names.length ? names.join(', ') : undefined,
    } as UiMealItem;
  });
}
function hasAnyMenu(menu: DailyMenuData | null): boolean {
  if (!menu || !menu.menu_items) return false;
  return Object.values(menu.menu_items).some(Boolean);
}

export function TodayMeal({ userAllergies, onNavigateToSchedule, darkMode = false }: TodayMealProps) {
  const [lunch, setLunch] = useState<DailyMenuData | null>(null);
  const [dinner, setDinner] = useState<DailyMenuData | null>(null);
  const [noMenu, setNoMenu] = useState(false); // ✅ 중간에 한 번만 "식단 없음"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'lunch' | 'dinner'>('lunch');

  const today = useMemo(() => new Date(), []);
  const dateStr = useMemo(() => toYmd(today), [today]);
  const dayKo = useMemo(() => dowKo(today), [today]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setNoMenu(false);

        // ✅ 주말은 급식 없음: API 호출 없이 중앙 "식단 없음"
        if (isWeekend(today)) {
          if (!mounted) return;
          setLunch(null);
          setDinner(null);
          setNoMenu(true);
          return;
        }

        const [l, d] = await Promise.all([
          getDailyMeal({ date: dateStr, meal_type: 'LUNCH' }),
          getDailyMeal({ date: dateStr, meal_type: 'DINNER' }),
        ]);

        if (!mounted) return;
        setLunch(l);
        setDinner(d);

        // ✅ 둘 다 비어있으면 중앙 "식단 없음"
        const lunchOk = hasAnyMenu(l);
        const dinnerOk = hasAnyMenu(d);
        setNoMenu(!lunchOk && !dinnerOk);
      } catch (e: any) {
        if (!mounted) return;

        // ✅ 404/204 = 데이터 없음 → 중앙 "식단 없음"
        const status = parseStatusFromErrorMessage(e?.message || '');
        if (status === 404 || status === 204) {
          setLunch(null);
          setDinner(null);
          setNoMenu(true);
          setError(null);
        } else {
          setError(e?.message || '식단을 불러오지 못했습니다.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [dateStr, today]);

  const lunchItems = useMemo(() => apiToUiItems(lunch), [lunch]);
  const dinnerItems = useMemo(() => apiToUiItems(dinner), [dinner]);

  const lunchNutrition = lunch?.nutrition
    ? { calories: lunch.nutrition.kcal, carbs: lunch.nutrition.carb, protein: lunch.nutrition.prot, fat: lunch.nutrition.fat }
    : undefined;

  const dinnerNutrition = dinner?.nutrition
    ? { calories: dinner.nutrition.kcal, carbs: dinner.nutrition.carb, protein: dinner.nutrition.prot, fat: dinner.nutrition.fat }
    : undefined;

  // 알레르기 항목에 사용자 알레르기가 포함되어 있는지 확인
  const hasUserAllergy = (allergens: string | undefined): boolean => {
    if (!allergens) return false;
    const allergenList = allergens.split(',').map((a) => a.trim());
    return allergenList.some((allergen) => userAllergies.includes(allergen));
  };

  const renderAllergens = (allergens: string | undefined) => {
    if (!allergens) return null;
    const allergenList = allergens.split(',').map((a) => a.trim());

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

  const openModal = (mealType: 'lunch' | 'dinner') => {
    setSelectedMealType(mealType);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <div className="text-center py-12">
          <Utensils className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>식단을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <div className="text-left">
          <h3 className={`${darkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold mb-2`}>식단을 불러오지 못했습니다</h3>
          <pre className={`text-sm whitespace-pre-wrap ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</pre>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <div className="space-y-4">
          {/* 오늘 날짜 표시 */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-teal-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
                {dayKo}요일
              </div>
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{dateStr}</span>
              <button
                onClick={onNavigateToSchedule}
                className={`ml-auto text-sm underline ${darkMode ? 'text-teal-300' : 'text-teal-600'}`}
              >
                식단표 조회
              </button>
            </div>
          </div>

          {/* ✅ 식단 없음이면 중간에 한 번만 표시 */}
          {noMenu ? (
            <div
              className={`rounded-lg border p-10 text-center ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'
              }`}
            >
              <Utensils className={`w-16 h-16 mx-auto mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-300'}`} />
              <div className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>식단 없음</div>
              <div className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                해당 날짜는 급식이 제공되지 않아요.
              </div>
            </div>
          ) : (
            // ✅ 기존 중식/석식 카드
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 중식 */}
              <div className="relative pt-3">
                <div className="absolute -top-0 left-4 z-10">
                  <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-md font-semibold shadow-sm">
                    중식
                  </span>
                </div>

                <button
                  onClick={() => openModal('lunch')}
                  className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 border-2 border-orange-200 hover:border-orange-300 hover:shadow-md transition cursor-pointer text-left min-h-[300px] md:min-h-0`}
                >
                  <div className="space-y-1 mb-3">
                    {lunchItems.length > 0 ? (
                      lunchItems.map((item, idx) => (
                        <div
                          key={idx}
                          className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-1 flex-wrap`}
                        >
                          <span>• {item.name}</span>
                          {item.allergens && renderAllergens(item.allergens)}
                          {item.allergens && hasUserAllergy(item.allergens) && (
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        (중식 데이터 없음)
                      </div>
                    )}
                  </div>

                  {lunchNutrition && (
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {lunchNutrition.calories}kcal · 탄 {lunchNutrition.carbs}g · 단 {lunchNutrition.protein}g · 지 {lunchNutrition.fat}g
                    </div>
                  )}
                </button>
              </div>

              {/* 석식 */}
              <div className="relative pt-3">
                <div className="absolute -top-0 left-4 z-10">
                  <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-md font-semibold shadow-sm">
                    석식
                  </span>
                </div>

                <button
                  onClick={() => openModal('dinner')}
                  className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 border-2 border-blue-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer text-left min-h-[300px] md:min-h-0`}
                >
                  <div className="space-y-1 mb-3">
                    {dinnerItems.length > 0 ? (
                      dinnerItems.map((item, idx) => (
                        <div
                          key={idx}
                          className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} flex items-center gap-1 flex-wrap`}
                        >
                          <span>• {item.name}</span>
                          {item.allergens && renderAllergens(item.allergens)}
                          {item.allergens && hasUserAllergy(item.allergens) && (
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        (석식 데이터 없음)
                      </div>
                    )}
                  </div>

                  {dinnerNutrition && (
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {dinnerNutrition.calories}kcal · 탄 {dinnerNutrition.carbs}g · 단 {dinnerNutrition.protein}g · 지 {dinnerNutrition.fat}g
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상세 모달: 기존 컴포넌트 재사용 */}
      <MealDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mealType={selectedMealType}
        weekInfo="오늘"
        day={dayKo}
        date={dateStr}
        menuItems={selectedMealType === 'lunch' ? lunchItems : dinnerItems}
        nutrition={selectedMealType === 'lunch' ? lunchNutrition : dinnerNutrition}
        userAllergies={userAllergies}
      />
    </>
  );
}
