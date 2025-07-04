import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { sanitizeUserContent } from '@/lib/markdownUtils';

// Helper function to generate a unique slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.project.findUnique({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description,
      content,
      tags,
      image,
      links,
      backgroundType,
      gradientStart,
      gradientEnd,
    } = body;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

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

        // Check for invalid characters
        if (
          !/^[a-zA-Z0-9\s\-_\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}]+$/u.test(trimmedTag)
        ) {
          return NextResponse.json(
            {
              error: `Tag "${trimmedTag}" contains invalid characters. Only letters, numbers, spaces, hyphens, underscores, and emojis are allowed.`,
            },
            { status: 400 },
          );
        }
      }
    }

    // Validate links
    if (links && Array.isArray(links)) {
      for (const link of links) {
        if (!link.name?.trim() || !link.url?.trim()) {
          return NextResponse.json(
            { error: 'All links must have both name and URL' },
            { status: 400 },
          );
        }

        // Basic URL validation
        try {
          new URL(link.url);
        } catch {
          return NextResponse.json({ error: `Invalid URL: ${link.url}` }, { status: 400 });
        }
      }
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(title);

    // Create project
    const project = await prisma.project.create({
      data: {
        title: sanitizeUserContent(title.trim()),
        slug,
        description: sanitizeUserContent(description.trim()),
        content: sanitizeUserContent(content.trim()),
        tags: tags || [],
        image: image || null,
        links: links || [],
        backgroundType: backgroundType || 'gradient',
        gradientStart: gradientStart || '#00b7ff',
        gradientEnd: gradientEnd || '#b3ffec',
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        slug: project.slug,
        title: project.title,
      },
    });
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || 'recent';
  const userId = searchParams.get('userId');

  const skip = (page - 1) * limit;

  try {
    let orderBy: Record<string, unknown> = { createdAt: 'desc' }; // Default to recent

    if (sort === 'popular') {
      orderBy = { views: { _count: 'desc' } };
    } else if (sort === 'rating') {
      orderBy = { stars: { _count: 'desc' } };
    }

    const where = userId ? { userId } : {};

    const projects = await prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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
    const total = await prisma.project.count({ where });

    // Transform the response to match frontend expectations
    const transformedProjects = projects.map((project) => ({
      ...project,
      author: project.user,
      views: project._count.views,
      stars: project._count.stars,
      user: undefined,
      _count: undefined,
    }));

    return NextResponse.json({
      projects: transformedProjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
