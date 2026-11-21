"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import {
  createFoodListingInDb,
  updateFoodListingInDb,
  toggleListingStatusInDb,
  deleteFoodListingInDb,
  verifyPickupCodeInDb,
  completeOrderPickupInDb,
  type CreateListingInput,
  type UpdateListingInput,
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

export async function updateBatchListingAction(
  input: UpdateListingInput | FormData
): Promise<ActionResult<FoodListing>> {
  try {
    const user = await requireRole("RESTAURANT_MANAGER", "ADMIN");

    let parsedInput: UpdateListingInput;

    if (input instanceof FormData) {
      const id = input.get("id")?.toString();
      if (!id) {
        return { success: false, error: "Batch listing ID is required." };
      }

      const file = input.get("image");
      // Check if user kept, cleared, or uploaded a new image
      let imageUrl: string | null | undefined = undefined;
      const rawImageUrl = input.get("imageUrl")?.toString();
      if (rawImageUrl !== undefined) {
        imageUrl = rawImageUrl.trim() === "" ? null : rawImageUrl.trim();
      }

      if (file && typeof file === "object" && "arrayBuffer" in file && (file as File).size > 0) {
        try {
          imageUrl = await uploadListingImage(file as File);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          return {
            success: false,
            error: "Failed to upload new image. Please try again or use another format.",
          };
        }
      }

      parsedInput = {
        id,
        title: input.get("title")?.toString() ?? "",
        category: (input.get("category")?.toString() ?? "Bakery") as UpdateListingInput["category"],
        quantity: Number(input.get("quantity")),
        availableQuantity: Number(input.get("availableQuantity")),
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

    if (!parsedInput.id) {
      return { success: false, error: "Batch listing ID is required." };
    }
    if (!parsedInput.title || !parsedInput.title.trim()) {
      return { success: false, error: "Please provide a valid batch name." };
    }
    if (!parsedInput.quantity || parsedInput.quantity < 1) {
      return { success: false, error: "Total batch units must be a positive number." };
    }
    if (parsedInput.availableQuantity < 0) {
      return { success: false, error: "Available units cannot be negative." };
    }
    if (parsedInput.availableQuantity > parsedInput.quantity) {
      return { success: false, error: "Available units cannot exceed total batch units." };
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

    const listing = await updateFoodListingInDb(
      parsedInput,
      user.id,
      user.role === "ADMIN"
    );

    revalidatePath("/marketplace");
    revalidatePath("/manager");
    revalidatePath("/");

    return { success: true, data: listing };
  } catch (error) {
    console.error("Error updating surplus batch:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update batch.";
    return { success: false, error: message };
  }
}

export async function toggleBatchStatusAction(
  listingId: string,
  targetStatus: "ACTIVE" | "CANCELLED"
): Promise<ActionResult<FoodListing>> {
  try {
    const user = await requireRole("RESTAURANT_MANAGER", "ADMIN");

    if (!listingId) {
      return { success: false, error: "Batch listing ID is required." };
    }

    const listing = await toggleListingStatusInDb(
      listingId,
      user.id,
      targetStatus,
      user.role === "ADMIN"
    );

    revalidatePath("/marketplace");
    revalidatePath("/manager");
    revalidatePath("/");

    return { success: true, data: listing };
  } catch (error) {
    console.error("Error toggling batch status:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update batch status.";
    return { success: false, error: message };
  }
}

export async function deleteBatchListingAction(
  listingId: string
): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const user = await requireRole("RESTAURANT_MANAGER", "ADMIN");

    if (!listingId) {
      return { success: false, error: "Batch listing ID is required." };
    }

    const res = await deleteFoodListingInDb(
      listingId,
      user.id,
      user.role === "ADMIN"
    );

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Cannot delete this batch.",
      };
    }

    revalidatePath("/marketplace");
    revalidatePath("/manager");
    revalidatePath("/");

    return { success: true, data: { deletedId: listingId } };
  } catch (error) {
    console.error("Error deleting surplus batch:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete batch.";
    return { success: false, error: message };
  }
}

export async function verifyPickupCodeAction(
  pickupCode: string
): Promise<
  ActionResult<{ orderId: string; customerName: string; pickupCode: string }>
> {
  try {
    const user = await requireRole("RESTAURANT_MANAGER", "ADMIN");
    const code = pickupCode.trim().toUpperCase();
    if (!code) {
      return { success: false, error: "Please enter a valid pickup code." };
    }

    const res = await verifyPickupCodeInDb(code, user.id, user.role === "ADMIN");
    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidatePath("/manager");
    revalidatePath("/marketplace");
    return { success: true, data: res.data };
  } catch (error) {
    console.error("Error verifying pickup code:", error);
    const message =
      error instanceof Error ? error.message : "Failed to verify pickup code.";
    return { success: false, error: message };
  }
}

export async function completeOrderPickupAction(
  orderId: string
): Promise<ActionResult<{ orderId: string }>> {
  try {
    const user = await requireRole("RESTAURANT_MANAGER", "ADMIN");
    if (!orderId) {
      return { success: false, error: "Order ID is required." };
    }

    const res = await completeOrderPickupInDb(
      orderId,
      user.id,
      user.role === "ADMIN"
    );
    if (!res.success) {
      return {
        success: false,
        error: res.error || "Cannot complete this pickup.",
      };
    }

    revalidatePath("/manager");
    revalidatePath("/marketplace");
    return { success: true, data: { orderId } };
  } catch (error) {
    console.error("Error completing pickup:", error);
    const message =
      error instanceof Error ? error.message : "Failed to complete pickup.";
    return { success: false, error: message };
  }
}
