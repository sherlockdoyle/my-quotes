import { AlertTriangle } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'wouter';

const FeaturedCard: FC<{
  title: string;
  description: string;
  href: string;
  imageName?: string;
  viewTransitionName?: string;
}> = ({ title, description, href, imageName, viewTransitionName }) => (
  <Link
    className='group relative h-64 cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-105'
    to={href}
  >
    <div
      className={`absolute inset-0 transition-transform group-hover:scale-110 ${imageName ? '' : 'bg-linear-to-br'}`}
      style={{
        backgroundImage: imageName
          ? `url(${import.meta.env.BASE_URL}/images/${imageName})`
          : 'radial-gradient(circle at 30% 40%, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.6) 25%, rgba(168, 85, 247, 0.4) 50%, rgba(59, 130, 246, 0.3) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        viewTransitionName,
      }}
    />

    <div className='absolute inset-x-0 top-0 z-10 flex h-1/2 items-start bg-linear-to-b from-black/90 via-black/60 to-transparent p-6'>
      <h3 className='text-2xl leading-tight font-bold text-balance text-white uppercase text-shadow-lg'>{title}</h3>
    </div>

    <div className='absolute inset-x-0 bottom-0 min-h-1/2 translate-y-0 bg-linear-to-t from-black/90 via-black/70 to-transparent p-6 transition-transform duration-300 ease-out md:translate-y-full md:group-hover:translate-y-0'>
      <p className='absolute bottom-6 text-base leading-relaxed text-white/90 text-shadow-sm'>{description}</p>
    </div>
  </Link>
);

const HomePage: FC = () => (
  <div className='space-y-8 px-2 py-4'>
    <div className='border-destructive/50 bg-destructive/10 flex items-start gap-3 rounded-lg border p-4'>
      <AlertTriangle className='text-destructive mt-0.5 h-5 w-5 shrink-0' />
      <div>
        <h3 className='text-destructive font-semibold'>Sensitive Content</h3>
        <p className='text-destructive mt-1 text-sm'>
          Some quotes may contain sensitive content. Please use caution when reading them.
        </p>
      </div>
    </div>

    <section className='space-y-4'>
      <p className='text-foreground/90 mt-4 max-w-2xl text-lg'>
        Once upon a long, long time ago, I used to write stories on{' '}
        <a className='underline' href='https://www.yourquote.in/' target='_blank'>
          YourQuote
        </a>
        . This started when I took part in a story-writing competition hosted by Eclectica, the literature club of my
        college. Since then, I've written many things - although nowadays I'm more interested in writing code rather
        than stories. This website is a collection of all the quotes I've written over the years, a backup of sorts.
      </p>
    </section>

    <section className='space-y-4'>
      <h3 className='text-2xl font-bold'>My Choice</h3>
      <p className='text-muted-foreground'>
        A collection of my favorite quotes. Click on one to get started and navigate using the next and previous
        buttons. Or read a random similar quote and discover unexpected connections. Finally, you can always{' '}
        <Link className='underline' to='/search'>
          search
        </Link>{' '}
        by tags, categories, or semantic content.
      </p>

      <div className='grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-4'>
        <FeaturedCard
          title='Continuity'
          description='A collection of stories that are linked together. Or, are they?'
          href='/search/%23continuity_by_sd'
        />
        <FeaturedCard
          title='Fragments'
          description='A collection of different stories, maybe. Make sure to read them in order, or not!'
          href='/search/%23fragments_by_sd'
          imageName='crjn0m.webp'
        />
        <FeaturedCard
          title='A Poem'
          description='Just a poem I like (and wrote).'
          href='/quote/csyps7'
          imageName='csyps7.webp'
          viewTransitionName='image-csyps7'
        />
        <FeaturedCard
          title='Funny'
          description='Have a laugh.'
          href='/quote/crl4mn'
          imageName='crl4mn.webp'
          viewTransitionName='image-crl4mn'
        />
      </div>
    </section>
  </div>
);
export default HomePage;
