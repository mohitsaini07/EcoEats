import { sql } from "@/lib/db/client";
import type { FoodListing } from "@/lib/types/marketplace";

export type PickupQueueItem = {
  order_id: string;
  customer_name: string;
  pickup_code: string;
  items_summary: string;
  total_amount: number;
  pickup_window: string;
  status: "READY_FOR_PICKUP" | "COMPLETED";
};

export type CreateListingInput = {
  title: string;
  category: "Bakery" | "Meals" | "Cafe" | "Dessert" | "Vegan";
  quantity: number;
  originalPrice: number;
  discountedPrice: number;
  pickupStart: string;
  pickupEnd: string;
  description?: string;
  imageUrl?: string;
};

const CATEGORY_IMAGES: Record<string, string> = {
  bakery: "./images/skyler-ewing.jpg",
  meals: "./images/veggie-sandwich.jpg",
  cafe: "./images/cinnamon-rolls.jpg",
  dessert: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=800",
  vegan: "./images/sonny-mauricio.jpg",
};

export function getCategoryImage(category: string): string {
  const key = (category || "").toLowerCase();
  return CATEGORY_IMAGES[key] || "./images/skyler-ewing.jpg";
}

export function parsePickupTimes(startTimeStr: string, endTimeStr: string): { start: Date; end: Date } {
  const now = new Date();

  function parseTime(str: string): { hours: number; minutes: number } {
    const trimmed = (str || "").trim();

    // Check if ISO or full date
    const dateTry = new Date(trimmed);
    if (!isNaN(dateTry.getTime()) && trimmed.includes("-")) {
      return { hours: dateTry.getHours(), minutes: dateTry.getMinutes() };
    }

    // Check 12-hour format e.g. "8:00 PM", "8:30pm", "8 pm"
    const match12 = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
      const isPm = match12[3].toLowerCase() === "pm";
      if (isPm && hours < 12) hours += 12;
      if (!isPm && hours === 12) hours = 0;
      return { hours, minutes };
    }

    // Check 24-hour format e.g. "20:00", "08:30"
    const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      return { hours: parseInt(match24[1], 10), minutes: parseInt(match24[2], 10) };
    }

    // Default fallback: 8:00 PM
    return { hours: 20, minutes: 0 };
  }

  const startHM = parseTime(startTimeStr);
  const endHM = parseTime(endTimeStr);

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHM.hours, startHM.minutes, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHM.hours, endHM.minutes, 0);

  // Ensure end > start (if end is earlier or equal, bump end to be at least 90 minutes after start)
  if (end.getTime() <= start.getTime()) {
    end.setTime(start.getTime() + 90 * 60 * 1000);
  }

  return { start, end };
}

export function formatPickupTime(dateOrStr: string | Date | null | undefined): string {
  if (!dateOrStr) return "8:00 PM";
  const d = new Date(dateOrStr);
  if (isNaN(d.getTime())) {
    return String(dateOrStr);
  }
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function normalizeCategory(cat: string): "Bakery" | "Meals" | "Cafe" | "Dessert" | "Vegan" {
  const lower = (cat || "").toLowerCase();
  if (lower === "meals") return "Meals";
  if (lower === "cafe") return "Cafe";
  if (lower === "dessert") return "Dessert";
  if (lower === "vegan") return "Vegan";
  return "Bakery";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToListing(row: any): FoodListing {
  const cat = normalizeCategory(row.category);
  return {
    id: String(row.id),
    restaurant_id: String(row.restaurant_id),
    restaurant_name: row.restaurant_name || "Artisan Kitchen",
    restaurant_address: row.restaurant_address || "Bengaluru, Karnataka",
    distance_km: typeof row.distance_km === "number" ? row.distance_km : 0.4,
    title: row.title || row.name || "Surplus Batch",
    description:
      row.description ||
      "Fresh surplus food prepared with care by our kitchen, available for quick pickup.",
    category: cat,
    quantity: Number(row.quantity),
    available_quantity: Number(row.available_quantity),
    original_price: Number(row.original_price),
    discounted_price: Number(row.discounted_price),
    pickup_start: formatPickupTime(row.pickup_start),
    pickup_end: formatPickupTime(row.pickup_end),
    status: row.status as "ACTIVE" | "SOLD_OUT" | "EXPIRED" | "DRAFT",
    image_url: row.image_url || getCategoryImage(cat),
    dietary_tags: ["Fresh Batch", "Packaged for Pickup"],
  };
}

/**
 * Fetch all active food listings for customer discovery.
 */
export async function getActiveFoodListings(): Promise<FoodListing[]> {
  try {
    const rows = await sql`
      SELECT 
        fl.id,
        fl.restaurant_id,
        r.name AS restaurant_name,
        r.address AS restaurant_address,
        fl.name AS title,
        fl.description,
        fl.category,
        fl.image_url,
        fl.quantity,
        fl.available_quantity,
        fl.original_price,
        fl.discounted_price,
        fl.pickup_start,
        fl.pickup_end,
        fl.status,
        fl.created_at
      FROM food_listings fl
      JOIN restaurants r ON fl.restaurant_id = r.id
      WHERE fl.status = 'ACTIVE'
        AND r.status = 'ACTIVE'
        AND fl.available_quantity > 0
      ORDER BY fl.created_at DESC
    `;

    return rows.map(mapRowToListing);
  } catch (error) {
    console.error("Failed to fetch active food listings:", error);
    return [];
  }
}

/**
 * Fetch the kitchen manager's dashboard data (restaurant info, their food listings, and pickup orders).
 */
export async function getManagerDashboardData(managerId: string) {
  try {
    // 1. Fetch or create manager's restaurant
    let [restaurant] = await sql`
      SELECT id, name, address, description, status
      FROM restaurants
      WHERE manager_id = ${managerId}
      LIMIT 1
    `;

    if (!restaurant) {
      // Check if user has an approved restaurant application
      const [app] = await sql`
        SELECT restaurant_name, restaurant_address
        FROM restaurant_applications
        WHERE user_id = ${managerId}
          AND status = 'APPROVED'
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const [user] = await sql`SELECT name, email FROM users WHERE id = ${managerId}`;
      const restName =
        app?.restaurant_name ||
        (user?.name ? `${user.name}'s Kitchen` : "The Artisan Kitchen");
      const restAddress =
        app?.restaurant_address || "Bengaluru, Karnataka";

      const [created] = await sql`
        INSERT INTO restaurants (
          manager_id,
          name,
          description,
          address,
          status
        ) VALUES (
          ${managerId},
          ${restName},
          'Fresh surplus partner kitchen',
          ${restAddress},
          'ACTIVE'
        )
        RETURNING id, name, address, description, status
      `;
      restaurant = created;
    }

    // 2. Fetch all listings for this restaurant
    const listingRows = await sql`
      SELECT 
        fl.id,
        fl.restaurant_id,
        r.name AS restaurant_name,
        r.address AS restaurant_address,
        fl.name AS title,
        fl.description,
        fl.category,
        fl.image_url,
        fl.quantity,
        fl.available_quantity,
        fl.original_price,
        fl.discounted_price,
        fl.pickup_start,
        fl.pickup_end,
        fl.status,
        fl.created_at
      FROM food_listings fl
      JOIN restaurants r ON fl.restaurant_id = r.id
      WHERE fl.restaurant_id = ${restaurant.id}
      ORDER BY fl.created_at DESC
    `;

    const listings = listingRows.map(mapRowToListing);

    // 3. Fetch real orders for this restaurant
    const orderRows = await sql`
      SELECT 
        o.id AS order_id,
        u.name AS customer_name,
        COALESCE(o.pickup_code, 'PENDING') AS pickup_code,
        o.total_amount,
        o.status AS order_status,
        o.picked_up_at,
        o.created_at,
        COALESCE(
          (
            SELECT string_agg(fl.name || ' × ' || oi.quantity, ', ')
            FROM order_items oi
            JOIN food_listings fl ON oi.food_listing_id = fl.id
            WHERE oi.order_id = o.id
          ),
          'Surplus order'
        ) AS items_summary,
        (
          SELECT MIN(fl.pickup_start)
          FROM order_items oi
          JOIN food_listings fl ON oi.food_listing_id = fl.id
          WHERE oi.order_id = o.id
        ) AS earliest_pickup,
        (
          SELECT MAX(fl.pickup_end)
          FROM order_items oi
          JOIN food_listings fl ON oi.food_listing_id = fl.id
          WHERE oi.order_id = o.id
        ) AS latest_pickup
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.restaurant_id = ${restaurant.id}
        AND o.status IN ('CONFIRMED', 'COMPLETED')
      ORDER BY o.created_at DESC
    `;

    const queue: PickupQueueItem[] = orderRows.map((o) => {
      let windowText = "8:00 PM – 9:30 PM";
      if (o.earliest_pickup && o.latest_pickup) {
        windowText = `${formatPickupTime(o.earliest_pickup)} – ${formatPickupTime(o.latest_pickup)}`;
      }
      return {
        order_id: String(o.order_id),
        customer_name: o.customer_name || "Customer",
        pickup_code: o.pickup_code || "ECO-0000",
        items_summary: o.items_summary,
        total_amount: Number(o.total_amount),
        pickup_window: windowText,
        status: o.order_status === "COMPLETED" || o.picked_up_at ? "COMPLETED" : "READY_FOR_PICKUP",
      };
    });

    // 4. Calculate real statistics from database
    const [revenueRow] = await sql`
      SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
      FROM orders
      WHERE restaurant_id = ${restaurant.id}
        AND status IN ('CONFIRMED', 'COMPLETED')
    `;

    const [rescuedRow] = await sql`
      SELECT COALESCE(SUM(oi.quantity), 0) AS units_rescued
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.restaurant_id = ${restaurant.id}
        AND o.status IN ('CONFIRMED', 'COMPLETED')
    `;

    const totalRevenue = Number(revenueRow?.total_revenue ?? 0);
    const totalRescued = Number(rescuedRow?.units_rescued ?? 0);

    return {
      restaurant: {
        id: String(restaurant.id),
        name: restaurant.name,
        address: restaurant.address,
      },
      listings,
      queue,
      stats: {
        totalRescuedToday: totalRescued,
        todayRevenue: totalRevenue,
      },
    };
  } catch (error) {
    console.error("Failed to fetch manager dashboard data:", error);
    return {
      restaurant: null,
      listings: [],
      queue: [],
      stats: {
        totalRescuedToday: 0,
        todayRevenue: 0,
      },
    };
  }
}

/**
 * Verify a customer pickup code for the manager's restaurant.
 */
export async function verifyPickupCodeInDb(
  code: string,
  managerId: string,
  isAdmin: boolean = false
): Promise<
  | { success: true; data: { orderId: string; customerName: string; pickupCode: string } }
  | { success: false; error: string }
> {
  const [restaurant] = isAdmin
    ? await sql`SELECT id FROM restaurants LIMIT 1`
    : await sql`SELECT id FROM restaurants WHERE manager_id = ${managerId} LIMIT 1`;

  if (!restaurant) {
    return { success: false, error: "No managed restaurant found for your account." };
  }

  const [order] = await sql`
    SELECT o.id, o.pickup_code, o.status, u.name AS customer_name
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.restaurant_id = ${restaurant.id}
      AND UPPER(o.pickup_code) = ${code}
    LIMIT 1
  `;

  if (!order) {
    return {
      success: false,
      error: `No pickup was found for “${code}”. Check the code and try again.`,
    };
  }

  if (order.status === "COMPLETED") {
    return {
      success: false,
      error: `Order with code “${code}” has already been marked as handed over.`,
    };
  }

  if (order.status !== "CONFIRMED") {
    return {
      success: false,
      error: `Order is not confirmed yet (current status: ${order.status}).`,
    };
  }

  await sql.begin(async (tx) => {
    await tx`
      UPDATE orders
      SET status = 'COMPLETED',
          picked_up_at = NOW(),
          updated_at = NOW()
      WHERE id = ${order.id}
    `;

    await tx`
      UPDATE inventory_reservations
      SET status = 'CONVERTED',
          converted_at = NOW()
      WHERE order_id = ${order.id}
        AND status = 'ACTIVE'
    `;
  });

  return {
    success: true,
    data: {
      orderId: String(order.id),
      customerName: order.customer_name || "Customer",
      pickupCode: order.pickup_code,
    },
  };
}

/**
 * Mark an order as handed over for the manager's restaurant.
 */
export async function completeOrderPickupInDb(
  orderId: string,
  managerId: string,
  isAdmin: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const [restaurant] = isAdmin
    ? await sql`SELECT id FROM restaurants LIMIT 1`
    : await sql`SELECT id FROM restaurants WHERE manager_id = ${managerId} LIMIT 1`;

  if (!restaurant) {
    return { success: false, error: "No managed restaurant found." };
  }

  const [order] = await sql`
    SELECT id, status FROM orders
    WHERE id = ${orderId}
      AND restaurant_id = ${restaurant.id}
    LIMIT 1
  `;

  if (!order) {
    return { success: false, error: "Order not found for your kitchen." };
  }

  await sql.begin(async (tx) => {
    await tx`
      UPDATE orders
      SET status = 'COMPLETED',
          picked_up_at = NOW(),
          updated_at = NOW()
      WHERE id = ${order.id}
    `;

    await tx`
      UPDATE inventory_reservations
      SET status = 'CONVERTED',
          converted_at = NOW()
      WHERE order_id = ${order.id}
        AND status = 'ACTIVE'
    `;
  });

  return { success: true };
}

/**
 * Insert a newly created food listing batch into PostgreSQL.
 */
export async function createFoodListingInDb(
  input: CreateListingInput,
  managerId: string
): Promise<FoodListing> {
  // 1. Ensure restaurant exists
  let [restaurant] = await sql`
    SELECT id, name, address
    FROM restaurants
    WHERE manager_id = ${managerId}
    LIMIT 1
  `;

  if (!restaurant) {
    const [user] = await sql`SELECT name FROM users WHERE id = ${managerId}`;
    const restName = user?.name ? `${user.name}'s Kitchen` : "The Artisan Kitchen";

    const [created] = await sql`
      INSERT INTO restaurants (
        manager_id,
        name,
        description,
        address,
        status
      ) VALUES (
        ${managerId},
        ${restName},
        'Fresh surplus partner kitchen',
        'Indiranagar, Bengaluru',
        'ACTIVE'
      )
      RETURNING id, name, address
    `;
    restaurant = created;
  }

  // 2. Parse pickup window timestamps
  const { start, end } = parsePickupTimes(input.pickupStart, input.pickupEnd);

  // 3. Insert into food_listings
  const [createdRow] = await sql`
    INSERT INTO food_listings (
      restaurant_id,
      name,
      description,
      category,
      original_price,
      discounted_price,
      quantity,
      available_quantity,
      pickup_start,
      pickup_end,
      status,
      image_url
    ) VALUES (
      ${restaurant.id},
      ${input.title.trim()},
      ${input.description?.trim() || "Fresh surplus batch prepared by our kitchen staff today."},
      ${input.category.toUpperCase()},
      ${input.originalPrice},
      ${input.discountedPrice},
      ${input.quantity},
      ${input.quantity},
      ${start.toISOString()},
      ${end.toISOString()},
      'ACTIVE',
      ${input.imageUrl || null}
    )
    RETURNING *
  `;

  return mapRowToListing({
    ...createdRow,
    restaurant_name: restaurant.name,
    restaurant_address: restaurant.address,
  });
}

export type UpdateListingInput = {
  id: string;
  title: string;
  category: "Bakery" | "Meals" | "Cafe" | "Dessert" | "Vegan";
  quantity: number;
  availableQuantity: number;
  originalPrice: number;
  discountedPrice: number;
  pickupStart: string;
  pickupEnd: string;
  description?: string;
  imageUrl?: string | null;
  status?: "ACTIVE" | "CANCELLED" | "DRAFT" | "SOLD_OUT";
};

async function verifyListingOwnership(listingId: string, managerId: string, isAdmin = false) {
  const [listing] = await sql`
    SELECT fl.*, r.name AS restaurant_name, r.address AS restaurant_address, r.manager_id
    FROM food_listings fl
    JOIN restaurants r ON fl.restaurant_id = r.id
    WHERE fl.id = ${listingId}
  `;

  if (!listing) {
    throw new Error("Food batch listing not found.");
  }

  if (!isAdmin && listing.manager_id !== managerId) {
    throw new Error("You do not have permission to manage this food batch.");
  }

  return listing;
}

/**
 * Update an existing food listing batch in PostgreSQL.
 */
export async function updateFoodListingInDb(
  input: UpdateListingInput,
  managerId: string,
  isAdmin = false
): Promise<FoodListing> {
  const currentListing = await verifyListingOwnership(input.id, managerId, isAdmin);

  const claimedUnits = Math.max(0, Number(currentListing.quantity) - Number(currentListing.available_quantity));
  if (input.quantity < claimedUnits) {
    throw new Error(`Total units cannot be less than ${claimedUnits} (units already ordered by customers).`);
  }

  if (input.availableQuantity < 0 || input.availableQuantity > input.quantity) {
    throw new Error("Available units must be between 0 and total batch units.");
  }

  const { start, end } = parsePickupTimes(input.pickupStart, input.pickupEnd);

  // Determine next status
  let nextStatus = input.status || currentListing.status;
  if (nextStatus === "ACTIVE" && input.availableQuantity === 0) {
    nextStatus = "SOLD_OUT";
  } else if (nextStatus === "SOLD_OUT" && input.availableQuantity > 0) {
    nextStatus = "ACTIVE";
  }

  const [updatedRow] = await sql`
    UPDATE food_listings
    SET name = ${input.title.trim()},
        category = ${input.category.toUpperCase()},
        original_price = ${input.originalPrice},
        discounted_price = ${input.discountedPrice},
        quantity = ${input.quantity},
        available_quantity = ${input.availableQuantity},
        pickup_start = ${start.toISOString()},
        pickup_end = ${end.toISOString()},
        description = ${input.description !== undefined ? input.description.trim() : currentListing.description},
        image_url = ${input.imageUrl !== undefined ? input.imageUrl : currentListing.image_url},
        status = ${nextStatus},
        updated_at = NOW()
    WHERE id = ${input.id}
    RETURNING *
  `;

  return mapRowToListing({
    ...updatedRow,
    restaurant_name: currentListing.restaurant_name,
    restaurant_address: currentListing.restaurant_address,
  });
}

/**
 * Deactivate or Reactivate a food listing batch.
 */
export async function toggleListingStatusInDb(
  listingId: string,
  managerId: string,
  targetStatus: "ACTIVE" | "CANCELLED",
  isAdmin = false
): Promise<FoodListing> {
  const currentListing = await verifyListingOwnership(listingId, managerId, isAdmin);

  let nextStatus: "ACTIVE" | "CANCELLED" | "SOLD_OUT" = targetStatus;
  if (targetStatus === "ACTIVE" && Number(currentListing.available_quantity) <= 0) {
    nextStatus = "SOLD_OUT";
  }

  const [updatedRow] = await sql`
    UPDATE food_listings
    SET status = ${nextStatus},
        updated_at = NOW()
    WHERE id = ${listingId}
    RETURNING *
  `;

  return mapRowToListing({
    ...updatedRow,
    restaurant_name: currentListing.restaurant_name,
    restaurant_address: currentListing.restaurant_address,
  });
}

/**
 * Safely delete a food listing if no active reservations or order dependencies exist.
 */
export async function deleteFoodListingInDb(
  listingId: string,
  managerId: string,
  isAdmin = false
): Promise<{ success: boolean; error?: string }> {
  await verifyListingOwnership(listingId, managerId, isAdmin);

  // Check 1: order dependencies
  const [orderDep] = await sql`
    SELECT COUNT(*)::int AS count
    FROM order_items
    WHERE food_listing_id = ${listingId}
  `;

  if (orderDep && orderDep.count > 0) {
    return {
      success: false,
      error: "Cannot delete this batch because it is linked to past customer orders. Please Deactivate it instead to hide it from the marketplace.",
    };
  }

  // Check 2: active inventory reservations
  const [activeRes] = await sql`
    SELECT COUNT(*)::int AS count
    FROM inventory_reservations
    WHERE food_listing_id = ${listingId}
      AND status = 'ACTIVE'
      AND expires_at > NOW()
  `;

  if (activeRes && activeRes.count > 0) {
    return {
      success: false,
      error: "Cannot delete this batch while customers have active checkout reservations in progress. Please wait for the reservation window to expire.",
    };
  }

  // Transaction: remove any un-checked-out cart items, then delete the listing
  await sql.begin(async (tx) => {
    await tx`DELETE FROM cart_items WHERE food_listing_id = ${listingId}`;
    await tx`DELETE FROM food_listings WHERE id = ${listingId}`;
  });

  return { success: true };
}
