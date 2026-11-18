"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import {
  createFoodListingInDb,
  type CreateListingInput,
} from "@/lib/db/listings";
import type { FoodListing } from "@/lib/types/marketplace";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createBatchListingAction(
  input: CreateListingInput
): Promise<ActionResult<FoodListing>> {
  try {
    const user = await requireRole("RESTAURANT_MANAGER", "ADMIN");

    if (!input.title || !input.title.trim()) {
      return { success: false, error: "Please provide a valid batch name." };
    }
    if (!input.quantity || input.quantity < 1) {
      return { success: false, error: "Quantity must be a positive number." };
    }
    if (!input.originalPrice || input.originalPrice <= 0) {
      return { success: false, error: "Original price must be greater than zero." };
    }
    if (!input.discountedPrice || input.discountedPrice <= 0) {
      return { success: false, error: "Surplus price must be greater than zero." };
    }
    if (input.discountedPrice > input.originalPrice) {
      return {
        success: false,
        error: "Surplus price cannot be higher than the original price.",
      };
    }

    const listing = await createFoodListingInDb(input, user.id);

    // Revalidate paths so customers and managers see the new batch immediately
    revalidatePath("/marketplace");
    revalidatePath("/manager");
    revalidatePath("/");

    return { success: true, data: listing };
  } catch (error) {
    console.error("Error creating surplus batch:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create batch.";
    return { success: false, error: message };
  }
}
