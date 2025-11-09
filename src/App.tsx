import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type FC } from 'react';
import { Link, Redirect, Route, Router, Switch } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import HomePage from './home/HomePage';
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
    history.scrollRestoration = 'auto';

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
            <div className='mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-2'>
              <Link to='/'>
                <h1 className='py-1.5 text-2xl font-bold tracking-tight'>My Quotes</h1>
              </Link>
              <div className='flex items-center gap-2'>
                <SearchButton />
                <a
                  className='border-border text-foreground hover:bg-muted rounded-full border p-2 font-bold transition-colors'
                  href='https://www.yourquote.in/sherlock-doyle-9qp8/quotes'
                  target='_blank'
                >
                  YQ
                </a>
                <a
                  className='border-border text-foreground hover:bg-muted rounded-full border p-2 transition-colors'
                  href='https://github.com/sherlockdoyle/my-quotes'
                  target='_blank'
                >
                  <svg
                    className='h-6 w-6'
                    role='img'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='#e9e9e9'
                  >
                    <title>GitHub</title>
                    <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
                  </svg>
                </a>
              </div>
            </div>
          </header>

          <main className='mx-auto max-w-3xl p-2 sm:p-4'>
            <Switch>
              <Route path='/' component={HomePage} />
              <Route path='/quote/:id' component={QuotePage} />
              <Route path='/search/:query?' component={SearchPage} />
              <Route>
                <Redirect to='/' />
              </Route>
            </Switch>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
};
export default App;
