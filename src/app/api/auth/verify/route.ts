import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  // Find the verification token
  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  // Mark user as verified
  await prisma.user.update({
    where: { email: record.email },
    data: {
      isEmailVerified: true,
      whenEmailVerified: new Date(),
    },
  });

  // Delete the token
  await prisma.emailVerificationToken.delete({
    where: { token },
  });

  return NextResponse.json({ success: true });
}
