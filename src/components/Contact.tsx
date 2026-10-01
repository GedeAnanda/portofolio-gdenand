import {
  ArrowUpRight,
  DownloadSimple,
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
  TiktokLogo,
} from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";
import PressToCopy from "./PressToCopy";
import AskNanda from "./AskNanda";
import Reveal from "./ui/Reveal";

const icons = { GitHub: GithubLogo, LinkedIn: LinkedinLogo, Instagram: InstagramLogo, TikTok: TiktokLogo } as const;

const socials = [...site.socials, ...(site.tiktok ? [{ label: "TikTok" as const, href: site.tiktok }] : [])];

export default function Contact({ aiEnabled }: { aiEnabled: boolean }) {
  return (
    <section id="contact" className="layer band border-b-0" style={{ ["--band" as string]: "var(--pop-pink)" }}>
      <div className="container-x py-28 md:py-40">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <h2 className="t-section max-w-[11ch]">
            Let&apos;s{" "}
            <span className="mark" style={{ ["--mark" as string]: "var(--pop-orange)" }}>
              build
            </span>{" "}
            something.
          </h2>
          <p className="t-lead mt-6">Have a project in mind or just want to say hi? Drop me a message.</p>
          <a
            href={`mailto:${site.email}`}
            className="link-u mt-10 inline-block break-all text-[clamp(1.35rem,2.8vw,2.5rem)] font-semibold tracking-[-0.02em]"
          >
            {site.email}
          </a>
          <ul className="mt-10 flex flex-wrap gap-2">
            {socials.map((s) => {
              const Icon = icons[s.label];
              return (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="chip gap-2 pr-4">
                    <Icon size={18} weight="regular" aria-hidden />
                    {s.label}
                    <ArrowUpRight size={13} weight="bold" aria-hidden className="text-muted" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              );
            })}
            {site.cvUrl && (
              <li>
                <a href={site.cvUrl} className="chip gap-2" download>
                  <DownloadSimple size={18} aria-hidden />
                  Download CV
                </a>
              </li>
            )}
          </ul>
        </div>
        <Reveal className="flex justify-center lg:col-span-5">
          <PressToCopy email={site.email} />
        </Reveal>
      </div>

      {aiEnabled && <AskNanda />}
      </div>
    </section>
  );
}
