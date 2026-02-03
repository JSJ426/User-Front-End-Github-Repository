import { useState } from 'react';
import { FileText, Plus, Search } from 'lucide-react';
import { PageType } from '../App';

export interface BoardPost {
  id: string;
  category: '공지' | '건의' | '신메뉴' | '기타의견';
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  views: number;
}

interface BoardProps {
  darkMode?: boolean;
  onPageChange: (page: PageType, postId?: string) => void;
  posts: BoardPost[];
}

export function Board({ darkMode = false, onPageChange, posts }: BoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const categories = ['전체', '공지', '건의', '신메뉴', '기타의견'];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 공지를 상단에 고정
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.category === '공지' && b.category !== '공지') return -1;
    if (a.category !== '공지' && b.category === '공지') return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '공지':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case '건의':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case '신메뉴':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case '기타의견':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `${hours}시간 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>
            게시판
          </h1>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            학교 급식에 대한 다양한 의견을 나눠보세요
          </p>
        </div>
        <button
          onClick={() => onPageChange('boardWrite')}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
        >
          <Plus className="w-5 h-5" />
          <span>글쓰기</span>
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 space-y-4`}>
        {/* 검색 */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="제목 또는 내용으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border ${
              darkMode 
                ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400' 
                : 'border-gray-300 bg-white placeholder-gray-400'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition ${
                selectedCategory === category
                  ? 'bg-teal-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 게시물 목록 */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
        {sortedPosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              게시물이 없습니다
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => onPageChange('boardRead', post.id)}
                className={`w-full text-left p-6 transition ${
                  post.category === '공지'
                    ? darkMode 
                      ? 'bg-red-900/10 hover:bg-red-900/20' 
                      : 'bg-red-50 hover:bg-red-100'
                    : darkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                      {post.category === '공지' && (
                        <span className="text-red-500 text-xs font-bold">중요</span>
                      )}
                    </div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-2 truncate`}>
                      {post.title}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 line-clamp-2`}>
                      {post.content}
                    </p>
                    <div className={`flex items-center gap-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      <span>{post.author}</span>
                      <span>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                      <span>•</span>
                      <span>조회 {post.views}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}