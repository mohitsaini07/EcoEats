export type FoodListing = {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_address: string;
  distance_km: number;
  title: string;
  description: string;
  category: "Bakery" | "Meals" | "Cafe" | "Dessert" | "Vegan";
  quantity: number;
  available_quantity: number;
  original_price: number;
  discounted_price: number;
  pickup_start: string;
  pickup_end: string;
  status: "ACTIVE" | "SOLD_OUT" | "EXPIRED" | "DRAFT";
  image_url?: string;
  dietary_tags?: string[];
};

export type CartItem = {
  id: string;
  food_listing_id: string;
  listing: FoodListing;
  quantity: number;
};

export type ActiveCart = {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  items: CartItem[];
  total_amount: number;
};

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "PAYMENT_FAILED"
  | "EXPIRED"
  | "CANCELLED"
  | "COMPLETED";

export type OrderItem = {
  id: string;
  food_listing_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
};

export type Order = {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  restaurant_address: string;
  status: OrderStatus;
  total_amount: number;
  pickup_code: string;
  pickup_start: string;
  pickup_end: string;
  picked_up_at?: string | null;
  created_at: string;
  reservation_expires_at?: string;
  items: OrderItem[];
};

