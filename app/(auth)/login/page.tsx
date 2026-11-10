import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign In",
  description: "Sign in to EcoEats to reserve surplus meals or manage your restaurant kitchen.",
};

export default async function LoginPage() {
  if (await getCurrentUser()) {
    redirect("/app");
  }

  return (
    <main className="eco-page min-h-screen flex items-center justify-center">
      {/* Sign In Form */}
      <section className="flex flex-col justify-center items-center px-6 py-12 sm:px-12 bg-[var(--eco-canvas-50)]">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Brand />
          </div>

          <div>
            <p className="eco-eyebrow">Welcome Back</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--color-foreground)]">
              Sign In to EcoEats
            </h1>
            <p className="eco-copy mt-2 text-xs sm:text-sm">
              Discover nearby surplus food, or access your kitchen manager hub.
            </p>
          </div>

          <div className="eco-panel p-6 sm:p-8 bg-white shadow-md">
            <Suspense fallback={<div className="py-8 text-center text-xs text-[var(--color-muted)]">Loading sign-in...</div>}>
              <LoginForm />
            </Suspense>
          </div>

          <div className="text-center text-xs text-[var(--eco-ink-500)] space-y-2">
            <p>
              Looking to explore without signing in?{" "}
              <Link href="/marketplace" className="font-bold text-[var(--color-primary)] hover:underline">
                Browse Public Marketplace
              </Link>
            </p>
            <p>
              New here?{" "}
              <Link href="/signup" className="font-bold text-[var(--color-primary)] hover:underline">
                Create a free customer account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
