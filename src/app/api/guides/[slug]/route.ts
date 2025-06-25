import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    const guide = await prisma.guide.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            stars: true,
            views: true,
            comments: true,
          },
        },
      },
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    } // Record view (only if user is logged in and not the owner)
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user && user.id !== guide.userId) {
        await prisma.view.createMany({
          data: {
            userId: user.id,
            guideId: guide.id,
          },
          skipDuplicates: true, // Prevent duplicate views from the same user
        });
      }
    } else {
      // Record anonymous view with IP
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      await prisma.view.create({
        data: {
          guideId: guide.id,
          ip,
        },
      });
    }

    // Transform the response to match frontend expectations
    const response = {
      ...guide,
      author: guide.user,
      views: guide._count.views,
      user: undefined,
      _count: undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch guide:', error);
    return NextResponse.json({ error: 'Failed to fetch guide' }, { status: 500 });
  }
}
