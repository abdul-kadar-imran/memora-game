import { useCallback, useEffect, useState } from 'react';

export type AppRoute = '/' | '/dashboard';

function normalizePath(pathname: string): AppRoute {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return '/dashboard';
  }
  return '/';
}

export function useRouter() {
  const [route, setRoute] = useState<AppRoute>(() =>
    normalizePath(window.location.pathname)
  );

  useEffect(() => {
    const handlePopState = () => {
      setRoute(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: AppRoute) => {
    const target = normalizePath(to);
    if (window.location.pathname !== target) {
      window.history.pushState({}, '', target);
    }
    setRoute(target);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return { route, navigate };
}
