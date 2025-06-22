'use client';

import Link from 'next/link';
import './notVerified.css';

export default function NotVerifiedBanner() {
  return (
    <div id="not-verified-banner">
      <p>Your account is not verified. Please check your email for the verification link.</p>
      <Link href="/settings/">Check your verification status in Settings.</Link>
    </div>
  );
}
