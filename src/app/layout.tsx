import './globals.css';
import type { Metadata } from 'next';
import ClientLayout from './ClientLayout';
import { ToastProvider } from '../components/ToastContext';

export const metadata: Metadata = {
  title: 'IoT Hub',
  description: 'Discover projects, learn new skills and share your own.',
  icons: {
    icon: '/favicon.ico',
  },
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
