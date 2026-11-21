import { sql } from "@/lib/db/client";
import type { ActiveCart, CartItem, FoodListing } from "@/lib/types/marketplace";
import { formatPickupTime } from "@/lib/db/listings";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SqlOrTx = any;

interface CartItemRow {
  cart_item_id: string;
  cart_id: string;
  food_listing_id: string;
  quantity: number;
  listing_id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  category: string;
  original_price: number;
  discounted_price: number;
  total_quantity: number;
  available_quantity: number;
  pickup_start: string | Date;
  pickup_end: string | Date;
  listing_status: FoodListing["status"];
  image_url: string | null;
  restaurant_name: string;
  restaurant_address: string;
}

function normalizeCategory(cat: string): "Bakery" | "Meals" | "Cafe" | "Dessert" | "Vegan" {
  const lower = (cat || "").toLowerCase();
  if (lower === "meals") return "Meals";
  if (lower === "cafe") return "Cafe";
  if (lower === "dessert") return "Dessert";
  if (lower === "vegan") return "Vegan";
  return "Bakery";
}

/**
 * Fetch the customer's active cart and its items from Supabase.
 */
export async function getCustomerActiveCart(
  userId: string,
  tx?: SqlOrTx
): Promise<ActiveCart | null> {
  const db = tx ?? sql;

  try {
    const [cartRow] = await db`
      SELECT 
        c.id,
        c.restaurant_id,
        r.name AS restaurant_name,
        r.address AS restaurant_address,
        c.status
      FROM carts c
      JOIN restaurants r ON c.restaurant_id = r.id
      WHERE c.user_id = ${userId}
        AND c.status = 'ACTIVE'
      LIMIT 1
    `;

    if (!cartRow) {
      return null;
    }

    // Clean up any items whose food listing is no longer active
    await db`
      DELETE FROM cart_items
      WHERE cart_id = ${cartRow.id}
        AND food_listing_id IN (
          SELECT fl.id FROM food_listings fl
          WHERE fl.id = cart_items.food_listing_id AND fl.status != 'ACTIVE'
        )
    `;

    const itemRows = await db<CartItemRow[]>`
      SELECT 
        ci.id AS cart_item_id,
        ci.cart_id,
        ci.food_listing_id,
        ci.quantity,
        fl.id AS listing_id,
        fl.restaurant_id,
        fl.name AS title,
        fl.description,
        fl.category,
        fl.original_price,
        fl.discounted_price,
        fl.quantity AS total_quantity,
        fl.available_quantity,
        fl.pickup_start,
        fl.pickup_end,
        fl.status AS listing_status,
        fl.image_url,
        r.name AS restaurant_name,
        r.address AS restaurant_address
      FROM cart_items ci
      JOIN food_listings fl ON ci.food_listing_id = fl.id
      JOIN restaurants r ON fl.restaurant_id = r.id
      WHERE ci.cart_id = ${cartRow.id}
      ORDER BY ci.created_at ASC
    `;

    if (itemRows.length === 0) {
      // Clean up orphaned empty cart row so user can start fresh with any restaurant
      await db`DELETE FROM carts WHERE id = ${cartRow.id}`;
      return null;
    }

    const items: CartItem[] = itemRows.map((row: CartItemRow) => {
      const cat = normalizeCategory(row.category);
      const listing: FoodListing = {
        id: String(row.listing_id),
        restaurant_id: String(row.restaurant_id),
        restaurant_name: row.restaurant_name,
        restaurant_address: row.restaurant_address,
        distance_km: 0.8,
        title: row.title,
        description: row.description || "",
        category: cat,
        quantity: Number(row.total_quantity),
        available_quantity: Number(row.available_quantity),
        original_price: Number(row.original_price),
        discounted_price: Number(row.discounted_price),
        pickup_start: formatPickupTime(row.pickup_start),
        pickup_end: formatPickupTime(row.pickup_end),
        status: row.listing_status,
        image_url: row.image_url || undefined,
        dietary_tags: ["Fresh Batch", "Packaged for Pickup"],
      };

      return {
        id: String(row.cart_item_id),
        food_listing_id: String(row.food_listing_id),
        listing,
        quantity: Number(row.quantity),
      };
    });

    const total_amount = items.reduce(
      (sum, item) => sum + item.listing.discounted_price * item.quantity,
      0
    );

    return {
      id: String(cartRow.id),
      restaurant_id: String(cartRow.restaurant_id),
      restaurant_name: cartRow.restaurant_name,
      items,
      total_amount,
    };
  } catch (error) {
    console.error("Failed to fetch customer active cart:", error);
    return null;
  }
}

/**
 * Add an item to the customer's active cart.
 * Enforces:
 * - One active cart per user
 * - Single restaurant per cart (returns conflict info if from another restaurant)
 * - Available inventory bounds
 */
export async function addToCustomerCart(
  userId: string,
  foodListingId: string
): Promise<{
  cart: ActiveCart | null;
  conflict?: { currentRestaurantName: string; incomingRestaurantName: string };
}> {
  return await sql.begin(async (tx) => {
    // 1. Fetch food listing
    const [listing] = await tx`
      SELECT fl.id, fl.restaurant_id, fl.available_quantity, fl.status, r.name AS restaurant_name
      FROM food_listings fl
      JOIN restaurants r ON fl.restaurant_id = r.id
      WHERE fl.id = ${foodListingId}
    `;

    if (!listing || listing.status !== "ACTIVE" || listing.available_quantity < 1) {
      throw new Error("This food batch is currently unavailable.");
    }

    // 2. Lock and check active cart for user
    const [existingCart] = await tx`
      SELECT c.id, c.restaurant_id, r.name AS restaurant_name
      FROM carts c
      JOIN restaurants r ON c.restaurant_id = r.id
      WHERE c.user_id = ${userId}
        AND c.status = 'ACTIVE'
      FOR UPDATE
    `;

    let cartId: string;

    if (existingCart) {
      // Check if existing cart has items
      const [itemCountRow] = await tx`
        SELECT COUNT(*)::int AS count
        FROM cart_items
        WHERE cart_id = ${existingCart.id}
      `;

      if (itemCountRow.count === 0) {
        // Empty cart: safely update restaurant
        await tx`
          UPDATE carts
          SET restaurant_id = ${listing.restaurant_id},
              updated_at = NOW()
          WHERE id = ${existingCart.id}
        `;
        cartId = existingCart.id;
        await tx`
          INSERT INTO cart_items (cart_id, food_listing_id, quantity)
          VALUES (${cartId}, ${listing.id}, 1)
        `;
      } else if (existingCart.restaurant_id !== listing.restaurant_id) {
        // Single-restaurant rule conflict
        return {
          cart: null,
          conflict: {
            currentRestaurantName: existingCart.restaurant_name,
            incomingRestaurantName: listing.restaurant_name,
          },
        };
      } else {
        cartId = existingCart.id;

        // Check if item already in cart
        const [existingItem] = await tx`
          SELECT id, quantity
          FROM cart_items
          WHERE cart_id = ${cartId}
            AND food_listing_id = ${listing.id}
        `;

        if (existingItem) {
          const nextQty = Math.min(existingItem.quantity + 1, listing.available_quantity);
          await tx`
            UPDATE cart_items
            SET quantity = ${nextQty},
                updated_at = NOW()
            WHERE id = ${existingItem.id}
          `;
        } else {
          await tx`
            INSERT INTO cart_items (cart_id, food_listing_id, quantity)
            VALUES (${cartId}, ${listing.id}, 1)
          `;
        }
      }
    } else {
      // Create new active cart (partial unique index one_active_cart_per_user protects against concurrent creation)
      const [newCart] = await tx`
        INSERT INTO carts (user_id, restaurant_id, status)
        VALUES (${userId}, ${listing.restaurant_id}, 'ACTIVE')
        ON CONFLICT (user_id) WHERE status = 'ACTIVE'
        DO UPDATE SET updated_at = NOW()
        RETURNING id
      `;

      cartId = newCart.id;

      await tx`
        INSERT INTO cart_items (cart_id, food_listing_id, quantity)
        VALUES (${cartId}, ${listing.id}, 1)
        ON CONFLICT (cart_id, food_listing_id)
        DO UPDATE SET quantity = LEAST(cart_items.quantity + 1, ${listing.available_quantity}), updated_at = NOW()
      `;
    }

    // Fetch full active cart to return (passing tx to avoid lock contention)
    const updatedCart = await getCustomerActiveCart(userId, tx);
    return { cart: updatedCart };
  });
}

/**
 * Update quantity of a cart item.
 * If quantity reaches 0, removes item and cleans up cart if empty.
 */
export async function updateCustomerCartQuantity(
  userId: string,
  foodListingId: string,
  quantity: number
): Promise<ActiveCart | null> {
  return await sql.begin(async (tx) => {
    const [existingCart] = await tx`
      SELECT id FROM carts
      WHERE user_id = ${userId}
        AND status = 'ACTIVE'
      FOR UPDATE
    `;

    if (!existingCart) return null;

    if (quantity <= 0) {
      await tx`
        DELETE FROM cart_items
        WHERE cart_id = ${existingCart.id}
          AND food_listing_id = ${foodListingId}
      `;
    } else {
      const [listing] = await tx`
        SELECT available_quantity FROM food_listings WHERE id = ${foodListingId}
      `;
      const maxStock = listing?.available_quantity ?? 99;
      const clamped = Math.min(quantity, maxStock);

      await tx`
        UPDATE cart_items
        SET quantity = ${clamped},
            updated_at = NOW()
        WHERE cart_id = ${existingCart.id}
          AND food_listing_id = ${foodListingId}
      `;
    }

    // Check if cart is now empty
    const [remaining] = await tx`
      SELECT COUNT(*)::int AS count
      FROM cart_items
      WHERE cart_id = ${existingCart.id}
    `;

    if (remaining.count === 0) {
      await tx`DELETE FROM carts WHERE id = ${existingCart.id}`;
      return null;
    }

    return await getCustomerActiveCart(userId, tx);
  });
}

/**
 * Clear the customer's active cart.
 */
export async function clearCustomerCart(userId: string): Promise<void> {
  await sql`
    DELETE FROM carts
    WHERE user_id = ${userId}
      AND status = 'ACTIVE'
  `;
}

/**
 * Switch restaurant by clearing current active cart and starting fresh with new listing.
 */
export async function switchCustomerCartRestaurant(
  userId: string,
  foodListingId: string
): Promise<ActiveCart | null> {
  return await sql.begin(async (tx) => {
    // 1. Clear old cart
    await tx`
      DELETE FROM carts
      WHERE user_id = ${userId}
        AND status = 'ACTIVE'
    `;

    // 2. Fetch new listing
    const [listing] = await tx`
      SELECT id, restaurant_id, available_quantity, status
      FROM food_listings
      WHERE id = ${foodListingId}
    `;

    if (!listing || listing.status !== "ACTIVE" || listing.available_quantity < 1) {
      throw new Error("This food batch is unavailable.");
    }

    // 3. Create fresh cart
    const [newCart] = await tx`
      INSERT INTO carts (user_id, restaurant_id, status)
      VALUES (${userId}, ${listing.restaurant_id}, 'ACTIVE')
      RETURNING id
    `;

    await tx`
      INSERT INTO cart_items (cart_id, food_listing_id, quantity)
      VALUES (${newCart.id}, ${listing.id}, 1)
    `;

    return await getCustomerActiveCart(userId, tx);
  });
}
