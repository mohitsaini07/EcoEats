import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { IconLeaf, IconMapPin, IconShoppingBag } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign In | EcoEats",
  description:
    "Sign in to EcoEats to discover discounted surplus food or manage your restaurant listings.",
};

export default async function LoginPage() {
  if (await getCurrentUser()) {
    redirect("/app");
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#FBFAF4] text-[#17251D]">
      {/* Soft brand-colored background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-48 -z-10 size-[34rem] rounded-full bg-[#DDF3E4]/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -left-40 -z-10 size-[34rem] rounded-full bg-[#F5E8CF]/60 blur-3xl"
      />

      {/* Shared site navigation */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
        <div className="shrink-0">
          <Brand ecoColor="text-black" />
        </div>

        <nav
          aria-label="Main navigation"
          className="order-3 flex w-full items-center justify-center gap-1 rounded-full border border-[#E6E8DF] bg-white/75 p-1.5 shadow-sm backdrop-blur-md sm:order-none sm:w-auto"
        >
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-semibold text-[#31513D] transition hover:bg-[#EEF5ED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D804D]"
          >
            Home
          </Link>
          <Link
            href="/marketplace"
            className="rounded-full px-4 py-2 text-sm font-semibold text-[#31513D] transition hover:bg-[#EEF5ED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D804D]"
          >
            Marketplace
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-sm text-[#68756D] md:inline">
            New to EcoEats?
          </span>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-[#1F5136] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#173D2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D804D] focus-visible:ring-offset-2"
          >
            Create account
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-12 pt-5 sm:px-8 sm:pb-16 lg:min-h-[calc(100vh-88px)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.88fr)] lg:gap-16 lg:px-10 lg:py-12">
        {/* Brand story */}
        <div className="mx-auto w-full max-w-xl lg:mx-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#CFE5D3] bg-[#EAF5EA]/90 px-3.5 py-2 text-xs font-bold tracking-wide text-[#245A39] shadow-sm">
            <IconLeaf size={15} />
            GOOD FOOD. LESS WASTE.
          </div>

          <h1 className="mt-6 max-w-xl text-4xl font-black leading-[1.06] tracking-[-0.045em] text-[#173D2A] sm:text-5xl lg:text-[3.65rem]">
            Welcome back to
            <span className="mt-1 block text-[#368252]">good food,</span>
            better finds.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-[#68756D] sm:text-lg">
            Your neighborhood&apos;s surplus food deals are waiting. Sign in to
            find something delicious, pay online, and pick it up from a local
            kitchen.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-[#E5E9DF] bg-white/75 p-4 shadow-sm backdrop-blur-sm">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF5EA] text-[#267448]">
                <IconShoppingBag size={19} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-[#20392A]">
                  Your next good deal
                </p>
                <p className="mt-1 text-xs leading-5 text-[#718077]">
                  Browse discounted surplus from nearby cafes and bakeries.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-[#E5E9DF] bg-white/75 p-4 shadow-sm backdrop-blur-sm">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F8F0DF] text-[#A66A1B]">
                <IconMapPin size={19} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-[#20392A]">
                  Simple local pickup
                </p>
                <p className="mt-1 text-xs leading-5 text-[#718077]">
                  Collect your paid order directly from the restaurant.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-2 text-xs font-medium text-[#718077]">
            <span className="grid size-6 place-items-center rounded-full bg-[#EAF5EA] text-[#267448]">
              <IconLeaf size={13} />
            </span>
            Good food deserves a second chance.
          </div>
        </div>

        {/* Sign-in form */}
        <div className="mx-auto w-full max-w-[500px] lg:ml-auto">
          <div className="rounded-[2rem] border border-[#E7E9E1] bg-white p-6 shadow-[0_24px_80px_rgba(23,61,42,0.10)] sm:p-8 lg:p-9">
            <div className="mb-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#368252]">
                Welcome back
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-[#173D2A] sm:text-3xl">
                Sign in to EcoEats
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#718077]">
                Pick up where you left off. Your next neighborhood food deal is
                just around the corner.
              </p>
            </div>

            <Suspense
              fallback={
                <div className="flex min-h-48 items-center justify-center rounded-2xl bg-[#FBFAF4] text-sm font-medium text-[#718077]">
                  Preparing your sign-in...
                </div>
              }
            >
              <LoginForm />
            </Suspense>

            <div className="mt-6 border-t border-[#EEF0E9] pt-5 text-center">
              <p className="text-sm text-[#718077]">
                New to EcoEats?{" "}
                <Link
                  href="/signup"
                  className="font-extrabold text-[#267448] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D804D]"
                >
                  Create a free account
                </Link>
              </p>
              <p className="mx-auto mt-4 max-w-sm text-[11px] leading-5 text-[#929C93]">
                EcoEats is a pickup-only marketplace. Place your order online
                and collect it from the restaurant during the listed pickup
                window.
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-[#859087] sm:hidden">
            Just browsing?{" "}
            <Link
              href="/marketplace"
              className="font-bold text-[#267448] underline-offset-4 hover:underline"
            >
              Explore surplus food
            </Link>
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#E9EBE3] px-5 py-5 text-center text-xs text-[#8A958C] sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
          <span>
            © {new Date().getFullYear()} EcoEats. Good food deserves a second
            chance.
          </span>
          <div className="flex items-center gap-4">
            <Link href="/" className="transition hover:text-[#267448]">
              Home
            </Link>
            <Link
              href="/marketplace"
              className="transition hover:text-[#267448]"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
