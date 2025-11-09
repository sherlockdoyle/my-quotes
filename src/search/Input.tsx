import { Search } from 'lucide-react';
import { useEffect, useRef, useState, type FC } from 'react';

const END_SUGGESTION_RE = /(#|:)(\w*)$/;

const Input: FC<{
  query: string;
  onSearch: (query: string, forced?: boolean) => void;
  suggestions: { tags: string[]; cats: string[] };
}> = ({ query, onSearch, suggestions }) => {
  const [value, setValue] = useState(query);
  const [showSuggestion, setShowSuggestions] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value), 1000);
    return () => clearTimeout(timeout);
  }, [value]);

  const suggestionMatch = value.match(END_SUGGESTION_RE);

  return (
    <div ref={containerRef} className='relative'>
      <form
        className='border-border flex h-10 items-center rounded-lg border'
        onSubmit={e => {
          e.preventDefault();
          onSearch(value, true);
          setShowSuggestions(false);
        }}
      >
        <input
          className='h-full flex-1 py-2 pl-3 outline-none'
          type='text'
          value={value}
          onFocus={() => setShowSuggestions(true)}
          onBlur={e => {
            if (!containerRef.current?.contains(e.relatedTarget || document.activeElement)) setShowSuggestions(false);
          }}
          onChange={e => setValue(e.target.value)}
        />

        <button
          className='bg-primary text-primary-foreground focus:ring-ring cursor-pointer rounded-lg p-2 transition-opacity hover:opacity-90'
          type='submit'
        >
          <Search className='aspect-square h-full' />
        </button>
      </form>

      {showSuggestion && suggestionMatch && (
        <div className='bg-card border-border absolute right-0 left-0 z-10 -mt-px mr-10 grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-1 rounded-md border px-2 py-4 shadow-lg'>
          {(suggestionMatch[1] === '#' ? suggestions.tags : suggestions.cats)
            .filter(m => m.startsWith(suggestionMatch[2]))
            .slice(0, 12)
            .map(m => {
              const text = suggestionMatch[1] + m;
              return (
                <div key={text}>
                  <button
                    className='text-accent cursor-pointer px-3 py-1 text-left text-sm break-all'
                    onClick={() => {
                      setValue(value.replace(END_SUGGESTION_RE, text));
                      setShowSuggestions(false);
                    }}
                  >
                    {text}
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
export default Input;
