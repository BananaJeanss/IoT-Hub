import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email'; // Add this import
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import argon2 from 'argon2';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const user = await prisma.user.findFirst({
          where: { OR: [{ username: credentials.username }, { email: credentials.username }] },
        });
        if (!user || !user.password) return null;
        const isValid = await argon2.verify(user.password, credentials.password);
        if (!isValid) return null;
        return {
          id: user.id,
          name: user.username,
          email: user.email,
          image: user.image,
        };
      },
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    // !!
    // TODO: Add Google/GitHub providers here later
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    // keep your JWT.com token in sync
    async jwt({ token, user }) {
      if (user) {
        token.image = user.image;
      }
      return token;
    },
    // whenever `useSession({ required: false }).update()` is called,
    // re-fetch the user from the DB and overwrite session.user.image
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { image: true, username: true, isEmailVerified: true },
        });
        if (dbUser) {
          session.user.image = dbUser.image;
          session.user.name = dbUser.username;
          session.user.isEmailVerified = !!dbUser.isEmailVerified;
        }
      }
      return {
        ...session,
        expires: session.expires ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // fallback: 30 days
      };
    },
  },
};
