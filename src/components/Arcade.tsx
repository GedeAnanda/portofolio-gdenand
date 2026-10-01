import ShipIt from "./arcade/ShipIt";

export default function Arcade() {
  return (
    <section id="arcade" className="layer band" style={{ ["--band" as string]: "var(--pop-yellow)" }}>
      <div className="container-x py-28 md:py-40">
      <h2 className="t-section">
        Take a{" "}
        <span className="mark" style={{ ["--mark" as string]: "var(--pop-pink)", ["--r" as string]: "2deg" }}>
          break
        </span>
      </h2>
      <p className="t-lead mt-6">
        A one-button runner about getting code to production past the bugs. Reach 500 to ship.
      </p>
      <div className="mt-12 md:mt-16">
        <ShipIt />
      </div>
      </div>
    </section>
  );
}
