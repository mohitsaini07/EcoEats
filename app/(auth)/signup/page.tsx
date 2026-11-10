import { redirect } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { getCurrentUser } from "@/lib/auth/session";
import { SignupForm } from "./signup-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create Account",
  description: "Sign up for EcoEats to reserve fresh surplus food from local cafes and bakeries.",
};

export default async function SignupPage() {
  if (await getCurrentUser()) {
    redirect("/app");
  }

  return (
    <main className="eco-page min-h-screen flex items-center justify-center">
      {/* Sign Up Form */}
      <section className="flex flex-col justify-center items-center px-6 py-12 sm:px-12 bg-(--eco-canvas-50)">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Brand />
          </div>

          <div>
            <p className="eco-eyebrow">Get Started</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="eco-copy mt-2 text-xs sm:text-sm">
              Discover and reserve surplus food from local cafes and bakeries.
            </p>
          </div>

          <div className="eco-panel p-6 sm:p-8 bg-white shadow-md">
            <SignupForm />
          </div>

          <div className="text-center text-xs text-[var(--eco-ink-500)] space-y-2">
            <p>
              Looking to explore first?{" "}
              <Link href="/marketplace" className="font-bold text-[var(--color-primary)] hover:underline">
                Browse Marketplace
              </Link>
            </p>
            <p>
              By signing up, you agree to fair-hold reservation etiquette and community guidelines.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
