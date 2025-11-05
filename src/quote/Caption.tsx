import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import { Link } from 'wouter';
import { type Quote } from './quote';

const TAG_REGEX = /#(\w+)/g;
const LINK_REGEX = /\b(?:https?:\/\/|www\.)[^\s]+/g;
interface Segment {
  type: 'text' | 'mention' | 'tag' | 'link';
  text: string;
}
function segmentCaption(caption: Quote['c'], mentions: Quote['m']): Segment[] {
  const events: { pos: number; type: 'mStart' | 'mEnd' | 'tStart' | 'tEnd' | 'lStart' | 'lEnd' }[] = [];

  if (mentions)
    for (const [s, e] of mentions) {
      events.push({ pos: s, type: 'mStart' });
      events.push({ pos: e, type: 'mEnd' });
    }

  const linkRanges: NonNullable<Quote['m']> = [];
  for (const match of caption.matchAll(LINK_REGEX)) {
    const s = match.index,
      e = s + match[0].length;
    linkRanges.push([s, e]);
    events.push({ pos: s, type: 'lStart' });
    events.push({ pos: e, type: 'lEnd' });
  }
  linkRanges.sort((a, b) => a[0] - b[0]);

  tagLoop: for (const match of caption.matchAll(TAG_REGEX)) {
    const s = match.index,
      e = s + match[0].length;

    let lo = 0,
      hi = linkRanges.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const [ls, le] = linkRanges[mid];
      if (s < ls) hi = mid - 1;
      else if (s >= le) lo = mid + 1;
      else continue tagLoop;
    }

    events.push({ pos: s, type: 'tStart' });
    events.push({ pos: e, type: 'tEnd' });
  }

  events.sort((a, b) => a.pos - b.pos);

  const segments: Segment[] = [];
  let start = 0,
    currentType: Segment['type'] = 'text';
  for (const { pos, type } of events) {
    if (pos > start) {
      segments.push({ type: currentType, text: caption.slice(start, pos) });
      start = pos;
    }

    currentType = type === 'mStart' ? 'mention' : type === 'tStart' ? 'tag' : type === 'lStart' ? 'link' : 'text';
  }
  if (start < caption.length) {
    segments.push({ type: currentType, text: caption.slice(start) });
  }

  return segments;
}

const Caption: FC<{ caption: Quote['c']; mentions: Quote['m'] }> = ({ caption, mentions }) => {
  const [expanded, setExpanded] = useState(false);
  const [isLong, setIsLong] = useState(false);

  const textRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function checkIsLong() {
      if (textRef.current) setIsLong(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
    checkIsLong();

    const resizeObserver = new ResizeObserver(checkIsLong);
    if (textRef.current) resizeObserver.observe(textRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const segments = useMemo(() => segmentCaption(caption, mentions), [caption, mentions]);

  return (
    <div className='space-y-2'>
      <div
        ref={textRef}
        className={`text-foreground scroll-mt-20 leading-relaxed whitespace-pre-wrap ${expanded ? '' : 'line-clamp-3'}`}
      >
        {segments.map(({ type, text }, i) => {
          if (type === 'mention')
            return (
              <span key={i} className='text-primary bg-primary/10 inline rounded px-0.5 font-semibold'>
                {text}
              </span>
            );

          if (type === 'tag')
            return (
              // path params is used because query params with hash routes doesn't look good
              <Link key={i} className='text-accent px-0.5 hover:underline' to={`/search/${encodeURIComponent(text)}`}>
                {text}
              </Link>
            );

          if (type === 'link')
            return (
              <a key={i} className='text-primary hover:underline' href={text} target='_blank'>
                {text}
              </a>
            );

          return text;
        })}
      </div>

      {(isLong || expanded) && ( // show button if already expanded
        <div className='flex justify-end'>
          <button
            className='text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors'
            onClick={() => {
              setExpanded(!expanded);
              if (!expanded) textRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {expanded ? (
              <>
                <ChevronUp className='h-4 w-4' />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className='h-4 w-4' />
                Show more
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
export default Caption;
