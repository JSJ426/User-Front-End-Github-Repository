import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NotificationPanel } from './components/NotificationPanel';
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

export type PageType = 'home' | 'schedule' | 'satisfaction' | 'profile' | 'settings' | 'passwordVerify' | 'passwordChange' | 'allergyEdit' | 'board' | 'boardRead' | 'boardWrite' | 'boardEdit';

// 알림 데이터 타입
interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

// 초기 알림 데이터
const initialNotifications: Notification[] = [
  {
    id: '1',
    title: '오늘의 급식 메뉴가 업데이트되었습니다',
    description: '2026년 1월 13일 점심 메뉴를 확인하세요.',
    time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10분 전
    isRead: false,
  },
  {
    id: '2',
    title: '만족도 평가 요청',
    description: '어제 급식에 대한 만족도 평가를 진행해 주세요.',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
    isRead: false,
  },
  {
    id: '3',
    title: '레르기 정보 확인',
    description: '알레르기 정보가 정확한지 확인해 주세요.',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
    isRead: true,
  },
  {
    id: '4',
    title: '이번 주 식단표 공지',
    description: '1월 13일~1월 17일 주간 식단이 등록되었습니다.',
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
    isRead: true,
  },
];

// 초기 게시물 데이터
const initialBoardPosts: BoardPost[] = [
  {
    id: '1',
    category: '공지',
    title: '급식 만족도 조사 실시 안내',
    content: '학생 여러분의 소중한 의견을 듣기 위해 급식 만족도 조사를 실시합니다.\n\n조사 기간: 2026년 1월 13일 ~ 1월 20일\n조사 방법: 만족도 평가 메뉴를 통해 온라인 참여\n\n많은 참여 부탁드립니다.',
    author: '급식관리팀',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    views: 245,
  },
  {
    id: '2',
    category: '건의',
    title: '채식 메뉴 추가 건의드립니다',
    content: '채식을 선호하는 학생들을 위해 주 1~2회 채식 메뉴를 추가해주시면 좋겠습니다.\n\n최근 채식에 관심있는 학생들이 늘어나고 있어 다양한 식단 옵션이 필요할 것 같습니다.',
    author: '김00',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    views: 87,
  },
  {
    id: '3',
    category: '요청',
    title: '알레르기 정보 표시 개선 요청',
    content: '메뉴판에 알레르기 유발 식품 정보가 더 명확하게 표시되었으면 좋겠습니다.\n\n현재 작은 글씨로 표시되어 있어 확인이 어렵습니다.',
    author: '이00',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    views: 156,
  },
  {
    id: '4',
    category: '불편사항',
    title: '급식실 대기 줄이 너무 깁니다',
    content: '점심시간에 급식실 대기 시간이 너무 길어 식사 시간이 부족합니다.\n\n배식 시간을 조정하거나 급식실을 추가로 운영해주시면 좋겠습니다.',
    author: '박00',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    views: 203,
  },
  {
    id: '5',
    category: '기타의견',
    title: '오늘 급식 정말 맛있었어요!',
    content: '오늘 점심 메뉴인 치킨까스가 정말 맛있었습니다.\n\n급식 선생님들께 감사드립니다. 앞으로도 맛있는 급식 부탁드려요!',
    author: '최00',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    views: 124,
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [userAllergies, setUserAllergies] = useState<string[]>(['난류', '땅콩']);
  const [darkMode, setDarkMode] = useState(false);
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>(initialBoardPosts);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);

  const handleMenuClick = () => {
    setShowSidebar(!showSidebar);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handlePageChange = (page: PageType, postId?: string) => {
    setCurrentPage(page);
    setShowSidebar(false);
    if (postId) {
      setCurrentPostId(postId);
      // 조회수 증가
      if (page === 'boardRead') {
        setBoardPosts(prev => prev.map(post =>
          post.id === postId ? { ...post, views: post.views + 1 } : post
        ));
      }
    }
  };

  const handleBoardPostCreate = (data: { category: string; title: string; content: string }) => {
    const newPost: BoardPost = {
      id: Date.now().toString(),
      category: data.category as BoardPost['category'],
      title: data.title,
      content: data.content,
      author: 'OOO',
      createdAt: new Date(),
      views: 0,
    };
    setBoardPosts(prev => [newPost, ...prev]);
  };

  const handleBoardPostUpdate = (postId: string, data: { category: string; title: string; content: string }) => {
    setBoardPosts(prev => prev.map(post =>
      post.id === postId
        ? {
            ...post,
            category: data.category as BoardPost['category'],
            title: data.title,
            content: data.content,
          }
        : post
    ));
  };

  const handleBoardPostDelete = (postId: string) => {
    setBoardPosts(prev => prev.filter(post => post.id !== postId));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home userAllergies={userAllergies} onPageChange={handlePageChange} />;
      case 'schedule':
        return <MenuSchedule />;
      case 'satisfaction':
        return <Satisfaction />;
      case 'profile':
        return <ProfileEdit onPageChange={handlePageChange} />;
      case 'settings':
        return <Settings darkMode={darkMode} setDarkMode={setDarkMode} />;
      case 'board':
        return <Board darkMode={darkMode} onPageChange={handlePageChange} posts={boardPosts} />;
      case 'boardRead':
        const currentPost = boardPosts.find(post => post.id === currentPostId);
        return (
          <BoardRead
            darkMode={darkMode}
            onPageChange={handlePageChange}
            post={currentPost || null}
            onDelete={handleBoardPostDelete}
          />
        );
      case 'boardWrite':
        return <BoardWrite darkMode={darkMode} onPageChange={handlePageChange} onSubmit={handleBoardPostCreate} />;
      case 'boardEdit':
        const editPost = boardPosts.find(post => post.id === currentPostId);
        return (
          <BoardEdit
            darkMode={darkMode}
            onPageChange={handlePageChange}
            post={editPost || null}
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
                className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <button
              onClick={() => setCurrentPage('passwordChange')}
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
                className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                새 비밀번호 확인
              </label>
              <input
                type="password"
                className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <button
              onClick={() => {
                alert('비밀번호가 변경되었습니다!');
                setCurrentPage('profile');
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
      case 'allergyEdit':
        return <div className="space-y-6">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>알레르기 정보 수정</h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>알레르기 유발 식품을 선택하세요</p>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 max-w-2xl`}>
            <div className="space-y-4">
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                해당하는 알레르기 항목을 모두 선택해주세요.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['난류', '우유', '메밀', '땅콩', '대두', '밀', '고등어', '게', '새우', '돼지고기', '복숭아', '토마토'].map((allergen) => (
                  <label key={allergen} className={`flex items-center gap-2 p-3 border ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} rounded-lg cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={userAllergies.includes(allergen)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setUserAllergies([...userAllergies, allergen]);
                        } else {
                          setUserAllergies(userAllergies.filter(a => a !== allergen));
                        }
                      }}
                      className="rounded text-teal-500"
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{allergen}</span>
                  </label>
                ))}
              </div>
              <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex gap-3`}>
                <button
                  onClick={() => {
                    alert('알레르기 정보가 저장되었습니다!');
                    setCurrentPage('profile');
                  }}
                  className="flex-1 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                >
                  저장하기
                </button>
                <button
                  onClick={() => setCurrentPage('profile')}
                  className={`px-6 py-3 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg transition`}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>;
      default:
        return <Home userAllergies={userAllergies} onPageChange={handlePageChange} />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header 
        onMenuClick={handleMenuClick} 
        onNotificationClick={handleNotificationClick}
        unreadCount={unreadCount}
        darkMode={darkMode}
      />
      
      <Sidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        darkMode={darkMode}
      />

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onNotificationRead={handleNotificationRead}
        darkMode={darkMode}
      />
      
      <main className={`container mx-auto px-4 py-8 max-w-7xl ${darkMode ? 'text-white' : ''}`}>
        {renderPage()}
      </main>
      <Footer darkMode={darkMode} />
    </div>
  );
}