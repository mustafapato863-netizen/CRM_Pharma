"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

export type LoginActionState = {
  error?: string;
  success?: boolean;
};

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(1),
});

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    username: String(formData.get("username") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid username and password." };
  }

  const user = await prisma.user.findFirst({
    where: { name: parsed.data.username },
    select: { id: true, isActive: true, passwordHash: true },
  });

  if (!user || !user.isActive) {
    return { error: "Invalid username or password." };
  }

  const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!isValid) {
    return { error: "Invalid username or password." };
  }

  return { success: true };
}
