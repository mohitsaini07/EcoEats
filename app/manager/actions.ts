"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import {
  createFoodListingInDb,
  type CreateListingInput,
} from "@/lib/db/listings";
import type { FoodListing } from "@/lib/types/marketplace";
import { uploadListingImage } from "@/lib/storage/upload";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createBatchListingAction(
  input: CreateListingInput | FormData
): Promise<ActionResult<FoodListing>> {
  try {
    const user = await requireRole("RESTAURANT_MANAGER", "ADMIN");

    let parsedInput: CreateListingInput;

    if (input instanceof FormData) {
      const file = input.get("image");
      let imageUrl = input.get("imageUrl")?.toString()?.trim() || undefined;

      if (file && typeof file === "object" && "arrayBuffer" in file && (file as File).size > 0) {
        try {
          imageUrl = await uploadListingImage(file as File);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          return {
            success: false,
            error: "Failed to upload image. Please try again or use another format.",
          };
        }
      }

      parsedInput = {
        title: input.get("title")?.toString() ?? "",
        category: (input.get("category")?.toString() ?? "Bakery") as CreateListingInput["category"],
        quantity: Number(input.get("quantity")),
        originalPrice: Number(input.get("originalPrice")),
        discountedPrice: Number(input.get("discountedPrice")),
        pickupStart: input.get("pickupStart")?.toString() ?? "8:00 PM",
        pickupEnd: input.get("pickupEnd")?.toString() ?? "9:30 PM",
        description: input.get("description")?.toString() ?? "",
        imageUrl,
      };
    } else {
      parsedInput = input;
    }

    if (!parsedInput.title || !parsedInput.title.trim()) {
      return { success: false, error: "Please provide a valid batch name." };
    }
    if (!parsedInput.quantity || parsedInput.quantity < 1) {
      return { success: false, error: "Quantity must be a positive number." };
    }
    if (!parsedInput.originalPrice || parsedInput.originalPrice <= 0) {
      return { success: false, error: "Original price must be greater than zero." };
    }
    if (!parsedInput.discountedPrice || parsedInput.discountedPrice <= 0) {
      return { success: false, error: "Surplus price must be greater than zero." };
    }
    if (parsedInput.discountedPrice > parsedInput.originalPrice) {
      return {
        success: false,
        error: "Surplus price cannot be higher than the original price.",
      };
    }

    const listing = await createFoodListingInDb(parsedInput, user.id);

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
