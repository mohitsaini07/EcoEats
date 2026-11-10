import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const APP_ROLES = ["CUSTOMER", "RESTAURANT_MANAGER", "ADMIN"] as const;
export type AppRole = (typeof APP_ROLES)[number];
export type CurrentUser = { id: string; email: string; name: string; role: AppRole };

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Unable to load user profile:", profileError.message);
      return null;
    }

    // Gracefully handle missing profile by creating a Customer record
    if (!profile) {
      const fallbackName =
        (user.user_metadata?.name as string | undefined)?.trim() ||
        user.email?.split("@")[0] ||
        "Customer";

      const { data: newProfile, error: insertError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          name: fallbackName,
          email: user.email ?? "",
          role: "CUSTOMER",
        })
        .select("name, role")
        .single();

      if (!insertError && newProfile && APP_ROLES.includes(newProfile.role as AppRole)) {
        return {
          id: user.id,
          email: user.email ?? "",
          name: newProfile.name,
          role: newProfile.role as AppRole,
        };
      }

      return null;
    }

    if (!APP_ROLES.includes(profile.role as AppRole)) {
      return null;
    }

    return {
      id: user.id,
      email: user.email ?? "",
      name: profile.name,
      role: profile.role as AppRole,
    };
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "digest" in err) {
      const digest = (err as { digest?: string }).digest;
      if (digest === "DYNAMIC_SERVER_USAGE") {
        throw err;
      }
    }
    console.error("Error in getCurrentUser:", err);
    return null;
  }
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(...roles: AppRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect(user.role === "RESTAURANT_MANAGER" ? "/manager" : "/marketplace");
  }
  return user;
}
