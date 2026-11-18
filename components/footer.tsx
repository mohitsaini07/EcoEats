import Link from "next/link";
import { IconArrowRight, IconLeaf } from "@/components/icons";

export function Footer() {
  return (
    <footer className="bg-[#F8F7F0] px-4 pb-5 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Impact callout */}
        <section className="relative mb-5 overflow-hidden rounded-[2rem] border border-[#D8E7D8] bg-[#E8F2E7] px-6 py-8 sm:px-10 sm:py-10 lg:px-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-24 size-72 rounded-full border-[32px] border-[#CFE4D0]/70"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 right-36 size-56 rounded-full bg-[#D5E8D3]/70 blur-2xl"
          />

          <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#C7DEC9] bg-white/70 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#286A40]">
                <IconLeaf size={13} /> A better way to enjoy good food
              </span>
              <h2 className="mt-5 text-3xl font-black leading-[1.08] tracking-[-0.045em] text-[#173D2A] sm:text-4xl lg:text-5xl">
                Good food deserves
                <br className="hidden sm:block" /> another chance.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#526B58] sm:text-base">
                Rescue delicious surplus from local kitchens, save on every
                order, and help keep perfectly good food out of the bin.
              </p>
            </div>

            <Link
              href="/signup"
              className="group inline-flex w-fit shrink-0 items-center justify-center gap-3 rounded-full bg-[#1F6B3B] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(31,107,59,0.18)] transition duration-200 hover:-translate-y-1 hover:bg-[#174F2D] hover:shadow-[0_14px_28px_rgba(31,107,59,0.24)] active:translate-y-0 active:scale-[0.98]"
            >
              Join the rescue
              <IconArrowRight
                size={17}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>

        {/* Main footer panel */}
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#142A1D] px-6 py-9 text-white shadow-[0_20px_55px_rgba(20,42,29,0.12)] sm:px-10 sm:py-11 lg:px-14 lg:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 -z-10 size-[26rem] rounded-full bg-[#2D7847]/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 left-[28%] -z-10 size-80 rounded-full bg-[#A5C98C]/10 blur-3xl"
          />

          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:gap-16">
            <div className="max-w-lg">
              <Link href="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A7D4A9] focus-visible:ring-offset-4 focus-visible:ring-offset-[#142A1D]">
                <span className="grid size-11 place-items-center rounded-2xl rounded-bl-md bg-[#2D7847] text-white shadow-lg shadow-black/10">
                  <IconLeaf size={22} />
                </span>
                <span className="text-2xl font-black tracking-[-0.04em]">
                  Eco<span className="text-[#91C99A]">Eats</span>
                </span>
              </Link>

              <p className="mt-6 text-2xl font-bold leading-snug tracking-[-0.035em] text-white sm:text-3xl">
                Less waste.
                <span className="text-[#91C99A]"> More taste.</span>
              </p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
                Bringing local kitchens and food lovers together, one rescued
                meal at a time.
              </p>

              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[11px] font-semibold text-white/75">
                <span className="size-2 rounded-full bg-[#91C99A]" />
                Local food · Online payment · Self pickup
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:pt-2">
              <div>
                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#91C99A]">
                  Explore
                </h3>
                <ul className="mt-5 space-y-3.5 text-sm font-medium text-white/65">
                  <li><Link href="/" className="transition-colors hover:text-white">Home</Link></li>
                  <li><Link href="/marketplace" className="transition-colors hover:text-white">Today's food</Link></li>
                  <li><Link href="/#how-it-works" className="transition-colors hover:text-white">How it works</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#91C99A]">
                  Get involved
                </h3>
                <ul className="mt-5 space-y-3.5 text-sm font-medium text-white/65">
                  <li><Link href="/signup" className="transition-colors hover:text-white">Join EcoEats</Link></li>
                  <li><Link href="/login" className="transition-colors hover:text-white">Restaurant sign in</Link></li>
                  <li><Link href="/marketplace" className="transition-colors hover:text-white">Explore nearby deals</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-[11px] text-white/40 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} EcoEats. Made for a less wasteful world.</p>
            <p className="inline-flex items-center gap-2 font-medium text-white/50">
              Good food is worth rescuing <IconLeaf size={13} className="text-[#91C99A]" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
