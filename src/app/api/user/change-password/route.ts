import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import argon2 from 'argon2';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { password } = await req.json();

  // Password validation (same as signup)
  if (typeof password !== 'string' || password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters long.' },
      { status: 400 },
    );
  }
  if (!/[A-Z]/.test(password)) {
    return NextResponse.json(
      { error: 'Password must contain at least one uppercase letter.' },
      { status: 400 },
    );
  }
  if (!/[a-z]/.test(password)) {
    return NextResponse.json(
      { error: 'Password must contain at least one lowercase letter.' },
      { status: 400 },
    );
  }
  if (!/[0-9]/.test(password)) {
    return NextResponse.json(
      { error: 'Password must contain at least one number.' },
      { status: 400 },
    );
  }

  try {
    const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
    await prisma.user.update({
      where: { email: session.user.id },
      data: { password: hashedPassword },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Password change failed.' }, { status: 500 });
  }
}
