import { X } from 'lucide-react';

interface MealItem {
  name: string;
  allergens?: string; // 보통 "5" 또는 "4.5" 형태
}

interface SimpleMealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  mealType: 'lunch' | 'dinner';
  meals: MealItem[];
  darkMode?: boolean;
  userAllergies?: string[]; // ✅ 추가
}

const allergenNumberMap: Record<string, number> = {
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

function parseNums(raw: string | undefined): number[] {
  if (!raw) return [];
  const tokens = String(raw).split(/[,.\s]+/).map(t => t.trim()).filter(Boolean);
  const out: number[] = [];
  for (const t of tokens) {
    if (/^\d+$/.test(t)) out.push(Number(t));
    else {
      const m = allergenNumberMap[t];
      if (m) out.push(m);
    }
  }
  return Array.from(new Set(out));
}

function userSet(userAllergies?: string[]): Set<number> {
  const s = new Set<number>();
  for (const a of userAllergies || []) {
    const t = String(a).trim();
    if (!t) continue;
    if (/^\d+$/.test(t)) s.add(Number(t));
    else {
      const m = allergenNumberMap[t];
      if (m) s.add(m);
    }
  }
  return s;
}

export function SimpleMealDetailModal({
  isOpen,
  onClose,
  date,
  mealType,
  meals,
  darkMode = false,
  userAllergies = [],
}: SimpleMealDetailModalProps) {
  if (!isOpen) return null;

  const mealTypeText = mealType === 'lunch' ? '중식' : '석식';
  const mealTypeBg = mealType === 'lunch' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700';

  const u = userSet(userAllergies);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* 헤더 */}
        <div className={`sticky top-0 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-start justify-between`}>
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>식단 상세 정보</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{formatDate(date)}</span>
              <span className={`${mealTypeBg} text-xs px-3 py-1 rounded-md font-semibold`}>{mealTypeText}</span>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition`} aria-label="닫기">
            <X className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
        </div>

        {/* 메뉴 목록 */}
        <div className="px-6 py-4 space-y-3">
          <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-3`}>메뉴</h3>

          {meals && meals.length > 0 ? (
            meals.map((item, idx) => {
              const nums = parseNums(item.allergens);
              const hasHit = nums.some(n => u.has(n));

              return (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 ${
                    darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
                  } ${hasHit ? (darkMode ? 'ring-1 ring-red-500/60' : 'ring-1 ring-red-300') : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{item.name}</h4>
                      {/* ✅ 삭제: 메뉴 밑 "알레르기 유발 식품: ..." 문구 */}
                    </div>

                    {/* ✅ 오른쪽 번호 뱃지: 내 알레르기 번호만 빨강 */}
                    {nums.length > 0 && (
                      <div className="flex flex-wrap gap-1 ml-2">
                        {nums.map((num) => {
                          const isHit = u.has(num);
                          return (
                            <span
                              key={num}
                              className={`text-xs px-2 py-1 rounded font-semibold ${
                                isHit
                                  ? (darkMode ? 'bg-red-600/30 text-red-200' : 'bg-red-200 text-red-700')
                                  : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')
                              }`}
                            >
                              {num}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={`text-center py-8 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-lg`}>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-lg mb-4`}>
                해당 날짜의 {mealTypeText}은 제공되지 않습니다.
              </p>
              <button
                onClick={onClose}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                확인
              </button>
            </div>
          )}
        </div>

        {/* 알레르기 표시 번호 안내 */}
        <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-blue-50'}`}>
          <h3 className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} text-sm mb-2`}>알레르기 표시 번호</h3>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
            1. 난류, 2. 우유, 3. 메밀, 4. 땅콩, 5. 대두, 6. 밀, 7. 고등어, 8. 게, 9. 새우,
            10. 돼지고기, 11. 복숭아, 12. 토마토, 13. 아황산류, 14. 호두, 15. 닭고기,
            16. 쇠고기, 17. 오징어, 18. 조개류
          </p>
        </div>
      </div>
    </div>
  );
}
