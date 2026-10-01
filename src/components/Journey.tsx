import { journeyItems } from "@/lib/journey";
import DepartureBoard from "./ui/DepartureBoard";

export default function Journey() {
  return (
    <section id="journey" className="layer container-x py-28 md:py-40">
      <h2 className="t-section">
        The path{" "}
        <span className="mark" style={{ ["--mark" as string]: "var(--pop-yellow)", ["--r" as string]: "1.5deg" }}>
          so far
        </span>
      </h2>
      <DepartureBoard items={journeyItems} />
    </section>
  );
}
