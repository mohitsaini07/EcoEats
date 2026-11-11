import Link from "next/link";
import {
  IconArrowRight,
  IconCheckCircle,
  IconClock,
  IconLeaf,
  IconMapPin,
  IconSearch,
  IconShoppingBag,
} from "@/components/icons";

export function HowEcoEatsWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-ecoeats-works-title"
      className="relative isolate overflow-hidden bg-[#FBFAF4] py-20 sm:py-24 lg:py-28"
    >
      {/* Soft brand atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-20 -z-10 size-[25rem] rounded-full bg-[#DDF1E2]/65 blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 -z-10 size-[28rem] rounded-full bg-[#F3E8CC]/55 blur-[110px]"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#CFE7D5] bg-[#E8F5EB] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#236B40] shadow-sm">
            <IconLeaf size={14} /> A better way to enjoy good food
          </span>

          <h2
            id="how-ecoeats-works-title"
            className="mt-6 text-3xl font-black leading-[1.08] tracking-[-0.045em] text-[#17251D] sm:text-4xl lg:text-5xl"
          >
            How EcoEats works
            <span className="mt-1 block text-[#2D804D]">
              Three simple steps. Less food waste.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#69746B] sm:text-base">
            Local kitchens list good food before closing time. You discover a
            deal, reserve it when you check out, and collect it directly from
            the kitchen.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-14 lg:mt-16">
          {/* Connecting line behind the cards */}
          <div
            aria-hidden="true"
            className="absolute left-[18%] right-[18%] top-[4.1rem] hidden border-t-2 border-dashed border-[#C9DDCC] lg:block"
          />

          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {/* Step 1 */}
            <article className="group relative rounded-[1.75rem] border border-[#E5E8DE] bg-white p-5 shadow-[0_12px_35px_rgba(29,55,37,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(29,55,37,0.10)] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-[0.16em] text-[#91A096]">
                  STEP 01
                </span>
                <span className="grid size-11 place-items-center rounded-2xl border border-[#D8EBDD] bg-[#EAF5EC] text-[#267447] transition group-hover:bg-[#267447] group-hover:text-white">
                  <IconSearch size={20} />
                </span>
              </div>

              {/* Mini product visual */}
              <div className="relative mt-6 min-h-[190px] overflow-hidden rounded-2xl border border-[#E5EDE3] bg-[linear-gradient(145deg,#F1F8EF_0%,#FAF8EF_100%)] p-4">
                <div className="flex items-center gap-2 rounded-xl border border-white/90 bg-white/90 px-3 py-2.5 shadow-sm">
                  <IconMapPin size={15} className="shrink-0 text-[#2D804D]" />
                  <span className="text-xs font-semibold text-[#34483A]">
                    Food available near you
                  </span>
                  <span className="ml-auto size-2 rounded-full bg-[#54A56C]" />
                </div>
                <div className="mt-3 rounded-2xl border border-white bg-white p-3 shadow-[0_8px_22px_rgba(38,78,48,0.07)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[#E8F5EB] px-2.5 py-1 text-[10px] font-bold text-[#267447]">
                      BAKERY DEAL
                    </span>
                    <span className="text-[10px] font-semibold text-[#879188]">
                      Nearby listing
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#F6E9D4] text-2xl">
                      🥐
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-[#1D2B21]">
                        Fresh croissant box
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#758078]">
                        Discounted surplus from a local bakery
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#EEF0E9] pt-2.5">
                    <span className="text-[11px] font-semibold text-[#758078]">
                      Explore today's deals
                    </span>
                    <IconArrowRight size={15} className="text-[#2D804D]" />
                  </div>
                </div>
                <span className="absolute -bottom-8 -right-7 size-24 rounded-full border-[14px] border-[#D9EBD8]/60" />
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-extrabold tracking-tight text-[#17251D]">
                  Discover nearby food
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#69746B]">
                  Browse freshly listed surplus from restaurants, cafes and
                  bakeries around your area.
                </p>
              </div>
            </article>

            {/* Step 2 */}
            <article className="group relative rounded-[1.75rem] border border-[#E5E8DE] bg-white p-5 shadow-[0_12px_35px_rgba(29,55,37,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(29,55,37,0.10)] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-[0.16em] text-[#91A096]">
                  STEP 02
                </span>
                <span className="grid size-11 place-items-center rounded-2xl border border-[#E9E1C9] bg-[#FBF5E7] text-[#9A702D] transition group-hover:bg-[#9A702D] group-hover:text-white">
                  <IconShoppingBag size={20} />
                </span>
              </div>

              {/* Mini checkout visual */}
              <div className="relative mt-6 min-h-[190px] overflow-hidden rounded-2xl border border-[#EEE8D9] bg-[linear-gradient(145deg,#FCF8ED_0%,#F4F5E9_100%)] p-4">
                <div className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_22px_rgba(91,76,39,0.07)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#253329]">
                      Order summary
                    </span>
                    <span className="rounded-full bg-[#EAF5EC] px-2 py-1 text-[10px] font-bold text-[#267447]">
                      Secure checkout
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-[#778078]">
                    <span>Surplus food × 2</span>
                    <span className="font-bold text-[#27372B]">₹298</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#E5E9E1] pt-3">
                    <span className="text-xs font-bold text-[#253329]">Total</span>
                    <span className="text-lg font-black text-[#267447]">₹298</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#FFF4DD] px-3 py-2.5 text-[#795A25]">
                    <IconClock size={15} className="shrink-0" />
                    <span className="text-[11px] font-bold">
                      10-minute inventory hold begins at checkout
                    </span>
                  </div>
                </div>
                <span className="absolute -bottom-9 -left-7 size-24 rounded-full border-[14px] border-[#E6EBD8]/70" />
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-extrabold tracking-tight text-[#17251D]">
                  Reserve & pay
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#69746B]">
                  Add items to your cart and pay securely. Your selected
                  inventory is held for 10 minutes once checkout begins.
                </p>
              </div>
            </article>

            {/* Step 3 */}
            <article className="group relative rounded-[1.75rem] border border-[#E5E8DE] bg-white p-5 shadow-[0_12px_35px_rgba(29,55,37,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(29,55,37,0.10)] sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-[0.16em] text-[#91A096]">
                  STEP 03
                </span>
                <span className="grid size-11 place-items-center rounded-2xl border border-[#D8EBDD] bg-[#EAF5EC] text-[#267447] transition group-hover:bg-[#267447] group-hover:text-white">
                  <IconMapPin size={20} />
                </span>
              </div>

              {/* Mini pickup pass visual */}
              <div className="relative mt-6 min-h-[190px] overflow-hidden rounded-2xl border border-[#E2EAE0] bg-[linear-gradient(145deg,#EEF6EC_0%,#F8F5E9_100%)] p-4">
                <div className="rounded-2xl border border-white bg-white p-4 shadow-[0_8px_22px_rgba(38,78,48,0.07)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#253329]">
                      Your pickup pass
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5EB] px-2 py-1 text-[10px] font-bold text-[#267447]">
                      <IconCheckCircle size={11} /> Confirmed
                    </span>
                  </div>
                  <div className="mt-4 rounded-xl border border-dashed border-[#B8D5BC] bg-[#F3F9F1] px-3 py-3 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#6B806F]">
                      Show this code at the counter
                    </span>
                    <p className="mt-1 font-mono text-2xl font-black tracking-[0.18em] text-[#1F6039]">
                      ECO · 4829
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-[#68756B]">
                    <IconClock size={13} className="text-[#2D804D]" />
                    Collect during your pickup window
                  </div>
                </div>
                <span className="absolute -right-8 -top-8 size-24 rounded-full border-[14px] border-[#DDEBDD]/70" />
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-extrabold tracking-tight text-[#17251D]">
                  Pick up from the kitchen
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#69746B]">
                  Visit the restaurant during the pickup window and show your
                  order code at the counter. No delivery involved.
                </p>
              </div>
            </article>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="mt-9 flex flex-col items-center justify-between gap-4 rounded-[1.75rem] border border-[#DDE8D9] bg-[#EDF5E9] px-6 py-6 text-center sm:flex-row sm:px-8 sm:text-left">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#1D6038] text-white shadow-sm">
              <IconLeaf size={20} />
            </span>
            <div>
              <p className="font-extrabold text-[#1B3323]">
                Good food deserves another chance.
              </p>
              <p className="mt-0.5 text-xs text-[#66766A]">
                Find a local deal and make your next pickup count.
              </p>
            </div>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#246F42] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(36,111,66,0.2)] transition hover:-translate-y-0.5 hover:bg-[#1D6038] hover:shadow-[0_12px_24px_rgba(36,111,66,0.25)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2D804D]/20 sm:w-auto"
          >
            Explore nearby food <IconArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
