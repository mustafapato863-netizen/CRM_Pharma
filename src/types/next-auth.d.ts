import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      permissions: Record<string, boolean>;
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    permissions: Record<string, boolean>;
    isActive: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    permissions?: Record<string, boolean>;
    isActive?: boolean;
  }
}
