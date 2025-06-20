import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function sendVerificationMail(email: string, baseUrl: string) {
  // Generate a token
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 60 * 1000); // Token valid for up to 30 minutes

  // Store token in DB
  await prisma.emailVerificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  // Send email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
    secure: false,
  });

  const verificationUrl = `${baseUrl}/verify?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '[IoT-Hub] Verify your email address',
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>
    <p>This link will expire in 30 minutes.</p>
    <br />
    <p>If you did not create an account, you can ignore this email.</p>
    `,
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}
