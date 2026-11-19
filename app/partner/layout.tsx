import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { requireUser } from "@/lib/auth/session";

export default async function PartnerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="min-h-screen bg-slate-50 text-[var(--color-foreground)]">
      <AppHeader user={user} />
      {children}
    </div>
  );
}
