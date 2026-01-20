export interface NutritionInfo {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export interface MenuItem {
  name: string;
  allergens?: string;
}

export interface DayMeal {
  day: string;
  date: string;
  lunch: MenuItem[];
  dinner: MenuItem[];
  lunchNutrition?: NutritionInfo;
  dinnerNutrition?: NutritionInfo;
}

export interface WeekData {
  week: string;
  days: DayMeal[];
}

// 1월 2주차 데이터 (오늘 날짜 기준: 1/13은 월요일)
export const weeklyMealData: WeekData[] = [
  {
    week: '1월 2주차',
    days: [
      { 
        day: '월', 
        date: '1/13', 
        lunch: [
          { name: '백미밥' },
          { name: '미역국' },
          { name: '제육볶음', allergens: '돼지고기, 대두' },
          { name: '계란찜', allergens: '난류' },
          { name: '배추김치' }
        ], 
        dinner: [
          { name: '현미밥' },
          { name: '된장찌개', allergens: '대두' },
          { name: '닭갈비', allergens: '닭고기, 밀' },
          { name: '시금치나물' },
          { name: '깍두기' }
        ],
        lunchNutrition: { calories: 720, carbs: 85, protein: 32, fat: 24 },
        dinnerNutrition: { calories: 680, carbs: 78, protein: 38, fat: 20 }
      },
      { 
        day: '화', 
        date: '1/14', 
        lunch: [
          { name: '현미밥' },
          { name: '된장찌개', allergens: '대두' },
          { name: '닭갈비', allergens: '닭고기, 밀' },
          { name: '시금치나물' },
          { name: '깍두기' }
        ], 
        dinner: [
          { name: '백미밥' },
          { name: '콩나물국', allergens: '대두' },
          { name: '갈치조림', allergens: '고등어' },
          { name: '두부조림', allergens: '대두' },
          { name: '총각김치' }
        ],
        lunchNutrition: { calories: 680, carbs: 78, protein: 38, fat: 20 },
        dinnerNutrition: { calories: 650, carbs: 72, protein: 35, fat: 18 }
      },
      { 
        day: '수', 
        date: '1/15', 
        lunch: [
          { name: '백미밥' },
          { name: '콩나물국', allergens: '대두' },
          { name: '갈치조림', allergens: '고등어' },
          { name: '두부조림', allergens: '대두' },
          { name: '총각김치' }
        ], 
        dinner: [
          { name: '보리밥' },
          { name: '김치찌개', allergens: '대두, 돼지고기' },
          { name: '불고기', allergens: '쇠고기, 대두' },
          { name: '계란말이', allergens: '난류' },
          { name: '배추김치' }
        ],
        lunchNutrition: { calories: 650, carbs: 72, protein: 35, fat: 18 },
        dinnerNutrition: { calories: 750, carbs: 82, protein: 40, fat: 28 }
      },
      { 
        day: '목', 
        date: '1/16', 
        lunch: [
          { name: '보리밥' },
          { name: '김치찌개', allergens: '대두, 돼지고기' },
          { name: '불고기', allergens: '쇠고기, 대두' },
          { name: '계란말이', allergens: '난류' },
          { name: '배추김치' }
        ], 
        dinner: [
          { name: '백미밥' },
          { name: '미역국' },
          { name: '제육볶음', allergens: '돼지고기, 대두' },
          { name: '계란찜', allergens: '난류' },
          { name: '깍두기' }
        ],
        lunchNutrition: { calories: 750, carbs: 82, protein: 40, fat: 28 },
        dinnerNutrition: { calories: 720, carbs: 85, protein: 32, fat: 24 }
      },
      { 
        day: '금', 
        date: '1/17', 
        lunch: [
          { name: '백미밥' },
          { name: '순두부찌개', allergens: '대두' },
          { name: '생선구이', allergens: '고등어' },
          { name: '콩나물무침', allergens: '대두' },
          { name: '김치' }
        ], 
        dinner: [
          { name: '현미밥' },
          { name: '육개장', allergens: '쇠고기, 대두' },
          { name: '돈까스', allergens: '돼지고기, 밀, 난류' },
          { name: '샐러드' },
          { name: '배추김치' }
        ],
        lunchNutrition: { calories: 620, carbs: 68, protein: 33, fat: 16 },
        dinnerNutrition: { calories: 780, carbs: 88, protein: 35, fat: 32 }
      },
    ]
  }
];

// 오늘 날짜 기준으로 해당 요일의 급식 데이터를 가져오는 함수
export function getTodayMeal(): DayMeal | null {
  const today = new Date();
  const dayIndex = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
  
  // 주말이면 null 반환
  if (dayIndex === 0 || dayIndex === 6) {
    return null;
  }
  
  // 월요일(1)을 0으로, 금요일(5)를 4로 매핑
  const weekdayIndex = dayIndex - 1;
  
  // 현재는 첫 번째 주차 데이터만 사용
  const currentWeek = weeklyMealData[0];
  
  return currentWeek.days[weekdayIndex] || null;
}