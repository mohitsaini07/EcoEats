import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
export default async function AppIndexPage() { const user = await requireUser(); redirect(user.role === "RESTAURANT_MANAGER" ? "/manager" : "/marketplace"); }
