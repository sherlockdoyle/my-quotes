import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type FC } from 'react';
import { Redirect, Route, Router } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import QuotePage from './quote/QuotePage';
import SearchButton from './search/SearchButton';
import SearchPage from './search/SearchPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000, // 1 hour
      retry: 1,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App: FC = () => {
  useEffect(() => {
    if (!document.startViewTransition) return;

    function handlePopState() {
      document.startViewTransition(() => {}); // transition on back button press
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Hash routing since this will be hosted on GitHub Pages */}
      <Router hook={useHashLocation}>
        <div className='bg-background text-foreground min-h-screen'>
          <header className='border-border bg-background/60 sticky top-0 z-50 border-b backdrop-blur'>
            <div className='mx-auto flex max-w-3xl items-center justify-between px-4 py-2'>
              <h1 className='py-1.5 text-2xl font-bold tracking-tight'>My Quotes</h1>
              <SearchButton />
            </div>
          </header>

          <main className='mx-auto max-w-3xl p-2 sm:p-4'>
            <Route path='/quote/:id' component={QuotePage} />
            <Route path='/search/:query?' component={SearchPage} />
            <Route path='/'>
              <Redirect to='/quote/np7e5' />
            </Route>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
};
export default App;
