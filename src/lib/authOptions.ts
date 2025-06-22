import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email'; // Add this import
import { prisma } from '@/lib/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import argon2 from 'argon2';

export const authOptions = {
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
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (token) {
        if (!session.user) {
          session.user = {} as Session['user'];
        }
        if (token.sub) {
          (session.user as NonNullable<Session['user']>).id = token.sub;
        }
        // Fetch user from DB to get isEmailVerified
        if (session.user && session.user.email) {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { isEmailVerified: true },
          });
          (session.user as NonNullable<Session['user']>).isEmailVerified =
            user?.isEmailVerified ?? false;
        }
      }

      return {
        ...session,
        expires: session.expires ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // fallback: 30 days
      };
    },
  },
};
