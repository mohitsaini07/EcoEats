"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  IconChefHat,
  IconPlus,
  IconCheckCircle,
  IconAlertCircle,
  IconX,
  IconPhoto,
  IconPencil,
  IconTrash,
  IconEye,
  IconEyeOff,
} from "@/components/icons";
import type { FoodListing } from "@/lib/types/marketplace";
import {
  createBatchListingAction,
  updateBatchListingAction,
  toggleBatchStatusAction,
  deleteBatchListingAction,
} from "@/app/manager/actions";
import type { PickupQueueItem } from "@/lib/db/listings";

const INITIAL_QUEUE: PickupQueueItem[] = [
  {
    order_id: "ord-882194",
    customer_name: "Aarav Sharma",
    pickup_code: "ECO-4829",
    items_summary: "Artisan Chocolate Croissant Box (Set of 3) × 2",
    total_amount: 298,
    pickup_window: "8:00 PM – 9:30 PM",
    status: "READY_FOR_PICKUP",
  },
  {
    order_id: "ord-882201",
    customer_name: "Priya Nair",
    pickup_code: "ECO-9124",
    items_summary: "Country Sourdough Loaf + Brioche Roll × 1",
    total_amount: 160,
    pickup_window: "8:00 PM – 9:30 PM",
    status: "READY_FOR_PICKUP",
  },
];

const INITIAL_MANAGER_LISTINGS: FoodListing[] = [
  {
    id: "fl-001",
    restaurant_id: "rest-001",
    restaurant_name: "Test Cafe & Artisan Bakery",
    restaurant_address: "124 100ft Road, Indiranagar, Bengaluru",
    distance_km: 0.4,
    title: "Artisan Chocolate Croissant Box (Set of 3)",
    description:
      "Flaky all-butter French croissants baked this morning, filled with Belgian dark chocolate ganache.",
    category: "Bakery",
    quantity: 10,
    available_quantity: 7,
    original_price: 380,
    discounted_price: 149,
    pickup_start: "8:00 PM",
    pickup_end: "9:30 PM",
    status: "ACTIVE",
    image_url: "./images/skyler-ewing.jpg",
    dietary_tags: ["Vegetarian", "Baked Today"],
  },
  {
    id: "fl-003",
    restaurant_id: "rest-001",
    restaurant_name: "Test Cafe & Artisan Bakery",
    restaurant_address: "124 100ft Road, Indiranagar, Bengaluru",
    distance_km: 0.4,
    title: "Cinnamon Brioche Spirals (Set of 2)",
    description:
      "Spiced cinnamon rolls with cream cheese icing drizzle, packaged fresh for evening pickup.",
    category: "Bakery",
    quantity: 8,
    available_quantity: 2,
    original_price: 260,
    discounted_price: 110,
    pickup_start: "8:00 PM",
    pickup_end: "9:30 PM",
    status: "ACTIVE",
    image_url: "./images/cinnamon-rolls.jpg",
    dietary_tags: ["Vegetarian"],
  },
];

const categories = ["Bakery", "Meals", "Cafe", "Dessert", "Vegan"] as const;

type Category = (typeof categories)[number];

interface ManagerViewProps {
  initialRestaurant?: {
    id: string;
    name: string;
    address: string;
  };
  initialListings?: FoodListing[];
  initialQueue?: PickupQueueItem[];
}

export function ManagerView({
  initialRestaurant,
  initialListings,
  initialQueue,
}: ManagerViewProps = {}) {
  const [restaurant] = useState(
    initialRestaurant || {
      id: "rest-001",
      name: "The Artisan Oven & Cafe",
      address: "Indiranagar Branch",
    }
  );
  const [listings, setListings] = useState<FoodListing[]>(
    initialListings && initialListings.length > 0 ? initialListings : INITIAL_MANAGER_LISTINGS
  );
  const [queue, setQueue] = useState<PickupQueueItem[]>(
    initialQueue && initialQueue.length > 0 ? initialQueue : INITIAL_QUEUE
  );

  const [codeInput, setCodeInput] = useState("");
  const [verifyMessage, setVerifyMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  // Global action notification
  const [actionMessage, setActionMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  // Create Listing Modal State
  const [isNewListingOpen, setIsNewListingOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [listingError, setListingError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("Bakery");
  const [newQuantity, setNewQuantity] = useState("10");
  const [newOriginalPrice, setNewOriginalPrice] = useState("350");
  const [newDiscountedPrice, setNewDiscountedPrice] = useState("140");
  const [newPickupStart, setNewPickupStart] = useState("8:00 PM");
  const [newPickupEnd, setNewPickupEnd] = useState("9:30 PM");
  const [newDescription, setNewDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Edit Listing Modal State
  const [editingListing, setEditingListing] = useState<FoodListing | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("Bakery");
  const [editQuantity, setEditQuantity] = useState("10");
  const [editAvailableQuantity, setEditAvailableQuantity] = useState("10");
  const [editOriginalPrice, setEditOriginalPrice] = useState("350");
  const [editDiscountedPrice, setEditDiscountedPrice] = useState("140");
  const [editPickupStart, setEditPickupStart] = useState("8:00 PM");
  const [editPickupEnd, setEditPickupEnd] = useState("9:30 PM");
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editRemoveImage, setEditRemoveImage] = useState(false);
  const [isEditDragging, setIsEditDragging] = useState(false);

  // Delete Listing Dialog State
  const [deletingListing, setDeletingListing] = useState<FoodListing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Deactivate/Activate Status Toggling State
  const [togglingListingId, setTogglingListingId] = useState<string | null>(null);

  // Filters
  const [queueFilter, setQueueFilter] = useState<"ALL" | "READY_FOR_PICKUP" | "COMPLETED">("ALL");
  const [batchFilter, setBatchFilter] = useState<"ALL" | "ACTIVE" | "CANCELLED" | "SOLD_OUT">("ALL");

  const pendingPickupsCount = queue.filter((item) => item.status === "READY_FOR_PICKUP").length;
  const completedPickupsCount = queue.filter((item) => item.status === "COMPLETED").length;
  const activeListingsCount = listings.filter((item) => item.status === "ACTIVE" && item.available_quantity > 0).length;
  const totalRescuedToday = 14;
  const todayRevenue = 2180;

  const visibleQueue = useMemo(
    () => queue.filter((item) => queueFilter === "ALL" || item.status === queueFilter),
    [queue, queueFilter],
  );

  const visibleBatches = useMemo(() => {
    return listings.filter((item) => {
      if (batchFilter === "ALL") return true;
      if (batchFilter === "ACTIVE") return item.status === "ACTIVE" && item.available_quantity > 0;
      if (batchFilter === "CANCELLED") return item.status === "CANCELLED" || item.status === "DRAFT";
      if (batchFilter === "SOLD_OUT") return item.status === "SOLD_OUT" || item.available_quantity === 0;
      return true;
    });
  }, [listings, batchFilter]);

  function showActionMessage(message: { text: string; success: boolean }) {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 5000);
  }

  function showVerificationMessage(message: { text: string; success: boolean }) {
    setVerifyMessage(message);
    window.setTimeout(() => setVerifyMessage(null), 5000);
  }

  function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = codeInput.trim().toUpperCase();
    if (!trimmed) return;

    const foundItem = queue.find(
      (item) => item.pickup_code.toUpperCase() === trimmed && item.status === "READY_FOR_PICKUP",
    );

    if (!foundItem) {
      showVerificationMessage({
        text: `No pending pickup was found for “${trimmed}”. Check the code and try again.`,
        success: false,
      });
      return;
    }

    setQueue((previous) =>
      previous.map((item) =>
        item.order_id === foundItem.order_id ? { ...item, status: "COMPLETED" } : item,
      ),
    );
    setCodeInput("");
    showVerificationMessage({
      text: `Pickup verified for ${foundItem.customer_name}. The order is marked as handed over.`,
      success: true,
    });
  }

  function handleCompletePickup(orderId: string) {
    const selected = queue.find((item) => item.order_id === orderId);
    if (!selected || selected.status !== "READY_FOR_PICKUP") return;

    setQueue((previous) =>
      previous.map((item) =>
        item.order_id === orderId ? { ...item, status: "COMPLETED" } : item,
      ),
    );
  }

  // --- Image Handlers ---
  function handleImageSelect(file: File | null) {
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setListingError("Please select a valid image file (PNG, JPG, WebP, or GIF).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setListingError("Image file size must be less than 10MB.");
      return;
    }
    setListingError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleEditImageSelect(file: File | null) {
    if (!file) {
      setEditImageFile(null);
      setEditImagePreview(null);
      setEditRemoveImage(true);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setEditError("Please select a valid image file (PNG, JPG, WebP, or GIF).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setEditError("Image file size must be less than 10MB.");
      return;
    }
    setEditError(null);
    setEditImageFile(file);
    setEditRemoveImage(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // --- Create Listing ---
  function resetListingForm() {
    setNewTitle("");
    setNewCategory("Bakery");
    setNewQuantity("10");
    setNewOriginalPrice("350");
    setNewDiscountedPrice("140");
    setNewPickupStart("8:00 PM");
    setNewPickupEnd("9:30 PM");
    setNewDescription("");
    setImageFile(null);
    setImagePreview(null);
    setIsDragging(false);
    setListingError(null);
  }

  async function handleCreateListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setListingError(null);

    const quantity = Number(newQuantity);
    const originalPrice = Number(newOriginalPrice);
    const discountedPrice = Number(newDiscountedPrice);

    if (!newTitle.trim()) {
      setListingError("Add a name for this surplus batch.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setListingError("Quantity must be a whole number greater than zero.");
      return;
    }
    if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
      setListingError("Enter a valid original price.");
      return;
    }
    if (!Number.isFinite(discountedPrice) || discountedPrice <= 0 || discountedPrice > originalPrice) {
      setListingError("Surplus price must be positive and no higher than the original price.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", newTitle.trim());
      formData.append("category", newCategory);
      formData.append("quantity", String(quantity));
      formData.append("originalPrice", String(originalPrice));
      formData.append("discountedPrice", String(discountedPrice));
      formData.append("pickupStart", newPickupStart.trim());
      formData.append("pickupEnd", newPickupEnd.trim());
      formData.append("description", newDescription.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await createBatchListingAction(formData);

      if (!res.success) {
        setListingError(res.error);
        setIsSaving(false);
        return;
      }

      setListings((previous) => [res.data, ...previous]);
      setIsNewListingOpen(false);
      resetListingForm();
      showActionMessage({
        text: `“${res.data.title}” published successfully to the marketplace.`,
        success: true,
      });
    } catch (err) {
      setListingError(err instanceof Error ? err.message : "Failed to publish surplus batch.");
    } finally {
      setIsSaving(false);
    }
  }

  // --- Edit Listing ---
  function handleOpenEdit(listing: FoodListing) {
    setEditingListing(listing);
    setEditTitle(listing.title);
    setEditCategory(listing.category as Category);
    setEditQuantity(String(listing.quantity));
    setEditAvailableQuantity(String(listing.available_quantity));
    setEditOriginalPrice(String(listing.original_price));
    setEditDiscountedPrice(String(listing.discounted_price));
    setEditPickupStart(listing.pickup_start || "8:00 PM");
    setEditPickupEnd(listing.pickup_end || "9:30 PM");
    setEditDescription(listing.description || "");
    setEditImageFile(null);
    setEditImagePreview(listing.image_url || null);
    setEditRemoveImage(false);
    setEditError(null);
  }

  async function handleUpdateListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingListing) return;
    setEditError(null);

    const quantity = Number(editQuantity);
    const availableQuantity = Number(editAvailableQuantity);
    const originalPrice = Number(editOriginalPrice);
    const discountedPrice = Number(editDiscountedPrice);

    if (!editTitle.trim()) {
      setEditError("Add a name for this surplus batch.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setEditError("Total units must be a whole number greater than zero.");
      return;
    }
    if (!Number.isInteger(availableQuantity) || availableQuantity < 0) {
      setEditError("Available units cannot be negative.");
      return;
    }
    if (availableQuantity > quantity) {
      setEditError("Available units cannot exceed total batch units.");
      return;
    }

    const alreadyClaimed = Math.max(0, editingListing.quantity - editingListing.available_quantity);
    if (quantity < alreadyClaimed) {
      setEditError(`Total units cannot be less than ${alreadyClaimed} (units already ordered by customers).`);
      return;
    }

    if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
      setEditError("Enter a valid original price.");
      return;
    }
    if (!Number.isFinite(discountedPrice) || discountedPrice <= 0 || discountedPrice > originalPrice) {
      setEditError("Surplus price must be positive and no higher than the original price.");
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("id", editingListing.id);
      formData.append("title", editTitle.trim());
      formData.append("category", editCategory);
      formData.append("quantity", String(quantity));
      formData.append("availableQuantity", String(availableQuantity));
      formData.append("originalPrice", String(originalPrice));
      formData.append("discountedPrice", String(discountedPrice));
      formData.append("pickupStart", editPickupStart.trim());
      formData.append("pickupEnd", editPickupEnd.trim());
      formData.append("description", editDescription.trim());

      if (editImageFile) {
        formData.append("image", editImageFile);
      } else if (editRemoveImage) {
        formData.append("imageUrl", "");
      } else if (editingListing.image_url) {
        formData.append("imageUrl", editingListing.image_url);
      }

      const res = await updateBatchListingAction(formData);

      if (!res.success) {
        setEditError(res.error);
        setIsUpdating(false);
        return;
      }

      setListings((previous) =>
        previous.map((item) => (item.id === res.data.id ? res.data : item))
      );
      setEditingListing(null);
      showActionMessage({
        text: `“${res.data.title}” updated successfully.`,
        success: true,
      });
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update batch.");
    } finally {
      setIsUpdating(false);
    }
  }

  // --- Deactivate / Activate Batch ---
  async function handleToggleStatus(listing: FoodListing) {
    const targetStatus = listing.status === "ACTIVE" ? "CANCELLED" : "ACTIVE";
    setTogglingListingId(listing.id);

    try {
      const res = await toggleBatchStatusAction(listing.id, targetStatus);
      if (!res.success) {
        showActionMessage({
          text: res.error,
          success: false,
        });
        return;
      }

      setListings((previous) =>
        previous.map((item) => (item.id === res.data.id ? res.data : item))
      );

      const statusDesc =
        targetStatus === "ACTIVE"
          ? "activated and visible in the marketplace"
          : "deactivated and hidden from customers";

      showActionMessage({
        text: `“${res.data.title}” is now ${statusDesc}.`,
        success: true,
      });
    } catch (err) {
      showActionMessage({
        text: err instanceof Error ? err.message : "Failed to update batch status.",
        success: false,
      });
    } finally {
      setTogglingListingId(null);
    }
  }

  // --- Delete Batch ---
  function handleOpenDelete(listing: FoodListing) {
    setDeletingListing(listing);
    setDeleteError(null);
  }

  async function handleConfirmDelete() {
    if (!deletingListing) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteBatchListingAction(deletingListing.id);
      if (!res.success) {
        setDeleteError(res.error);
        setIsDeleting(false);
        return;
      }

      const deletedTitle = deletingListing.title;
      setListings((previous) => previous.filter((item) => item.id !== deletingListing.id));
      setDeletingListing(null);
      showActionMessage({
        text: `“${deletedTitle}” was permanently deleted.`,
        success: true,
      });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete batch.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FBFAF4] px-4 py-7 text-[#1B2B21] sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* Global Toast Notification */}
        {actionMessage && (
          <div
            role="status"
            className={`fixed bottom-6 right-6 z-50 flex max-w-md items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all animate-in fade-in slide-in-from-bottom-3 ${
              actionMessage.success
                ? "border-[#BEE0C5] bg-[#EBF7EE] text-[#226338]"
                : "border-[#F4C5BD] bg-[#FFF2EF] text-[#A63725]"
            }`}
          >
            {actionMessage.success ? (
              <IconCheckCircle size={18} className="shrink-0 text-[#2D7343]" />
            ) : (
              <IconAlertCircle size={18} className="shrink-0 text-[#B83E2C]" />
            )}
            <span className="flex-1">{actionMessage.text}</span>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="grid size-6 place-items-center rounded-full hover:bg-black/5"
            >
              <IconX size={14} />
            </button>
          </div>
        )}

        {/* Page heading */}
        <header className="flex flex-col gap-5 border-b border-[#E6E8DF] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D8E8D9] bg-[#EDF5EC] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#285D3B]">
                <IconChefHat size={14} /> {restaurant.name}
              </span>
              <span className="text-xs font-medium text-[#788279]">{restaurant.address}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#568064]">Kitchen operations</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] text-[#193B28] sm:text-4xl">
              Inventory & pickups<span className="text-[#D99A3D]">.</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6B756D]">
              Keep surplus batches moving, adjust pricing & quantities, and make customer pickup effortless.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsNewListingOpen(true)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1D4A30] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(29,74,48,0.16)] transition hover:-translate-y-0.5 hover:bg-[#173C27] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1D4A30]/20"
          >
            <IconPlus size={17} /> Create surplus batch
          </button>
        </header>

        {/* Operational metrics */}
        <section aria-label="Today's performance" className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Pending pickups" value={String(pendingPickupsCount)} detail="Ready for collection" tone="amber" marker="01" />
          <MetricCard label="Active batches" value={String(activeListingsCount)} detail={`${listings.length} total listings`} tone="green" marker="02" />
          <MetricCard label="Units rescued today" value={String(totalRescuedToday)} detail="Food kept in circulation" tone="green" marker="03" />
          <MetricCard label="Today's revenue" value={`₹${todayRevenue.toLocaleString("en-IN")}`} detail="From surplus orders" tone="cream" marker="04" />
        </section>

        {/* Pickup verification panel */}
        <section className="mt-6 overflow-hidden rounded-[28px] border border-[#D6E5D7] bg-[#EAF3E9] shadow-[0_12px_35px_rgba(34,75,47,0.06)]">
          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#39704A]">
                <span className="size-1.5 rounded-full bg-[#3D9558]" /> Counter desk
              </div>
              <h2 className="mt-3 text-xl font-black tracking-tight text-[#193B28] sm:text-2xl">Verify a customer pickup</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-[#607365]">
                Ask the customer for the code in their order confirmation, verify it, then hand over the packed order.
              </p>
            </div>
            <form onSubmit={handleVerifyCode} className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <label htmlFor="pickup-code" className="sr-only">Pickup code</label>
              <input
                id="pickup-code"
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                placeholder="ECO-4829"
                value={codeInput}
                onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                className="min-h-12 w-full rounded-2xl border border-[#CADCCB] bg-white px-4 font-mono text-sm font-bold tracking-[0.12em] text-[#193B28] outline-none placeholder:font-medium placeholder:tracking-wider placeholder:text-[#A0AAA1] focus:border-[#2F7446] focus:ring-4 focus:ring-[#2F7446]/10 sm:w-44"
              />
              <button
                type="submit"
                disabled={!codeInput.trim()}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#1D4A30] px-5 text-sm font-bold text-white transition hover:bg-[#173C27] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <IconCheckCircle size={16} /> Verify code
              </button>
            </form>
          </div>
          {verifyMessage && (
            <div
              role="status"
              className={`mx-5 mb-5 flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-medium sm:mx-7 sm:mb-7 ${
                verifyMessage.success
                  ? "border-[#C9E2CE] bg-white text-[#28633B]"
                  : "border-[#F0D1C8] bg-[#FFF3EF] text-[#A34332]"
              }`}
            >
              {verifyMessage.success ? <IconCheckCircle size={17} /> : <IconAlertCircle size={17} />}
              <span>{verifyMessage.text}</span>
            </div>
          )}
        </section>

        {/* Work areas */}
        <div className="mt-7 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          {/* Pickup queue */}
          <section id="pickups" className="rounded-[28px] border border-[#E6E8DF] bg-white p-5 shadow-[0_8px_28px_rgba(34,49,37,0.035)] sm:p-6">
            <div className="flex flex-col gap-3 border-b border-[#EEF0E9] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6B8B72]">Collection desk</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-[#193B28]">Today&apos;s pickup queue</h2>
                <p className="mt-1 text-xs text-[#788279]">Orders waiting to be collected or already handed over.</p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-[#F2F5EE] px-3 py-1.5 text-xs font-bold text-[#526B56]">
                {queue.length} orders · {pendingPickupsCount} pending
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter pickup orders">
              {([
                ["ALL", "All orders"],
                ["READY_FOR_PICKUP", "Awaiting pickup"],
                ["COMPLETED", "Handed over"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setQueueFilter(value)}
                  aria-pressed={queueFilter === value}
                  className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                    queueFilter === value
                      ? "bg-[#1D4A30] text-white shadow-sm"
                      : "border border-[#E5E9E1] bg-white text-[#667268] hover:border-[#BDD2BF] hover:text-[#285D3B]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {visibleQueue.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#DDE5DA] bg-[#FBFCF8] px-5 py-10 text-center">
                  <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#EEF5EC] text-[#4A8056]">✓</div>
                  <p className="mt-3 text-sm font-bold text-[#2B4933]">No orders in this view</p>
                  <p className="mt-1 text-xs text-[#859087]">Try another filter or check back when a customer places an order.</p>
                </div>
              ) : (
                visibleQueue.map((item) => (
                  <article
                    key={item.order_id}
                    className={`rounded-2xl border p-4 transition ${
                      item.status === "COMPLETED"
                        ? "border-[#E8ECE5] bg-[#F8FAF6]"
                        : "border-[#DCE8DC] bg-white hover:border-[#BBD3BE] hover:shadow-[0_8px_24px_rgba(34,75,47,0.06)]"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-[#EDF5EC] px-2.5 py-1 font-mono text-xs font-extrabold tracking-wider text-[#285D3B]">{item.pickup_code}</span>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${item.status === "COMPLETED" ? "bg-[#EEF0EC] text-[#69756A]" : "bg-[#FFF3D9] text-[#93651E]"}`}>
                            {item.status === "COMPLETED" ? "Handed over" : "Awaiting pickup"}
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-extrabold text-[#263A2B]">{item.customer_name}</h3>
                        <p className="mt-1 text-xs leading-5 text-[#727D73]">{item.items_summary}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#7D887E]">
                          <span>{item.pickup_window}</span>
                          <span className="font-bold text-[#344C38]">₹{item.total_amount.toLocaleString("en-IN")} paid</span>
                        </div>
                      </div>
                      {item.status === "READY_FOR_PICKUP" ? (
                        <button
                          type="button"
                          onClick={() => handleCompletePickup(item.order_id)}
                          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[#C9DCCB] bg-[#F0F6EF] px-4 text-xs font-extrabold text-[#2C6840] transition hover:bg-[#E5F0E4]"
                        >
                          Mark handed over
                        </button>
                      ) : (
                        <span className="inline-flex min-h-9 shrink-0 items-center gap-1.5 text-xs font-bold text-[#6E846F]">
                          <IconCheckCircle size={15} /> Completed
                        </span>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
            {completedPickupsCount > 0 && (
              <p className="mt-4 text-[11px] text-[#879087]">{completedPickupsCount} pickup{completedPickupsCount === 1 ? "" : "s"} completed today.</p>
            )}
          </section>

          {/* Surplus Batches & Inventory Manager */}
          <section id="listings" className="rounded-[28px] border border-[#E6E8DF] bg-white p-5 shadow-[0_8px_28px_rgba(34,49,37,0.035)] sm:p-6">
            <div className="flex items-end justify-between gap-3 border-b border-[#EEF0E9] pb-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6B8B72]">Surplus inventory</p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-[#193B28]">Your active batches</h2>
                <p className="mt-1 text-xs text-[#788279]">Edit details, available quantities, or deactivate items.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewListingOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#EAF3E9] px-3.5 py-2 text-xs font-extrabold text-[#2D6A40] transition hover:bg-[#DDECDD]"
              >
                <IconPlus size={14} /> New batch
              </button>
            </div>

            {/* Filter Tabs for Batches */}
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter surplus batches">
              {([
                ["ALL", `All (${listings.length})`],
                ["ACTIVE", `Active (${listings.filter((l) => l.status === "ACTIVE" && l.available_quantity > 0).length})`],
                ["CANCELLED", `Deactivated (${listings.filter((l) => l.status === "CANCELLED" || l.status === "DRAFT").length})`],
                ["SOLD_OUT", `Sold out (${listings.filter((l) => l.status === "SOLD_OUT" || l.available_quantity === 0).length})`],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setBatchFilter(value)}
                  aria-pressed={batchFilter === value}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    batchFilter === value
                      ? "bg-[#1D4A30] text-white shadow-sm"
                      : "border border-[#E5E9E1] bg-white text-[#667268] hover:border-[#BDD2BF] hover:text-[#285D3B]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {visibleBatches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#DDE5DA] bg-[#FBFCF8] px-5 py-10 text-center">
                  <p className="text-sm font-bold text-[#2B4933]">No batches in this view</p>
                  <p className="mt-1 text-xs text-[#859087]">
                    {batchFilter === "ALL"
                      ? "Create your first surplus listing to make it available to customers."
                      : "Try switching filters to view your other batches."}
                  </p>
                </div>
              ) : (
                visibleBatches.map((listing) => {
                  const soldUnits = Math.max(0, listing.quantity - listing.available_quantity);
                  const soldPercent = listing.quantity > 0 ? Math.min(100, (soldUnits / listing.quantity) * 100) : 0;
                  const discount = listing.original_price > 0
                    ? Math.round((1 - listing.discounted_price / listing.original_price) * 100)
                    : 0;

                  const isInactive = listing.status === "CANCELLED" || listing.status === "DRAFT";
                  const isSoldOut = listing.status === "SOLD_OUT" || listing.available_quantity === 0;

                  return (
                    <article
                      key={listing.id}
                      className={`rounded-2xl border p-4 transition ${
                        isInactive
                          ? "border-[#E5E7E2] bg-[#FAFBF9] opacity-80"
                          : "border-[#E7EBE4] bg-[#FCFDF9] hover:border-[#CCD8CE] hover:shadow-[0_4px_16px_rgba(25,50,30,0.04)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          {listing.image_url ? (
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-[#E5E9E1] bg-[#F0F3EC]">
                              <img
                                src={listing.image_url}
                                alt={listing.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="grid size-14 shrink-0 place-items-center rounded-xl border border-[#E5E9E1] bg-[#F2F6F0] text-[#4F7353]">
                              <IconPhoto size={20} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex rounded-full bg-[#EEF4EA] px-2.5 py-0.5 text-[10px] font-bold text-[#5E765D]">
                                {listing.category}
                              </span>
                              {isInactive && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-[#DCE0D9] bg-[#F0F2ED] px-2 py-0.5 text-[10px] font-extrabold text-[#6E7970]">
                                  <IconEyeOff size={11} /> Hidden
                                </span>
                              )}
                            </div>
                            <h3 className="mt-1.5 text-sm font-extrabold leading-5 text-[#263A2B]">{listing.title}</h3>
                            <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#7B857B]">{listing.description}</p>
                          </div>
                        </div>

                        {/* Inventory status pill */}
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                            isInactive
                              ? "bg-[#ECEEEA] text-[#636E65]"
                              : isSoldOut
                              ? "bg-[#FFF1DC] text-[#9A6721]"
                              : listing.available_quantity <= 2
                              ? "bg-[#FFF6E6] text-[#9A6721] border border-[#F6E1C4]"
                              : "bg-[#E9F4E9] text-[#347047] border border-[#CCE2CD]"
                          }`}
                        >
                          {isInactive
                            ? "Deactivated"
                            : isSoldOut
                            ? "Sold out"
                            : `${listing.available_quantity} left of ${listing.quantity}`}
                        </span>
                      </div>

                      {/* Claim progress */}
                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-[#7B867B]">
                          <span>{soldUnits} of {listing.quantity} units claimed</span>
                          <span>{Math.round(soldPercent)}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#E9EDE6]">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isInactive ? "bg-[#9CA79E]" : "bg-[#4D8A59]"
                            }`}
                            style={{ width: `${soldPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Prices and Action Toolbar */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#EDF0E9] pt-3">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black tabular-nums text-[#1D4A30]">₹{listing.discounted_price}</span>
                            <span className="text-xs text-[#9AA39A] line-through">₹{listing.original_price}</span>
                            {discount > 0 && <span className="rounded-full bg-[#F9EEDC] px-2 py-0.5 text-[9px] font-extrabold text-[#946B2D]">{discount}% off</span>}
                          </div>
                          <p className="mt-1 text-[10px] text-[#879087]">Pickup {listing.pickup_start} – {listing.pickup_end}</p>
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex items-center gap-1.5">
                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(listing)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE4D9] bg-white px-3 py-1.5 text-xs font-bold text-[#2A4833] transition hover:bg-[#F2F6F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A40]"
                            title="Edit batch details & available inventory"
                          >
                            <IconPencil size={13} />
                            <span>Edit</span>
                          </button>

                          {/* Deactivate / Activate button */}
                          {listing.status === "ACTIVE" ? (
                            <button
                              type="button"
                              disabled={togglingListingId === listing.id}
                              onClick={() => handleToggleStatus(listing)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E2E6DE] bg-white px-3 py-1.5 text-xs font-bold text-[#6D776F] transition hover:bg-[#F4F6F2] hover:text-[#233528] disabled:opacity-50"
                              title="Hide from customer marketplace"
                            >
                              <IconEyeOff size={13} />
                              <span>{togglingListingId === listing.id ? "Hiding..." : "Deactivate"}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={togglingListingId === listing.id}
                              onClick={() => handleToggleStatus(listing)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#CDE3CF] bg-[#EDF6EE] px-3 py-1.5 text-xs font-bold text-[#27683F] transition hover:bg-[#DFEFDF] disabled:opacity-50"
                              title="Show in customer marketplace"
                            >
                              <IconEye size={13} />
                              <span>{togglingListingId === listing.id ? "Activating..." : "Activate"}</span>
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(listing)}
                            className="inline-flex size-8 items-center justify-center rounded-xl border border-[#F3DCD6] bg-white text-[#B34336] transition hover:bg-[#FDF2F0] hover:text-[#942C20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B34336]"
                            title="Delete batch"
                            aria-label={`Delete ${listing.title}`}
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {/* --- Create Listing Modal --- */}
      {isNewListingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102719]/55 p-3 backdrop-blur-sm sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsNewListingOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-listing-title"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-[#E3E9DE] bg-[#FBFAF4] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.25)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E6EAE1] pb-5">
              <div>
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#E8F1E6] text-[#2D6A40]"><IconChefHat size={19} /></span>
                <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6B8B72]">New surplus listing</p>
                <h2 id="new-listing-title" className="mt-1 text-xl font-black tracking-tight text-[#193B28]">Create a batch</h2>
                <p className="mt-1 text-xs leading-5 text-[#788279]">Share the details customers need to discover and pick up this food.</p>
              </div>
              <button
                type="button"
                onClick={() => { setIsNewListingOpen(false); setListingError(null); }}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-[#E3E8DF] bg-white text-[#69766B] transition hover:bg-[#F0F3EC] hover:text-[#233C2A]"
                aria-label="Close create listing dialog"
              >
                <IconX size={17} />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="mt-5 space-y-4">
              <div>
                <label htmlFor="listing-title" className="mb-1.5 block text-xs font-bold text-[#405746]">Food item title <span className="text-[#B76E42]">*</span></label>
                <input id="listing-title" type="text" required maxLength={150} placeholder="e.g. Sourdough loaf and baguette pack" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none transition placeholder:text-[#A3ACA3] focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="listing-category" className="mb-1.5 block text-xs font-bold text-[#405746]">Category</label>
                  <select id="listing-category" value={newCategory} onChange={(event) => setNewCategory(event.target.value as Category)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10">
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="listing-quantity" className="mb-1.5 block text-xs font-bold text-[#405746]">Available units</label>
                  <input id="listing-quantity" type="number" min="1" step="1" required value={newQuantity} onChange={(event) => setNewQuantity(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm tabular-nums text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="listing-original-price" className="mb-1.5 block text-xs font-bold text-[#405746]">Original price (₹)</label>
                  <input id="listing-original-price" type="number" min="0.01" step="0.01" required value={newOriginalPrice} onChange={(event) => setNewOriginalPrice(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm tabular-nums text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                </div>
                <div>
                  <label htmlFor="listing-discounted-price" className="mb-1.5 block text-xs font-bold text-[#405746]">Surplus price (₹)</label>
                  <input id="listing-discounted-price" type="number" min="0.01" step="0.01" required value={newDiscountedPrice} onChange={(event) => setNewDiscountedPrice(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm tabular-nums text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5EBDD] bg-white/70 p-4">
                <p className="mb-3 text-xs font-extrabold text-[#405746]">Customer pickup window</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pickup-start" className="mb-1.5 block text-[11px] font-semibold text-[#748075]">Starts at</label>
                    <input id="pickup-start" type="text" required placeholder="8:00 PM" value={newPickupStart} onChange={(event) => setNewPickupStart(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                  </div>
                  <div>
                    <label htmlFor="pickup-end" className="mb-1.5 block text-[11px] font-semibold text-[#748075]">Ends at</label>
                    <input id="pickup-end" type="text" required placeholder="9:30 PM" value={newPickupEnd} onChange={(event) => setNewPickupEnd(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                  </div>
                </div>
              </div>

              {/* Batch Photo Upload */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#405746]">
                  Batch photo <span className="font-medium text-[#8A958A]">(optional)</span>
                </label>
                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-2xl border border-[#D5E1D4] bg-[#F4F8F3] p-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm sm:size-20">
                        <img
                          src={imagePreview}
                          alt="Batch preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold text-[#263A2B]">
                          {imageFile?.name || "Uploaded photo"}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-[#738274]">
                          {imageFile
                            ? `${(imageFile.size / 1024).toFixed(0)} KB · Ready to publish`
                            : "Selected image"}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#B34032] hover:underline"
                        >
                          <IconX size={12} /> Remove photo
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleImageSelect(file);
                    }}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                      isDragging
                        ? "border-[#2D6A40] bg-[#EDF6EE]"
                        : "border-[#D8E1D5] bg-[#FBFCF9] hover:border-[#ADC7B0] hover:bg-[#F5F9F4]"
                    }`}
                  >
                    <input
                      id="listing-image"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file);
                      }}
                      className="absolute inset-0 z-10 cursor-pointer opacity-0"
                      aria-label="Upload batch photo"
                    />
                    <div className="grid size-11 place-items-center rounded-2xl bg-[#EAF3E8] text-[#2D6A40] shadow-sm">
                      <IconPhoto size={22} />
                    </div>
                    <p className="mt-2.5 text-xs font-extrabold text-[#273B2C]">
                      Click to upload a food photo{" "}
                      <span className="font-normal text-[#6C7B6E]">or drag & drop</span>
                    </p>
                    <p className="mt-1 text-[11px] text-[#869287]">
                      PNG, JPG, WebP up to 10MB (Category fallback used if empty)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="listing-description" className="mb-1.5 block text-xs font-bold text-[#405746]">Description <span className="font-medium text-[#8A958A]">(optional)</span></label>
                <textarea id="listing-description" rows={3} maxLength={500} placeholder="Describe the batch, freshness, ingredients or allergens..." value={newDescription} onChange={(event) => setNewDescription(event.target.value)} className="w-full resize-y rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none placeholder:text-[#A3ACA3] focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
              </div>

              {listingError && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-[#F0D1C8] bg-[#FFF3EF] px-3.5 py-3 text-xs font-medium text-[#A34332]">
                  <IconAlertCircle size={16} className="shrink-0" /> {listingError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-[#E6EAE1] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setIsNewListingOpen(false);
                    setListingError(null);
                  }}
                  className="min-h-11 rounded-full border border-[#D8E1D6] bg-white px-5 text-sm font-bold text-[#5C6B5E] transition hover:bg-[#F4F6F0] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#1D4A30] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(29,74,48,0.16)] transition hover:bg-[#173C27] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <IconPlus size={16} /> {isSaving ? "Publishing batch..." : "Publish batch"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* --- Edit Listing Modal --- */}
      {editingListing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102719]/55 p-3 backdrop-blur-sm sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditingListing(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-listing-title"
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-[#E3E9DE] bg-[#FBFAF4] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.25)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E6EAE1] pb-5">
              <div>
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#E8F1E6] text-[#2D6A40]">
                  <IconPencil size={18} />
                </span>
                <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6B8B72]">Modify surplus batch</p>
                <h2 id="edit-listing-title" className="mt-1 text-xl font-black tracking-tight text-[#193B28]">Edit batch details</h2>
                <p className="mt-1 text-xs leading-5 text-[#788279]">
                  Update batch inventory, pricing, customer pickup window, or photos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setEditingListing(null); setEditError(null); }}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-[#E3E8DF] bg-white text-[#69766B] transition hover:bg-[#F0F3EC] hover:text-[#233C2A]"
                aria-label="Close edit listing dialog"
              >
                <IconX size={17} />
              </button>
            </div>

            <form onSubmit={handleUpdateListing} className="mt-5 space-y-4">
              <div>
                <label htmlFor="edit-title" className="mb-1.5 block text-xs font-bold text-[#405746]">Food item title <span className="text-[#B76E42]">*</span></label>
                <input id="edit-title" type="text" required maxLength={150} value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none transition placeholder:text-[#A3ACA3] focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="edit-category" className="mb-1.5 block text-xs font-bold text-[#405746]">Category</label>
                  <select id="edit-category" value={editCategory} onChange={(event) => setEditCategory(event.target.value as Category)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10">
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-quantity" className="mb-1.5 block text-xs font-bold text-[#405746]">Total units</label>
                  <input id="edit-quantity" type="number" min="1" step="1" required value={editQuantity} onChange={(event) => setEditQuantity(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm tabular-nums text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                </div>
                <div>
                  <label htmlFor="edit-available-quantity" className="mb-1.5 block text-xs font-bold text-[#405746]">Available units</label>
                  <input id="edit-available-quantity" type="number" min="0" step="1" required value={editAvailableQuantity} onChange={(event) => setEditAvailableQuantity(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm tabular-nums text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                </div>
              </div>

              {/* Already ordered units helper */}
              {editingListing && editingListing.quantity - editingListing.available_quantity > 0 && (
                <p className="text-[11px] font-semibold text-[#667E6B] bg-[#EDF5EC] p-2.5 rounded-xl border border-[#D8E8D9]">
                  ℹ️ {editingListing.quantity - editingListing.available_quantity} unit(s) have already been claimed or reserved from this batch.
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="edit-original-price" className="mb-1.5 block text-xs font-bold text-[#405746]">Original price (₹)</label>
                  <input id="edit-original-price" type="number" min="0.01" step="0.01" required value={editOriginalPrice} onChange={(event) => setEditOriginalPrice(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm tabular-nums text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                </div>
                <div>
                  <label htmlFor="edit-discounted-price" className="mb-1.5 block text-xs font-bold text-[#405746]">Surplus price (₹)</label>
                  <input id="edit-discounted-price" type="number" min="0.01" step="0.01" required value={editDiscountedPrice} onChange={(event) => setNewDiscountedPrice(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm tabular-nums text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5EBDD] bg-white/70 p-4">
                <p className="mb-3 text-xs font-extrabold text-[#405746]">Customer pickup window</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="edit-pickup-start" className="mb-1.5 block text-[11px] font-semibold text-[#748075]">Starts at</label>
                    <input id="edit-pickup-start" type="text" required placeholder="8:00 PM" value={editPickupStart} onChange={(event) => setEditPickupStart(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                  </div>
                  <div>
                    <label htmlFor="edit-pickup-end" className="mb-1.5 block text-[11px] font-semibold text-[#748075]">Ends at</label>
                    <input id="edit-pickup-end" type="text" required placeholder="9:30 PM" value={editPickupEnd} onChange={(event) => setEditPickupEnd(event.target.value)} className="w-full rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
                  </div>
                </div>
              </div>

              {/* Edit Batch Photo */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#405746]">
                  Batch photo <span className="font-medium text-[#8A958A]">(optional)</span>
                </label>
                {editImagePreview && !editRemoveImage ? (
                  <div className="relative overflow-hidden rounded-2xl border border-[#D5E1D4] bg-[#F4F8F3] p-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm sm:size-20">
                        <img
                          src={editImagePreview}
                          alt="Batch preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-extrabold text-[#263A2B]">
                          {editImageFile?.name || "Current batch photo"}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium text-[#738274]">
                          {editImageFile
                            ? `${(editImageFile.size / 1024).toFixed(0)} KB · New photo uploaded`
                            : "Active marketplace image"}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <label
                            htmlFor="edit-image-replace"
                            className="cursor-pointer text-[11px] font-bold text-[#2D6A40] hover:underline"
                          >
                            Replace photo
                            <input
                              id="edit-image-replace"
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleEditImageSelect(file);
                              }}
                              className="sr-only"
                            />
                          </label>
                          <span className="text-[#C4C9C2]">·</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditImageFile(null);
                              setEditImagePreview(null);
                              setEditRemoveImage(true);
                            }}
                            className="text-[11px] font-bold text-[#B34032] hover:underline"
                          >
                            Remove photo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsEditDragging(true);
                    }}
                    onDragLeave={() => setIsEditDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsEditDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleEditImageSelect(file);
                    }}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                      isEditDragging
                        ? "border-[#2D6A40] bg-[#EDF6EE]"
                        : "border-[#D8E1D5] bg-[#FBFCF9] hover:border-[#ADC7B0] hover:bg-[#F5F9F4]"
                    }`}
                  >
                    <input
                      id="edit-image-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleEditImageSelect(file);
                      }}
                      className="absolute inset-0 z-10 cursor-pointer opacity-0"
                      aria-label="Upload replacement batch photo"
                    />
                    <div className="grid size-11 place-items-center rounded-2xl bg-[#EAF3E8] text-[#2D6A40] shadow-sm">
                      <IconPhoto size={22} />
                    </div>
                    <p className="mt-2.5 text-xs font-extrabold text-[#273B2C]">
                      Click to upload a new food photo{" "}
                      <span className="font-normal text-[#6C7B6E]">or drag & drop</span>
                    </p>
                    <p className="mt-1 text-[11px] text-[#869287]">
                      PNG, JPG, WebP up to 10MB
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="edit-description" className="mb-1.5 block text-xs font-bold text-[#405746]">Description <span className="font-medium text-[#8A958A]">(optional)</span></label>
                <textarea id="edit-description" rows={3} maxLength={500} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} className="w-full resize-y rounded-xl border border-[#DDE5D9] bg-white px-3.5 py-3 text-sm text-[#263A2B] outline-none placeholder:text-[#A3ACA3] focus:border-[#54835B] focus:ring-4 focus:ring-[#54835B]/10" />
              </div>

              {editError && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-[#F0D1C8] bg-[#FFF3EF] px-3.5 py-3 text-xs font-medium text-[#A34332]">
                  <IconAlertCircle size={16} className="shrink-0" /> {editError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-[#E6EAE1] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => {
                    setEditingListing(null);
                    setEditError(null);
                  }}
                  className="min-h-11 rounded-full border border-[#D8E1D6] bg-white px-5 text-sm font-bold text-[#5C6B5E] transition hover:bg-[#F4F6F0] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#1D4A30] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(29,74,48,0.16)] transition hover:bg-[#173C27] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <IconCheckCircle size={16} /> {isUpdating ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* --- Delete Confirmation Dialog --- */}
      {deletingListing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102719]/55 p-3 backdrop-blur-sm sm:p-5"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isDeleting) setDeletingListing(null);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            className="w-full max-w-md rounded-[28px] border border-[#E8D0C9] bg-[#FBFAF7] p-5 shadow-[0_24px_70px_rgba(30,15,10,0.2)] sm:p-6"
          >
            <div className="flex items-start gap-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#FDEAE6] text-[#B83E2C]">
                <IconTrash size={20} />
              </span>
              <div>
                <h2 id="delete-dialog-title" className="text-base font-extrabold text-[#29382B]">
                  Delete surplus batch?
                </h2>
                <p id="delete-dialog-description" className="mt-1 text-xs leading-5 text-[#6D776E]">
                  Are you sure you want to delete <strong className="text-[#233527]">“{deletingListing.title}”</strong>?
                  This action removes this batch permanently.
                </p>
                <p className="mt-2 text-[11px] text-[#869287] bg-[#F1F3EE] p-2.5 rounded-xl border border-[#E2E6DF]">
                  🛡️ <strong>Integrity check:</strong> If any customer has previously ordered this batch, deletion will be safely blocked to preserve historical orders. You can deactivate it instead.
                </p>
              </div>
            </div>

            {deleteError && (
              <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-[#F0D1C8] bg-[#FFF3EF] px-3.5 py-3 text-xs font-medium text-[#A34332]">
                <IconAlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeletingListing(null);
                  setDeleteError(null);
                }}
                className="rounded-full border border-[#DCE4D9] bg-white px-5 py-2.5 text-xs font-bold text-[#617064] transition hover:bg-[#F0F4EC] disabled:opacity-50"
              >
                Keep batch
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#B83E2C] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#9B2F1F] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <IconTrash size={13} />
                <span>{isDeleting ? "Deleting..." : "Delete batch"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
  marker,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "green" | "amber" | "cream";
  marker: string;
}) {
  const toneStyles = {
    green: "bg-[#EDF5EC] text-[#2E7143]",
    amber: "bg-[#FBF2E3] text-[#9A702D]",
    cream: "bg-[#F4F1E7] text-[#746743]",
  };

  return (
    <article className="rounded-[22px] border border-[#E6E8DF] bg-white p-4 shadow-[0_6px_20px_rgba(34,49,37,0.03)] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#7D897E]">{label}</p>
        <span className={`rounded-lg px-2 py-1 text-[9px] font-black tracking-wider ${toneStyles[tone]}`}>{marker}</span>
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-[#193B28] sm:text-3xl">{value}</p>
      <p className="mt-1 text-[10px] font-medium text-[#8A948A]">{detail}</p>
    </article>
  );
}
