"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Play, Stop } from "@phosphor-icons/react";
import BrowserFrame from "../mockups/BrowserFrame";
import { unlock } from "@/lib/achievements";
import landing from "../../../public/work/fotokita/landing.webp";
import camera from "../../../public/work/fotokita/camera.webp";
import studio from "../../../public/work/fotokita/studio.webp";
import strip from "../../../public/work/fotokita/layout-strip.webp";
import strip3 from "../../../public/work/fotokita/layout-strip-3.webp";
import grid from "../../../public/work/fotokita/layout-grid.webp";
import purikura from "../../../public/work/fotokita/layout-purikura.webp";
import scrapbook from "../../../public/work/fotokita/layout-scrapbook.webp";
import checker from "../../../public/work/fotokita/layout-checker.webp";
import spotlight from "../../../public/work/fotokita/layout-spotlight.webp";
import vogue from "../../../public/work/fotokita/layout-vogue.webp";
import newspaper from "../../../public/work/fotokita/layout-newspaper.webp";

const SITE_URL = "https://fotokita.space";

const screens = [
  { id: "landing", label: "Landing", src: landing, alt: "fotokita.space landing page: make cute, aesthetic photo strips anywhere" },
  { id: "camera", label: "Camera", src: camera, alt: "The camera view after a two-handed peace sign fired shot 1 of 4" },
  { id: "studio", label: "Studio", src: studio, alt: "The studio: nine layouts, covers, filters and frames, then save as PNG or boomerang video" },
] as const;

const layouts = [
  { id: "strip", label: "Strip 1x4", src: strip },
  { id: "strip-3", label: "Strip 3-Cut", src: strip3 },
  { id: "grid", label: "Grid 2x2", src: grid },
  { id: "purikura", label: "Purikura", src: purikura },
  { id: "scrapbook", label: "Scrapbook", src: scrapbook },
  { id: "checker", label: "Y2K Checker", src: checker },
  { id: "spotlight", label: "Spotlight", src: spotlight },
  { id: "vogue", label: "Vogue", src: vogue },
  { id: "newspaper", label: "Newspaper", src: newspaper },
] as const;

type ScreenId = (typeof screens)[number]["id"];

/** The live site in a browser frame: three captured screens, or the real app in an iframe. */
export function FotoKitaBrowser() {
  const [screen, setScreen] = useState<ScreenId>("camera");
  const [live, setLive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const current = screens.find((s) => s.id === screen)!;

  return (
    <div className="min-w-0">
      <div role="tablist" aria-label="fotokita.space screens" className="mb-4 flex flex-wrap gap-2" style={{ ["--chip-on" as string]: "var(--pop-pink)" }}>
        {screens.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={!live && screen === s.id}
            className="chip"
            onClick={() => {
              setLive(false);
              setScreen(s.id);
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <BrowserFrame
        url="fotokita.space"
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
              aria-label="Open fotokita.space in a new tab"
            >
              <ArrowUpRight size={14} weight="bold" aria-hidden />
            </a>
          </span>
        }
      >
        <div className="absolute inset-0 bg-[#fff8fa]">
          {live ? (
            <>
              {!loaded && (
                <div className="absolute inset-0 grid place-items-center" aria-label="Loading the live site">
                  <div className="flex w-1/2 flex-col gap-3">
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-black/10" />
                    <div className="h-4 w-full animate-pulse rounded-full bg-black/10" />
                  </div>
                </div>
              )}
              <iframe
                src={SITE_URL}
                title="fotokita.space, the live site"
                allow="camera; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-downloads allow-popups"
                onLoad={() => setLoaded(true)}
                className="absolute inset-0 size-full border-0 transition-opacity duration-500"
                style={{ opacity: loaded ? 1 : 0 }}
              />
            </>
          ) : (
            <>
              {screens.map((s) => (
                <Image
                  key={s.id}
                  src={s.src}
                  alt={s.id === screen ? s.alt : ""}
                  aria-hidden={s.id !== screen}
                  fill
                  sizes="(min-width: 1024px) 860px, 100vw"
                  className="object-cover object-top transition-opacity duration-500"
                  style={{ opacity: s.id === screen ? 1 : 0 }}
                />
              ))}
              <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/25 to-transparent pb-5 pt-16">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setLoaded(false);
                    setLive(true);
                  }}
                >
                  <Play size={16} weight="fill" aria-hidden />
                  Try it live
                </button>
              </div>
            </>
          )}
        </div>
      </BrowserFrame>
      <p className="t-label mt-3" aria-live="polite">
        {live
          ? "The real app. Allow the camera, then show two peace signs."
          : `${current.label}: captured from the live site with sample photos.`}
      </p>
    </div>
  );
}

/** A little printer: pick a layout and the app's real render for it slides out. */
export function FotoKitaPrinter() {
  const [layout, setLayout] = useState(0);
  const printed = useRef(new Set<number>([0]));
  const print = layouts[layout];

  const choose = (i: number) => {
    setLayout(i);
    printed.current.add(i);
    if (printed.current.size >= 3) unlock("print");
  };

  return (
    <div>
      <p className="text-sm font-medium">Print a layout</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Collage layout" style={{ ["--chip-on" as string]: "var(--pop-pink)" }}>
        {layouts.map((l, i) => (
          <button
            key={l.id}
            type="button"
            className="chip min-h-8 py-1 text-[0.8125rem]"
            aria-pressed={layout === i}
            onClick={() => choose(i)}
          >
            {l.label}
          </button>
        ))}
      </div>
      {/* The slot the print comes out of. */}
      <div className="mt-6 h-3 rounded-full border-2 border-edge bg-ink" aria-hidden />
      <div className="-mt-1.5 flex h-[420px] items-start justify-center overflow-hidden px-2 pt-1 md:h-[480px]">
        <div
          key={print.id}
          className="print-in rounded-b-[8px] border-2 border-t-0 border-edge bg-white p-1.5 shadow-[6px_6px_0_var(--hard)]"
          style={{ ["--r" as string]: layout % 2 ? "-2deg" : "2deg" }}
        >
          <Image
            src={print.src}
            alt={`A ${print.label} collage rendered by fotokita.space`}
            sizes="300px"
            className="h-auto max-h-[390px] w-auto max-w-[240px] rounded-[4px] md:max-h-[450px]"
          />
        </div>
      </div>
      <p className="t-label mt-3">Real renders from the app, made with sample photos.</p>
    </div>
  );
}
