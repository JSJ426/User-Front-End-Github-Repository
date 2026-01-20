import { useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';

export function Satisfaction() {
  const [lunchRating, setLunchRating] = useState(0);
  const [dinnerRating, setDinnerRating] = useState(0);
  const [lunchComment, setLunchComment] = useState('');
  const [dinnerComment, setDinnerComment] = useState('');
  const [lunchHover, setLunchHover] = useState(0);
  const [dinnerHover, setDinnerHover] = useState(0);
  const [lunchSubmitted, setLunchSubmitted] = useState(false);
  const [dinnerSubmitted, setDinnerSubmitted] = useState(false);

  const todayMenu = {
    lunch: ['백미밥', '미역국', '제육볶음', '계란찜', '배추김치'],
    dinner: ['현미밥', '된장찌개', '닭갈비', '시금치나물', '깍두기']
  };

  const handleLunchSubmit = () => {
    alert(`중식 평가가 제출되었습니다!\n별점: ${lunchRating}점\n의견: ${lunchComment || '없음'}`);
    setLunchSubmitted(true);
  };

  const handleDinnerSubmit = () => {
    alert(`석식 평가가 제출되었습니다!\n별점: ${dinnerRating}점\n의견: ${dinnerComment || '없음'}`);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">만족도 평가</h1>
        <p className="text-gray-600">오늘의 급식에 대한 만족도를 평가해주세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 중식 평가 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">중식 만족도 평가</h2>
            {lunchSubmitted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">제출 완료</span>
              </div>
            )}
          </div>

          {/* 오늘의 중식 메뉴 */}
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-sm font-semibold text-orange-600 mb-2">오늘의 중식 메뉴</div>
            <div className="space-y-1">
              {todayMenu.lunch.map((item, idx) => (
                <div key={idx} className="text-sm text-gray-700">
                  • {item}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <StarRating 
              rating={lunchRating} 
              setRating={setLunchRating} 
              label="중식 만족도"
              hover={lunchHover}
              setHover={setLunchHover}
              disabled={lunchSubmitted}
            />

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">추가 의견</h3>
              <textarea
                value={lunchComment}
                onChange={(e) => setLunchComment(e.target.value)}
                placeholder="중식에 대한 의견을 자유롭게 작성해주세요 (선택사항)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={4}
                disabled={lunchSubmitted}
              />
            </div>

            <button
              onClick={handleLunchSubmit}
              disabled={lunchRating === 0 || lunchSubmitted}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {lunchSubmitted ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  중식 평가 제출 완료
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  중식 평가 제출
                </>
              )}
            </button>
          </div>
        </div>

        {/* 석식 평가 카드 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">석식 만족도 평가</h2>
            {dinnerSubmitted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">제출 완료</span>
              </div>
            )}
          </div>

          {/* 오늘의 석식 메뉴 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-semibold text-blue-600 mb-2">오늘의 석식 메뉴</div>
            <div className="space-y-1">
              {todayMenu.dinner.map((item, idx) => (
                <div key={idx} className="text-sm text-gray-700">
                  • {item}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <StarRating 
              rating={dinnerRating} 
              setRating={setDinnerRating} 
              label="석식 만족도"
              hover={dinnerHover}
              setHover={setDinnerHover}
              disabled={dinnerSubmitted}
            />

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">추가 의견</h3>
              <textarea
                value={dinnerComment}
                onChange={(e) => setDinnerComment(e.target.value)}
                placeholder="석식에 대한 의견을 자유롭게 작성해주세요 (선택사항)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={4}
                disabled={dinnerSubmitted}
              />
            </div>

            <button
              onClick={handleDinnerSubmit}
              disabled={dinnerRating === 0 || dinnerSubmitted}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {dinnerSubmitted ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  석식 평가 제출 완료
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  석식 평가 제출
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 평가 통계 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">이번 주 평균 만족도</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {['월', '화', '수', '목', '금'].map((day) => {
            const avgRating = 4.0;
            const fullStars = Math.floor(avgRating);
            const hasHalfStar = avgRating % 1 !== 0;
            
            return (
              <div key={day} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-700 mb-2">{day}요일</div>
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="relative">
                      <Star className="w-4 h-4 text-gray-300" />
                      {i < fullStars && (
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 absolute top-0 left-0" />
                      )}
                      {i === fullStars && hasHalfStar && (
                        <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 mt-1">{avgRating}점</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
