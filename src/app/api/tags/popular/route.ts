import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cache popular tags for a hour
let cachedTags: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    const now = Date.now();

    if (cachedTags && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json({ tags: cachedTags });
    }

    const result = await prisma.$queryRaw`
      SELECT tag, COUNT(*) as count
      FROM (
        SELECT UNNEST(tags) as tag
        FROM "User" 
        WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
      ) as user_tags
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 20
    `;

    cachedTags = (result as Array<{ tag: string; count: bigint }>).map((item) => item.tag);
    cacheTimestamp = now;

    return NextResponse.json({ tags: cachedTags });
  } catch (error) {
    console.error('Failed to fetch popular tags:', error);
    return NextResponse.json({ tags: cachedTags || [] });
  }
}
