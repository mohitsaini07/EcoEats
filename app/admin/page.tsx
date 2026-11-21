import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ApplicationRow, type RestaurantApplicationData } from "./application-row";
import {
  IconCheckCircle,
  IconClock,
  IconAlertCircle,
  IconChefHat,
} from "@/components/icons";

interface AdminPageProps {
  searchParams?: Promise<{ status?: string }>;
}

export default async function AdminDashboardPage(props: AdminPageProps) {
  await requireRole("ADMIN");
  const searchParams = await props.searchParams;
  const filterStatus = searchParams?.status?.toUpperCase() || "ALL";

  const supabase = await createClient();

  // Fetch applications with joined applicant user profile
  let applications: RestaurantApplicationData[] = [];

  const { data, error } = await supabase
    .from("restaurant_applications")
    .select(`
      id,
      user_id,
      restaurant_name,
      restaurant_address,
      contact_phone,
      status,
      admin_notes,
      reviewed_by,
      reviewed_at,
      created_at,
      updated_at,
      applicant:users!restaurant_applications_user_id_fkey (
        id,
        name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load applications with joined user:", error.message);
    // Fallback: fetch applications directly
    const { data: rawApps } = await supabase
      .from("restaurant_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (rawApps && rawApps.length > 0) {
      const userIds = [...new Set(rawApps.map((a) => a.user_id))];
      const { data: userProfiles } = await supabase
        .from("users")
        .select("id, name, email")
        .in("id", userIds);

      const userMap = new Map((userProfiles || []).map((u) => [u.id, u]));

      applications = rawApps.map((app) => ({
        ...app,
        applicant: userMap.get(app.user_id) || null,
      }));
    }
  } else if (data) {
    applications = data as unknown as RestaurantApplicationData[];
  }

  // Calculate statistics
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

  const filteredApplications =
    filterStatus === "ALL"
      ? applications
      : applications.filter((a) => a.status === filterStatus);

  
return (
  <main className="mx-auto w-full max-w-[1440px] space-y-9 px-5 py-9 sm:px-8 lg:px-12 lg:py-12">
    {/* Dashboard heading */}
    <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DCE8DA] bg-[#EEF4EC] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#315E3D]">
          <IconChefHat size={14} />
          EcoEats Administration
        </div>

        <h1 className="text-3xl font-black tracking-[-0.04em] text-[#203B2A] sm:text-4xl">
          Partner applications<span className="text-[#77A47C]">.</span>
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#77847A]">
          Review restaurant applications, verify partner details and manage
          your growing restaurant network.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E6EAE1] bg-white px-5 py-3 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A298]">
          Total applications
        </p>
        <p className="mt-1 text-2xl font-black text-[#254A32]">
          {totalCount.toString().padStart(2, "0")}
        </p>
      </div>
    </section>

    {/* KPI cards */}
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
      {[
        {
          label: "All applications",
          value: totalCount,
          icon: <IconChefHat size={19} />,
          color: "text-[#31583B]",
          bg: "bg-[#EEF4EC]",
          active: filterStatus === "ALL",
          href: "/admin",
        },
        {
          label: "Awaiting review",
          value: pendingCount,
          icon: <IconClock size={19} />,
          color: "text-amber-700",
          bg: "bg-amber-50",
          active: filterStatus === "PENDING",
          href: "/admin?status=PENDING",
        },
        {
          label: "Approved partners",
          value: approvedCount,
          icon: <IconCheckCircle size={19} />,
          color: "text-emerald-700",
          bg: "bg-emerald-50",
          active: filterStatus === "APPROVED",
          href: "/admin?status=APPROVED",
        },
        {
          label: "Not approved",
          value: rejectedCount,
          icon: <IconAlertCircle size={19} />,
          color: "text-rose-700",
          bg: "bg-rose-50",
          active: filterStatus === "REJECTED",
          href: "/admin?status=REJECTED",
        },
      ].map((item) => (
        <a
          key={item.label}
          href={item.href}
          className={`group rounded-[22px] border bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
            item.active
              ? "border-[#AFC8B0] shadow-[0_5px_20px_rgba(37,74,50,0.07)]"
              : "border-[#E7EAE2] shadow-[0_3px_15px_rgba(37,74,50,0.025)]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`grid size-10 place-items-center rounded-xl ${item.bg} ${item.color}`}>
              {item.icon}
            </span>
            <span className="text-xs text-[#A2AAA1] transition group-hover:translate-x-1">
              ↗
            </span>
          </div>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-[#929C91]">
            {item.label}
          </p>

          <p className={`mt-1 text-3xl font-black tracking-tight ${item.color}`}>
            {item.value.toString().padStart(2, "0")}
          </p>
        </a>
      ))}
    </section>

    {/* Applications section */}
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A9A8A]">
            Review workspace
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#263E2D]">
            Restaurant applications
          </h2>
          <p className="mt-1 text-xs text-[#89958A]">
            {filteredApplications.length} applications currently displayed
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#E6EAE2] bg-white p-1.5 shadow-sm">
          {[
            { label: "All", count: totalCount, value: "ALL", href: "/admin" },
            { label: "Pending", count: pendingCount, value: "PENDING", href: "/admin?status=PENDING" },
            { label: "Approved", count: approvedCount, value: "APPROVED", href: "/admin?status=APPROVED" },
            { label: "Rejected", count: rejectedCount, value: "REJECTED", href: "/admin?status=REJECTED" },
          ].map((tab) => (
            <a
              key={tab.value}
              href={tab.href}
              className={`rounded-xl px-3 py-2 text-[11px] font-bold transition sm:px-4 ${
                filterStatus === tab.value
                  ? "bg-[#254B32] text-white shadow-sm"
                  : "text-[#718075] hover:bg-[#F1F5EF] hover:text-[#254B32]"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 ${filterStatus === tab.value ? "text-white/70" : "text-[#A1ACA1]"}`}>
                {tab.count}
              </span>
            </a>
          ))}
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[#D8E1D5] bg-white/70 px-6 py-20 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#EEF4EC] text-[#578061]">
            <IconChefHat size={28} />
          </div>
          <h3 className="mt-5 text-lg font-bold text-[#294631]">
            No applications found
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#879388]">
            {filterStatus === "PENDING"
              ? "You're all caught up. There are no restaurant applications waiting for review."
              : "There are no applications matching this filter right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <ApplicationRow key={app.id} app={app} />
          ))}
        </div>
      )}
    </section>
  </main>
);

}
