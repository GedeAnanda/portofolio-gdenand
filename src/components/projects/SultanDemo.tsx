"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Play, Stop } from "@phosphor-icons/react";
import BrowserFrame from "../mockups/BrowserFrame";
import { unlock } from "@/lib/achievements";
import hero from "../../../public/work/sultan/hero.webp";
import blend from "../../../public/work/sultan/blend.webp";
import believe from "../../../public/work/sultan/believe.webp";
import craft from "../../../public/work/sultan/craft.webp";
import stats from "../../../public/work/sultan/stats.webp";
import crown from "../../../public/work/sultan/crown.webp";

const SITE_URL = "https://smoothies-sultan.vercel.app";
/** The live site is rendered at this desktop width, then scaled into the frame. */
const VIRTUAL_WIDTH = 1440;

const scenes = [
  { id: "hero", label: "Intro", src: hero, alt: "Smoothies Sultan title over an orange gradient" },
  { id: "blend", label: "Blend", src: blend, alt: "A smoothie cup bursting into strawberries, mango and blueberries" },
  { id: "believe", label: "Manifesto", src: believe, alt: "A manifesto paragraph lighting up word by word" },
  { id: "craft", label: "The craft", src: craft, alt: "The Craft bento grid with a smoothie photo and an orange tile" },
  { id: "stats", label: "Numbers", src: stats, alt: "Brand numbers in large orange type" },
  { id: "crown", label: "Finale", src: crown, alt: "Taste the crown closing call to action" },
];

export default function SultanDemo() {
  const [scene, setScene] = useState(1);
  const [live, setLive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState<number | null>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  // Wide frames show the real desktop layout scaled down; narrow ones get the site's own mobile layout.
  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setScale(w >= 560 ? w / VIRTUAL_WIDTH : null);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const start = () => {
    setLoaded(false);
    setLive(true);
    unlock("live");
  };

  return (
    <div>
      <BrowserFrame
        url="smoothies-sultan.vercel.app"
        actions={
          <span className="flex items-center gap-1">
            {live && (
              <button
                type="button"
                onClick={() => setLive(false)}
                className="grid size-7 place-items-center rounded-full text-muted transition-colors hover:text-ink"
                aria-label="Stop the live site and show screenshots"
              >
                <Stop size={13} weight="fill" aria-hidden />
              </button>
            )}
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="grid size-7 place-items-center rounded-full text-muted transition-colors hover:text-ink"
              aria-label="Open Smoothies Sultan in a new tab"
            >
              <ArrowUpRight size={14} weight="bold" aria-hidden />
            </a>
          </span>
        }
      >
        <div ref={viewRef} className="absolute inset-0 bg-[#e98a2a]">
          {live ? (
            <>
              {!loaded && (
                <div className="absolute inset-0 grid place-items-center bg-[#f7f7f5]">
                  <div className="flex w-1/2 flex-col gap-3" aria-label="Loading the live site">
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-black/10" />
                    <div className="h-4 w-full animate-pulse rounded-full bg-black/10" />
                    <div className="h-4 w-1/2 animate-pulse rounded-full bg-black/10" />
                  </div>
                </div>
              )}
              <iframe
                src={SITE_URL}
                title="Smoothies Sultan, the live site"
                onLoad={() => setLoaded(true)}
                sandbox="allow-scripts allow-same-origin"
                className="absolute left-0 top-0 origin-top-left border-0 bg-white transition-opacity duration-500"
                style={
                  scale
                    ? { width: VIRTUAL_WIDTH, height: VIRTUAL_WIDTH * 0.625, transform: `scale(${scale})`, opacity: loaded ? 1 : 0 }
                    : { width: "100%", height: "100%", opacity: loaded ? 1 : 0 }
                }
              />
            </>
          ) : (
            <>
              {scenes.map((s, i) => (
                <Image
                  key={s.id}
                  src={s.src}
                  alt={i === scene ? s.alt : ""}
                  aria-hidden={i !== scene}
                  fill
                  sizes="(min-width: 1024px) 860px, 100vw"
                  className="object-cover transition-opacity duration-500"
                  style={{ opacity: i === scene ? 1 : 0 }}
                />
              ))}
              <div className="absolute inset-0 grid place-items-center bg-black/10">
                <button type="button" onClick={start} className="btn btn-primary">
                  <Play size={16} weight="fill" aria-hidden />
                  Run the live site
                </button>
              </div>
            </>
          )}
        </div>
      </BrowserFrame>

      <div className="mt-4 flex items-start justify-between gap-6">
        {live ? (
          <p className="t-label" aria-live="polite">
            The real site, running inside the frame. Scroll it.
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 pt-1" role="group" aria-label="Screenshots" data-lenis-prevent>
            {scenes.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScene(i)}
                aria-pressed={scene === i}
                aria-label={`Show ${s.label}`}
                className="relative h-12 w-[76px] flex-none overflow-hidden rounded-[10px] border-2 border-edge opacity-70 transition-[opacity,transform] hover:opacity-100 aria-pressed:-translate-y-1 aria-pressed:opacity-100 aria-pressed:shadow-[3px_3px_0_var(--hard)]"
              >
                <Image src={s.src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
