import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PartnerApplicationForm } from "./application-form";
import {
  IconAlertCircle,
  IconCheckCircle,
  IconChefHat,
  IconClock,
  IconSparkles,
  IconArrowRight,
} from "@/components/icons";

export default async function PartnerStatusPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: application } = await supabase
    .from("restaurant_applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isApproved = user.role === "RESTAURANT_MANAGER" || application?.status === "APPROVED";
  const isPending = application?.status === "PENDING" && !isApproved;
  const isRejected = application?.status === "REJECTED" && !isApproved;

  return (
    <main className="eco-container py-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-1">
          <IconChefHat size={16} />
          <span>Restaurant Partner Program</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight">
          Partner Application Status
        </h1>
        <p className="text-xs sm:text-sm text-[var(--eco-ink-700)] mt-1">
          Review your kitchen verification and partner onboarding status.
        </p>
      </div>

      {/* Case 1: Already Approved / RESTAURANT_MANAGER */}
      {isApproved && (
        <section className="eco-card p-6 sm:p-8 space-y-5 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-start gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-800 shrink-0">
              <IconCheckCircle size={26} />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-200/70 text-emerald-900">
                  Approved & Active
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-emerald-950">
                You are a Verified Restaurant Partner!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                Your restaurant partner status is active. You can manage your kitchen, list surplus batches, and fulfill customer pickup orders in the Manager Portal.
              </p>
            </div>
          </div>

          {application && (
            <div className="p-4 rounded-xl bg-white/80 border border-emerald-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Restaurant Name</span>
                <span className="font-bold text-slate-900">{application.restaurant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Contact Phone</span>
                <span className="font-bold text-slate-900">{application.contact_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Registered Address</span>
                <span className="font-bold text-slate-900 text-right max-w-xs">{application.restaurant_address}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/manager"
              className="eco-button eco-button-primary inline-flex items-center justify-center gap-2 text-sm font-bold"
            >
              <IconChefHat size={16} />
              Open Kitchen Manager Portal
              <IconArrowRight size={14} />
            </Link>
            <Link
              href="/marketplace"
              className="eco-button eco-button-secondary inline-flex items-center justify-center text-sm font-bold"
            >
              Browse Surplus Food
            </Link>
          </div>
        </section>
      )}

      {/* Case 2: Application PENDING */}
      {isPending && (
        <section className="eco-card p-6 sm:p-8 space-y-6 border-amber-200 bg-amber-50/30">
          <div className="flex items-start gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-800 shrink-0">
              <IconClock size={26} />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200/80 text-amber-950">
                  Under Admin Review
                </span>
                <span className="text-[11px] text-slate-500">
                  Submitted on {new Date(application.created_at).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-amber-950">
                Application Received & Pending Review
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Thank you for applying to partner with EcoEats! Our administrative team is reviewing your kitchen details. Once verified, your account will be upgraded to Kitchen Manager.
              </p>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="p-4 rounded-xl bg-white border border-amber-100 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-xs border-b border-slate-100 pb-2">
              Submitted Application Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-slate-500 font-semibold">Restaurant Name</span>
                <span className="font-bold text-slate-900">{application.restaurant_name}</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 font-semibold">Contact Phone</span>
                <span className="font-bold text-slate-900">{application.contact_phone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-[11px] text-slate-500 font-semibold">Address</span>
                <span className="font-semibold text-slate-800">{application.restaurant_address}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <IconSparkles size={14} className="text-[var(--color-primary)]" />
              What happens next?
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
              <li>Our team checks address and contact information for local partner authenticity.</li>
              <li>Approval typically takes 24 to 48 hours.</li>
              <li>When approved, your account will immediately gain access to the Kitchen Manager portal.</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Link
              href="/marketplace"
              className="eco-button eco-button-secondary text-xs font-bold"
            >
              Browse Marketplace as Customer
            </Link>
          </div>
        </section>
      )}

      {/* Case 3: Application REJECTED */}
      {isRejected && (
        <section className="eco-card p-6 sm:p-8 space-y-6 border-red-200 bg-red-50/20">
          <div className="flex items-start gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-red-100 text-red-700 shrink-0">
              <IconAlertCircle size={26} />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                  Not Approved
                </span>
                {application.reviewed_at && (
                  <span className="text-[11px] text-slate-500">
                    Reviewed on {new Date(application.reviewed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-extrabold text-red-950">
                Application Review Decision
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Unfortunately, your application was not approved during this review cycle. Please review the feedback below and update your details to submit a new application.
              </p>
            </div>
          </div>

          {/* Admin notes */}
          {application.admin_notes && (
            <div className="p-4 rounded-xl bg-white border border-red-200 space-y-1.5">
              <h4 className="text-xs font-bold text-red-950">
                Feedback from Reviewer:
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-red-50/50 p-2.5 rounded-lg border border-red-100 font-mono">
                {application.admin_notes}
              </p>
            </div>
          )}

          {/* Reapplication Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Submit an Updated Application
              </h3>
              <p className="text-xs text-slate-500">
                Correct any information noted above and resubmit for administrator review.
              </p>
            </div>
            <PartnerApplicationForm
              initialValues={{
                restaurantName: application.restaurant_name,
                restaurantAddress: application.restaurant_address,
                contactPhone: application.contact_phone,
              }}
              isReapplying={true}
            />
          </div>
        </section>
      )}

      {/* Case 4: No application yet */}
      {!application && !isApproved && (
        <section className="eco-card p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-slate-900">
              Apply to Partner with EcoEats
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Are you a restaurant, cafe, or bakery manager? List surplus meals, curb food waste, and connect with local patrons.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <PartnerApplicationForm />
          </div>
        </section>
      )}
    </main>
  );
}
