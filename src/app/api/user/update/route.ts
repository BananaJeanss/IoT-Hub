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

  // Validate tags
  if (tags && Array.isArray(tags)) {
    const MAX_TAG_LENGTH = 25;
    const MAX_TAGS = 5;

    if (tags.length > MAX_TAGS) {
      return NextResponse.json(
        { error: `Cannot have more than ${MAX_TAGS} tags` },
        { status: 400 },
      );
    }

    for (const tag of tags) {
      if (typeof tag !== 'string') {
        return NextResponse.json({ error: 'All tags must be strings' }, { status: 400 });
      }

      const trimmedTag = tag.trim();
      if (trimmedTag.length === 0) {
        return NextResponse.json({ error: 'Tags cannot be empty' }, { status: 400 });
      }

      if (trimmedTag.length > MAX_TAG_LENGTH) {
        return NextResponse.json(
          { error: `Tag "${trimmedTag}" exceeds maximum length of ${MAX_TAG_LENGTH} characters` },
          { status: 400 },
        );
      }

      // Check for invalid characters (allow alphanumeric, spaces, hyphens, underscores, and emojis)
      if (!/^[a-zA-Z0-9\s\-_\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}]+$/u.test(trimmedTag)) {
        return NextResponse.json(
          {
            error: `Tag "${trimmedTag}" contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, and emojis are allowed.`,
          },
          { status: 400 },
        );
      }
    }

    // Remove duplicates and trim whitespace
    const cleanedTags = [...new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0))];
    body.tags = cleanedTags;
  }

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
