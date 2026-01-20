import { useState } from 'react';
import { User, Mail, Phone, School, Save, AlertTriangle, Key } from 'lucide-react';
import { PageType } from '../App';

interface ProfileEditProps {
  onPageChange: (page: PageType) => void;
}

export function ProfileEdit({ onPageChange }: ProfileEditProps) {
  const [formData, setFormData] = useState({
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678',
    grade: '2',
    class: '3',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    alert('회원정보가 수정되었습니다!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">회원정보 수정</h1>
        <p className="text-gray-600">개인정보를 수정하고 관리하세요</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="space-y-6">
          {/* 프로필 사진 */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{formData.name}</h3>
              <p className="text-sm text-gray-600">{formData.grade}학년 {formData.class}반</p>
              <button className="text-sm text-teal-600 hover:text-teal-700 mt-1">
                프로필 사진 변경
              </button>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                전화번호
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <School className="w-4 h-4 inline mr-1" />
                  학년
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleChange('grade', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  반
                </label>
                <select
                  value={formData.class}
                  onChange={(e) => handleChange('class', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}반</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="pt-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              저장하기
            </button>
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
              취소
            </button>
          </div>
        </div>
      </div>

      {/* 알레르기 정보 */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">알레르기 정보</h2>
        <p className="text-sm text-gray-600 mb-4">
          급식 메뉴에서 알레르기 유발 식품을 확인하고 관리할 수 있습니다.
        </p>
        <button 
          onClick={() => onPageChange('allergyEdit')}
          className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-5 h-5" />
          알레르기 정보 수정
        </button>
      </div>

      {/* 비밀번호 변경 */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">비밀번호 변경</h2>
        <p className="text-sm text-gray-600 mb-4">
          비밀번호 변경을 위해 본인 인증이 필요합니다.
        </p>
        <button 
          onClick={() => onPageChange('passwordVerify')}
          className="w-full px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-2"
        >
          <Key className="w-5 h-5" />
          비밀번호 변경
        </button>
      </div>
    </div>
  );
}