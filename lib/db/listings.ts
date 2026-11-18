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
};

const CATEGORY_IMAGES: Record<string, string> = {
  bakery: "./images/skyler-ewing.jpg",
  meals: "./images/sonny-mauricio.jpg",
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
    image_url: getCategoryImage(cat),
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
      const [user] = await sql`SELECT name, email FROM users WHERE id = ${managerId}`;
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

    // 3. Fetch real orders for this restaurant if any exist
    const orderRows = await sql`
      SELECT 
        o.id AS order_id,
        u.name AS customer_name,
        COALESCE(o.pickup_code, 'PENDING') AS pickup_code,
        o.total_amount,
        o.status AS order_status,
        o.picked_up_at,
        o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.restaurant_id = ${restaurant.id}
        AND o.status IN ('CONFIRMED', 'COMPLETED')
      ORDER BY o.created_at DESC
    `;

    const queue: PickupQueueItem[] = orderRows.map((o) => ({
      order_id: String(o.order_id),
      customer_name: o.customer_name || "Customer",
      pickup_code: o.pickup_code || "ECO-0000",
      items_summary: `Order #${String(o.order_id).slice(-6)}`,
      total_amount: Number(o.total_amount),
      pickup_window: "Today, 8:00 PM – 9:30 PM",
      status: o.picked_up_at ? "COMPLETED" : "READY_FOR_PICKUP",
    }));

    return {
      restaurant: {
        id: String(restaurant.id),
        name: restaurant.name,
        address: restaurant.address,
      },
      listings,
      queue,
    };
  } catch (error) {
    console.error("Failed to fetch manager dashboard data:", error);
    return {
      restaurant: {
        id: "rest-001",
        name: "Test Cafe & Artisan Bakery",
        address: "124 100ft Road, Indiranagar, Bengaluru",
      },
      listings: [],
      queue: [],
    };
  }
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
      status
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
      'ACTIVE'
    )
    RETURNING *
  `;

  return mapRowToListing({
    ...createdRow,
    restaurant_name: restaurant.name,
    restaurant_address: restaurant.address,
  });
}
