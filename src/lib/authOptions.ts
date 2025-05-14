import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;
        return {
          id: user.id,
          name: user.username,
          email: user.email,
          image: user.image,
        };
      },
    }),
    // Add Google/GitHub providers here later
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (token) {
        if (!session.user) {
          session.user = {} as Session["user"];
        }
        (session.user as NonNullable<Session["user"]>).id = token.sub;
      }

      return {
        ...session,
        expires: session.expires ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // fallback: 30 days
      };
    },
  },
};
