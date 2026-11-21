"use server";

import { createClient } from "@/lib/supabase/server";

export type SignupActionInput = {
  name: string;
  email: string;
  password: string;
  accountType: "CUSTOMER" | "PARTNER";
  restaurantName?: string;
  restaurantAddress?: string;
  contactPhone?: string;
  origin?: string;
};

export type SignupActionResult = {
  success: boolean;
  error?: string;
  requiresConfirmation?: boolean;
  user?: {
    id: string;
    email?: string;
  };
  hasSession?: boolean;
};

export async function signupAction(
  input: SignupActionInput
): Promise<SignupActionResult> {
  const supabase = await createClient();

  // 1. Detect an existing authenticated Supabase session before processing signup
  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();

  if (existingUser) {
    return {
      success: false,
      error:
        "You're already signed in. Please log out before creating another account.",
    };
  }

  // 2. Validate input fields
  const trimmedName = input.name?.trim() || "";
  const trimmedEmail = input.email?.trim() || "";
  const password = input.password || "";

  if (!trimmedName) {
    return {
      success: false,
      error:
        input.accountType === "PARTNER"
          ? "Please enter the manager or owner's full name."
          : "Please enter your full name.",
    };
  }

  if (!trimmedEmail || !trimmedEmail.includes("@")) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  if (password.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters long.",
    };
  }

  const metadata: Record<string, string> = {
    name: trimmedName,
  };

  if (input.accountType === "PARTNER") {
    const trimmedRestName = input.restaurantName?.trim() || "";
    const trimmedRestAddress = input.restaurantAddress?.trim() || "";
    const trimmedPhone = input.contactPhone?.trim() || "";

    if (!trimmedRestName) {
      return { success: false, error: "Please enter your restaurant or bakery name." };
    }
    if (trimmedRestName.length > 150) {
      return { success: false, error: "Restaurant name must be 150 characters or fewer." };
    }
    if (!trimmedRestAddress) {
      return { success: false, error: "Please enter the restaurant's complete address." };
    }
    if (!trimmedPhone) {
      return { success: false, error: "Please enter a contact phone number." };
    }
    if (trimmedPhone.length > 20) {
      return { success: false, error: "Contact phone number must be 20 characters or fewer." };
    }

    metadata.restaurant_name = trimmedRestName;
    metadata.restaurant_address = trimmedRestAddress;
    metadata.contact_phone = trimmedPhone;
  }

  const origin = input.origin || "";

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${origin}/auth/callback?next=/app`,
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("already registered") ||
      msg.includes("unique constraint") ||
      error.status === 422
    ) {
      return {
        success: false,
        error: "An account with this email address already exists. Try signing in instead.",
      };
    } else if (msg.includes("rate limit")) {
      return {
        success: false,
        error: "Too many registration requests. Please wait a few minutes before trying again.",
      };
    } else {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // If user session is active immediately (e.g. auto-confirm enabled)
  if (data.session && data.user) {
    if (input.accountType === "PARTNER") {
      const trimmedRestName = input.restaurantName?.trim() || "";
      const trimmedRestAddress = input.restaurantAddress?.trim() || "";
      const trimmedPhone = input.contactPhone?.trim() || "";

      await supabase.from("restaurant_applications").insert({
        user_id: data.user.id,
        restaurant_name: trimmedRestName,
        restaurant_address: trimmedRestAddress,
        contact_phone: trimmedPhone,
        status: "PENDING",
      });
    }

    return {
      success: true,
      hasSession: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }

  return {
    success: true,
    requiresConfirmation: true,
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email,
        }
      : undefined,
  };
}
