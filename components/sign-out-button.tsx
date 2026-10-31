"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export function SignOutButton() { const router = useRouter(); const [pending, setPending] = useState(false); async function signOut() { setPending(true); await createClient().auth.signOut(); router.replace("/"); router.refresh(); } return <button type="button" onClick={signOut} disabled={pending} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-60">{pending ? "Signing out…" : "Sign out"}</button>; }
