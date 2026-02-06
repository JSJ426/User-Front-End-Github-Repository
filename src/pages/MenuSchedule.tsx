import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { SimpleMealDetailModal } from '../components/SimpleMealDetailModal';
import { getMonthlyMealPlan, type MonthlyMealPlanData } from '../api/mealplan';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

/* =========================
   날짜 유틸 (🔥 KST 밀림 방지)
   ========================= */
const pad2 = (n: number) => String(n).padStart(2, '0');

const toYmdLocal = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// "YYYY-MM-DD" -> local Date (UTC 파싱 방지)
const parseYmdLocal = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// 주말이면 가장 가까운 평일로 보정 (스크롤/포커스용)
function getClosestWeekday(date: Date): Date {
  const day = date.getDay();
  if (day === 6) return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1); // 토 -> 금
  if (day === 0) return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1); // 일 -> 월
  return date;
}

/* =========================
   타입
   ========================= */
interface MealItem {
  name: string;
  allergens?: string;
}

interface DayMeal {
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  lunch: MealItem[];
  dinner: MealItem[];
}

interface MenuScheduleProps {
  darkMode?: boolean;
}

export function MenuSchedule({ darkMode = false }: MenuScheduleProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<DayMeal | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<'lunch' | 'dinner'>('lunch');

  const [showHint, setShowHint] = useState(false);
  const [isMobileCalendarActive, setIsMobileCalendarActive] = useState(false);
  const [minScale, setMinScale] = useState(0.4);

  const containerRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);

  const [monthMeals, setMonthMeals] = useState<Record<string, DayMeal>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const todayIso = toYmdLocal(today);

  // "포커스 날짜"(강조/스크롤용): 주말이면 가장 가까운 평일로 보정
  const focusDateIso = toYmdLocal(getClosestWeekday(today));

  /* =========================
     힌트 (최초 진입 1회)
     ========================= */
  useEffect(() => {
    const hintShown = localStorage.getItem('calendarHintShown');
    if (!hintShown) setShowHint(true);
  }, []);

  const handleCloseHint = () => {
    setShowHint(false);
    localStorage.setItem('calendarHintShown', 'true');
  };

  /* =========================
     월 변경 시 월간 API 로드
     ========================= */
  useEffect(() => {
    let mounted = true;

    async function loadMonth() {
      try {
        setLoading(true);
        setError(null);

        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // 1~12
        const data: MonthlyMealPlanData = await getMonthlyMealPlan({ year, month });

        const meals: Record<string, DayMeal> = {};

        for (const m of data.menus || []) {
          const dateStr = m.date; // ✅ API 날짜 그대로 (YYYY-MM-DD)
          const d = parseYmdLocal(dateStr); // ✅ 로컬 파싱
          const dow = d.getDay();

          // ✅ 주말은 표시 안 하므로 데이터도 무시
          if (dow === 0 || dow === 6) continue;

          const dayOfWeekStr = ['일', '월', '화', '수', '목', '금', '토'][dow];

          if (!meals[dateStr]) {
            meals[dateStr] = {
              date: dateStr,
              dayOfWeek: dayOfWeekStr,
              lunch: [],
              dinner: [],
            };
          }

          const items = (Object.values(m.menu_items || {}).filter(Boolean) as any[]).map((it) => ({
            name: it.name,
            // SimpleMealDetailModal이 '.'로 split -> '.' join 유지
            allergens: (it.allergens || []).map(String).join('.'),
          }));

          if (m.meal_type === 'LUNCH') meals[dateStr].lunch = items;
          if (m.meal_type === 'DINNER') meals[dateStr].dinner = items;
        }

        if (!mounted) return;
        setMonthMeals(meals);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || '식단표를 불러오지 못했습니다.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadMonth();
    return () => {
      mounted = false;
    };
  }, [currentMonth]);

  /* =========================
     ✅ 식단표 구조(월~금 5열) 배치 생성
     - 주말은 표시 X
     - 하지만 "주(week) 끊기"에는 반영 (토요일에서 주 마감)
     - date key는 toISOString 금지, 로컬 YYYY-MM-DD 사용
     ========================= */
  const calendar = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth(); // 0~11
    const lastDay = new Date(year, month + 1, 0).getDate();

    const weeks: (DayMeal | null)[][] = [];
    let week: (DayMeal | null)[] = [null, null, null, null, null]; // 월~금

    const pushWeekIfHasAny = () => {
      if (week.some(Boolean)) weeks.push([...week]);
      week = [null, null, null, null, null];
    };

    for (let day = 1; day <= lastDay; day++) {
      const d = new Date(year, month, day); // 로컬
      const dow = d.getDay(); // 0(일)~6(토)

      // 주말은 표시 안 함. 단, 토요일은 "주 마감" 트리거.
      if (dow === 0 || dow === 6) {
        if (dow === 6) pushWeekIfHasAny(); // ✅ 토요일이면 주 마감
        continue;
      }

      const col = dow - 1; // 월=0 .. 금=4

      // 안전장치: 월요일인데 기존 week에 데이터가 있으면 마감
      if (col === 0 && week.some(Boolean)) pushWeekIfHasAny();

      const dateStr = toYmdLocal(d); // ✅ API 키와 동일 포맷
      const dayOfWeekStr = ['일', '월', '화', '수', '목', '금', '토'][dow];

      week[col] =
        monthMeals[dateStr] ?? {
          date: dateStr,
          dayOfWeek: dayOfWeekStr,
          lunch: [],
          dinner: [],
        };
    }

    // 마지막 주
    pushWeekIfHasAny();
    return weeks;
  }, [currentMonth, monthMeals]);

  /* =========================
     minScale 계산
     ========================= */
  useEffect(() => {
    const calculateMinScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight || window.innerHeight * 0.7;

      const calendarWidth = 850 + 32; // min-width + padding
      const calendarHeight = calendar.length * 200 + calendar.length * 12 + 100;

      const scaleByWidth = containerWidth / calendarWidth;
      const scaleByHeight = containerHeight / calendarHeight;

      const calculatedMinScale = Math.min(scaleByWidth, scaleByHeight, 1);
      setMinScale(Math.max(0.3, calculatedMinScale));
    };

    calculateMinScale();
    window.addEventListener('resize', calculateMinScale);
    return () => window.removeEventListener('resize', calculateMinScale);
  }, [calendar.length]);

  /* =========================
     모바일 캘린더 활성화 시 body 스크롤 방지
     ========================= */
  useEffect(() => {
    if (isMobileCalendarActive) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isMobileCalendarActive]);

  /* =========================
     포커스 날짜 자동 스크롤
     ========================= */
  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (meal: DayMeal, mealType: 'lunch' | 'dinner') => {
    setSelectedDate(meal);
    setSelectedMealType(mealType);
  };

  const isToday = (dateStr: string) => dateStr === todayIso;
  const isFocusDate = (dateStr: string) => dateStr === focusDateIso;

  if (loading) {
    return <div className={`p-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>식단표를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className={`p-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
          식단표를 불러오지 못했습니다
        </h3>
        <pre className={`text-sm whitespace-pre-wrap ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>식단표 조회</h1>
        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>급식 식단을 확인하세요</p>
      </div>

      {/* 월간 식단표 */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        {/* 월 이동 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className={`p-2 rounded-full transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </h2>

          <button
            onClick={handleNextMonth}
            className={`p-2 rounded-full transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 데스크톱 */}
        <div className="hidden md:grid grid-cols-5 gap-3">
          {/* 요일 헤더 */}
          {['월', '화', '수', '목', '금'].map((day) => (
            <div key={day} className={`text-center font-semibold py-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {day}
            </div>
          ))}

          {/* 날짜 셀 */}
          {calendar.flat().map((dayMeal, index) => {
            if (!dayMeal) return <div key={index} className="min-h-[200px]" />;

            const dateNum = parseYmdLocal(dayMeal.date).getDate();

            const current = isToday(dayMeal.date);
            const focus = isFocusDate(dayMeal.date);

            const hasLunch = dayMeal.lunch.length > 0;
            const hasDinner = dayMeal.dinner.length > 0;
            const hasMeal = hasLunch || hasDinner;

            return (
              <div
                key={index}
                ref={focus ? focusRef : null}
                className={`min-h-[200px] border rounded-lg p-3 flex flex-col ${
                  current || focus
                    ? darkMode
                      ? 'border-teal-500 border-2 bg-teal-900/20'
                      : 'border-teal-500 border-2 bg-teal-50'
                    : darkMode
                    ? 'border-gray-700'
                    : 'border-gray-200'
                } ${!hasMeal ? 'opacity-60' : ''}`}
              >
                {/* 날짜 */}
                <div
                  className={`text-sm font-medium mb-3 ${
                    current || focus
                      ? darkMode
                        ? 'text-teal-400 font-bold'
                        : 'text-teal-600 font-bold'
                      : darkMode
                      ? 'text-gray-300'
                      : 'text-gray-700'
                  }`}
                >
                  {dateNum}
                  {current && (
                    <span className={`ml-1 text-xs ${darkMode ? 'text-teal-300' : 'text-teal-500'}`}>(오늘)</span>
                  )}
                </div>

                {/* 식단 내용 */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {/* 중식 */}
                  {hasLunch ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateClick(dayMeal, 'lunch');
                      }}
                      className={`w-full text-left space-y-1 p-2 rounded-md transition ${
                        darkMode ? 'hover:bg-orange-900/20 active:bg-orange-900/30' : 'hover:bg-orange-50 active:bg-orange-100'
                      }`}
                    >
                      <div
                        className={`text-xs px-2 py-1 rounded inline-block ${
                          darkMode ? 'bg-orange-900/40 text-orange-300' : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        중식
                      </div>
                      <div className="space-y-0.5">
                        {dayMeal.lunch.map((item, idx) => (
                          <div key={idx} className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            • {item.name}
                          </div>
                        ))}
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateClick(dayMeal, 'lunch');
                      }}
                      className={`w-full text-left space-y-1 p-2 rounded-md transition opacity-50 ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`text-xs px-2 py-1 rounded inline-block ${
                          darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        중식
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>식단 없음</div>
                    </button>
                  )}

                  {/* 석식 */}
                  {hasDinner ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateClick(dayMeal, 'dinner');
                      }}
                      className={`w-full text-left space-y-1 p-2 rounded-md transition ${
                        darkMode ? 'hover:bg-blue-900/20 active:bg-blue-900/30' : 'hover:bg-blue-50 active:bg-blue-100'
                      }`}
                    >
                      <div
                        className={`text-xs px-2 py-1 rounded inline-block ${
                          darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        석식
                      </div>
                      <div className="space-y-0.5">
                        {dayMeal.dinner.map((item, idx) => (
                          <div key={idx} className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            • {item.name}
                          </div>
                        ))}
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateClick(dayMeal, 'dinner');
                      }}
                      className={`w-full text-left space-y-1 p-2 rounded-md transition opacity-50 ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className={`text-xs px-2 py-1 rounded inline-block ${
                          darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        석식
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>식단 없음</div>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 모바일 */}
        <div
          ref={containerRef}
          className="md:hidden relative"
          onTouchStart={() => setIsMobileCalendarActive(true)}
          onTouchEnd={() => setIsMobileCalendarActive(false)}
        >
          <TransformWrapper
            initialScale={minScale}
            minScale={minScale}
            maxScale={2.5}
            centerOnInit={true}
            wheel={{ disabled: true }}
            panning={{ disabled: false, velocityDisabled: true }}
            doubleClick={{ disabled: false, mode: 'reset' }}
            limitToBounds={false}
            centerZoomedOut={true}
            disablePadding={false}
            alignmentAnimation={{ disabled: true }}
            velocityAnimation={{ disabled: true }}
          >
            {({ resetTransform }) => (
              <>
                <TransformComponent
                  wrapperStyle={{
                    width: '100%',
                    height: '70vh',
                    overflow: 'hidden',
                    touchAction: 'none',
                  }}
                >
                  <div className="w-full h-full flex items-start justify-start p-4">
                    <div className="min-w-[850px]">
                      {/* 요일 헤더 */}
                      <div className="grid grid-cols-5 gap-3 mb-3">
                        {['월', '화', '수', '목', '금'].map((day) => (
                          <div
                            key={day}
                            className={`text-center font-semibold py-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* 날짜 셀 */}
                      <div className="grid grid-cols-5 gap-3">
                        {calendar.flat().map((dayMeal, index) => {
                          if (!dayMeal) return <div key={index} className="min-h-[200px]" />;

                          const dateNum = parseYmdLocal(dayMeal.date).getDate();
                          const current = isToday(dayMeal.date);
                          const focus = isFocusDate(dayMeal.date);

                          const hasLunch = dayMeal.lunch.length > 0;
                          const hasDinner = dayMeal.dinner.length > 0;
                          const hasMeal = hasLunch || hasDinner;

                          return (
                            <div
                              key={index}
                              className={`min-h-[200px] border rounded-lg p-3 flex flex-col ${
                                current || focus
                                  ? darkMode
                                    ? 'border-teal-500 border-2 bg-teal-900/20'
                                    : 'border-teal-500 border-2 bg-teal-50'
                                  : darkMode
                                  ? 'border-gray-700'
                                  : 'border-gray-200'
                              } ${!hasMeal ? 'opacity-60' : ''}`}
                            >
                              <div
                                className={`text-sm font-medium mb-3 ${
                                  current || focus
                                    ? darkMode
                                      ? 'text-teal-400 font-bold'
                                      : 'text-teal-600 font-bold'
                                    : darkMode
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                }`}
                              >
                                {dateNum}
                                {current && (
                                  <span className={`ml-1 text-xs ${darkMode ? 'text-teal-300' : 'text-teal-500'}`}>
                                    (오늘)
                                  </span>
                                )}
                              </div>

                              <div className="flex-1 space-y-3 overflow-y-auto">
                                {/* 중식 */}
                                {hasLunch ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDateClick(dayMeal, 'lunch');
                                    }}
                                    className={`w-full text-left space-y-1 p-2 rounded-md transition ${
                                      darkMode
                                        ? 'hover:bg-orange-900/20 active:bg-orange-900/30'
                                        : 'hover:bg-orange-50 active:bg-orange-100'
                                    }`}
                                  >
                                    <div
                                      className={`text-xs px-2 py-1 rounded inline-block ${
                                        darkMode ? 'bg-orange-900/40 text-orange-300' : 'bg-orange-100 text-orange-700'
                                      }`}
                                    >
                                      중식
                                    </div>
                                    <div className="space-y-0.5">
                                      {dayMeal.lunch.map((item, idx) => (
                                        <div key={idx} className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                          • {item.name}
                                        </div>
                                      ))}
                                    </div>
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDateClick(dayMeal, 'lunch');
                                    }}
                                    className={`w-full text-left space-y-1 p-2 rounded-md transition opacity-50 ${
                                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <div
                                      className={`text-xs px-2 py-1 rounded inline-block ${
                                        darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                                      }`}
                                    >
                                      중식
                                    </div>
                                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>식단 없음</div>
                                  </button>
                                )}

                                {/* 석식 */}
                                {hasDinner ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDateClick(dayMeal, 'dinner');
                                    }}
                                    className={`w-full text-left space-y-1 p-2 rounded-md transition ${
                                      darkMode
                                        ? 'hover:bg-blue-900/20 active:bg-blue-900/30'
                                        : 'hover:bg-blue-50 active:bg-blue-100'
                                    }`}
                                  >
                                    <div
                                      className={`text-xs px-2 py-1 rounded inline-block ${
                                        darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'
                                      }`}
                                    >
                                      석식
                                    </div>
                                    <div className="space-y-0.5">
                                      {dayMeal.dinner.map((item, idx) => (
                                        <div key={idx} className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                          • {item.name}
                                        </div>
                                      ))}
                                    </div>
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDateClick(dayMeal, 'dinner');
                                    }}
                                    className={`w-full text-left space-y-1 p-2 rounded-md transition opacity-50 ${
                                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <div
                                      className={`text-xs px-2 py-1 rounded inline-block ${
                                        darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                                      }`}
                                    >
                                      석식
                                    </div>
                                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>식단 없음</div>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </TransformComponent>

                {/* 전체 보기 버튼 */}
                <button
                  onClick={() => resetTransform()}
                  className={`absolute bottom-4 right-4 p-3 rounded-full shadow-lg transition z-10 ${
                    darkMode ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'bg-teal-500 hover:bg-teal-600 text-white'
                  }`}
                  aria-label="전체 보기"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
              </>
            )}
          </TransformWrapper>
        </div>
      </div>

      {/* 식단 상세 모달 */}
      {selectedDate && (
        <SimpleMealDetailModal
          isOpen={true}
          onClose={() => setSelectedDate(null)}
          date={selectedDate.date}
          mealType={selectedMealType}
          meals={selectedMealType === 'lunch' ? selectedDate.lunch : selectedDate.dinner}
          darkMode={darkMode}
        />
      )}

      {/* 힌트 모달 */}
      {showHint && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-xl max-w-sm w-full`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>💡 모바일 사용 팁</h2>
              <button
                onClick={handleCloseHint}
                className={`p-2 rounded-full transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
            <div className={`space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>
                👆 <strong>두 손가락으로 핀치</strong>하여 확대/축소하세요
              </p>
              <p>
                ✋ <strong>한 손가락으로 드래그</strong>하여 캘린더를 이동할 수 있어요
              </p>
              <p>
                👌 <strong>더블 탭</strong>하면 원래 크기로 돌아갑니다
              </p>
            </div>
            <button
              onClick={handleCloseHint}
              className={`mt-6 w-full py-2 px-4 rounded-lg font-medium transition ${
                darkMode ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'bg-teal-500 hover:bg-teal-600 text-white'
              }`}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
