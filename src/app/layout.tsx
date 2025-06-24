import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';
import { ToastProvider } from '../components/ToastContext';

export const metadata: Metadata = {
  title: 'IoT Hub',
  description: 'Discover projects, learn new skills and share your own.',
  keywords: ['IoT', 'projects', 'guides', 'community'],
  authors: [{ name: 'BananaJeanss', url: 'https://github.com/BananaJeanss' }],
  metadataBase: new URL('https://iot-hub-two.vercel.app'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'IoT Hub',
    description: 'Discover projects, learn new skills and share your own.',
    url: 'https://iot-hub-two.vercel.app',
    siteName: 'IoT Hub',
    images: [{ url: '/assets/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IoT Hub',
    description: 'Discover projects, learn new skills and share your own.',
    images: ['/assets/og-image.png'],
    creator: '@BananaJeanss',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <ClientLayout>{children}</ClientLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
