import { memo, useEffect, useRef, useState, type FC } from 'react';
import { type Quote } from './quote';

function generateRandomColors() {
  return Array.from({ length: 4 }, () => Math.random() * 360).map(
    hue => `hsl(${hue}, ${70 + Math.random() * 30}%, ${Math.random() * 30}%)`,
  );
}
function generateGradient() {
  const type = Math.floor(Math.random() * 3);
  const colors = generateRandomColors();
  const colorsJoined = colors.join(',');
  switch (type) {
    default:
    case 0: // linear
      return `linear-gradient(${Math.random() * 360}deg,${colorsJoined})`;
    case 1: // radial
      return `radial-gradient(circle at ${Math.random() * 100}% ${Math.random() * 100}%,${colorsJoined})`;
    case 2: // conic
      return `conic-gradient(from ${Math.random() * 360}deg at ${Math.random() * 100}% ${Math.random() * 100}%,${colorsJoined},${colors[0]})`;
  }
}

function setOptimalFontSize(textElement: HTMLElement, maxWidth: number, maxHeight: number) {
  let fontSize = Number.parseFloat(textElement.style.fontSize) || 16; // parse will ignore unit

  while (textElement.offsetWidth <= maxWidth && textElement.offsetHeight <= maxHeight) {
    fontSize *= 2;
    textElement.style.fontSize = fontSize + 'px';
  }

  let min = fontSize / 2,
    max = fontSize;
  fontSize = min;
  while (min <= max) {
    const mid = Math.floor((min + max) / 2);
    textElement.style.fontSize = mid + 'px';

    if (textElement.offsetWidth <= maxWidth && textElement.offsetHeight <= maxHeight) {
      fontSize = mid;
      min = mid + 1;
    } else {
      max = mid - 1;
    }
  }

  textElement.style.fontSize = (fontSize > 24 ? fontSize * 0.9 : fontSize) + 'px';
}

const GradientLoader: FC<{ text: string }> = memo(({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateFontSize() {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        setOptimalFontSize(textRef.current, containerWidth, containerHeight);
      }
    }
    updateFontSize();

    const resizeObserver = new ResizeObserver(updateFontSize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className='absolute flex h-full w-full items-center justify-center overflow-hidden'
      style={{ background: generateGradient() }}
    >
      <div ref={textRef} className='max-w-[90%] text-center leading-tight wrap-break-word'>
        <span className='font-bold whitespace-pre-wrap text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'>{text}</span>
      </div>
    </div>
  );
});

const Image: FC<{ id: string; format: Quote['f']; text: Quote['t'] }> = ({ id, format, text }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className='bg-card relative aspect-square w-full overflow-hidden rounded-lg'
      style={{ viewTransitionName: `image-${id}` }}
    >
      {imageLoaded || <GradientLoader text={text} />}
      <img
        className={`h-full w-full ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        src={`${import.meta.env.BASE_URL}/images/${id}.${format === 'g' ? 'gif' : 'webp'}`}
        alt={text}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
};
export default Image;
