import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function AppIndexPage() {
  const user = await requireUser();

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  if (user.role === "RESTAURANT_MANAGER") {
    redirect("/manager");
  }

  // User is CUSTOMER. Check if they have a pending or rejected restaurant partner application
  const supabase = await createClient();
  const { data: application } = await supabase
    .from("restaurant_applications")
    .select("status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (application && (application.status === "PENDING" || application.status === "REJECTED")) {
    redirect("/partner/status");
  }

  redirect("/marketplace");
}
