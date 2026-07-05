"use server";

import { signOut } from "next-auth/react";

export async function logoutAction() {
  await signOut({ redirect: true, callbackUrl: "/login" });
}
