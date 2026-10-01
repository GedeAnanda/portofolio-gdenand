"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ui } from "@/lib/store";

// three.js and every scene live in this chunk, so the first paint ships none of it.
const Stage = dynamic(() => import("./Stage"), { ssr: false });

function supportsWebGL2() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export default function StageLoader() {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    if (!supportsWebGL2()) {
      // Lets CSS drop the pin skeleton and pin hints that only make sense with 3D.
      document.documentElement.dataset.stage = "none";
      ui.set({ webgl: "none" });
      return;
    }
    ui.set({ webgl: "ok" });

    const start = () => setLoad(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 250);
    return () => clearTimeout(id);
  }, []);

  return load ? <Stage /> : null;
}
