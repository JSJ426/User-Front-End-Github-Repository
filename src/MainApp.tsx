import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { MenuSchedule } from './pages/MenuSchedule';
import { Satisfaction } from './pages/Satisfaction';
import { ProfileEdit } from './pages/ProfileEdit';
import { Settings } from './pages/Settings';
import { Board, BoardPost } from './pages/Board';
import { BoardRead } from './pages/BoardRead';
import { BoardWrite } from './pages/BoardWrite';
import { BoardEdit } from './pages/BoardEdit';
import { Toaster } from './components/ui/sonner';
import {
  createBoard as apiCreateBoard,
  deleteBoard as apiDeleteBoard,
  fetchBoardList,
  updateBoard as apiUpdateBoard,
  type BoardListItem,
  type BoardCategory,
} from './api/board';
import { changePassword, getStudentMe } from './api/student';
import { toast } from 'sonner@2.0.3';

interface MainAppProps {
  onLogout: () => void;
}


export type PageType = 'home' | 'schedule' | 'satisfaction' | 'profile' | 'settings' | 'passwordVerify' | 'passwordChange' | 'board' | 'boardRead' | 'boardWrite' | 'boardEdit';


function apiCategoryToUiCategory(cat: string): BoardPost['category'] {
  const c = String(cat || '').toUpperCase();
  if (c === 'NOTICE') return '공지';
  if (c === 'NEW_MENU') return '신메뉴';
  if (c === 'SUGGESTION') return '건의';
  // REQUEST/COMPLAINT/ETC 등은 일단 기타로
  return '기타의견';
}

function uiCategoryToApiCategory(cat: string): BoardCategory {
  if (cat === '공지') return 'NOTICE';
  if (cat === '신메뉴') return 'NEW_MENU';
  if (cat === '건의') return 'SUGGESTION';
  return 'ETC';
}

function listItemToBoardPost(it: BoardListItem): BoardPost {
  return {
    id: String(it.id),
    category: apiCategoryToUiCategory(it.category),
    title: it.title,
    // 목록에는 content가 없으므로 빈 문자열로 (상세에서 가져옴)
    content: '',
    author: it.authorType === 'DIETITIAN' ? '영양사' : '학생',
    createdAt: new Date(it.createdAt),
    views: it.viewCount ?? 0,
  };
}

export default function MainApp({ onLogout }: MainAppProps) {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [showSidebar, setShowSidebar] = useState(false);
  const allergyItems = [
    { id: 1, name: '난류' },
    { id: 2, name: '우유' },
    { id: 3, name: '메밀' },
    { id: 4, name: '땅콩' },
    { id: 5, name: '대두' },
    { id: 6, name: '밀' },
    { id: 7, name: '고등어' },
    { id: 8, name: '게' },
    { id: 9, name: '새우' },
    { id: 10, name: '돼지고기' },
    { id: 11, name: '복숭아' },
    { id: 12, name: '토마토' },
  ];

  const [userAllergyCodes, setUserAllergyCodes] = useState<number[]>([]);
  const [userAllergies, setUserAllergies] = useState<string[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [darkMode, setDarkMode] = useState(false);
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  
  // 현재 로그인한 사용자 (학생용)
  const currentUser = currentUserName || '학생';

  const handleMenuClick = () => {
    setShowSidebar(!showSidebar);
  };

  const refreshBoardList = async () => {
    try {
      setBoardLoading(true);
      setBoardError(null);
      const res = await fetchBoardList();
      const items = res?.data?.items ?? [];
      setBoardPosts(items.map(listItemToBoardPost));
    } catch (e: any) {
      setBoardError(e?.message || '게시판 목록을 불러오지 못했습니다.');
    } finally {
      setBoardLoading(false);
    }
  };

  useEffect(() => {
    // 앱 진입 시 게시판 목록 한 번 로드
    refreshBoardList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ✅ 항상 백에서 최신값으로 초기화
    (async () => {
      try {
        const res = await getStudentMe();
        const me = res.data;
        setCurrentUserName(me?.name || '');
        setUserAllergyCodes(me?.allergy_codes || []);
        const names = (me?.allergy_codes || [])
          .map((code) => allergyItems.find((a) => a.id === code)?.name)
          .filter(Boolean) as string[];
        setUserAllergies(names);
      } catch {
        // 로그인 직후 토큰 문제 등으로 실패할 수 있음 -> 여기서는 조용히 무시
      }
    })();
  }, []);

  const handlePageChange = (page: PageType, postId?: string) => {
    setCurrentPage(page);
    setShowSidebar(false);
    if (postId) {
      setCurrentPostId(postId);
    }
  };

  const handleBoardPostCreate = async (data: { category: string; title: string; content: string }) => {
    await apiCreateBoard({
      category: uiCategoryToApiCategory(data.category),
      title: data.title,
      content: data.content,
      authorType: 'STUDENT',
    });
    await refreshBoardList();
  };

  const handleBoardPostUpdate = async (postId: string, data: { category: string; title: string; content: string }) => {
    await apiUpdateBoard(Number(postId), {
      category: uiCategoryToApiCategory(data.category),
      title: data.title,
      content: data.content,
    });
    await refreshBoardList();
  };

  const handleBoardPostDelete = async (postId: string) => {
    await apiDeleteBoard(Number(postId));
    await refreshBoardList();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home userAllergies={userAllergies} onPageChange={handlePageChange} darkMode={darkMode} />;
      case 'schedule':
        return <MenuSchedule darkMode={darkMode} />;
      case 'satisfaction':
        return <Satisfaction />;
      case 'profile':
        return <ProfileEdit onPageChange={handlePageChange} />;
      case 'settings':
        return <Settings darkMode={darkMode} setDarkMode={setDarkMode} />;
      case 'board':
        return (
          <Board
            darkMode={darkMode}
            onPageChange={handlePageChange}
            posts={boardPosts}
            loading={boardLoading}
            error={boardError}
            onRefresh={refreshBoardList}
          />
        );
      case 'boardRead':
        return (
          <BoardRead
            darkMode={darkMode}
            onPageChange={handlePageChange}
            postId={currentPostId}
            onDelete={handleBoardPostDelete}
            currentUser={currentUser}
          />
        );
      case 'boardWrite':
        return <BoardWrite darkMode={darkMode} onPageChange={handlePageChange} onSubmit={handleBoardPostCreate} />;
      case 'boardEdit':
        return (
          <BoardEdit
            darkMode={darkMode}
            onPageChange={handlePageChange}
            postId={currentPostId}
            onUpdate={handleBoardPostUpdate}
          />
        );
      case 'passwordVerify':
        return <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 max-w-md mx-auto`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>본인 인증</h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>비밀번호 변경을 위해 본인 인증이 필요합니다.</p>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                현재 비밀번호
              </label>
              <input
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <button
              onClick={() => {
                if (!pwCurrent.trim()) {
                  toast.error('현재 비밀번호를 입력해주세요.');
                  return;
                }
                setPwNew('');
                setPwConfirm('');
                setCurrentPage('passwordChange');
              }}
              className="w-full px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
            >
              인증하기
            </button>
            <button
              onClick={() => setCurrentPage('profile')}
              className={`w-full px-6 py-3 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg transition`}
            >
              취소
            </button>
          </div>
        </div>;
      case 'passwordChange':
        return <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 max-w-md mx-auto`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>비밀번호 변경</h2>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                새 비밀번호
              </label>
              <input
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                새 비밀번호 확인
              </label>
              <input
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <button
              onClick={async () => {
                if (!pwNew.trim() || !pwConfirm.trim()) {
                  toast.error('새 비밀번호를 입력해주세요.');
                  return;
                }
                if (pwNew !== pwConfirm) {
                  toast.error('새 비밀번호가 일치하지 않습니다.');
                  return;
                }
                try {
                  await changePassword({ currentPassword: pwCurrent, newPassword: pwNew });
                  toast.success('비밀번호가 변경되었습니다!');
                  setCurrentPage('profile');
                } catch (e: any) {
                  toast.error(e?.message || '비밀번호 변경에 실패했습니다.');
                }
              }}
              className="w-full px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
            >
              변경하기
            </button>
            <button
              onClick={() => setCurrentPage('profile')}
              className={`w-full px-6 py-3 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg transition`}
            >
              취소
            </button>
          </div>
        </div>;
      default:
        return <Home userAllergies={userAllergies} onPageChange={handlePageChange} darkMode={darkMode} />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header 
        onMenuClick={handleMenuClick} 
        darkMode={darkMode}
        onLogout={onLogout}
        onHomeClick={() => handlePageChange('home')}
      />
      
      <Sidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        darkMode={darkMode}
      />
      
      <main className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-white' : ''}`}>
        {renderPage()}
      </main>
      <Footer darkMode={darkMode} />
      <Toaster />
    </div>
  );
}