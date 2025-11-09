import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'wouter';
import { getQuote, type Quote } from './quote';
import QuoteView from './QuoteView';
import RandomSimilar from './RandomSimilar';

const ShareIcon: FC<{ name: string; href: string; path: string; color: string }> = ({ name, href, path, color }) => (
  <a
    className='border-border bg-card hover:bg-muted cursor-pointer rounded-full border p-1 text-sm font-medium transition-colors'
    title={`Share on ${name}`}
    href={href}
    target='_blank'
  >
    <svg className='h-5 w-5' role='img' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill={color}>
      <title>{name}</title>
      <path d={path} />
    </svg>
  </a>
);

function truncate(text: string, maxLength: number, ellipsis = '...') {
  if (text.length <= maxLength) return text;

  const targetLength = maxLength - ellipsis.length;
  let truncated = text.substring(0, targetLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  if (lastSpaceIndex >= 0) truncated = truncated.substring(0, lastSpaceIndex);
  return truncated + ellipsis;
}
const Share: FC<{ id: string; quote: Quote }> = ({ id, quote }) => {
  const text = quote.t + '\n\n' + quote.c;
  const url = encodeURIComponent(`${window.location.origin}${import.meta.env.BASE_URL}#/quote/${id}`);

  return (
    <div className='flex flex-wrap items-center gap-x-4 gap-y-2'>
      <a
        className='text-muted-foreground flex items-center gap-1 text-sm hover:underline'
        href={quote.h}
        rel='noopener noreferrer'
        target='_blank'
      >
        Open in YourQuote
        <ExternalLink className='h-4 w-4' />
      </a>

      <div className='ml-auto flex items-center gap-2'>
        <ShareIcon
          name='X'
          href={`https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(truncate(text, 220, '... Click to read more'))}`}
          color='#fff'
          path='M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z'
        />
        <ShareIcon
          name='Facebook'
          href={`https://facebook.com/sharer.php?u=${url}`}
          color='#0866FF'
          path='M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z'
        />
        <ShareIcon
          name='WhatsApp'
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(truncate(text, 1400, '... Click link to read more') + '\n\n')}${url}`}
          color='#25D366'
          path='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z'
        />
        <ShareIcon
          name='Telegram'
          href={`https://t.me/share/url?url=${url}&text=${encodeURIComponent(truncate(text, 1400, '... Tap to see full'))}`}
          color='#26A5E4'
          path='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z'
        />
        <ShareIcon
          name='Reddit'
          href={`https://reddit.com/submit?url=${url}&title=${encodeURIComponent(truncate(text, 280, '... More inside'))}`}
          color='#FF4500'
          path='M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z'
        />
      </div>
    </div>
  );
};

const Navigation: FC<{ id: string; prev: Quote['p']; next: Quote['n'] }> = ({ id, prev, next }) => (
  <div className='border-border/40 flex items-center justify-between gap-3 border-t pt-4'>
    <Link
      className='border-border bg-card hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors'
      title='Previous quote'
      to={`/quote/${prev}`}
    >
      <ChevronLeft className='h-4 w-4' />
      Previous
    </Link>

    <RandomSimilar id={id} />

    <Link
      className='border-border bg-card hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors'
      title='Next quote'
      to={`/quote/${next}`}
    >
      Next
      <ChevronRight className='h-4 w-4' />
    </Link>
  </div>
);

const QuotePage: FC<{ params: { id: string } }> = ({ params: { id } }) => {
  const quote = useQuery({ queryKey: ['quote', id], queryFn: () => getQuote(id) });

  if (quote.isPending)
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center'>
        <div className='border-border border-r-primary inline-block h-8 w-8 animate-spin rounded-full border-4' />
        <p className='text-muted-foreground mt-2'>Loading quote...</p>
      </div>
    );

  if (quote.isError)
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center'>
        <p className='mb-2 text-2xl font-bold text-red-400'>Error loading quote</p>
        <p className='text-muted-foreground mb-4'>{quote.error.message}</p>
      </div>
    );

  return (
    <div className='space-y-6'>
      <QuoteView id={id} quote={quote.data} />

      <Share id={id} quote={quote.data} />

      <Navigation id={id} next={quote.data.n} prev={quote.data.p} />
    </div>
  );
};
export default QuotePage;
