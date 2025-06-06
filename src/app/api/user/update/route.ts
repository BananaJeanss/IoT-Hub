import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const {
    bio,
    tags,
    backgroundImage,
    backgroundType,
    gradientStartRgb,
    gradientEndRgb,
    image,
    wallCommentsPrivacy,
  } = body;

  try {
    const updateData: Record<string, unknown> = {
      bio,
      image,
      tags,
      backgroundImage,
      backgroundType,
      gradientStartRgb,
      gradientEndRgb,
    };

    if (wallCommentsPrivacy !== undefined) {
      updateData.wallCommentsPrivacy = wallCommentsPrivacy;
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
