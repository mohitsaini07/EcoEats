"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type ApplicationActionResult = {
  success: boolean;
  error?: string;
};

export async function submitPartnerApplication(
  formData: FormData
): Promise<ApplicationActionResult> {
  const user = await requireUser();

  if (user.role !== "CUSTOMER") {
    return {
      success: false,
      error: "Only accounts with Customer role can submit restaurant partner applications.",
    };
  }

  const restaurantName = (formData.get("restaurantName") as string | null)?.trim() || "";
  const restaurantAddress = (formData.get("restaurantAddress") as string | null)?.trim() || "";
  const contactPhone = (formData.get("contactPhone") as string | null)?.trim() || "";

  if (!restaurantName) {
    return { success: false, error: "Restaurant name is required." };
  }
  if (restaurantName.length > 150) {
    return { success: false, error: "Restaurant name must be 150 characters or fewer." };
  }
  if (!restaurantAddress) {
    return { success: false, error: "Restaurant address is required." };
  }
  if (!contactPhone) {
    return { success: false, error: "Contact phone number is required." };
  }
  if (contactPhone.length > 20) {
    return { success: false, error: "Contact phone number must be 20 characters or fewer." };
  }

  const supabase = await createClient();

  // Check if user already has an active pending application
  const { data: existingPending } = await supabase
    .from("restaurant_applications")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "PENDING")
    .maybeSingle();

  if (existingPending) {
    return {
      success: false,
      error: "You already have a restaurant application under review.",
    };
  }

  const { error: insertError } = await supabase
    .from("restaurant_applications")
    .insert({
      user_id: user.id,
      restaurant_name: restaurantName,
      restaurant_address: restaurantAddress,
      contact_phone: contactPhone,
      status: "PENDING",
    });

  if (insertError) {
    console.error("Failed to submit restaurant application:", insertError);
    return {
      success: false,
      error: insertError.message || "Could not submit application. Please try again.",
    };
  }

  revalidatePath("/partner/status");
  return { success: true };
}
