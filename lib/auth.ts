import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import type { Role } from "@/types"

type SessionLikeUser = {
  id?: string
  email?: string | null
  role?: Role
  name?: string | null
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
}

export async function resolveSessionUser(user: SessionLikeUser | undefined | null) {
  if (!user?.email) {
    return null
  }

  const dbUser = user.id
    ? await db.user.findFirst({
        where: {
          OR: [{ id: user.id }, { email: user.email }],
        },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
        },
      })
    : await db.user.findUnique({
        where: { email: user.email },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
        },
      })

  if (!dbUser) {
    return null
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    name: dbUser.name ?? user.name ?? null,
  }
}
