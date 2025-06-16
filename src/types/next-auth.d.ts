import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string | null
      email?: string | null
      image?: string | null
      name?: string | null
    }
  }

  interface User {
    id: string
    username: string
    email: string
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    email?: string
    name?: string
  }
}