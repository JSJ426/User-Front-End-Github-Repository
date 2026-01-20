import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { PageType } from '../App';
import { BoardPost } from './Board';

interface BoardEditProps {
  darkMode?: boolean;
  onPageChange: (page: PageType, postId?: string) => void;
  post: BoardPost | null;
  onUpdate: (postId: string, data: { category: string; title: string; content: string }) => void;
}

export function BoardEdit({ darkMode = false, onPageChange, post, onUpdate }: BoardEditProps) {
  const [category, setCategory] = useState<string>('건의');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (post) {
      setCategory(post.category === '공지' ? '건의' : post.category);
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  // '공지'를 제외한 카테고리 목록
  const categories = ['건의', '요청', '불편사항', '기타의견'];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '건의':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case '요청':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '불편사항':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case '기타의견':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const handleSubmit = () => {
    if (!post) return;

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    onUpdate(post.id, {
      category,
      title: title.trim(),
      content: content.trim(),
    });

    alert('게시물이 수정되었습니다!');
    onPageChange('boardRead', post.id);
  };

  if (!post) {
    return (
      <div className="space-y-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-12 text-center`}>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            게시물을 찾을 수 없습니다
          </p>
          <button
            onClick={() => onPageChange('board')}
            className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  // 공지사항은 수정 불가
  if (post.category === '공지') {
    return (
      <div className="space-y-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-12 text-center`}>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
            공지사항은 수정할 수 없습니다
          </p>
          <button
            onClick={() => onPageChange('boardRead', post.id)}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>
            게시물 수정
          </h1>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            게시물 내용을 수정해주세요
          </p>
        </div>
        <button
          onClick={() => onPageChange('boardRead', post.id)}
          className={`flex items-center gap-2 px-4 py-2 ${
            darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } rounded-lg transition`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>취소</span>
        </button>
      </div>

      {/* 수정 폼 */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 space-y-6`}>
        {/* 카테고리 선택 */}
        <div>
          <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
            분류 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg transition ${
                  category === cat
                    ? getCategoryColor(cat)
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
            * 공지 분류는 관리자만 작성할 수 있습니다
          </p>
        </div>

        {/* 제목 입력 */}
        <div>
          <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={100}
            className={`w-full px-4 py-3 border ${
              darkMode 
                ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' 
                : 'border-gray-300 bg-white placeholder-gray-400'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1 text-right`}>
            {title.length}/100
          </p>
        </div>

        {/* 내용 입력 */}
        <div>
          <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
            rows={12}
            maxLength={2000}
            className={`w-full px-4 py-3 border ${
              darkMode 
                ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' 
                : 'border-gray-300 bg-white placeholder-gray-400'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none`}
          />
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1 text-right`}>
            {content.length}/2000
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            <Save className="w-5 h-5" />
            <span>수정하기</span>
          </button>
          <button
            onClick={() => onPageChange('boardRead', post.id)}
            className={`px-6 py-3 ${
              darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } rounded-lg transition`}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
