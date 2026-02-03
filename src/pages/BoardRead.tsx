import { ArrowLeft, Edit, Trash2, Eye } from 'lucide-react';
import { PageType } from '../App';
import { BoardPost } from './Board';

interface BoardReadProps {
  darkMode?: boolean;
  onPageChange: (page: PageType, postId?: string) => void;
  post: BoardPost | null;
  onDelete: (postId: string) => void;
  currentUser?: string; // 현재 로그인한 사용자 이름
}

export function BoardRead({ darkMode = false, onPageChange, post, onDelete, currentUser }: BoardReadProps) {
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
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (window.confirm('정말로 이 게시물을 삭제하시겠습니까?')) {
      onDelete(post.id);
      onPageChange('board');
    }
  };

  const isNotice = post.category === '공지';
  const isMyPost = currentUser && post.author === currentUser;

  return (
    <div className="space-y-6">
      {/* 상단 버튼 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onPageChange('board')}
          className={`flex items-center gap-2 px-4 py-2 ${
            darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } rounded-lg transition`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>목록으로</span>
        </button>

        {/* 공지가 아니고, 본인이 작성한 글인 경우에만 수정/삭제 버튼 표시 */}
        {!isNotice && isMyPost && (
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange('boardEdit', post.id)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Edit className="w-5 h-5" />
              <span>수정</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <Trash2 className="w-5 h-5" />
              <span>삭제</span>
            </button>
          </div>
        )}
      </div>

      {/* 게시물 내용 */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
        {/* 헤더 */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
            {isNotice && (
              <span className="text-red-500 text-sm font-bold">중요</span>
            )}
          </div>
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>
            {post.title}
          </h1>
          <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-medium">{post.author}</span>
            <span>•</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.views}
            </span>
          </div>
        </div>

        {/* 본문 */}
        <div className={`p-6 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}