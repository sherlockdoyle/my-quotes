import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type FC } from 'react';
import { Link, useLocation } from 'wouter';
import { getQuote } from '../quote/quote';

const Result: FC<{ id: string }> = ({ id }) => {
  const [, navigate] = useLocation();

  const quote = useQuery({ queryKey: ['quote', id], queryFn: () => getQuote(id) });

  return (
    <Link
      className='border-border bg-card aspect-square cursor-pointer overflow-hidden rounded-lg border transition-all hover:scale-105 hover:shadow-lg'
      to={`/quote/${id}`}
      onClick={e => {
        e.preventDefault();
        if (document.startViewTransition) document.startViewTransition(() => navigate(`/quote/${id}`));
        else navigate(`/quote/${id}`);
      }}
      style={{ viewTransitionName: `image-${id}` }}
    >
      <img
        className='h-full w-full object-cover hover:scale-110'
        src={`${import.meta.env.BASE_URL}/images/${id}.${quote.data?.f === 'g' ? 'gif' : 'webp'}`}
        alt={quote.data?.t}
        loading='lazy'
      />
    </Link>
  );
};

const ITEMS_PER_PAGE = 20;
function getPageNumbers(total: number, current: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, 0, total];

  if (current >= total - 3) return [1, 0, total - 4, total - 3, total - 2, total - 1, total];

  return [1, 0, current - 1, current, current + 1, 0, total];
}

const ResultsGrid: FC<{ results: string[]; currentPage: number; setCurrentPage: (page: number) => void }> = ({
  results,
  currentPage,
  setCurrentPage,
}) => {
  function handlePageChange(page: number) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResults = results.slice(startIndex, endIndex);

  return (
    <div className='space-y-2'>
      <p className='text-muted-foreground text-sm'>
        Found {results.length} result{results.length === 1 || 's'}
        {totalPages > 1 && (
          <>
            {' '}
            (showing {startIndex + 1}-{Math.min(endIndex, results.length)})
          </>
        )}
      </p>

      {results.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <p className='text-lg font-semibold'>No posts found</p>
          <p className='text-muted-foreground mt-1 text-sm'>Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-2'>
            {currentResults.map(id => (
              <Result key={id} id={id} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className='mt-4 flex h-10 items-stretch justify-center gap-1'>
              <button
                className='border-border bg-card hover:bg-muted inline-flex max-w-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label='Previous page'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>
              {getPageNumbers(totalPages, currentPage).map((page, index) =>
                page === 0 ? (
                  <span key={`ellipsis-${index}`} className='px-2'>
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`border-border inline-flex max-w-10 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                      page === currentPage ? 'bg-primary' : 'bg-card hover:bg-muted cursor-pointer transition-colors'
                    }`}
                    onClick={() => handlePageChange(page)}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                className='border-border bg-card hover:bg-muted inline-flex max-w-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label='Next page'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ResultsGrid;
