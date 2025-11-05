import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FC } from 'react';
import { Redirect, Route, Router } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import QuotePage from './quote/QuotePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App: FC = () => (
  <QueryClientProvider client={queryClient}>
    {/* Hash routing since this will be hosted on GitHub Pages */}
    <Router hook={useHashLocation}>
      <div className='bg-background text-foreground min-h-screen'>
        <header className='border-border bg-background/60 sticky top-0 z-50 border-b backdrop-blur'>
          <div className='mx-auto flex max-w-3xl items-center justify-between p-4'>
            <h1 className='text-2xl font-bold tracking-tight'>My Quotes</h1>
          </div>
        </header>

        <main className='mx-auto max-w-3xl p-2 sm:p-4'>
          <Route path='/quote/:id' component={QuotePage} />
          <Route path='/'>
            <Redirect to='/quote/np7e5' />
          </Route>
        </main>
      </div>
    </Router>
  </QueryClientProvider>
);
export default App;
