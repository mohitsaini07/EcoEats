
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
    <div className="min-h-screen bg-[#F6F7F2] text-[#1C3025]">
      <AppHeader user={user} />
      {children}
    </div>
  );
}
