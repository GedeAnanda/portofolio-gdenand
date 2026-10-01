"use client";

import { useEffect, useMemo } from "react";
import { canvasTexture } from "./helpers";

/**
 * A baked, blurred rounded-rectangle shadow. Unlike a contact-shadow pass it
 * costs nothing per frame and fades to fully transparent well inside its own
 * plane, so it can never show a hard edge at the border of a view.
 */
export default function SoftShadow({
  width,
  depth,
  position,
  opacity,
  color = "#000000",
}: {
  width: number;
  depth: number;
  position: [number, number, number];
  opacity: number;
  color?: string;
}) {
  const alphaMap = useMemo(() => {
    const w = 512;
    const h = Math.round((512 * depth) / width);
    const pad = Math.min(w, h) * 0.24;
    return canvasTexture(w, h, (ctx) => {
      // alphaMap reads the green channel, so paint intensity onto opaque black. On a transparent
      // canvas every faintly covered pixel would upload as pure white and the edge would turn hard.
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);
      // Draw the shape off-canvas and keep only its blurred canvas shadow (works everywhere, unlike ctx.filter).
      ctx.shadowColor = "#ffffff";
      ctx.shadowBlur = pad * 0.9;
      ctx.shadowOffsetX = w * 2;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(pad - w * 2, pad, w - pad * 2, h - pad * 2, pad * 0.35);
      ctx.fill();
    });
  }, [width, depth]);
  useEffect(() => () => alphaMap.dispose(), [alphaMap]);

  return (
    <mesh position={position} rotation-x={-Math.PI / 2} renderOrder={-1}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial
        color={color}
        alphaMap={alphaMap}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
