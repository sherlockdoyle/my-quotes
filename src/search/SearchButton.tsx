import { Search } from 'lucide-react';
import type { FC } from 'react';
import { Link, useRoute } from 'wouter';

const SearchButton: FC = () => {
  const [match] = useRoute('/search/:query?');

  if (match) return null;

  return (
    <Link
      className='border-border text-foreground/75 hover:text-foreground rounded-full border p-2 transition-colors'
      to='/search'
    >
      <Search className='h-6 w-6' />
    </Link>
  );
};
export default SearchButton;
