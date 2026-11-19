import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireRole("ADMIN");
  return (
    <div className="min-h-screen bg-slate-50 text-[var(--color-foreground)]">
      <AppHeader user={user} />
      {children}
    </div>
  );
}
