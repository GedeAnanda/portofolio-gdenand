"use client";

import { useState, type UIEvent } from "react";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react";
import BrowserFrame from "../mockups/BrowserFrame";
import PhoneFrame from "../mockups/PhoneFrame";
import { unlock } from "@/lib/achievements";
import landing from "../../../public/work/firstep/landing-full.webp";
import dashboard from "../../../public/work/firstep/dashboard.webp";
import skillGap from "../../../public/work/firstep/skill-gap.webp";
import mobileHome from "../../../public/work/firstep/mobile-home.webp";
import mobileResult from "../../../public/work/firstep/mobile-result.webp";

const tabs = [
  { id: "landing", label: "Landing page", note: "Captured from the live site. Scroll inside the window." },
  { id: "dashboard", label: "Dashboard", note: "Signed-in home with every career tool in one place." },
  { id: "skills", label: "Skill gap", note: "Skill Gap Analyzer: what to learn next, with courses for each gap." },
] as const;

type Tab = (typeof tabs)[number]["id"];

const phoneScreens = [
  { id: "home", label: "Home", src: mobileHome, alt: "FirStep mobile landing page" },
  {
    id: "result",
    label: "Result",
    src: mobileResult,
    alt: "FirStep simulation result on mobile: Backend Specialist to Tech Lead, 72% probability",
  },
] as const;

export default function FirStepDemo() {
  const [tab, setTab] = useState<Tab>("landing");
  const [phone, setPhone] = useState(1);
  const current = tabs.find((t) => t.id === tab)!;

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) unlock("scroll");
  };

  return (
    <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-9">
        <div role="tablist" aria-label="FirStep screens" className="mb-4 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`firstep-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls="firstep-panel"
              className="chip"
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <BrowserFrame
          url={tab === "landing" ? "firstep-two.vercel.app" : `firstep-two.vercel.app/${tab === "dashboard" ? "dashboard" : "skill-gap"}`}
          actions={
            <a
              href="https://firstep-two.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="grid size-7 place-items-center rounded-full text-muted transition-colors hover:text-ink"
              aria-label="Open FirStep in a new tab"
            >
              <ArrowUpRight size={14} weight="bold" aria-hidden />
            </a>
          }
        >
          <div
            id="firstep-panel"
            role="tabpanel"
            aria-labelledby={`firstep-tab-${tab}`}
            tabIndex={0}
            className="absolute inset-0"
          >
            {tab === "landing" ? (
              <div className="h-full overflow-y-auto overscroll-contain" data-lenis-prevent onScroll={onScroll}>
                <Image
                  src={landing}
                  alt="The full FirStep landing page: hero, stats, the twelve career tools, testimonials and footer"
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="h-auto w-full"
                />
              </div>
            ) : (
              <div className="fade-in h-full bg-[#f7f8fc]" key={tab}>
                <Image
                  src={tab === "dashboard" ? dashboard : skillGap}
                  alt={
                    tab === "dashboard"
                      ? "FirStep dashboard greeting the user, with stats and the career tools"
                      : "FirStep Skill Gap Analyzer listing data structures, SQL and REST API design as gaps"
                  }
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="h-auto w-full"
                />
              </div>
            )}
          </div>
        </BrowserFrame>
        <p className="t-label mt-3" aria-live="polite">
          {current.note}
        </p>
      </div>

      <div className="mx-auto w-full max-w-[250px] lg:col-span-3 lg:max-w-none">
        <button
          type="button"
          className="block w-full"
          onClick={() => setPhone((p) => (p + 1) % phoneScreens.length)}
          aria-label={`Show the ${phoneScreens[(phone + 1) % phoneScreens.length].label.toLowerCase()} screen on the phone`}
        >
          <PhoneFrame tone="light" screen="#fafafa">
            {phoneScreens.map((s, i) => (
              <Image
                key={s.id}
                src={s.src}
                alt={i === phone ? s.alt : ""}
                aria-hidden={i !== phone}
                fill
                sizes="260px"
                className="object-cover object-top transition-opacity duration-500"
                style={{ opacity: i === phone ? 1 : 0 }}
              />
            ))}
          </PhoneFrame>
        </button>
        <div className="mt-4 flex justify-center gap-2" role="group" aria-label="Phone screen">
          {phoneScreens.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="chip"
              aria-pressed={phone === i}
              onClick={() => setPhone(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
