'use client';

import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import NotVerifiedBanner from '@/components/notVerified/notVerified';
import { Analytics } from '@vercel/analytics/next';
import { SessionProvider, useSession } from 'next-auth/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

function NotVerifiedBannerWrapper() {
  const { data: session } = useSession();
  if (!session?.user || session.user.isEmailVerified) return null;
  return <NotVerifiedBanner />;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div id="navbar">
        <Navbar />
      </div>
      <NotVerifiedBannerWrapper />
      <div id="main">{children}</div>
      <Footer />
      <Analytics />
      <SpeedInsights />
    </SessionProvider>
  );
}
