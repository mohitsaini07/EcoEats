import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const APP_ROLES = ["CUSTOMER", "RESTAURANT_MANAGER", "ADMIN"] as const;
export type AppRole = (typeof APP_ROLES)[number];
export type CurrentUser = { id: string; email: string; name: string; role: AppRole };

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;
  const { data: profile, error: profileError } = await supabase.from("users").select("name, role").eq("id", user.id).maybeSingle();
  if (profileError) throw new Error("Unable to load the signed-in user profile");
  if (!profile || !APP_ROLES.includes(profile.role as AppRole)) return null;
  return { id: user.id, email: user.email ?? "", name: profile.name, role: profile.role as AppRole };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: AppRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(user.role === "RESTAURANT_MANAGER" ? "/manager" : "/marketplace");
  return user;
}
