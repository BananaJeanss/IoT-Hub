import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import SettingsClient from './SettingsClient';
import { prisma } from '@/lib/prisma';

import './settings.css';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? undefined },
  });
  if (!user) {
    redirect('/login');
  }
  return <SettingsClient user={user} />;
}
