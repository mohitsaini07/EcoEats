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
    <main className="eco-container py-8 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-1">
            <IconChefHat size={16} />
            <span>Admin Review Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight">
            Restaurant Partner Applications
          </h1>
          <p className="text-xs sm:text-sm text-[var(--eco-ink-700)] mt-0.5">
            Verify kitchen applications and authorize restaurant managers.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <a
          href="/admin"
          className={`eco-card p-4 transition hover:border-[var(--color-primary)] ${
            filterStatus === "ALL" ? "border-slate-800 ring-2 ring-slate-800/10" : "border-slate-200"
          }`}
        >
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Applications
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {totalCount}
          </span>
        </a>

        <a
          href="/admin?status=PENDING"
          className={`eco-card p-4 transition hover:border-amber-400 ${
            filterStatus === "PENDING" ? "border-amber-500 ring-2 ring-amber-500/10 bg-amber-50/30" : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="block text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Pending Review
            </span>
            <IconClock size={16} className="text-amber-600" />
          </div>
          <span className="text-2xl font-black text-amber-950 mt-1 block">
            {pendingCount}
          </span>
        </a>

        <a
          href="/admin?status=APPROVED"
          className={`eco-card p-4 transition hover:border-emerald-400 ${
            filterStatus === "APPROVED" ? "border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-50/30" : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Approved Partners
            </span>
            <IconCheckCircle size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-950 mt-1 block">
            {approvedCount}
          </span>
        </a>

        <a
          href="/admin?status=REJECTED"
          className={`eco-card p-4 transition hover:border-rose-400 ${
            filterStatus === "REJECTED" ? "border-rose-500 ring-2 ring-rose-500/10 bg-rose-50/30" : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="block text-[11px] font-bold text-rose-800 uppercase tracking-wider">
              Not Approved
            </span>
            <IconAlertCircle size={16} className="text-rose-600" />
          </div>
          <span className="text-2xl font-black text-rose-950 mt-1 block">
            {rejectedCount}
          </span>
        </a>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <a
          href="/admin"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            filterStatus === "ALL"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          All ({totalCount})
        </a>
        <a
          href="/admin?status=PENDING"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            filterStatus === "PENDING"
              ? "bg-amber-600 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <span className="size-2 rounded-full bg-amber-400" />
          Pending ({pendingCount})
        </a>
        <a
          href="/admin?status=APPROVED"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            filterStatus === "APPROVED"
              ? "bg-emerald-600 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Approved ({approvedCount})
        </a>
        <a
          href="/admin?status=REJECTED"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            filterStatus === "REJECTED"
              ? "bg-rose-600 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Rejected ({rejectedCount})
        </a>
      </div>

      {/* Applications List */}
      <section className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="eco-card p-12 text-center space-y-3 border-dashed border-slate-300">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <IconChefHat size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-700">
              No applications in this category
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filterStatus === "PENDING"
                ? "All caught up! There are currently no partner applications awaiting review."
                : "No partner applications found matching this status filter."}
            </p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <ApplicationRow key={app.id} app={app} />
          ))
        )}
      </section>
    </main>
  );
}
