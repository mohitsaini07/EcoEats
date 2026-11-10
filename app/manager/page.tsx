import { ManagerView } from "@/components/manager-view";

export const metadata = {
  title: "Kitchen Manager Hub",
  description: "Manage restaurant surplus batches, pending pickups, and food rescue operations.",
};

export default function ManagerPage() {
  return <ManagerView />;
}
