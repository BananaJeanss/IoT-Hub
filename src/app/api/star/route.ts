import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the project by slug
    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if already starred
    const existingStar = await prisma.star.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: project.id,
        },
      },
    });

    if (existingStar) {
      // Unstar the project
      await prisma.star.delete({
        where: { id: existingStar.id },
      });

      return NextResponse.json({ starred: false, message: 'Project unstarred' });
    } else {
      // Star the project
      await prisma.star.create({
        data: {
          userId: session.user.id,
          projectId: project.id,
        },
      });

      return NextResponse.json({ starred: true, message: 'Project starred' });
    }
  } catch (error) {
    console.error('Star toggle error:', error);
    return NextResponse.json({ error: 'Failed to toggle star' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const session = await getServerSession(authOptions);

    // Find the project by slug
    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
      include: {
        _count: {
          select: {
            stars: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let isStarred = false;
    if (session?.user?.id) {
      const star = await prisma.star.findUnique({
        where: {
          userId_projectId: {
            userId: session.user.id,
            projectId: project.id,
          },
        },
      });
      isStarred = !!star;
    }

    return NextResponse.json({
      starCount: project._count.stars,
      isStarred,
    });
  } catch (error) {
    console.error('Get star status error:', error);
    return NextResponse.json({ error: 'Failed to get star status' }, { status: 500 });
  }
}
