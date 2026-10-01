import KineticName from "./ui/KineticName";
import HeroDevices from "./HeroDevices";
import { site } from "@/lib/site";

export default function Hero() {
  return (
    <section id="top" aria-label="Introduction" className="layer relative isolate overflow-x-clip">
      <div className="container-x grid grid-cols-1 min-h-[100dvh] content-center items-center gap-12 pb-14 pt-24 lg:grid-cols-12 lg:gap-8 lg:pb-16">
        <div className="flex flex-col gap-7 lg:col-span-6">
          <h1 className="t-display ml-[-0.04em] select-none pb-[0.06em] text-[clamp(5.2rem,24vw,8rem)] text-ink lg:text-[clamp(7rem,10vw,10.5rem)]">
            <span className="sr-only">
              {site.name}, {site.role.toLowerCase()}
            </span>
            <KineticName text={site.name} />
          </h1>
          <p
            className="hero-rise max-w-[30ch] text-[clamp(1.125rem,1.6vw,1.4rem)] font-medium leading-snug text-ink"
            style={{ ["--d" as string]: "380ms" }}
          >
            I build{" "}
            <span className="hl" style={{ ["--mark" as string]: "var(--pop-cyan)" }}>
              Go and Node.js
            </span>{" "}
            backends, native iOS apps in{" "}
            <span className="hl" style={{ ["--mark" as string]: "var(--pop-pink)" }}>
              SwiftUI
            </span>
            , and products on top of{" "}
            <span className="hl" style={{ ["--mark" as string]: "var(--pop-lime)" }}>
              AI models
            </span>
            .
          </p>
          <div className="hero-rise flex flex-wrap gap-3" style={{ ["--d" as string]: "480ms" }}>
            <a href="#projects" className="btn btn-primary">
              Play the projects
            </a>
            <a href="#contact" className="btn btn-quiet">
              Contact
            </a>
          </div>
        </div>

        <div className="lg:col-span-6">
          <HeroDevices />
        </div>
      </div>
    </section>
  );
}
