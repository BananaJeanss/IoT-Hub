import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { username } = await req.json();
  if (username !== session.user.name) {
    return NextResponse.json({ error: 'Username mismatch' }, { status: 400 });
  }

  try {
    // handle the deletion of a user account and all related records
    // Delete related records first
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete stars
    await prisma.star.deleteMany({ where: { userId: user.id } });
    // Delete wall posts authored by or on the user's wall
    await prisma.wallPost.deleteMany({
      where: { OR: [{ authorId: user.id }, { wallOwnerId: user.id }] },
    });
    // Delete projects
    await prisma.project.deleteMany({ where: { userId: user.id } });
    // Delete guides
    await prisma.guide.deleteMany({ where: { userId: user.id } });

    // Delete the user
    await prisma.user.delete({ where: { username } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
