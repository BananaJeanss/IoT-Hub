import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        wallCommentsPrivacy: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      wallCommentsPrivacy:
        (user as { wallCommentsPrivacy?: string }).wallCommentsPrivacy || 'everyone',
    });
  } catch (error) {
    console.error('Failed to fetch user privacy settings:', error);
    return NextResponse.json({ error: 'Failed to fetch privacy settings' }, { status: 500 });
  }
}
