import { useState } from 'react';
import { Star, Send, CheckCircle, Clock, AlertCircle, Bug } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '../components/ui/alert-dialog';
import { toast } from 'sonner@2.0.3';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// 평가 상태 타입
type EvaluationState = 'enabled' | 'disabled' | 'submitted';

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

  const todayMenu = {
    lunch: ['백미밥', '미역국', '제육볶음', '계란찜', '배추김치'],
    dinner: ['현미밥', '된장찌개', '닭갈비', '시금치나물', '깍두기']
  };

  // 제출 가능 여부 체크
  const canSubmitLunch = lunchRating > 0 && lunchComment.trim().length > 0;
  const canSubmitDinner = dinnerRating > 0 && dinnerComment.trim().length > 0;

  const handleLunchSubmit = () => {
    if (!canSubmitLunch) {
      setShowValidationAlert(true);
      return;
    }

    toast.success(`중식 평가가 제출되었습니다!\n별점: ${lunchRating}점\n의견: ${lunchComment}`);
    setLunchSubmitted(true);
  };

  const handleDinnerSubmit = () => {
    if (!canSubmitDinner) {
      setShowValidationAlert(true);
      return;
    }

    toast.success(`석식 평가가 제출되었습니다!\n별점: ${dinnerRating}점\n의견: ${dinnerComment}`);
    setDinnerSubmitted(true);
  };

  const StarRating = ({ 
    rating, 
    setRating, 
    label,
    hover,
    setHover,
    disabled
  }: { 
    rating: number; 
    setRating: (n: number) => void; 
    label: string;
    hover: number;
    setHover: (n: number) => void;
    disabled?: boolean;
  }) => {
    const displayRating = hover || rating;

    const handleClick = (index: number, isHalf: boolean) => {
      if (disabled) return;
      const value = isHalf ? index + 0.5 : index + 1;
      setRating(value);
    };

    const handleMouseMove = (starIndex: number, event: React.MouseEvent<HTMLDivElement>) => {
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
                className="absolute top-0 left-0 bottom-0 w-1/2"
                onClick={() => handleClick(starIndex, true)}
              />
              
              {/* 클릭 영역 - 오른쪽 절반 (1점) */}
              <div
                className="absolute top-0 right-0 bottom-0 w-1/2"
                onClick={() => handleClick(starIndex, false)}
              />
            </>
          )}
          
          {/* 채워진 별 */}
          {fillValue > 0 && (
            <div 
              className="absolute top-0 left-0 overflow-hidden pointer-events-none"
              style={{
                width: fillValue >= 1 ? '100%' : '50%'
              }}
            >
              <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">{label}</h3>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((starIndex) => renderStar(starIndex))}
        </div>
        <div className="text-sm text-gray-600">
          {rating > 0 ? `선택한 점수: ${rating}점` : '별점을 선택해주세요'}
        </div>
      </div>
    );
  };

  const EvaluationContent = ({ 
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
    canSubmit
  }: {
    type: 'lunch' | 'dinner';
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
  }) => {
    const isLunch = type === 'lunch';
    const titleText = isLunch ? '중식' : '석식';
    const isDisabled = state === 'disabled';
    const isSubmitted = state === 'submitted';
    
    return (
      <div className="space-y-6">
        {/* 제출 완료 배지 */}
        {isSubmitted && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">제출이 완료되었습니다</span>
          </div>
        )}

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-800">{titleText} 만족도 평가</h2>

        {/* 오늘의 메뉴 박스 */}
        <div className={`p-4 rounded-lg border ${
          isLunch 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className={`text-sm font-semibold mb-2 ${
            isLunch ? 'text-orange-600' : 'text-blue-600'
          }`}>
            오늘의 {titleText} 메뉴
          </div>
          <div className="space-y-1">
            {menu.map((item, idx) => (
              <div key={idx} className="text-sm text-gray-700">
                • {item}
              </div>
            ))}
          </div>
        </div>

        {/* Disabled 상태: 안내 박스만 표시 */}
        {isDisabled && (
          <div className="p-6 bg-gray-50 border border-gray-300 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-gray-700 mb-3">
              <AlertCircle className="w-6 h-6" />
              <span className="text-lg font-semibold">평가 가능 시간이 아닙니다</span>
            </div>
            <div className="text-sm text-gray-600">
              평가 가능: {isLunch ? '중식 개시(12:00)' : '석식 개시(18:00)'} 직후 ~ 당일 24:00
            </div>
          </div>
        )}

        {/* Enabled 또는 Submitted 상태: 입력 영역 표시 */}
        {!isDisabled && (
          <>
            {/* 별점 */}
            <div>
              <StarRating 
                rating={rating} 
                setRating={setRating} 
                label={`${titleText} 만족도`}
                hover={hover}
                setHover={setHover}
                disabled={isSubmitted}
              />
            </div>

            {/* 추가 의견 */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">추가 의견 (필수)</h3>
              <textarea
                value={comment}
                onChange={(e) => !isSubmitted && setComment(e.target.value)}
                placeholder={`${titleText}에 대한 의견을 작성해주세요`}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 resize-none transition ${
                  isLunch 
                    ? 'focus:ring-orange-500 border-gray-300' 
                    : 'focus:ring-blue-500 border-gray-300'
                } ${
                  isSubmitted 
                    ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                    : ''
                }`}
                rows={4}
                disabled={isSubmitted}
              />
              <div className="text-xs text-gray-500 mt-1">
                {comment.trim().length > 0 
                  ? `${comment.trim().length}자 입력됨` 
                  : '의견을 입력해주세요 (최소 1자 이상)'}
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              onClick={onSubmit}
              disabled={isSubmitted || !canSubmit}
              className={`w-full px-6 py-3 rounded-lg transition flex items-center justify-center gap-2 font-semibold ${
                isSubmitted
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : isLunch
                    ? canSubmit
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : canSubmit
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitted ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  제출 완료
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {titleText} 평가 제출
                </>
              )}
            </button>

            {/* 제출 조건 안내 */}
            {!isSubmitted && (
              <div className="text-xs text-gray-500 text-center">
                {!canSubmit && '별점과 추가 의견을 모두 입력해야 제출할 수 있습니다'}
              </div>
            )}
          </>
        )}
      </div>
    );
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
