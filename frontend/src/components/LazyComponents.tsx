import { lazy, Suspense } from 'react';

// Lazy loading de componentes vigentes
export const LazyNews = lazy(() => import('./News'));
export const LazyAllNews = lazy(() => import('./AllNewsModern'));
export const LazyNewsDetail = lazy(() => import('./NewsDetailModern'));

// Componente de Loading genérico
export const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
  </div>
);

// Wrapper con Suspense
export const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);