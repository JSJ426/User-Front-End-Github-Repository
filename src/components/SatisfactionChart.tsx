import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function SatisfactionChart() {
  const monthlyData = [
    { month: '1월', score: 3.5 },
    { month: '2월', score: 4.2 },
    { month: '3월', score: 3.8 },
    { month: '4월', score: 4.5 },
    { month: '5월', score: 4.0 },
    { month: '6월', score: 4.3 },
  ];

  const weeklyData = [
    { day: '1/6일', morning: 4.1, lunch: 3.8 },
    { day: '1/7일', morning: 3.9, lunch: 4.2 },
    { day: '1/8일', morning: 4.3, lunch: 4.5 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">만족도</h2>
      
      <div className="space-y-8">
        {/* 이번 달 평균 만족도 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-4">
            이번 달 평균 만족도:
          </h3>
          
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                domain={[0, 5]}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="morning" name="조식" radius={[8, 8, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell key={`cell-morning-${index}`} fill="#ef4444" />
                ))}
              </Bar>
              <Bar dataKey="lunch" name="중식" radius={[8, 8, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell key={`cell-lunch-${index}`} fill="#f97316" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 월별 만족도 추이 */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-4">
            월별 만족도 추이
          </h3>
          
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                domain={[0, 5]}
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="score" name="평균 점수" radius={[8, 8, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.score >= 4.0 ? '#14b8a6' : '#fbbf24'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">조식</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-gray-600">중식</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-500 rounded"></div>
              <span className="text-gray-600">높은 만족도</span>
            </div>
          </div>
          
          <button className="text-teal-500 hover:text-teal-600 text-sm">
            상세 보기 →
          </button>
        </div>
      </div>
    </div>
  );
}
