import type { ComponentProps, FC } from 'react';
import { Link, useLocation } from 'wouter';

const TransitionLink: FC<ComponentProps<typeof Link>> = props => {
  const [, navigate] = useLocation();

  return (
    <Link
      {...props}
      onClick={e => {
        e.preventDefault();
        const to = props.to ?? props.href;
        if (document.startViewTransition) document.startViewTransition(() => navigate(to));
        else navigate(to);
      }}
    />
  );
};
export default TransitionLink;
