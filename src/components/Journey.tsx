import { journeyItems } from "@/lib/journey";
import DepartureBoard from "./ui/DepartureBoard";

export default function Journey() {
  return (
    <section id="journey" className="layer container-x py-28 md:py-40">
      <h2 className="t-section">The path so far</h2>
      <DepartureBoard items={journeyItems} />
    </section>
  );
}
