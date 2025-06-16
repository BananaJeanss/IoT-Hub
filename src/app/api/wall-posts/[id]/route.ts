import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const author = await prisma.user.findUnique({
      where: { email: session.user.id },
    });

    if (!author) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const post = await prisma.wallPost.findUnique({
      where: { id },
      include: { author: true, wallOwner: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Only allow deletion by post author or wall owner
    if (post.authorId !== author.id && post.wallOwnerId !== author.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.wallPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wall post deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
