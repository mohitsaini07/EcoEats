"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IconLogOut } from "@/components/icons";

export function SignOutButton({
  className = "eco-button eco-button-ghost text-xs rounded-full",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    if (pending) return;
    setPending(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      // Even if network fails, force redirect to login
      router.replace("/login");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className={className}
      aria-label="Sign out of EcoEats"
    >
      <IconLogOut size={15} />
      <span>{pending ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}
