import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    // Always fetch the user if session exists
    let user = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    const project = await prisma.project.findUnique({
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

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    } // Record view (only if user is logged in and not the owner)
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user && user.id !== project.userId) {
        await prisma.view.create({
          data: {
            userId: user.id,
            projectId: project.id,
          },
        });
      }
    } else {
      // Record anonymous view with IP
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      await prisma.view.create({
        data: {
          projectId: project.id,
          ip,
        },
      });
    }

    // Transform the response to match frontend expectations
    const response = {
      ...project,
      author: project.user,
      views: project._count.views,
      user: undefined,
      _count: undefined,
      isOwner: session?.user?.email && user && user.id === project.userId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}
