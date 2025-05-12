// src/app/layout.tsx
import './globals.css';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IoT Hub',
  description: 'Discover projects, learn new skills and share your own.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Note: charset & viewport are automatically handled by Next.js */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        {/* Navbar container */}
        <div id="navbar" />

        {/* Your script injected after page load */}
        <Script src="/navbar.js" strategy="afterInteractive" />

        {/* Your content gets injected into the "main" div here */}
        <div id="main">
          {children}
        </div>
      </body>
    </html>
  );
}
