import { useEffect, useMemo, useState } from 'react';
import { Star, Send, CheckCircle, Clock, AlertCircle, Bug } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '../components/ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { getDailyMeal } from '../api/mealplan';
import { createSatisfaction } from '../api/satisfaction';
import { ApiError } from '../api/http';

type MealTab = 'lunch' | 'dinner';

// ✅ 당일(24시 전) 재평가 방지: 페이지 이동/재진입에도 유지되도록 localStorage에 제출 여부 저장
// 키는 날짜가 바뀌면 자동으로 분리되므로, 다음날 00:00 이후에는 다시 평가 가능
function getSatisfactionLockKey(dateStr: string, mealType: 'LUNCH' | 'DINNER') {
  return `satisfaction_submitted:${dateStr}:${mealType}`;
}

function extractMenuNames(menuItems: any): string[] {
  if (!menuItems || typeof menuItems !== 'object') return [];
  const keys = ['rice', 'soup', 'main1', 'main2', 'side', 'kimchi', 'dessert'] as const;
  const names: string[] = [];
  for (const k of keys) {
    const item = (menuItems as any)[k];
    if (item && typeof item === 'object' && item.name) names.push(String(item.name));
  }
  return names;
}

function StarRating({
  rating,
  setRating,
  label,
  hover,
  setHover,
  disabled,
}: {
  rating: number;
  setRating: (n: number) => void;
  label: string;
  hover: number;
  setHover: (n: number) => void;
  disabled?: boolean;
}) {
  const displayRating = hover || rating;

  const handleClick = (index: number, isHalf: boolean) => {
    if (disabled) return;
    const value = isHalf ? index + 0.5 : index + 1;
    setRating(value);
  };

  const handleMouseMove = (starIndex: number, event: any) => {
    if (disabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    const hoverValue = starIndex + (isLeftHalf ? 0.5 : 1);
    setHover(hoverValue);
  };

  const renderStar = (starIndex: number) => {
    const fillValue = displayRating - starIndex;

    return (
      <div
        key={starIndex}
        className={`relative transition-transform ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}`}
        onMouseMove={(e) => handleMouseMove(starIndex, e)}
        onMouseLeave={() => !disabled && setHover(0)}
      >
        {/* 배경 별 (회색) */}
        <Star className="w-12 h-12 text-gray-300" />

        {!disabled && (
          <>
            {/* 클릭 영역 - 왼쪽 절반 (0.5점) */}
            <div
              className="absolute top-0 left-0 bottom-0 w-1/2 z-20"
              onClick={() => handleClick(starIndex, true)}
            />

            {/* 클릭 영역 - 오른쪽 절반 (1점) */}
            <div
              className="absolute top-0 right-0 bottom-0 w-1/2 z-20"
              onClick={() => handleClick(starIndex, false)}
            />
          </>
        )}

        {/* 채워진 별 */}
        {fillValue > 0 && (
          <div
            className="absolute top-0 left-0 bottom-0 overflow-hidden pointer-events-none"
            style={{ width: fillValue >= 1 ? '100%' : '50%' }}
          >
            <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{label}</h3>
        <p className="text-sm text-gray-600">별점을 선택해주세요 (0.5점 단위)</p>
      </div>

      <div className="flex justify-center gap-1">
        {[0, 1, 2, 3, 4].map((i) => renderStar(i))}
      </div>

      <div className="text-center">
        <span className="text-2xl font-bold text-yellow-500">{displayRating.toFixed(1)}</span>
        <span className="text-gray-600 ml-1">/ 5.0</span>
      </div>
    </div>
  );
}

// 평가 상태 타입
type EvaluationState = 'enabled' | 'disabled' | 'submitted';

function EvaluationContent({
  type,
  menu,
  rating,
  setRating,
  comment,
  setComment,
  hover,
  setHover,
  state,
  onSubmit,
  canSubmit,
  mealLoading,
  mealError,
}: {
  type: MealTab;
  menu: string[];
  rating: number;
  setRating: (n: number) => void;
  comment: string;
  setComment: (s: string) => void;
  hover: number;
  setHover: (n: number) => void;
  state: EvaluationState;
  onSubmit: () => void;
  canSubmit: boolean;
  mealLoading: boolean;
  mealError: string | null;
}) {
  const isLunch = type === 'lunch';
  const titleText = isLunch ? '중식' : '석식';
  const isDisabled = state === 'disabled';
  const isSubmitted = state === 'submitted';

  return (
    <div className="space-y-6">
      {mealError ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{mealError}</span>
        </div>
      ) : null}

      {isSubmitted ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">제출이 완료되었습니다</span>
        </div>
      ) : null}

      {isDisabled ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700">
          <Clock className="w-5 h-5" />
          <span className="text-sm">{titleText} 평가는 {isLunch ? '12시' : '18시'} 이후부터 가능합니다</span>
        </div>
      ) : null}

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-3">오늘의 {titleText} 식단</h3>
        {mealLoading ? (
          <div className="text-sm text-gray-500">불러오는 중…</div>
        ) : menu.length > 0 ? (
          <div className="space-y-2">
            {menu.map((item, index) => (
              <div key={`${titleText}-${index}`} className="text-sm text-gray-600">• {item}</div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">식단 정보가 없습니다</div>
        )}
      </div>

      <StarRating
        rating={rating}
        setRating={setRating}
        label="별점 평가"
        hover={hover}
        setHover={setHover}
        disabled={isDisabled || isSubmitted}
      />

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">추가 의견</h3>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="급식에 대한 의견을 남겨주세요 (필수)"
          maxLength={200}
          disabled={isDisabled || isSubmitted}
          className={`w-full h-24 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            isDisabled || isSubmitted ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{comment.length}/200</span>
          {!canSubmit && !isDisabled && !isSubmitted ? (
            <span className="text-red-500">별점과 의견을 모두 입력해주세요</span>
          ) : null}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!canSubmit || isDisabled || isSubmitted}
        className={`w-full px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
          canSubmit && !isDisabled && !isSubmitted
            ? 'bg-teal-500 text-white hover:bg-teal-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Send className="w-5 h-5" />
        {isSubmitted ? '제출 완료' : `${titleText} 평가 제출`}
      </button>
    </div>
  );
}

// 평가 가능 시간 체크 함수
const checkEvaluationAvailability = (mealType: 'lunch' | 'dinner'): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  
  // 중식: 12시(정오) 이후 ~ 23:59 (당일 자정 전)
  // 석식: 18시(오후 6시) 이후 ~ 23:59 (당일 자정 전)
  
  if (mealType === 'lunch') {
    return currentHour >= 12 && currentHour <= 23;
  } else {
    return currentHour >= 18 && currentHour <= 23;
  }
};

// 기본 탭 선택 로직 (시간 기반)
const getDefaultTab = (): 'lunch' | 'dinner' => {
  const now = new Date();
  const currentHour = now.getHours();
  
  // 석식 개시 이후 ~ 24:00: 석식 탭
  if (currentHour >= 18 && currentHour <= 23) {
    return 'dinner';
  }
  
  // 그 외: 중식 탭 (중식 개시 이후 ~ 석식 개시 전, 개시 전, 24시 이후)
  return 'lunch';
};

export function Satisfaction() {
  const [activeTab, setActiveTab] = useState<'lunch' | 'dinner'>(getDefaultTab());
  
  // 개발 모드 (상태 강제 설정용)
  const [devMode, setDevMode] = useState(false);
  const [forceLunchState, setForceLunchState] = useState<EvaluationState | null>(null);
  const [forceDinnerState, setForceDinnerState] = useState<EvaluationState | null>(null);
  
  // 중식 상태
  const [lunchRating, setLunchRating] = useState(0);
  const [lunchComment, setLunchComment] = useState('');
  const [lunchHover, setLunchHover] = useState(0);
  const [lunchSubmitted, setLunchSubmitted] = useState(false);
  
  // 석식 상태
  const [dinnerRating, setDinnerRating] = useState(0);
  const [dinnerComment, setDinnerComment] = useState('');
  const [dinnerHover, setDinnerHover] = useState(0);
  const [dinnerSubmitted, setDinnerSubmitted] = useState(false);
  
  // 알림 다이얼로그
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  // 실제 상태 계산
  const getLunchState = (): EvaluationState => {
    if (devMode && forceLunchState) return forceLunchState;
    if (lunchSubmitted) return 'submitted';
    return checkEvaluationAvailability('lunch') ? 'enabled' : 'disabled';
  };

  const getDinnerState = (): EvaluationState => {
    if (devMode && forceDinnerState) return forceDinnerState;
    if (dinnerSubmitted) return 'submitted';
    return checkEvaluationAvailability('dinner') ? 'enabled' : 'disabled';
  };

  const lunchState = getLunchState();
  const dinnerState = getDinnerState();

  // ==== 오늘 식단(실제 API 기반) ====
  const todayDateStr = useMemo(() => {
    const d = new Date();
    // UTC로 변환되는 toISOString 사용 시 날짜가 하루 밀릴 수 있어서 로컬 기준으로 조합
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // ✅ 페이지 재진입 시에도 '오늘 이미 제출했는지' 유지
  // (백엔드 중복체크가 있더라도, UX상 버튼/입력창을 미리 잠그기 위해 사용)
  useEffect(() => {
    try {
      const lunchKey = getSatisfactionLockKey(todayDateStr, 'LUNCH');
      const dinnerKey = getSatisfactionLockKey(todayDateStr, 'DINNER');

      setLunchSubmitted(localStorage.getItem(lunchKey) === '1');
      setDinnerSubmitted(localStorage.getItem(dinnerKey) === '1');
    } catch {
      // localStorage 접근 불가 환경이면 무시
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayDateStr]);

  const [mealLoading, setMealLoading] = useState(false);
  const [mealError, setMealError] = useState<string | null>(null);
  const [todayMenu, setTodayMenu] = useState<{ lunch: string[]; dinner: string[] }>({
    lunch: [],
    dinner: [],
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setMealLoading(true);
        setMealError(null);

        const [lunchRes, dinnerRes] = await Promise.allSettled([
          getDailyMeal({ date: todayDateStr, meal_type: 'LUNCH' }),
          getDailyMeal({ date: todayDateStr, meal_type: 'DINNER' }),
        ]);

        const next = { lunch: [] as string[], dinner: [] as string[] };
        if (lunchRes.status === 'fulfilled') {
          const d = lunchRes.value;
          next.lunch = extractMenuNames((d as any).menu_items);
        }

        if (dinnerRes.status === 'fulfilled') {
          const d = dinnerRes.value;
          next.dinner = extractMenuNames((d as any).menu_items);
        }

        if (!mounted) return;
        setTodayMenu(next);
      } catch (e: any) {
        if (!mounted) return;
        setMealError(e?.message || '오늘 식단을 불러오지 못했습니다.');
      } finally {
        if (mounted) setMealLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [todayDateStr]);

  // 제출 가능 여부 체크
  const canSubmitLunch = lunchRating > 0 && lunchComment.trim().length > 0;
  const canSubmitDinner = dinnerRating > 0 && dinnerComment.trim().length > 0;

  const handleLunchSubmit = async () => {
    if (!canSubmitLunch) {
      setShowValidationAlert(true);
      return;
    }

    if (!todayMenu.lunch || todayMenu.lunch.length === 0) {
      toast.error('오늘 중식 식단 정보를 찾지 못했습니다.\n(식단이 없거나 조회에 실패했습니다)');
      return;
    }

    try {
      await createSatisfaction({
        date: todayDateStr,
        meal_type: 'LUNCH',
        rating: Math.max(1, Math.min(5, Math.round(lunchRating))),
        content: lunchComment.trim().slice(0, 200),
      });
      toast.success('중식 평가가 제출되었습니다!');
      try {
        localStorage.setItem(getSatisfactionLockKey(todayDateStr, 'LUNCH'), '1');
      } catch {
        // ignore
      }
      setLunchSubmitted(true);
    } catch (e: any) {
      // ✅ 이미 제출한 경우(백엔드 중복체크)면 UX상 제출완료로 잠그기
      if (e instanceof ApiError && (e.status === 400 || e.status === 409) && String(e.message).includes('이미')) {
        try {
          localStorage.setItem(getSatisfactionLockKey(todayDateStr, 'LUNCH'), '1');
        } catch {
          // ignore
        }
        setLunchSubmitted(true);
        toast.info('이미 오늘 중식 만족도 평가를 완료했습니다.');
        return;
      }

      toast.error(e?.message || '중식 평가 제출에 실패했습니다.');
    }
  };

  const handleDinnerSubmit = async () => {
    if (!canSubmitDinner) {
      setShowValidationAlert(true);
      return;
    }

    if (!todayMenu.dinner || todayMenu.dinner.length === 0) {
      toast.error('오늘 석식 식단 정보를 찾지 못했습니다.\n(식단이 없거나 조회에 실패했습니다)');
      return;
    }

    if (!todayMenu.dinner || todayMenu.dinner.length === 0) {
      toast.error('오늘 석식 식단 정보를 찾지 못했습니다.\n(식단이 없거나 조회에 실패했습니다)');
      return;
    }

    try {
      await createSatisfaction({
        date: todayDateStr,
        meal_type: 'DINNER',
        rating: Math.max(1, Math.min(5, Math.round(dinnerRating))),
        content: dinnerComment.trim().slice(0, 200),
      });
      toast.success('석식 평가가 제출되었습니다!');
      try {
        localStorage.setItem(getSatisfactionLockKey(todayDateStr, 'DINNER'), '1');
      } catch {
        // ignore
      }
      setDinnerSubmitted(true);
    } catch (e: any) {
      if (e instanceof ApiError && (e.status === 400 || e.status === 409) && String(e.message).includes('이미')) {
        try {
          localStorage.setItem(getSatisfactionLockKey(todayDateStr, 'DINNER'), '1');
        } catch {
          // ignore
        }
        setDinnerSubmitted(true);
        toast.info('이미 오늘 석식 만족도 평가를 완료했습니다.');
        return;
      }

      toast.error(e?.message || '석식 평가 제출에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">만족도 평가</h1>
        <p className="text-gray-600">오늘의 급식에 대한 만족도를 평가해주세요</p>
      </div>

      {/* 카드 컨테이너 */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        {/* 탭 UI - 카드 안쪽 상단 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-11">
            <TabsTrigger value="lunch" className="text-base font-semibold">
              중식
            </TabsTrigger>
            <TabsTrigger value="dinner" className="text-base font-semibold">
              석식
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lunch">
            <EvaluationContent
              type="lunch"
              menu={todayMenu.lunch}
              rating={lunchRating}
              setRating={setLunchRating}
              comment={lunchComment}
              setComment={setLunchComment}
              hover={lunchHover}
              setHover={setLunchHover}
              state={lunchState}
              onSubmit={handleLunchSubmit}
              canSubmit={canSubmitLunch}
            />
          </TabsContent>

          <TabsContent value="dinner">
            <EvaluationContent
              type="dinner"
              menu={todayMenu.dinner}
              rating={dinnerRating}
              setRating={setDinnerRating}
              comment={dinnerComment}
              setComment={setDinnerComment}
              hover={dinnerHover}
              setHover={setDinnerHover}
              state={dinnerState}
              onSubmit={handleDinnerSubmit}
              canSubmit={canSubmitDinner}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* 유효성 검사 알림 다이얼로그 */}
      <AlertDialog open={showValidationAlert} onOpenChange={setShowValidationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>입력 항목 확인</AlertDialogTitle>
            <AlertDialogDescription>
              별점과 추가 의견을 모두 입력해야 제출할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 개발 모드 설정 */}
      {devMode && (
        <div className="bg-yellow-50 border-2 border-yellow-300 p-5 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Bug className="w-5 h-5 text-yellow-700" />
            <h3 className="font-bold text-yellow-800">개발 모드 (테스트용)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                중식 평가 상태
              </label>
              <Select 
                value={forceLunchState || 'auto'} 
                onValueChange={(value) => setForceLunchState(value === 'auto' ? null : value as EvaluationState)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="자동" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">자동 (시간 기반)</SelectItem>
                  <SelectItem value="enabled">평가 가능 (Enabled)</SelectItem>
                  <SelectItem value="disabled">평가 불가 (Disabled)</SelectItem>
                  <SelectItem value="submitted">제출 완료 (Submitted)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 mt-2">
                현재 상태: <span className="font-semibold">{lunchState}</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                석식 평가 상태
              </label>
              <Select 
                value={forceDinnerState || 'auto'} 
                onValueChange={(value) => setForceDinnerState(value === 'auto' ? null : value as EvaluationState)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="자동" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">자동 (시간 기반)</SelectItem>
                  <SelectItem value="enabled">평가 가능 (Enabled)</SelectItem>
                  <SelectItem value="disabled">평가 불가 (Disabled)</SelectItem>
                  <SelectItem value="submitted">제출 완료 (Submitted)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500 mt-2">
                현재 상태: <span className="font-semibold">{dinnerState}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
            ℹ️ 이 설정은 UI 테스트용입니다. 실제 배포 시에는 제거되어야 합니다.
          </div>
        </div>
      )}

      {/* 개발 모드 토글 */}
      <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <Bug className="w-4 h-4 text-gray-600" />
        <label className="text-sm text-gray-700 font-medium">개발 모드</label>
        <Switch
          checked={devMode}
          onCheckedChange={setDevMode}
        />
      </div>
    </div>
  );
}
