import { useEffect, useState } from 'react';

import LoginPage from './components/LoginPage';
import FindIdPage from './components/FindIdPage';
import FindPasswordPage from './components/FindPasswordPage';
import StudentSignUpPage from './components/StudentSignUpPage';
import MainApp from './MainApp';
import { Toaster } from './components/ui/sonner';

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

function go(route: RouteKey) {
  window.location.hash = `/${route}`;
}

export default function App() {
  const [route, setRoute] = useState<RouteKey>(() => readHash());

  useEffect(() => {
    if (!window.location.hash) go('login');
    const onHashChange = () => setRoute(readHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const onNavigate = (next: RouteKey) => {
    go(next);
    setRoute(next);
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
      return <MainApp onLogout={() => onNavigate('login')} />;
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