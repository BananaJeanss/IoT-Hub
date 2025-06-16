import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { User } from 'next-auth';
import argon2 from 'argon2';

export const authOptions = {
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
        if (!user || !user.password || !user.username || !user.email) return null;
        const isValid = await argon2.verify(user.password, credentials.password);
        if (!isValid) return null;
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.name = token.username as string;
      }
      return session;
    },
  },
};
