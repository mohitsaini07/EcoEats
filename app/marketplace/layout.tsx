import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth/session";
export default async function MarketplaceLayout({ children }: { children: ReactNode }) { const user = await requireRole("CUSTOMER", "ADMIN"); return <div className="min-h-screen bg-slate-50"><AppHeader user={user} />{children}</div>; }
