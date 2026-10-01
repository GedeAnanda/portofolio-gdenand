"use client";

import { useEffect, useState } from "react";
import { unlock } from "@/lib/achievements";

/** A big arcade button that copies the email address. */
export default function PressToCopy({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const id = window.setTimeout(() => setState("idle"), 2400);
    return () => window.clearTimeout(id);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
      unlock("hello");
    } catch {
      setState("failed");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="arcade-ring">
        <button type="button" className="arcade-btn" onClick={copy} aria-describedby="copy-status">
          {state === "copied" ? "Copied" : "Copy email"}
        </button>
      </div>
      <p id="copy-status" className="t-label min-h-5 text-center" aria-live="polite">
        {state === "copied"
          ? "It's on your clipboard."
          : state === "failed"
            ? "Couldn't reach the clipboard. The address is on the left."
            : "Press it."}
      </p>
    </div>
  );
}
