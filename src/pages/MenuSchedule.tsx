import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { SimpleMealDetailModal } from '../components/SimpleMealDetailModal';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// 식단 데이터 타입
interface MealItem {
  name: string;
  allergens?: string;
}

interface DayMeal {
  date: string;
  dayOfWeek: string;
  lunch: MealItem[];
  dinner: MealItem[];
}

// 2026년 1월 식단 데이터 (예시)
const january2026Meals: DayMeal[] = [
  {
    date: '2026-01-01',
    dayOfWeek: '수',
    lunch: [],
    dinner: [],
  },
  {
    date: '2026-01-02',
    dayOfWeek: '목',
    lunch: [
      { name: '현미밥', allergens: '' },
      { name: '된장찌개', allergens: '5.6' },
      { name: '제육볶음', allergens: '5.6.10' },
      { name: '계란찜', allergens: '1' },
      { name: '배추김치', allergens: '9' },
    ],
    dinner: [
      { name: '쌀밥', allergens: '' },
      { name: '미역국', allergens: '5.6' },
      { name: '닭강정', allergens: '1.5.6.13' },
      { name: '숙주나물', allergens: '5' },
      { name: '깍두기', allergens: '9' },
    ],
  },
  {
    date: '2026-01-03',
    dayOfWeek: '금',
    lunch: [
      { name: '비빔밥', allergens: '1.5.6.16' },
      { name: '���버섯된장국', allergens: '5.6' },
      { name: '고등어구이', allergens: '7' },
      { name: '브로콜리무침', allergens: '5' },
      { name: '배추김치', allergens: '9' },
    ],
    dinner: [
      { name: '카레라이스', allergens: '2.5.6.13' },
      { name: '콘스프', allergens: '2.5.6' },
      { name: '돈까스', allergens: '1.5.6.10' },
      { name: '단무지', allergens: '' },
      { name: '깍두기', allergens: '9' },
    ],
  },
  // 더 많은 날짜 추가...
];

interface MenuScheduleProps {
  darkMode?: boolean;
}

export function MenuSchedule({ darkMode = false }: MenuScheduleProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // 2026년 1월
  const [selectedDate, setSelectedDate] = useState<DayMeal | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<'lunch' | 'dinner'>('lunch');
  const [showHint, setShowHint] = useState(false);
  const [isMobileCalendarActive, setIsMobileCalendarActive] = useState(false);
  const [minScale, setMinScale] = useState(0.4);
  const containerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  
  const today = new Date(2026, 0, 29); // 2026년 1월 29일 (오늘)

  // 힌트 표시 체크 (최초 진입 시에만)
  useEffect(() => {
    const hintShown = localStorage.getItem('calendarHintShown');
    if (!hintShown) {
      setShowHint(true);
    }
  }, []);

  const handleCloseHint = () => {
    setShowHint(false);
    localStorage.setItem('calendarHintShown', 'true');
  };

  // 오늘이 주말인 경우 가장 가까운 평일 찾기
  const getClosestWeekday = (date: Date): Date => {
    const day = date.getDay();
    
    // 토요일(6)인 경우 금요일로
    if (day === 6) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    }
    // 일요일(0)인 경우 월요일로
    if (day === 0) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }
    
    return date;
  };

  const focusDate = getClosestWeekday(today);

  // 월간 캘린더 생성 (월~금만, 주 단위 배열)
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const weeks: (DayMeal | null)[][] = [];
    let currentWeek: (DayMeal | null)[] = [];
    
    // 첫 주 시작 전 빈 칸 추가 (월요일 기준)
    const startDayOfWeek = firstDay.getDay();
    const offset = startDayOfWeek === 0 ? 4 : startDayOfWeek - 1; // 일요일이면 4칸, 아니면 (요일-1)칸
    
    for (let i = 0; i < offset; i++) {
      currentWeek.push(null);
    }
    
    // 날짜 추가 (평일만)
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      
      // 토요일(6) 또는 일요일(0)이면 건너뛰기
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // 금요일 다음이 토요일이면 주를 완성하고 다음 주로
        if (dayOfWeek === 6 && currentWeek.length > 0) {
          while (currentWeek.length < 5) {
            currentWeek.push(null);
          }
          weeks.push([...currentWeek]);
          currentWeek = [];
        }
        continue;
      }
      
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeekStr = ['일', '월', '화', '수', '목', '금', '토'][dayOfWeek];
      
      const meal = january2026Meals.find(m => m.date === dateStr);
      
      if (meal) {
        currentWeek.push(meal);
      } else {
        // 기본 식단 데이터 생성
        currentWeek.push({
          date: dateStr,
          dayOfWeek: dayOfWeekStr,
          lunch: [
            { name: '백미밥', allergens: '' },
            { name: '된장찌개', allergens: '5.6' },
            { name: '주메뉴', allergens: '' },
            { name: '부메뉴', allergens: '' },
            { name: '김치', allergens: '9' },
          ],
          dinner: [
            { name: '백미밥', allergens: '' },
            { name: '국', allergens: '5.6' },
            { name: '주메뉴', allergens: '' },
            { name: '부메뉴', allergens: '' },
            { name: '김치', allergens: '9' },
          ],
        });
      }
      
      // 주가 끝나면 (5칸) weeks에 추가하고 새 주 시작
      if (currentWeek.length === 5) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    }
    
    // 마지막 주 추가
    if (currentWeek.length > 0) {
      // 마지막 주를 5칸으로 채우기
      while (currentWeek.length < 5) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const calendar = generateCalendar();

  // minScale 계산
  useEffect(() => {
    const calculateMinScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight || window.innerHeight * 0.7;
        
        // 캘린더 고정 크기 (요일 헤더 + 셀 높이 계산)
        const calendarWidth = 850 + 32; // min-width + padding
        const calendarHeight = calendar.length * 200 + calendar.length * 12 + 100; // 셀 높이 * 주 수 + gap + 여유
        
        // 화면에 맞는 최소 배율 계산
        const scaleByWidth = containerWidth / calendarWidth;
        const scaleByHeight = containerHeight / calendarHeight;
        
        // 더 작은 값을 minScale로 설정 (전체가 보이도록)
        const calculatedMinScale = Math.min(scaleByWidth, scaleByHeight, 1);
        
        setMinScale(Math.max(0.3, calculatedMinScale)); // 최소 0.3 보장
      }
    };
    
    calculateMinScale();
    window.addEventListener('resize', calculateMinScale);
    
    return () => {
      window.removeEventListener('resize', calculateMinScale);
    };
  }, [calendar.length]);

  // 모바일 캘린더 활성화 시 body 스크롤 방지
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

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (meal: DayMeal, mealType: 'lunch' | 'dinner') => {
    const meals = mealType === 'lunch' ? meal.lunch : meal.dinner;
    
    // 해당 식사가 없는 경우에도 모달을 열어서 안내 메시지 표시
    setSelectedDate(meal);
    setSelectedMealType(mealType);
  };

  const isToday = (dateStr: string) => {
    return dateStr === today.toISOString().split('T')[0];
  };

  const isFocusDate = (dateStr: string) => {
    return dateStr === focusDate.toISOString().split('T')[0];
  };

  // 오늘 날짜 셀로 자동 스크롤
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentMonth]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>
          식단표 조회
        </h1>
        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
          급식 식단을 확인하세요
        </p>
      </div>

      {/* 월간 식단표 */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        {/* 월 이동 컨트롤 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className={`p-2 rounded-full transition ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </h2>

          <button
            onClick={handleNextMonth}
            className={`p-2 rounded-full transition ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 캘린더 그리드 */}
        {/* 데스크톱 버전 (md 이상) */}
        <div className="hidden md:grid grid-cols-5 gap-3">
          {/* 요일 헤더 */}
          {['월', '화', '수', '목', '금'].map((day) => (
            <div
              key={day}
              className={`text-center font-semibold py-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {day}
            </div>
          ))}

          {/* 날짜 셀 */}
          {calendar.flat().map((dayMeal, index) => {
            if (!dayMeal) {
              return <div key={index} className="min-h-[200px]" />;
            }

            const date = new Date(dayMeal.date);
            const isCurrentDay = isToday(dayMeal.date);
            const isFocus = isFocusDate(dayMeal.date);
            const hasLunch = dayMeal.lunch.length > 0;
            const hasDinner = dayMeal.dinner.length > 0;
            const hasMeal = hasLunch || hasDinner;

            return (
              <div
                key={index}
                ref={isFocus ? todayRef : null}
                className={`min-h-[200px] border rounded-lg p-3 flex flex-col ${
                  isCurrentDay || isFocus
                    ? darkMode
                      ? 'border-teal-500 border-2 bg-teal-900/20'
                      : 'border-teal-500 border-2 bg-teal-50'
                    : darkMode
                    ? 'border-gray-700'
                    : 'border-gray-200'
                } ${!hasMeal ? 'opacity-60' : ''}`}
              >
                {/* 날짜 */}
                <div className={`text-sm font-medium mb-3 ${
                  isCurrentDay || isFocus
                    ? darkMode
                      ? 'text-teal-400 font-bold'
                      : 'text-teal-600 font-bold'
                    : darkMode
                    ? 'text-gray-300'
                    : 'text-gray-700'
                }`}>
                  {date.getDate()}
                  {isCurrentDay && (
                    <span className={`ml-1 text-xs ${
                      darkMode ? 'text-teal-300' : 'text-teal-500'
                    }`}>
                      (오늘)
                    </span>
                  )}
                </div>
                
                {/* 식단 내용 */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {/* 중식 섹션 */}
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
                      <div className={`text-xs px-2 py-1 rounded inline-block ${
                        darkMode
                          ? 'bg-orange-900/40 text-orange-300'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        중식
                      </div>
                      <div className="space-y-0.5">
                        {dayMeal.lunch.map((item, idx) => (
                          <div
                            key={idx}
                            className={`text-xs ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
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
                        darkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-xs px-2 py-1 rounded inline-block ${
                        darkMode
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        중식
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        식단 없음
                      </div>
                    </button>
                  )}
                  
                  {/* 석식 섹션 */}
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
                      <div className={`text-xs px-2 py-1 rounded inline-block ${
                        darkMode
                          ? 'bg-blue-900/40 text-blue-300'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        석식
                      </div>
                      <div className="space-y-0.5">
                        {dayMeal.dinner.map((item, idx) => (
                          <div
                            key={idx}
                            className={`text-xs ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
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
                        darkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-xs px-2 py-1 rounded inline-block ${
                        darkMode
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        석식
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        식단 없음
                      </div>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 모바일 버전 (md 미만) - 캔버스 UI */}
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
            panning={{ 
              disabled: false,
              velocityDisabled: true
            }}
            doubleClick={{ 
              disabled: false,
              mode: 'reset'
            }}
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
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <div className="w-full h-full flex items-start justify-start p-4">
                    <div className="min-w-[850px]">
                      {/* 요일 헤더 */}
                      <div className="grid grid-cols-5 gap-3 mb-3">
                        {['월', '화', '수', '목', '금'].map((day) => (
                          <div
                            key={day}
                            className={`text-center font-semibold py-2 ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* 날짜 셀 */}
                      <div className="grid grid-cols-5 gap-3">
                        {calendar.flat().map((dayMeal, index) => {
                          if (!dayMeal) {
                            return <div key={index} className="min-h-[200px]" />;
                          }

                          const date = new Date(dayMeal.date);
                          const isCurrentDay = isToday(dayMeal.date);
                          const isFocus = isFocusDate(dayMeal.date);
                          const hasLunch = dayMeal.lunch.length > 0;
                          const hasDinner = dayMeal.dinner.length > 0;
                          const hasMeal = hasLunch || hasDinner;

                          return (
                            <div
                              key={index}
                              className={`min-h-[200px] border rounded-lg p-3 flex flex-col ${
                                isCurrentDay || isFocus
                                  ? darkMode
                                    ? 'border-teal-500 border-2 bg-teal-900/20'
                                    : 'border-teal-500 border-2 bg-teal-50'
                                  : darkMode
                                  ? 'border-gray-700'
                                  : 'border-gray-200'
                              } ${!hasMeal ? 'opacity-60' : ''}`}
                            >
                              {/* 날짜 */}
                              <div className={`text-sm font-medium mb-3 ${
                                isCurrentDay || isFocus
                                  ? darkMode
                                    ? 'text-teal-400 font-bold'
                                    : 'text-teal-600 font-bold'
                                  : darkMode
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }`}>
                                {date.getDate()}
                                {isCurrentDay && (
                                  <span className={`ml-1 text-xs ${
                                    darkMode ? 'text-teal-300' : 'text-teal-500'
                                  }`}>
                                    (오늘)
                                  </span>
                                )}
                              </div>
                              
                              {/* 식단 내용 */}
                              <div className="flex-1 space-y-3 overflow-y-auto">
                                {/* 중식 섹션 */}
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
                                    <div className={`text-xs px-2 py-1 rounded inline-block ${
                                      darkMode
                                        ? 'bg-orange-900/40 text-orange-300'
                                        : 'bg-orange-100 text-orange-700'
                                    }`}>
                                      중식
                                    </div>
                                    <div className="space-y-0.5">
                                      {dayMeal.lunch.map((item, idx) => (
                                        <div
                                          key={idx}
                                          className={`text-xs ${
                                            darkMode ? 'text-gray-400' : 'text-gray-600'
                                          }`}
                                        >
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
                                      darkMode
                                        ? 'hover:bg-gray-700'
                                        : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className={`text-xs px-2 py-1 rounded inline-block ${
                                      darkMode
                                        ? 'bg-gray-700 text-gray-400'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                      중식
                                    </div>
                                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                      식단 없음
                                    </div>
                                  </button>
                                )}
                                
                                {/* 석식 섹션 */}
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
                                    <div className={`text-xs px-2 py-1 rounded inline-block ${
                                      darkMode
                                        ? 'bg-blue-900/40 text-blue-300'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      석식
                                    </div>
                                    <div className="space-y-0.5">
                                      {dayMeal.dinner.map((item, idx) => (
                                        <div
                                          key={idx}
                                          className={`text-xs ${
                                            darkMode ? 'text-gray-400' : 'text-gray-600'
                                          }`}
                                        >
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
                                      darkMode
                                        ? 'hover:bg-gray-700'
                                        : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className={`text-xs px-2 py-1 rounded inline-block ${
                                      darkMode
                                        ? 'bg-gray-700 text-gray-400'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                      석식
                                    </div>
                                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                      식단 없음
                                    </div>
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
                    darkMode
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-teal-500 hover:bg-teal-600 text-white'
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
              <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                💡 모바일 사용 팁
              </h2>
              <button
                onClick={handleCloseHint}
                className={`p-2 rounded-full transition ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
            <div className={`space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>👆 <strong>두 손가락으로 핀치</strong>하여 확대/축소하세요</p>
              <p>✋ <strong>한 손가락으로 드래그</strong>하여 캘린더를 이동할 수 있어요</p>
              <p>👌 <strong>더블 탭</strong>하면 원래 크기로 돌아갑니다</p>
            </div>
            <button
              onClick={handleCloseHint}
              className={`mt-6 w-full py-2 px-4 rounded-lg font-medium transition ${
                darkMode
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-teal-500 hover:bg-teal-600 text-white'
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