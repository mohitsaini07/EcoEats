"use client";

import { useState, useTransition } from "react";
import { approveApplicationAction, rejectApplicationAction } from "./actions";
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

export function ApplicationRow({ app }: { app: RestaurantApplicationData }) {
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
        setSuccessMessage("Application approved and restaurant partner activated!");
      }
    });
  }

  function handleReject(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!rejectNotes.trim()) {
      setErrorMessage("Please enter rejection feedback or reason.");
      return;
    }

    startTransition(async () => {
      const res = await rejectApplicationAction(app.id, rejectNotes);
      if (!res.success) {
        setErrorMessage(res.error || "Rejection failed");
      } else {
        setRejecting(false);
        setSuccessMessage("Application marked as rejected with notes.");
      }
    });
  }

  const statusBadge = {
    PENDING: "bg-amber-100 text-amber-900 border-amber-300",
    APPROVED: "bg-emerald-100 text-emerald-900 border-emerald-300",
    REJECTED: "bg-rose-100 text-rose-900 border-rose-300",
  }[app.status];

  return (
    <div className="eco-card p-5 space-y-4 border-slate-200 bg-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900">
              {app.restaurant_name}
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadge}`}
            >
              {app.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Submitted {new Date(app.created_at).toLocaleString()}
          </p>
        </div>

        {/* Action buttons for PENDING */}
        {app.status === "PENDING" && !rejecting && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApprove}
              disabled={isPending}
              className="eco-button eco-button-primary text-xs font-bold py-1.5 px-3.5 rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              <IconCheckCircle size={14} />
              {isPending ? "Processing..." : "Approve Partner"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRejecting(true);
                setErrorMessage(null);
              }}
              disabled={isPending}
              className="eco-button eco-button-secondary text-xs font-bold py-1.5 px-3.5 rounded-lg cursor-pointer text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="block text-slate-400 font-semibold text-[11px]">
            Applicant / Owner
          </span>
          <span className="font-bold text-slate-800">
            {app.applicant?.name || "Customer Account"}
          </span>
          <span className="block text-slate-500 text-[11px]">
            {app.applicant?.email || app.user_id}
          </span>
        </div>

        <div>
          <span className="block text-slate-400 font-semibold text-[11px]">
            Contact Phone
          </span>
          <span className="font-bold text-slate-800">{app.contact_phone}</span>
        </div>

        <div className="sm:col-span-2 md:col-span-1">
          <span className="block text-slate-400 font-semibold text-[11px]">
            Location / Address
          </span>
          <span className="text-slate-700 line-clamp-2">
            {app.restaurant_address}
          </span>
        </div>
      </div>

      {/* Admin Notes if present */}
      {app.admin_notes && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          <span className="font-bold text-slate-700">Admin Review Feedback:</span>
          <p className="text-slate-600 font-mono text-[11px]">{app.admin_notes}</p>
          {app.reviewed_at && (
            <span className="block text-[10px] text-slate-400">
              Reviewed at {new Date(app.reviewed_at).toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Rejection Form Drawer / Box */}
      {rejecting && (
        <form
          onSubmit={handleReject}
          className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-950">
              Reason for Rejection (visible to applicant):
            </span>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <IconX size={16} />
            </button>
          </div>
          <textarea
            rows={2}
            required
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="e.g. Please provide an authentic commercial address and registered trade phone number."
            className="eco-field text-xs resize-none bg-white"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejecting(false)}
              disabled={isPending}
              className="eco-button eco-button-secondary text-xs font-bold py-1 px-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="eco-button bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-1 px-3 rounded-lg cursor-pointer"
            >
              {isPending ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      )}

      {/* Success/Error Feedback */}
      {errorMessage && (
        <div role="alert" className="eco-status-note text-xs">
          <IconAlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <IconCheckCircle size={16} className="text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
