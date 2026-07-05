import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { translations } from "@/shared/config/translations";
import LoginForm from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("pharmacy-crm:locale")?.value === "ar" ? "ar" : "en";
  const t = translations[locale].login;
  return { title: t.login, description: t.subtitle };
}

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <Suspense fallback={<div />}>
      <LoginForm />
    </Suspense>
  );
}
