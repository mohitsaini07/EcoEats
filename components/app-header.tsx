import Link from "next/link";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import type { CurrentUser } from "@/lib/auth/session";
export function AppHeader({ user }: { user: CurrentUser }) { const manager = user.role === "RESTAURANT_MANAGER"; return <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"><Brand /><nav className="flex items-center gap-1" aria-label="Primary navigation"><Link href={manager ? "/manager" : "/marketplace"} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">{manager ? "Dashboard" : "Marketplace"}</Link><span className="hidden border-l border-slate-200 pl-3 text-sm text-slate-500 sm:inline">{user.name}</span><SignOutButton /></nav></div></header>; }
