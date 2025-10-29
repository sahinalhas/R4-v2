import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const prefetchMap: Record<string, () => Promise<any>> = {
  '/': () => import('@/pages/Students'),
  '/ogrenci': () => import('@/pages/StudentProfile/StudentProfile'),
  '/raporlar': () => import('@/pages/Reports'),
};

const prefetchedRoutes = new Set<string>();

export function usePrefetchRoutes() {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    if (currentPath === '/' && !prefetchedRoutes.has('/ogrenci')) {
      setTimeout(() => {
        prefetchMap['/']?.().then(() => {
          prefetchedRoutes.add('/ogrenci');
        });
      }, 1000);
    } else if (currentPath === '/ogrenci' && !prefetchedRoutes.has('/ogrenci/:id')) {
      setTimeout(() => {
        prefetchMap['/ogrenci']?.().then(() => {
          prefetchedRoutes.add('/ogrenci/:id');
        });
      }, 500);
    } else if (currentPath.startsWith('/ogrenci/') && !prefetchedRoutes.has('/raporlar')) {
      setTimeout(() => {
        prefetchMap['/raporlar']?.().then(() => {
          prefetchedRoutes.add('/raporlar');
        });
      }, 1000);
    }
  }, [location]);
}
