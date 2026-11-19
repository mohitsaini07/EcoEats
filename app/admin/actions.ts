"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type AdminActionResult = {
  success: boolean;
  error?: string;
  restaurantId?: string;
};

export async function approveApplicationAction(
  applicationId: string
): Promise<AdminActionResult> {
  // Enforce ADMIN role at server level
  await requireRole("ADMIN");

  if (!applicationId) {
    return { success: false, error: "Application ID is required." };
  }

  const supabase = await createClient();

  // Call the protected database function
  // Admin identity is derived inside PostgreSQL from auth.uid()
  const { data, error } = await supabase.rpc("approve_restaurant_application", {
    p_application_id: applicationId,
  });

  if (error) {
    console.error("Failed to approve application:", error);
    return {
      success: false,
      error: error.message || "Failed to approve application.",
    };
  }

  revalidatePath("/admin");
  return { success: true, restaurantId: data as string };
}

export async function rejectApplicationAction(
  applicationId: string,
  notes: string
): Promise<AdminActionResult> {
  // Enforce ADMIN role at server level
  await requireRole("ADMIN");

  if (!applicationId) {
    return { success: false, error: "Application ID is required." };
  }

  const trimmedNotes = notes.trim();
  if (!trimmedNotes) {
    return {
      success: false,
      error: "Please provide a reason or notes for rejecting this application.",
    };
  }

  const supabase = await createClient();

  // Call the protected database function
  // Admin identity is derived inside PostgreSQL from auth.uid()
  const { error } = await supabase.rpc("reject_restaurant_application", {
    p_application_id: applicationId,
    p_notes: trimmedNotes,
  });

  if (error) {
    console.error("Failed to reject application:", error);
    return {
      success: false,
      error: error.message || "Failed to reject application.",
    };
  }

  revalidatePath("/admin");
  return { success: true };
}
