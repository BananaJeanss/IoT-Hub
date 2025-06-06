import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content, wallOwnerId } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    const author = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!author) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check privacy settings of the wall owner
    const wallOwner = await prisma.user.findUnique({
      where: { id: wallOwnerId },
    });

    if (!wallOwner) {
      return NextResponse.json({ error: 'Wall owner not found' }, { status: 404 });
    }

    // Check if comments are restricted to owner only
    const wallCommentsPrivacy =
      (wallOwner as { wallCommentsPrivacy?: string }).wallCommentsPrivacy || 'everyone';
    if (wallCommentsPrivacy === 'owner-only' && author.id !== wallOwnerId) {
      return NextResponse.json(
        { error: 'Only the wall owner can post comments on this wall' },
        { status: 403 },
      );
    }

    const wallPost = await prisma.wallPost.create({
      data: {
        content: content.trim(),
        authorId: author.id,
        wallOwnerId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(wallPost);
  } catch (error) {
    console.error('Wall post creation error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const wallOwnerId = searchParams.get('wallOwnerId');

  if (!wallOwnerId) {
    return NextResponse.json({ error: 'wallOwnerId is required' }, { status: 400 });
  }

  try {
    const posts = await prisma.wallPost.findMany({
      where: { wallOwnerId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch wall posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
