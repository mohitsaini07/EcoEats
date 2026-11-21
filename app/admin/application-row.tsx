
"use client";

import { useState, useTransition } from "react";
import {
  approveApplicationAction,
  rejectApplicationAction,
} from "./actions";
import {
  IconAlertCircle,
  IconCheckCircle,
  IconX,
} from "@/components/icons";

export interface RestaurantApplicationData {
  id: string;
  user_id: string;
  restaurant_name: string;
  restaurant_address: string;
  contact_phone: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  applicant?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const statusStyles = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 ring-rose-200",
};

export function ApplicationRow({
  app,
}: {
  app: RestaurantApplicationData;
}) {
  const [isPending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleApprove() {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await approveApplicationAction(app.id);

      if (!res.success) {
        setErrorMessage(res.error || "Approval failed");
      } else {
        setSuccessMessage("Restaurant partner successfully approved.");
      }
    });
  }

  function handleReject(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!rejectNotes.trim()) {
      setErrorMessage("Please provide a rejection reason.");
      return;
    }

    startTransition(async () => {
      const res = await rejectApplicationAction(app.id, rejectNotes);

      if (!res.success) {
        setErrorMessage(res.error || "Rejection failed");
      } else {
        setRejecting(false);
        setSuccessMessage("Application rejected successfully.");
      }
    });
  }

  const submittedDate = new Date(app.created_at);

  return (
    <article className="group overflow-hidden rounded-[24px] border border-[#E8EAE2] bg-white shadow-[0_4px_24px_rgba(31,55,39,0.035)] transition duration-300 hover:-translate-y-0.5 hover:border-[#C9D8CB] hover:shadow-[0_12px_35px_rgba(31,55,39,0.07)]">
      <div className="p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#EEF4EC] text-[#28583A]">
              <span className="text-lg font-black">
                {app.restaurant_name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-[#203B2A]">
                  {app.restaurant_name}
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusStyles[app.status]}`}
                >
                  {app.status}
                </span>
              </div>

              <p className="mt-1 text-xs text-[#8A968B]">
                Application #{app.id.slice(0, 8)}
              </p>

              <p className="mt-2 text-xs text-[#718074]">
                Submitted{" "}
                {submittedDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {app.status === "PENDING" && !rejecting && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[#24583A] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#19452D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IconCheckCircle size={15} />
                {isPending ? "Processing..." : "Approve"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRejecting(true);
                  setErrorMessage(null);
                }}
                disabled={isPending}
                className="rounded-xl border border-[#F0DADA] bg-white px-4 py-2.5 text-xs font-bold text-[#B44B4B] transition hover:bg-[#FFF5F5] disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          )}
        </div>

        <div className="my-6 h-px bg-[#EEF0EA]" />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA59B]">
              Applicant / Owner
            </p>
            <p className="mt-2 text-sm font-bold text-[#304C38]">
              {app.applicant?.name || "Customer Account"}
            </p>
            <p className="mt-1 break-all text-xs text-[#829087]">
              {app.applicant?.email || app.user_id}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA59B]">
              Contact Number
            </p>
            <p className="mt-2 text-sm font-semibold text-[#304C38]">
              {app.contact_phone}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA59B]">
              Restaurant Location
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#637267]">
              {app.restaurant_address}
            </p>
          </div>
        </div>

        {app.admin_notes && (
          <div className="mt-6 rounded-2xl border border-[#E9EDE5] bg-[#F8FAF6] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#718074]">
              Admin Review Feedback
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#526356]">
              {app.admin_notes}
            </p>

            {app.reviewed_at && (
              <p className="mt-2 text-[11px] text-[#98A299]">
                Reviewed {new Date(app.reviewed_at).toLocaleString("en-IN")}
              </p>
            )}
          </div>
        )}

        {rejecting && (
          <form
            onSubmit={handleReject}
            className="mt-6 space-y-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-rose-950">
                  Reject application
                </h4>
                <p className="mt-1 text-xs text-rose-700">
                  This feedback will be visible to the applicant.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRejecting(false)}
                className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-100"
                aria-label="Close rejection form"
              >
                <IconX size={17} />
              </button>
            </div>

            <textarea
              rows={3}
              required
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Explain why this application cannot be approved..."
              className="w-full resize-none rounded-xl border border-rose-200 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejecting(false)}
                disabled={isPending}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-rose-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {isPending ? "Rejecting..." : "Confirm rejection"}
              </button>
            </div>
          </form>
        )}

        {(errorMessage || successMessage) && (
          <div
            role={errorMessage ? "alert" : "status"}
            className={`mt-5 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
              errorMessage
                ? "border border-rose-200 bg-rose-50 text-rose-800"
                : "border border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {errorMessage ? (
              <IconAlertCircle size={16} />
            ) : (
              <IconCheckCircle size={16} />
            )}
            {errorMessage || successMessage}
          </div>
        )}
      </div>
    </article>
  );
}
