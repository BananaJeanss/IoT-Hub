import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';

export default async function UserPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Replace 'name' with your username field if needed
  redirect(`/user/${session.user?.name}`);
}
