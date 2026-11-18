import { MarketplaceView } from "@/components/marketplace-view";
import { getActiveFoodListings } from "@/lib/db/listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Surplus Food Marketplace",
  description: "Browse discounted surplus food from local bakeries, cafes, and kitchens near you.",
};

export default async function MarketplacePage() {
  const listings = await getActiveFoodListings();
  return <MarketplaceView initialListings={listings} />;
}
