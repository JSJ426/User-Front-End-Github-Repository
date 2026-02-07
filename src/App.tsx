import { useEffect, useState } from 'react';

import LoginPage from './components/LoginPage';
import FindIdPage from './components/FindIdPage';
import FindPasswordPage from './components/FindPasswordPage';
import StudentSignUpPage from './components/StudentSignUpPage';
import MainApp from './MainApp';
import { Toaster } from './components/ui/sonner';
import { clearAccessToken, getAccessToken } from './api/http';

/**
 * Hash Router (react-router-dom 없이)
 * - #/login
 * - #/findId
 * - #/findPassword
 * - #/signUpStudent
 * - #/app
 */

export type RouteKey =
  | 'login'
  | 'findId'
  | 'findPassword'
  | 'signUpStudent'
  | 'app';

function readHash(): RouteKey {
  const raw = (window.location.hash || '').replace(/^#/, '').replace(/^\//, '');
  const key = (raw.split('?')[0] || '').trim();
  switch (key) {
    case 'login':
    case 'findId':
    case 'findPassword':
    case 'signUpStudent':
    case 'app':
      return key;
    default:
      return 'login';
  }
}

function go(route: RouteKey, opts?: { replace?: boolean }) {
  const url = `#/${route}`;
  if (opts?.replace) window.location.replace(url);
  else window.location.hash = `/${route}`;
}

export default function App() {
  const [route, setRoute] = useState<RouteKey>(() => readHash());

  useEffect(() => {
    if (!window.location.hash) go('login', { replace: true });

    const syncAuthGuard = () => {
      const next = readHash();
      const hasToken = !!getAccessToken();

      // ✅ 비로그인 상태에서 #/app 접근(뒤로가기 포함)하면 로그인으로 되돌림
      if (!hasToken && next === 'app') {
        go('login', { replace: true });
        setRoute('login');
        return;
      }

      setRoute(next);
    };

    // 최초 1회도 가드 적용
    syncAuthGuard();

    window.addEventListener('hashchange', syncAuthGuard);
    return () => window.removeEventListener('hashchange', syncAuthGuard);
  }, []);

  const onNavigate = (next: RouteKey) => {
    // ✅ app 이동은 history를 남기지 않도록 replace 처리 (로그인 -> 앱 뒤로가기 이슈 방지)
    const shouldReplace = next === 'app';
    go(next, { replace: shouldReplace });
    setRoute(next);
  };

  const handleLogout = () => {
    // ✅ 토큰/캐시 제거 후 로그인 화면으로 이동
    clearAccessToken();
    const keysToClear = [
      'student_me_cache',
      'student_allergy_codes',
      'student_name',
      'school_name',
      'schoolName',
    ];
    keysToClear.forEach((k) => localStorage.removeItem(k));

    go('login', { replace: true });
    setRoute('login');
  };

  const view = (() => {
    switch (route) {
      case 'login':
        return <LoginPage onNavigate={onNavigate as any} />;
      case 'findId':
        return <FindIdPage onNavigate={onNavigate as any} />;
      case 'findPassword':
        return <FindPasswordPage onNavigate={onNavigate as any} />;
      case 'signUpStudent':
        return <StudentSignUpPage onNavigate={onNavigate as any} />;
      case 'app':
        return <MainApp onLogout={handleLogout} />;
      default:
        return <LoginPage onNavigate={onNavigate as any} />;
    }
  })();

  return (
    <>
      <Toaster />
      {view}
    </>
  );
}
