import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ApplicationShell } from "@/components/layout/application-shell";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <ApplicationShell
      permissions={(session.user.permissions ?? {}) as Record<string, boolean>}
      userName={session.user.name}
    >
      {children}
    </ApplicationShell>
  );
}
