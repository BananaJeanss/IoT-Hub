import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationMail } from '@/lib/verificationMail/sendVerificationMail';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate email format
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }

    // validate if email exists in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return NextResponse.json({ error: 'Email not registered.' }, { status: 404 });
    }

    // check if email is already verified
    if (user.isEmailVerified) {
      return NextResponse.json({ error: 'Email is already verified.' }, { status: 400 });
    }

    // check if a verification token that's younger than 5 minutes exists
    const recentToken = await prisma.emailVerificationToken.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (recentToken) {
      return NextResponse.json(
        { error: 'A verification email was sent recently. Please wait before requesting another.' },
        { status: 400 },
      );
    }

    // baseurl
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Send verification email
    await sendVerificationMail(email, baseUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in resend verification:', error);
    return NextResponse.json({ error: 'Failed to resend verification email.' }, { status: 500 });
  }
}
