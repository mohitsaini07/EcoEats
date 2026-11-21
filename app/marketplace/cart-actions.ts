"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { sql } from "@/lib/db/client";
import {
  getCustomerActiveCart,
  addToCustomerCart,
  updateCustomerCartQuantity,
  clearCustomerCart,
  switchCustomerCartRestaurant,
} from "@/lib/db/cart";
import type { ActiveCart } from "@/lib/types/marketplace";

export type CartActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      conflict?: { currentRestaurantName: string; incomingRestaurantName: string };
    };

/**
 * Fetch the authenticated customer's active cart.
 */
export async function fetchActiveCartAction(): Promise<CartActionResult<ActiveCart | null>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: true, data: null };
    }

    const cart = await getCustomerActiveCart(user.id);
    return { success: true, data: cart };
  } catch (error) {
    console.error("Failed to load active cart:", error);
    return { success: false, error: "Failed to load active cart" };
  }
}

/**
 * Add an item to the customer's cart in Supabase.
 */
export async function addToCartAction(
  foodListingId: string
): Promise<CartActionResult<ActiveCart | null>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Please log in to add items to your tray." };
    }

    const result = await addToCustomerCart(user.id, foodListingId);

    if (result.conflict) {
      return {
        success: false,
        error: "Cart contains items from another restaurant",
        conflict: result.conflict,
      };
    }

    revalidatePath("/marketplace");
    return { success: true, data: result.cart };
  } catch (error) {
    console.error("Error adding to cart:", error);
    const message = error instanceof Error ? error.message : "Failed to add item to tray.";
    return { success: false, error: message };
  }
}

/**
 * Update quantity of a cart item in Supabase.
 */
export async function updateCartQuantityAction(
  foodListingId: string,
  quantity: number
): Promise<CartActionResult<ActiveCart | null>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Please log in to update your tray." };
    }

    const cart = await updateCustomerCartQuantity(user.id, foodListingId, quantity);
    revalidatePath("/marketplace");
    return { success: true, data: cart };
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    const message = error instanceof Error ? error.message : "Failed to update item quantity.";
    return { success: false, error: message };
  }
}

/**
 * Clear the customer's cart in Supabase.
 */
export async function clearCartAction(): Promise<CartActionResult<null>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: true, data: null };
    }

    await clearCustomerCart(user.id);
    revalidatePath("/marketplace");
    return { success: true, data: null };
  } catch (error) {
    console.error("Error clearing cart:", error);
    const message = error instanceof Error ? error.message : "Failed to clear tray.";
    return { success: false, error: message };
  }
}

/**
 * Clear current cart and add item from a new restaurant.
 */
export async function switchCartRestaurantAction(
  foodListingId: string
): Promise<CartActionResult<ActiveCart | null>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Please log in to update your tray." };
    }

    const cart = await switchCustomerCartRestaurant(user.id, foodListingId);
    revalidatePath("/marketplace");
    return { success: true, data: cart };
  } catch (error) {
    console.error("Error switching restaurant cart:", error);
    const message = error instanceof Error ? error.message : "Failed to switch restaurant.";
    return { success: false, error: message };
  }
}

/**
 * Execute atomic checkout RPC in Supabase.
 * Locks active cart, reserves inventory, creates PENDING_PAYMENT order,
 * creates order_items and 10-minute reservations, decrements listing quantity,
 * and marks cart CHECKED_OUT.
 */
export async function checkoutActiveCartAction(): Promise<
  CartActionResult<{ orderId: string; pickupCode?: string }>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Please log in to complete checkout." };
    }

    const { data: orderId, error: rpcError } = await supabase.rpc("checkout_cart");
    if (rpcError) {
      console.error("checkout_cart RPC error:", rpcError);
      return { success: false, error: rpcError.message || "Checkout failed." };
    }

    const code = `ECO-${String(orderId).replace(/-/g, "").slice(-4).toUpperCase()}`;
    await sql`
      UPDATE orders
      SET status = 'CONFIRMED',
          pickup_code = ${code},
          updated_at = NOW()
      WHERE id = ${orderId}
    `;

    revalidatePath("/marketplace");
    revalidatePath("/manager");
    return { success: true, data: { orderId: String(orderId), pickupCode: code } };
  } catch (error) {
    console.error("Checkout action error:", error);
    const message = error instanceof Error ? error.message : "Failed to complete checkout.";
    return { success: false, error: message };
  }
}
