import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim();
        const password = credentials?.password ?? "";

        if (!username || !password) return null;

        const user = await prisma.user.findFirst({
          where: { name: username },
          select: {
            id: true,
            name: true,
            passwordHash: true,
            permissions: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        const permissions =
          user.permissions && typeof user.permissions === "object"
            ? (user.permissions as Record<string, boolean>)
            : {};

        return {
          id: user.id,
          name: user.name ?? "",
          permissions,
          isActive: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as {
          id: string;
          permissions: unknown;
          isActive: boolean;
        };

        (token as any).id = typedUser.id;
        (token as any).permissions = typedUser.permissions;
        (token as any).isActive = typedUser.isActive;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token as any).id as string;
        session.user.permissions = (token as any).permissions;
        session.user.isActive = Boolean((token as any).isActive);
      }

      return session;
    },
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
};

export default authOptions;
