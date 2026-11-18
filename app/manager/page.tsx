import { requireRole } from "@/lib/auth/session";
import { getManagerDashboardData } from "@/lib/db/listings";
import { ManagerView } from "@/components/manager-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kitchen Manager Hub",
  description: "Manage restaurant surplus batches, pending pickups, and food rescue operations.",
};

export default async function ManagerPage() {
  const user = await requireRole("RESTAURANT_MANAGER", "ADMIN");
  const dashboardData = await getManagerDashboardData(user.id);

  return (
    <ManagerView
      initialRestaurant={dashboardData.restaurant}
      initialListings={dashboardData.listings}
      initialQueue={dashboardData.queue}
    />
  );
}
