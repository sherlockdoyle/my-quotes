import { Calendar } from 'lucide-react';
import { memo, type FC } from 'react';
import { Link } from 'wouter';
import Caption from './Caption';
import Image from './Image';
import { type Quote } from './quote';

const dateTimeFormattter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});
const MetaData: FC<{ time: Date; labels: Quote['l'] }> = memo(({ time, labels }) => (
  <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-2'>
    <div className='text-muted-foreground flex items-center gap-1'>
      <Calendar className='h-4 w-4' />
      <p className='text-sm'>{dateTimeFormattter.format(time)}</p>
    </div>

    {labels && (
      <div className='flex flex-wrap gap-2'>
        {labels.map(label => (
          <Link
            key={label}
            className='bg-accent/10 text-accent hover:bg-accent/20 border-accent/50 inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-medium transition-colors'
            to={`/search/:${label}`}
          >
            {label}
          </Link>
        ))}
      </div>
    )}
  </div>
));

const QuoteView: FC<{ id: string; quote: Quote }> = ({ id, quote }) => (
  <div className='space-y-4'>
    <Image id={id} format={quote.f} text={quote.t} />

    <MetaData time={new Date(quote.d)} labels={quote.l} />

    <Caption caption={quote.c} mentions={quote.m} />
  </div>
);
export default QuoteView;
