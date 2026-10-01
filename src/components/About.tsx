import Image from "next/image";
import portrait from "../../public/avatar.jpg";
import Reveal from "./ui/Reveal";
import WordReveal from "./ui/WordReveal";

const facts = [
  { term: "Focus", detail: "API design, data modelling and the apps built on top" },
  { term: "Studying", detail: "Informatics Engineering at Telkom University" },
  { term: "Now", detail: "Software Engineering x AI bootcamp at RevoU" },
];

export default function About() {
  return (
    <section id="about" className="layer container-x py-28 md:py-40">
      <h2 className="t-label mb-8 md:mb-12">About</h2>
      <WordReveal
        className="max-w-[34ch] text-[clamp(1.75rem,3.5vw,3.25rem)] font-semibold leading-[1.12] tracking-tight"
        text="I'm Nanda, an Informatics Engineering student at Telkom University in Bandung. I design APIs and data models in Go and Node.js, ship native iOS apps in SwiftUI, and put AI models to work inside real products."
        emphasis={["Go", "Node.js", "SwiftUI"]}
      />

      <div className="mt-20 grid grid-cols-1 gap-12 md:mt-28 lg:grid-cols-12 lg:gap-8">
        <Reveal as="figure" className="lg:col-span-5">
          <div className="overflow-hidden rounded-(--radius-frame) bg-raised">
            <Image
              src={portrait}
              alt="Nanda in front of the FirStep screen at the Festival AI Nusantara booth"
              sizes="(min-width: 1024px) 38vw, 100vw"
              placeholder="blur"
              className="aspect-[4/5] h-auto w-full object-cover object-[50%_35%]"
            />
          </div>
          <figcaption className="t-label mt-3">Presenting FirStep at Festival AI Nusantara.</figcaption>
        </Reveal>

        <div className="flex flex-col justify-end gap-12 lg:col-span-6 lg:col-start-7">
          <Reveal as="p" className="t-lead text-ink">
            I like owning a product end to end: the schema, the API contract, the client that calls it and the demo
            day where people try it. Lately that has meant a national AI showcase, a GEMASTIK paper and my first
            SwiftUI app.
          </Reveal>
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {facts.map((f, i) => (
              <Reveal key={f.term} delay={i * 90} className="border-t border-line pt-4">
                <dt className="t-label">{f.term}</dt>
                <dd className="mt-2 text-[0.9375rem] leading-snug">{f.detail}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
