"use client";

import { useRef, useState } from "react";
import { ui, useStore } from "@/lib/store";
import { signals } from "@/lib/stage";
import ViewSlot from "./ui/ViewSlot";

/**
 * The 3D push button is only a picture; this real <button> sits on top of its
 * cap, so mouse, touch and keyboard all work and screen readers get a label.
 */
export default function PushToCopy({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const webgl = useStore(ui, (s) => s.webgl, "unknown");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = async () => {
    signals.buttonPress = performance.now();
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2600);
  };

  const state = (value: "idle" | "hover" | "down") => ui.set({ pushButton: value });

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="relative aspect-square w-full">
        <ViewSlot id="button" kind="button" className="absolute inset-0" />
        <button
          type="button"
          onClick={copy}
          onPointerEnter={() => state("hover")}
          onPointerLeave={() => state("idle")}
          onPointerDown={() => state("down")}
          onPointerUp={() => state("hover")}
          onFocus={() => state("hover")}
          onBlur={() => state("idle")}
          onKeyDown={(e) => (e.key === " " || e.key === "Enter") && state("down")}
          onKeyUp={() => state("hover")}
          className={`absolute left-1/2 top-[47%] size-[44%] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full ${
            webgl === "none" ? "bg-accent font-semibold text-on-accent" : ""
          }`}
          aria-label={`Copy my email address, ${email}`}
        >
          {webgl === "none" ? "Copy email" : null}
        </button>
      </div>
      <p className="t-label -mt-2 text-center" aria-live="polite">
        {status === "copied"
          ? "Copied. Paste it into your email app."
          : status === "failed"
            ? "Couldn't copy it. Select the email address instead."
            : "Press the button to copy my email."}
      </p>
    </div>
  );
}
