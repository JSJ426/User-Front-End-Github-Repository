export type MealType = 'LUNCH' | 'DINNER';

export type ApiMenuItem = {
  id: string;
  name: string;
  display: string;
  allergens: number[];
};

export type DailyMenuData = {
  menu_id: number;
  meal_plan_id: number;
  school_id: number;
  date: string; // YYYY-MM-DD
  meal_type: MealType;
  nutrition: { kcal: number; carb: number; prot: number; fat: number };
  cost: number;
  ai_comment: string | null;
  menu_items: {
    rice: ApiMenuItem | null;
    soup: ApiMenuItem | null;
    main1: ApiMenuItem | null;
    main2: ApiMenuItem | null;
    side: ApiMenuItem | null;
    kimchi: ApiMenuItem | null;
    dessert: ApiMenuItem | null;
  };
  allergen_summary: {
    unique_allergens: number[];
    by_menu: Record<string, number[]>;
  };
  created_at?: string;
  updated_at?: string;
};

// 월간 식단표 조회 응답의 menus 항목 (school_id 등은 상위 data에 있음)
export type MonthlyMenuItem = {
  menu_id: number;
  date: string; // YYYY-MM-DD
  meal_type: MealType;
  nutrition: { kcal: number; carb: number; prot: number; fat: number };
  cost: number;
  ai_comment: string | null;
  menu_items: DailyMenuData['menu_items'];
  allergen_summary?: any;
};

export type MonthlyMealPlanData = {
  meal_plan_id: number;
  year: number;
  month: number;
  school_id: number;
  created_at?: string;
  updated_at?: string;
  menus: MonthlyMenuItem[];
};

function getBaseUrl() {
  // Vite env: VITE_API_BASE_URL=http://localhost:8080
  return (import.meta as any).env?.VITE_API_BASE_URL || '';
}

function buildHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('access_token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * 일간 식단표 상세 조회
 * GET /mealplan/menus/{date}/{mealType}
 */
export async function getDailyMeal(params: { date: string; meal_type: MealType }) {
  const { date, meal_type } = params;
  const url = `${getBaseUrl()}/mealplan/menus/${date}/${meal_type}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${text || res.statusText}`);
  }

  const json = await res.json();
  return json.data as DailyMenuData;
}

/**
 * 월간 식단표 조회
 * GET /mealplan/monthly?year=YYYY&month=M
 */
export async function getMonthlyMealPlan(params: { year: number; month: number }) {
  const { year, month } = params;
  const url = `${getBaseUrl()}/mealplan/monthly?year=${encodeURIComponent(String(year))}&month=${encodeURIComponent(
    String(month),
  )}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(),
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${text || res.statusText}`);
  }

  const json = await res.json();
  return json.data as MonthlyMealPlanData;
}
