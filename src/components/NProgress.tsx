'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200, // how often to increment
  minimum: 0.25, // start at 25%
  speed: 400, // how long the bar takes to finish
});

export default function NProgressBar() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();
    NProgress.set(0.25);
    NProgress.inc();

    const timer = setTimeout(() => NProgress.done(), 75);
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname]);

  return null;
}
