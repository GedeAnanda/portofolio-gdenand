"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { ui, useStore, type Theme } from "@/lib/store";
import { palette } from "@/lib/palette";
import { isSlotVisible, signals, type Slot } from "@/lib/stage";
import { clamp01, hash01, smoothstep } from "./helpers";

/*
 * A pin-art board. Each pin's resting height comes from a cut-out portrait:
 * a rounded "pillow" grown from the silhouette plus the photo's brightness,
 * so the face reads as a bas-relief. The pointer presses pins down, they
 * spring back, and clicking sends a ripple across the board.
 */

const PORTRAIT = "/images/portrait-pins.png";
const RELIEF = 11;
const BASE_LEN = 7;
const PRESS_DEPTH = 6.5;
const STAMP_RADIUS = 4.6;
/** Face centre inside the portrait crop, 0..1. */
const FACE = { x: 0.375, y: 0.29 };

interface Layout {
  cols: number;
  rows: number;
  /** Portrait rectangle inside the board, in pins. */
  pw: number;
  ph: number;
  px0: number;
  py0: number;
}

const WIDE: Layout = { cols: 92, rows: 104, pw: 72, ph: 90, px0: 10, py0: 14 };
const COMPACT: Layout = { cols: 62, rows: 72, pw: 50, ph: 62, px0: 6, py0: 10 };
/** How far, in pins, the board survives around the silhouette before dissolving. */
const HALO = 9;

interface PinData {
  layout: Layout;
  count: number;
  /** Board cell (row * cols + col) -> instance index, or -1 where no pin is drawn. */
  index: Int32Array;
  x: Float32Array;
  y: Float32Array;
  base: Float32Array;
  tone: Float32Array;
  cover: Float32Array;
  footprint: Float32Array;
  delay: Float32Array;
  grain: Float32Array;
  maxDelay: number;
}

function samplePixels(img: HTMLImageElement, w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data;
}

/** Chamfer distance from every inside pixel to the silhouette edge. The bottom edge is a crop, not an edge. */
function distanceInside(alpha: Float32Array, w: number, h: number) {
  const INF = 1e6;
  const d = new Float32Array(w * h);
  for (let i = 0; i < d.length; i++) d[i] = alpha[i] > 0.5 ? INF : 0;
  const at = (x: number, y: number) => {
    if (x < 0 || x >= w || y < 0) return 0;
    if (y >= h) return INF;
    return d[y * w + x];
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (d[i] === 0) continue;
      d[i] = Math.min(d[i], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.414, at(x + 1, y - 1) + 1.414);
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      if (d[i] === 0) continue;
      d[i] = Math.min(d[i], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.414, at(x - 1, y + 1) + 1.414);
    }
  }
  return d;
}

/** Chamfer distance from every board cell to the nearest portrait cell. */
function distanceOutside(inside: Uint8Array, w: number, h: number) {
  const INF = 1e6;
  const d = new Float32Array(w * h);
  for (let i = 0; i < d.length; i++) d[i] = inside[i] ? 0 : INF;
  const at = (x: number, y: number) => (x < 0 || x >= w || y < 0 || y >= h ? INF : d[y * w + x]);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (d[i] === 0) continue;
      d[i] = Math.min(d[i], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.414, at(x + 1, y - 1) + 1.414);
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      if (d[i] === 0) continue;
      d[i] = Math.min(d[i], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.414, at(x - 1, y + 1) + 1.414);
    }
  }
  return d;
}

function buildPins(img: HTMLImageElement, layout: Layout): PinData {
  const { cols, rows, pw, ph, px0, py0 } = layout;
  const cells = cols * rows;
  const px = samplePixels(img, pw, ph);

  const n = pw * ph;
  const alpha = new Float32Array(n);
  const luma = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    alpha[i] = px[i * 4 + 3] / 255;
    luma[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
  }

  // Stretch brightness to the portrait's own range so the relief uses its full depth.
  const inside: number[] = [];
  for (let i = 0; i < n; i++) if (alpha[i] > 0.5) inside.push(luma[i]);
  inside.sort((a, b) => a - b);
  const lo = inside[Math.floor(inside.length * 0.03)] ?? 0;
  const hi = inside[Math.floor(inside.length * 0.97)] ?? 1;

  const dist = distanceInside(alpha, pw, ph);
  let dmax = 1;
  for (const v of dist) if (v < 1e5 && v > dmax) dmax = v;

  // First pass over the whole board: relief, tone and coverage per cell.
  const cellBase = new Float32Array(cells);
  const cellTone = new Float32Array(cells);
  const cellCover = new Float32Array(cells);
  const solid = new Uint8Array(cells);
  const faceSigma = 0.13 * pw;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const lx = col - px0;
      const ly = row - py0;
      if (lx < 0 || lx >= pw || ly < 0 || ly >= ph) continue;
      const c = row * cols + col;
      const j = ly * pw + lx;
      const m = smoothstep(0.2, 0.8, alpha[j]);
      if (m <= 0) continue;
      const t = clamp01((luma[j] - lo) / Math.max(hi - lo, 1e-3));
      const d = dist[j] >= 1e5 ? dmax : dist[j];
      const pillow = 0.62 * Math.sqrt(Math.min(d, 10) / 10) + 0.38 * (d / dmax);
      const fx = lx - FACE.x * pw;
      const fy = ly - FACE.y * ph;
      const face = Math.exp(-(fx * fx + fy * fy) / (2 * faceSigma * faceSigma));
      // The bust dissolves where the photo crop cuts it (shoulders and chest).
      const crop = smoothstep(0, 14, Math.min(lx, pw - 1 - lx)) * smoothstep(0, 16, ph - 1 - ly);
      // Ease every edge of the silhouette down so bright edges never stand as tall walls.
      const rim = 0.25 + 0.75 * smoothstep(0, 4.5, d);
      cellBase[c] = m * crop * rim * (0.46 * pillow + 0.34 * Math.pow(t, 0.85) + 0.3 * face) * RELIEF;
      cellTone[c] = t;
      cellCover[c] = m * crop;
      if (m > 0.5) solid[c] = 1;
    }
  }

  // Second pass: keep the portrait plus a halo of background pins that shrink away from it.
  const outside = distanceOutside(solid, cols, rows);
  const index = new Int32Array(cells).fill(-1);
  const keep: { c: number; footprint: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const c = row * cols + col;
      const bottom = smoothstep(0, 14, rows - 1 - row);
      const halo = 1 - smoothstep(0, HALO, outside[c]);
      const footprint = Math.max(cellCover[c], halo * 0.9) * (0.2 + 0.8 * bottom);
      if (footprint < 0.08) continue;
      index[c] = keep.length;
      keep.push({ c, footprint });
    }
  }

  const count = keep.length;
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const base = new Float32Array(count);
  const tone = new Float32Array(count);
  const cover = new Float32Array(count);
  const footprint = new Float32Array(count);
  const delay = new Float32Array(count);
  const grain = new Float32Array(count);

  const faceX = px0 + FACE.x * pw - cols / 2 + 0.5;
  const faceY = rows / 2 - (py0 + FACE.y * ph) - 0.5;
  let maxDelay = 0;
  keep.forEach(({ c, footprint: f }, i) => {
    const col = c % cols;
    const row = (c - col) / cols;
    const wx = col - cols / 2 + 0.5;
    const wy = rows / 2 - row - 0.5;
    const r = hash01(c);
    x[i] = wx;
    y[i] = wy;
    grain[i] = r;
    tone[i] = cellTone[c];
    cover[i] = cellCover[c];
    footprint[i] = f;
    base[i] = cellBase[c] + (1 - cellCover[c]) * (r - 0.5) * 0.35 * f;
    delay[i] = 0.12 + Math.hypot(wx - faceX, wy - faceY) * 0.013 + r * 0.12;
    if (delay[i] > maxDelay) maxDelay = delay[i];
  });

  return { layout, count, index, x, y, base, tone, cover, footprint, delay, grain, maxDelay };
}

function makePinMaterial() {
  const uniforms = {
    uBaseLen: { value: BASE_LEN },
    uAccent: { value: new THREE.Color() },
    uAoFloor: { value: 0.3 },
  };
  const material = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.02 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute vec2 aState;
attribute float aFootprint;
uniform float uBaseLen;
varying float vDepth;
varying float vPress;`,
      )
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position);
// Halo pins are short stubs, so their sides never read as a fringe.
float baseLen = uBaseLen * mix(0.12, 1.0, smoothstep(0.35, 0.95, aFootprint));
float pinLen = max(baseLen + aState.x, 0.02);
transformed.xy *= aFootprint;
transformed.z = -baseLen + position.z * pinLen;
vDepth = (1.0 - position.z) * pinLen;
vPress = aState.y;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform vec3 uAccent;
uniform float uAoFloor;
varying float vDepth;
varying float vPress;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
float tip = 1.0 - smoothstep(0.0, 1.3, vDepth);
diffuseColor.rgb = mix(diffuseColor.rgb, uAccent, smoothstep(0.08, 0.85, vPress) * tip * 0.92);
diffuseColor.rgb *= mix(uAoFloor, 1.0, exp(-vDepth * 0.3));`,
      );
  };
  material.customProgramCacheKey = () => "pin-field";
  return { material, uniforms };
}

function paint(mesh: THREE.InstancedMesh, pins: PinData, theme: Theme) {
  const p = palette[theme];
  const field = new THREE.Color(p.pinField);
  const dark = new THREE.Color(p.pinShadow);
  const light = new THREE.Color(p.pinLight);
  const c = new THREE.Color();
  for (let i = 0; i < pins.count; i++) {
    c.copy(dark).lerp(light, Math.pow(pins.tone[i], 0.9));
    c.lerp(field, 1 - pins.cover[i]);
    const v = 1 + (pins.grain[i] - 0.5) * 0.07;
    c.setRGB(c.r * v, c.g * v, c.b * v);
    mesh.setColorAt(i, c);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

function Pins({ pins, slotId }: { pins: PinData; slotId: string }) {
  const theme = useStore(ui, (s) => s.theme);
  const reduced = useStore(ui, (s) => s.reducedMotion);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { cols, rows } = pins.layout;
  const tilt = cols > 80 ? 0.26 : 0.08;

  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(0.87, 0.87, 1);
    g.translate(0, 0, 0.5);
    g.setAttribute(
      "aState",
      new THREE.InstancedBufferAttribute(new Float32Array(pins.count * 2), 2).setUsage(THREE.DynamicDrawUsage),
    );
    g.setAttribute("aFootprint", new THREE.InstancedBufferAttribute(pins.footprint, 1));
    return g;
  }, [pins]);

  const { material, uniforms } = useMemo(() => makePinMaterial(), []);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < pins.count; i++) {
      m.makeTranslation(pins.x[i], pins.y[i], 0);
      mesh.setMatrixAt(i, m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [pins]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    paint(mesh, pins, theme);
    uniforms.uAccent.value.set(palette[theme].accent);
    material.roughness = theme === "dark" ? 0.42 : 0.58;
    material.metalness = theme === "dark" ? 0.16 : 0.02;
    uniforms.uAoFloor.value = theme === "dark" ? 0.3 : 0.5;
  }, [pins, theme, material, uniforms]);

  const sim = useMemo(
    () => ({
      h: new Float32Array(pins.count),
      v: new Float32Array(pins.count),
      press: new Float32Array(pins.count),
      start: -1,
      ripples: [] as { col: number; row: number; t: number }[],
      pointer: { active: false, col: 0, row: 0, pcol: Number.NaN, prow: Number.NaN },
      lastTouch: 0,
    }),
    [pins],
  );

  const toGrid = (point: THREE.Vector3) => {
    const local = groupRef.current!.worldToLocal(point.clone());
    return { col: local.x + cols / 2 - 0.5, row: rows / 2 - 0.5 - local.y };
  };

  const stamp = (cx: number, cy: number) => {
    const r2 = STAMP_RADIUS * STAMP_RADIUS;
    const c0 = Math.max(0, Math.floor(cx - STAMP_RADIUS));
    const c1 = Math.min(cols - 1, Math.ceil(cx + STAMP_RADIUS));
    const r0 = Math.max(0, Math.floor(cy - STAMP_RADIUS));
    const r1 = Math.min(rows - 1, Math.ceil(cy + STAMP_RADIUS));
    for (let row = r0; row <= r1; row++) {
      for (let col = c0; col <= c1; col++) {
        const dx = col - cx;
        const dy = row - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 >= r2) continue;
        const f = 1 - d2 / r2;
        const value = f * f * (3 - 2 * f);
        const i = pins.index[row * cols + col];
        if (i >= 0 && value > sim.press[i]) sim.press[i] = value;
      }
    }
  };

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const g = toGrid(e.point);
    sim.pointer.active = true;
    sim.pointer.col = g.col;
    sim.pointer.row = g.row;
    sim.lastTouch = performance.now();
  };
  const onLeave = () => {
    sim.pointer.active = false;
    sim.pointer.pcol = Number.NaN;
  };
  const onDown = (e: ThreeEvent<PointerEvent>) => {
    const g = toGrid(e.point);
    sim.ripples.push({ col: g.col, row: g.row, t: performance.now() / 1000 });
    if (sim.ripples.length > 4) sim.ripples.shift();
    sim.lastTouch = performance.now();
  };

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const group = groupRef.current;
    if (!mesh || !group || !isSlotVisible(slotId)) return;

    const t = state.clock.elapsedTime;
    if (sim.start < 0) {
      sim.start = t;
      document.documentElement.dataset.stage = "ready";
    }
    const dt = Math.min(delta, 1 / 30);
    const age = t - sim.start;
    const intro = !reduced && age < pins.maxDelay + 1.2;
    const scroll = signals.heroProgress;
    const flatten = 1 - 0.85 * scroll;
    const now = performance.now();
    const nowS = now / 1000;
    const idle = reduced ? 0 : clamp01((now - Math.max(sim.lastTouch, signals.pointer.lastMove) - 2500) / 1500);

    const p = sim.pointer;
    if (p.active) {
      if (Number.isFinite(p.pcol)) {
        const dx = p.col - p.pcol;
        const dy = p.row - p.prow;
        const steps = Math.min(40, Math.ceil(Math.hypot(dx, dy) / 0.8));
        for (let s = 1; s < steps; s++) stamp(p.pcol + (dx * s) / steps, p.prow + (dy * s) / steps);
      }
      stamp(p.col, p.row);
      p.pcol = p.col;
      p.prow = p.row;
    }

    sim.ripples = sim.ripples.filter((r) => nowS - r.t < 2.4);
    const ripples = sim.ripples;
    const amp = reduced ? 1.2 : 2.6;

    const attr = mesh.geometry.getAttribute("aState") as THREE.InstancedBufferAttribute;
    const out = attr.array as Float32Array;
    const decay = Math.exp(-dt * 1.35);
    const { base, delay, x, y } = pins;
    const halfC = cols / 2 - 0.5;
    const halfR = rows / 2 - 0.5;
    const K = 150;
    const C = 16;

    for (let i = 0; i < pins.count; i++) {
      let reveal = 1;
      if (intro) {
        const k = (age - delay[i]) / 0.9;
        reveal = k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k);
      }
      let target = base[i] * reveal * flatten - sim.press[i] * PRESS_DEPTH;
      if (idle > 0) target += idle * 0.45 * Math.sin(t * 1.3 - (x[i] * 0.08 + y[i] * 0.11));
      for (let r = 0; r < ripples.length; r++) {
        const rp = ripples[r];
        const rAge = nowS - rp.t;
        const dc = x[i] + halfC - rp.col;
        const dr = halfR - y[i] - rp.row;
        const phase = Math.sqrt(dc * dc + dr * dr) - rAge * 34;
        target += amp * Math.exp((-phase * phase) / 10) * Math.exp(-rAge * 1.7);
      }
      const v = sim.v[i] + ((target - sim.h[i]) * K - sim.v[i] * C) * dt;
      const h = sim.h[i] + v * dt;
      sim.v[i] = v;
      sim.h[i] = h;
      sim.press[i] *= decay;
      out[i * 2] = h;
      out[i * 2 + 1] = sim.press[i];
    }
    attr.needsUpdate = true;

    const px = reduced ? 0 : signals.pointer.x;
    const py = reduced ? 0 : signals.pointer.y;
    group.rotation.y += (tilt + px * 0.09 - group.rotation.y) * 0.05;
    group.rotation.x += (0.04 - py * 0.05 + scroll * 0.5 - group.rotation.x) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[geometry, material, pins.count]} frustumCulled={false} />
      <mesh position={[0, 0, RELIEF * 0.45]} onPointerMove={onMove} onPointerLeave={onLeave} onPointerDown={onDown}>
        <planeGeometry args={[cols, rows]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function PinLights() {
  const theme = useStore(ui, (s) => s.theme);
  const p = palette[theme];
  return (
    <>
      <hemisphereLight args={[p.hemiSky, p.hemiGround, p.hemi]} />
      <directionalLight position={[-150, 110, 100]} intensity={p.key} color="#fff3e6" />
      <directionalLight position={[110, -30, 50]} intensity={p.rim * 0.8} color="#e4eaff" />
    </>
  );
}

export default function PinField({ slot }: { slot: Slot }) {
  const size = useThree((s) => s.size);
  const layout = size.width < 640 ? COMPACT : WIDE;
  const [pins, setPins] = useState<PinData | null>(null);

  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (alive) setPins(buildPins(img, layout));
    };
    img.src = PORTRAIT;
    return () => {
      alive = false;
    };
  }, [layout]);

  // Fit the portrait (not the whole board) to the view; the board's faded edges may spill out.
  const aspect = size.width / Math.max(size.height, 1);
  const visibleH = Math.max(layout.ph * 1.08, (layout.pw + 8) / aspect);
  const distance = visibleH / 2 / Math.tan(THREE.MathUtils.degToRad(13));
  const targetY = layout.rows / 2 - (layout.py0 + layout.ph / 2) + layout.ph * 0.03;

  return (
    <>
      <PerspectiveCamera makeDefault fov={26} near={10} far={900} position={[0, targetY, distance]} />
      <PinLights />
      {pins && pins.layout === layout && <Pins key={pins.count} pins={pins} slotId={slot.id} />}
    </>
  );
}
