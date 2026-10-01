import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

export interface Spring {
  x: number;
  v: number;
}

/** Semi-implicit damped spring. Stable while sqrt(k) * dt < 2. */
export function stepSpring(s: Spring, target: number, k: number, c: number, dt: number) {
  s.v += ((target - s.x) * k - s.v * c) * dt;
  s.x += s.v * dt;
  return s.x;
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function smoothstep(a: number, b: number, v: number) {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Deterministic 0..1 noise so layouts do not reshuffle between renders. */
export function hash01(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export interface PointerInput {
  hover: boolean;
  dragging: boolean;
  /** Accumulated drag distance in CSS px. Consumers keep their own last-read value. */
  totalX: number;
  totalY: number;
  /** Pointer position inside the slot, [-1, 1], y up. */
  x: number;
  y: number;
  /** Increments on every tap or click that did not turn into a drag. */
  taps: number;
  touch: boolean;
}

/** Drag, hover and tap input read straight from a slot element, outside React state. */
export function usePointerInput(el: RefObject<HTMLElement | null>): PointerInput {
  const input = useRef<PointerInput>({
    hover: false,
    dragging: false,
    totalX: 0,
    totalY: 0,
    x: 0,
    y: 0,
    taps: 0,
    touch: false,
  }).current;

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    let id = -1;
    let lastX = 0;
    let lastY = 0;
    let startX = 0;
    let startY = 0;
    let startT = 0;

    const locate = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      input.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      input.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const enter = (e: PointerEvent) => {
      input.touch = e.pointerType !== "mouse";
      if (!input.touch) input.hover = true;
      locate(e);
    };
    const leave = () => {
      if (!input.dragging) input.hover = false;
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      input.touch = e.pointerType !== "mouse";
      input.dragging = true;
      id = e.pointerId;
      lastX = startX = e.clientX;
      lastY = startY = e.clientY;
      startT = performance.now();
      locate(e);
      node.setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      locate(e);
      if (!input.dragging || e.pointerId !== id) return;
      input.totalX += e.clientX - lastX;
      input.totalY += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      input.dragging = false;
      id = -1;
      const moved = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (e.type === "pointerup" && moved < 6 && performance.now() - startT < 450) input.taps++;
      if (e.pointerType !== "mouse") input.hover = false;
    };

    node.addEventListener("pointerenter", enter);
    node.addEventListener("pointerleave", leave);
    node.addEventListener("pointerdown", down);
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", up);
    return () => {
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", up);
    };
  }, [el, input]);

  return input;
}

/** Reads a next/font family (e.g. --font-mona) so canvas text matches the page. */
export function cssFont(variable: "--font-mona" | "--font-martian") {
  const value = getComputedStyle(document.body).getPropertyValue(variable).trim();
  return value || (variable === "--font-mona" ? "system-ui, sans-serif" : "ui-monospace, monospace");
}

export async function loadFonts(specs: string[]) {
  try {
    await Promise.all(specs.map((s) => document.fonts.load(s)));
  } catch {
    /* fall back to whatever is available */
  }
}

/**
 * Clear glass without a transmission pass: the body is nearly invisible, edges
 * thicken with a fresnel term and reflections are added on top at full strength
 * (premultiplied output), so the glass still reads over an empty background.
 */
export function makeGlassMaterial({ alpha = 0.05, edge = 0.5, tint = "#ffffff" } = {}) {
  const material = new THREE.MeshPhysicalMaterial({
    color: tint,
    roughness: 0.04,
    metalness: 0,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  material.blending = THREE.CustomBlending;
  material.blendSrc = THREE.OneFactor;
  material.blendDst = THREE.OneMinusSrcAlphaFactor;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uAlpha = { value: alpha };
    shader.uniforms.uEdge = { value: edge };
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uAlpha;\nuniform float uEdge;")
      .replace(
        "#include <opaque_fragment>",
        `float fres = pow(1.0 - saturate(abs(dot(normal, normalize(vViewPosition)))), 2.5);
float glassA = mix(uAlpha, uEdge, fres);
vec3 glassDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
vec3 glassSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
gl_FragColor = vec4(glassDiffuse * glassA * 0.3 + glassSpecular * (0.55 + 0.45 * fres), glassA);`,
      );
  };
  material.customProgramCacheKey = () => `glass-${alpha}-${edge}`;
  return material;
}

export function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
