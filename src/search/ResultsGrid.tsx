import { useQuery } from '@tanstack/react-query';
import { type FC } from 'react';
import { Link, useLocation } from 'wouter';
import { getQuote } from '../quote/quote';

const Result: FC<{ id: string }> = ({ id }) => {
  const [, navigate] = useLocation();

  const quote = useQuery({ queryKey: ['quote', id], queryFn: () => getQuote(id) });

  return (
    <Link
      className='border-border bg-card hover:border-accent aspect-square cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-lg'
      to={`/quote/${id}`}
      onClick={e => {
        e.preventDefault();
        if (document.startViewTransition) document.startViewTransition(() => navigate(`/quote/${id}`));
        else navigate(`/quote/${id}`);
      }}
      style={{ viewTransitionName: `image-${id}` }}
    >
      <img
        className='h-full w-full object-cover'
        src={`${import.meta.env.BASE_URL}/images/${id}.${quote.data?.f === 'g' ? 'gif' : 'webp'}`}
        alt={quote.data?.t}
        loading='lazy'
      />
    </Link>
  );
};

const ResultsGrid: FC<{ results: string[] }> = ({ results }) => {
  return (
    <div className='space-y-2'>
      <p className='text-muted-foreground text-sm'>
        Found {results.length} result{results.length === 1 || 's'}
      </p>

      {results.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <p className='text-lg font-semibold'>No posts found</p>
          <p className='text-muted-foreground mt-1 text-sm'>Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className='grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-2'>
          {results.map(id => (
            <Result key={id} id={id} />
          ))}
        </div>
      )}
    </div>
  );
};
export default ResultsGrid;
