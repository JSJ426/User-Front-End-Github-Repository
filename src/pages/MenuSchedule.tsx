import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { weeklyMealData } from '../data/mealData';

export function MenuSchedule() {
  const [currentWeek, setCurrentWeek] = useState(0);

  const currentData = weeklyMealData[currentWeek];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">식단표 조회</h1>
        <p className="text-gray-600">주간 급식 식단을 확인하세요</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* 주차 선택 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
            disabled={currentWeek === 0}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h2 className="text-xl font-bold text-gray-800">{currentData.week}</h2>

          <button
            onClick={() => setCurrentWeek(Math.min(weeklyMealData.length - 1, currentWeek + 1))}
            disabled={currentWeek === weeklyMealData.length - 1}
            className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 식단표 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {currentData.days.map((dayData, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* 요일 헤더 */}
              <div className="bg-teal-500 text-white p-3 text-center">
                <div className="font-bold">{dayData.day}요일</div>
                <div className="text-sm opacity-90">{dayData.date}</div>
              </div>

              {/* 중식 */}
              <div className="p-4 bg-white">
                <div className="text-sm font-semibold text-orange-600 mb-2">중식</div>
                <div className="space-y-1">
                  {dayData.lunch.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      • {item.name}
                      {item.allergens && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({item.allergens})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 석식 */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm font-semibold text-blue-600 mb-2">석식</div>
                <div className="space-y-1">
                  {dayData.dinner.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      • {item.name}
                      {item.allergens && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({item.allergens})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}