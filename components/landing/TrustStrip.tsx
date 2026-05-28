import { TRUST_ITEMS } from "@/components/landing/landingContent";

export function TrustStrip() {
  return (
    <div className="border-y border-[#e8decf] bg-[#f4eddf]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-9 gap-y-2 px-5 py-4 md:px-8">
        {TRUST_ITEMS.map((item) => (
          <span key={item} className="flex items-center gap-2 text-sm font-medium text-[#6f675c]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8791a]" aria-hidden />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
