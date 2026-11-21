import { MarketplaceView } from "@/components/marketplace-view";
import { getActiveFoodListings } from "@/lib/db/listings";
import { getCurrentUser } from "@/lib/auth/session";
import { getCustomerActiveCart } from "@/lib/db/cart";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Surplus Food Marketplace",
  description: "Browse discounted surplus food from local bakeries, cafes, and kitchens near you.",
};

export default async function MarketplacePage() {
  const [listings, user] = await Promise.all([
    getActiveFoodListings(),
    getCurrentUser(),
  ]);

  const initialCart = user ? await getCustomerActiveCart(user.id) : null;

  return (
    <MarketplaceView
      initialListings={listings}
      initialCart={initialCart}
    />
  );
}
