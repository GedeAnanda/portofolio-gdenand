import { StarFour } from "@phosphor-icons/react/dist/ssr";

const items = [
  "Go",
  "SwiftUI",
  "Claude API",
  "PostgreSQL",
  "Next.js",
  "Express",
  "Prisma",
  "IndoBERT",
  "GSAP",
  "JWT",
];
const starColors = ["var(--pop-pink)", "var(--pop-blue)", "var(--pop-lime)", "var(--pop-orange)", "var(--pop-violet)"];

/** The stack, scrolling past in a tilted band. Decorative: the Skills section lists the same tools. */
export default function StackBand() {
  const row = (copy: number) =>
    items.map((item, i) => (
      <span key={`${copy}-${item}`} className="flex items-center gap-6 pr-6">
        <span>{item}</span>
        <StarFour size={22} weight="fill" style={{ color: starColors[i % starColors.length] }} className="drop-shadow-[1.5px_1.5px_0_#17141f]" />
      </span>
    ));

  return (
    <div aria-hidden className="layer overflow-x-clip py-4">
      <div className="relative -mx-2 -rotate-[1.6deg] overflow-hidden border-y-2 border-edge bg-pop-yellow py-4 text-[#17141f]">
        <div className="marquee-track text-[clamp(1.25rem,2.4vw,2rem)] font-extrabold tracking-[-0.02em]" style={{ fontStretch: "118%" }}>
          {row(0)}
          {row(1)}
        </div>
      </div>
    </div>
  );
}
