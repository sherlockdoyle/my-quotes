import { useQuery } from '@tanstack/react-query';
import { CircleQuestionMark, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FC, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import Input from './Input';
import ResultsGrid from './ResultsGrid';
import { Searcher } from './search';

const HelpSection: FC<{ title: string; desc: ReactNode; example: ReactNode }> = ({ title, desc, example }) => (
  <div>
    <h4 className='mb-1 font-semibold'>{title}</h4>
    <p className='text-muted-foreground mb-2'>{desc}</p>
    <code className='bg-muted block rounded px-3 py-2 text-xs'>{example}</code>
  </div>
);

const Help: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className='border-border text-foreground/75 hover:text-foreground cursor-pointer rounded-full border transition-colors'
        title='Search help'
        onClick={() => setIsOpen(true)}
      >
        <CircleQuestionMark className='h-6 w-6' />
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4'>
          <div className='bg-card border-border max-h-[80vh] w-full max-w-md overflow-auto rounded-lg border'>
            <div className='border-border bg-card sticky top-0 flex items-center justify-between border-b p-4'>
              <h3 className='text-lg font-bold'>Search Syntax Guide</h3>
              <button
                className='text-muted-foreground hover:text-foreground cursor-pointer transition-colors'
                onClick={() => setIsOpen(false)}
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='space-y-4 p-4 text-sm'>
              <HelpSection
                title='Normal Text Search'
                desc='Search by plain text without any prefix'
                example='fragments'
              />

              <HelpSection
                title='Tags'
                desc={
                  <>
                    Start with <code className='bg-muted rounded px-1 py-0.5'>#</code> to search by tag
                  </>
                }
                example='#YourQuoteAndMine #death'
              />

              <HelpSection
                title='Categories'
                desc={
                  <>
                    Start with <code className='bg-muted rounded px-1 py-0.5'>:</code> to search by category
                  </>
                }
                example=':hor :lif'
              />

              <HelpSection
                title='AND Operator'
                desc={
                  <>
                    Use <code className='bg-muted rounded px-1 py-0.5'>&</code> to find posts with multiple criteria.
                    Multiple tags and labels are implicitly combined with AND. The following are equivalent:'
                  </>
                }
                example={
                  <>
                    #murder & :lov
                    <br />
                    #murder :lov
                  </>
                }
              />

              <HelpSection
                title='OR Operator'
                desc={
                  <>
                    Use <code className='bg-muted rounded px-1 py-0.5'>|</code> to find posts with either criteria
                  </>
                }
                example='#ghost | :sto'
              />

              <HelpSection
                title='Grouping'
                desc={
                  <>
                    Use <code className='bg-muted rounded px-1 py-0.5'>()</code> to group operations
                  </>
                }
                example='(#shortstory | #YoStoWriMo) & :dia'
              />

              <HelpSection
                title='Combining Everything'
                desc='Complex example:'
                example='continuity (#love | :mtl) & (#fear | :pot)'
              />

              <div className='border-border border-t pt-4'>
                <p className='text-muted-foreground text-xs'>
                  <strong>Tip:</strong> In normal mode, only tags and categories are searchable. Enable semantic search
                  to search through post text content as well.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const enum SemanticEnabledState {
  Disabled = 0,
  Confirmation = 1,
  Enabled = 2,
}
const SEMANTIC_ENABLED_KEY = 'semanticEnabled';
function useLocalStorageSemanticEnabled() {
  const [value, setValue] = useState<SemanticEnabledState>(() => {
    const storedValue = localStorage.getItem(SEMANTIC_ENABLED_KEY);
    return storedValue ? JSON.parse(storedValue) : SemanticEnabledState.Disabled;
  });

  useEffect(() => {
    localStorage.setItem(SEMANTIC_ENABLED_KEY, JSON.stringify(value));
  }, [value]);

  return [value, setValue] as const;
}

const SearchPage: FC<{ params: { query?: string } }> = ({ params: { query } }) => {
  const [semanticEnabled, setSemanticEnabled] = useLocalStorageSemanticEnabled();

  const tagsMap = useQuery<Record<string, string[]>>({
    queryKey: ['tagsMap'],
    queryFn: async () => await (await fetch(`${import.meta.env.BASE_URL}/tags.json`)).json(),
  });
  const catsMap = useQuery<Record<string, string[]>>({
    queryKey: ['categoriesMap'],
    queryFn: async () => await (await fetch(`${import.meta.env.BASE_URL}/categories.json`)).json(),
  });

  const searcher = useMemo(
    () => new Searcher(tagsMap.data, catsMap.data, semanticEnabled === SemanticEnabledState.Enabled),
    [tagsMap.data, catsMap.data, semanticEnabled],
  );

  const [, navigate] = useLocation();
  const searchQuery = query ? decodeURIComponent(query) : '';
  const doSearch = useQuery({
    queryKey: [
      'search',
      searchQuery,
      tagsMap.isSuccess,
      catsMap.isSuccess,
      semanticEnabled === SemanticEnabledState.Enabled,
    ], // refine search after dependencies load
    queryFn: () => searcher.doSearch(searchQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='text-xl font-bold'>Over-engineered Search</h2>
          <Help />
        </div>

        <div className='space-y-1'>
          <div className='flex items-center gap-4'>
            <label className='flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium'>
              <input
                className='border-border bg-input h-4 w-4 cursor-pointer rounded'
                type='checkbox'
                checked={semanticEnabled > 0}
                onChange={e =>
                  setSemanticEnabled(
                    e.target.checked ? SemanticEnabledState.Confirmation : SemanticEnabledState.Disabled,
                  )
                }
              />
              Enable semantic search
            </label>

            <label className='flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium transition-opacity has-disabled:cursor-not-allowed has-disabled:opacity-50'>
              <input
                className='border-border bg-input h-4 w-4 cursor-pointer rounded'
                type='checkbox'
                checked={semanticEnabled > 1}
                disabled={semanticEnabled === SemanticEnabledState.Disabled}
                onChange={e =>
                  setSemanticEnabled(
                    e.target.checked ? SemanticEnabledState.Enabled : SemanticEnabledState.Confirmation,
                  )
                }
              />
              I am sure
            </label>
          </div>

          <p
            className={`text-sm transition-colors ${semanticEnabled === SemanticEnabledState.Confirmation ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Enabling semantic search will download around 30MB of data.
          </p>
        </div>
      </div>

      <div className='space-y-1'>
        <Input
          query={searchQuery}
          suggestions={{
            tags: tagsMap.data ? Object.keys(tagsMap.data) : [],
            cats: catsMap.data ? Object.keys(catsMap.data) : [],
          }}
          onSearch={(q, forced) => {
            if (q)
              if (q !== searchQuery) navigate(`/search/${encodeURIComponent(q)}`, { replace: true });
              else if (forced) doSearch.refetch();
          }}
        />
        {semanticEnabled === SemanticEnabledState.Enabled || (
          <p className='text-muted-foreground text-xs'>
            Only tags and categories are searchable without semantic search.
          </p>
        )}
      </div>

      {doSearch.isPending ? (
        <div className='flex flex-col items-center justify-center'>
          <div className='border-border border-r-primary inline-block h-8 w-8 animate-spin rounded-full border-4' />
          <p className='text-muted-foreground mt-2'>Searching...</p>
        </div>
      ) : doSearch.isError ? (
        <div className='flex flex-col items-center justify-center'>
          <p className='mb-2 text-2xl font-bold text-red-400'>Error searching</p>
          <p className='text-muted-foreground mb-4'>{doSearch.error.message}</p>
        </div>
      ) : (
        <ResultsGrid results={doSearch.data} />
      )}
    </div>
  );
};
export default SearchPage;
