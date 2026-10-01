"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { accentSkill, categoryLabels, categoryOrder, skills } from "@/lib/skills";
import { ui, useStore, type Theme } from "@/lib/store";
import { palette } from "@/lib/palette";
import { isSlotVisible, signals, type Slot } from "@/lib/stage";
import Studio from "./Studio";
import SoftShadow from "./SoftShadow";
import { canvasTexture, cssFont, loadFonts, stepSpring, type Spring } from "./helpers";

const GAP = 0.1;
const CAP_H = 0.46;
const TRAVEL = 0.2;
const ROW = 1;
const MOD = 1.75;
const TEX_PER_UNIT = 220;

interface KeyDef {
  id: string;
  label: string;
  skill: string | null;
  w: number;
  x: number;
  z: number;
  row: number;
  accent: boolean;
}

function widthFor(label: string) {
  return Math.min(2.75, Math.max(1.25, Math.round((0.6 + label.length * 0.12) * 4) / 4));
}

/** Four rows, one per category. Each row starts with a modifier-style category key and all rows share one width. */
function buildLayout() {
  const rows = categoryOrder.map((cat) => ({ cat, items: skills.filter((s) => s.category === cat) }));
  const sums = rows.map((r) => r.items.reduce((a, s) => a + widthFor(s.name), 0));
  const width = Math.max(...sums) + MOD;
  const keys: KeyDef[] = [];
  rows.forEach((r, ri) => {
    const extra = width - MOD - sums[ri];
    const modW = MOD + Math.min(extra, 1);
    const spread = (extra - Math.min(extra, 1)) / r.items.length;
    const z = (ri - (rows.length - 1) / 2) * ROW;
    let x = -width / 2;
    keys.push({
      id: `mod-${r.cat}`,
      label: categoryLabels[r.cat],
      skill: null,
      w: modW,
      x: x + modW / 2,
      z,
      row: ri,
      accent: false,
    });
    x += modW;
    for (const s of r.items) {
      const w = widthFor(s.name) + spread;
      keys.push({
        id: s.name,
        label: s.name,
        skill: s.name,
        w,
        x: x + w / 2,
        z,
        row: ri,
        accent: s.name === accentSkill,
      });
      x += w;
    }
  });
  return { keys, width, depth: rows.length * ROW };
}

const capCache = new Map<number, THREE.BufferGeometry>();
/** Rounded keycap with a slight taper towards the top, like a sculpted profile. */
function capGeometry(w: number) {
  const key = Math.round(w * 1000);
  const cached = capCache.get(key);
  if (cached) return cached;
  const g = new RoundedBoxGeometry(w - GAP, CAP_H, ROW - GAP, 3, 0.1);
  g.translate(0, CAP_H / 2, 0);
  const pos = g.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) / CAP_H;
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setX(i, x - Math.sign(x) * Math.min(Math.abs(x), 0.07 * t));
    pos.setZ(i, z - Math.sign(z) * Math.min(Math.abs(z), 0.08 * t));
  }
  capCache.set(key, g);
  return g;
}

function legendTexture(k: KeyDef, theme: Theme, fonts: { sans: string; mono: string }) {
  const p = palette[theme];
  const w = (k.w - 0.28) * TEX_PER_UNIT;
  const h = 0.7 * TEX_PER_UNIT;
  return canvasTexture(w, h, (ctx) => {
    const pad = 0.1 * TEX_PER_UNIT;
    if (k.skill) {
      ctx.fillStyle = k.accent ? "#141414" : p.legend;
      let size = 46;
      ctx.font = `600 ${size}px ${fonts.sans}`;
      while (ctx.measureText(k.label).width > w - pad * 2 && size > 22) {
        size -= 1;
        ctx.font = `600 ${size}px ${fonts.sans}`;
      }
      ctx.textBaseline = "top";
      ctx.fillText(k.label, pad, pad);
    } else {
      ctx.fillStyle = p.legend;
      ctx.globalAlpha = 0.72;
      ctx.font = `500 27px ${fonts.mono}`;
      ctx.textBaseline = "bottom";
      ctx.fillText(k.label.toUpperCase(), pad, h - pad);
    }
  });
}

export default function Keyboard({ slot }: { slot: Slot }) {
  const theme = useStore(ui, (s) => s.theme);
  const reduced = useStore(ui, (s) => s.reducedMotion);
  const size = useThree((s) => s.size);
  const { keys, width, depth } = useMemo(() => buildLayout(), []);
  const p = palette[theme];

  const [legends, setLegends] = useState<THREE.CanvasTexture[] | null>(null);
  useEffect(() => {
    let alive = true;
    let made: THREE.CanvasTexture[] = [];
    (async () => {
      const fonts = { sans: cssFont("--font-mona"), mono: cssFont("--font-martian") };
      await loadFonts([`600 46px ${fonts.sans}`, `500 27px ${fonts.mono}`]);
      if (!alive) return;
      made = keys.map((k) => legendTexture(k, theme, fonts));
      setLegends(made);
    })();
    return () => {
      alive = false;
      made.forEach((t) => t.dispose());
    };
  }, [keys, theme]);

  const materials = useMemo(
    () => ({
      alpha: new THREE.MeshStandardMaterial({ color: p.keyAlpha, roughness: 0.62 }),
      mod: new THREE.MeshStandardMaterial({ color: p.keyMod, roughness: 0.62 }),
      accent: new THREE.MeshStandardMaterial({ color: p.accent, roughness: 0.55 }),
      body: new THREE.MeshStandardMaterial({ color: p.body, roughness: 0.38, metalness: 0.55 }),
      knob: new THREE.MeshStandardMaterial({ color: p.metal, roughness: 0.3, metalness: 0.85 }),
      led: new THREE.MeshStandardMaterial({ color: p.accent, emissive: p.accent, emissiveIntensity: 0.2 }),
    }),
    [p],
  );
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  const caseGeometry = useMemo(() => new RoundedBoxGeometry(width + 0.8, 0.55, depth + 1.7, 4, 0.24), [width, depth]);
  useEffect(() => () => caseGeometry.dispose(), [caseGeometry]);
  const legendGeometries = useMemo(() => keys.map((k) => new THREE.PlaneGeometry(k.w - 0.28, 0.7)), [keys]);

  const springs = useMemo(
    () => keys.map((): Spring & { hover: boolean; down: boolean } => ({ x: 0, v: 0, hover: false, down: false })),
    [keys],
  );
  const groups = useRef<(THREE.Group | null)[]>([]);
  const board = useRef<THREE.Group>(null);
  const knob = useRef<THREE.Group>(null);
  const knobSpin = useRef<Spring & { target: number }>({ x: 0, v: 0, target: 0 });
  const intro = useRef({ scheduled: false, at: new Float64Array(keys.length) });

  const setCursor = (value: string) => {
    if (slot.ref.current) slot.ref.current.style.cursor = value;
  };

  const press = (i: number) => {
    const k = keys[i];
    knobSpin.current.target += 0.35;
    if (k.skill) {
      ui.set({ selectedSkill: k.skill });
      return;
    }
    // A category key rolls across its whole row.
    const now = performance.now();
    keys.forEach((other) => {
      if (other.row === k.row && other.skill) signals.keyPress.set(other.skill, now + (other.x - k.x) * 55);
    });
  };

  useEffect(() => {
    const release = () => springs.forEach((s) => (s.down = false));
    window.addEventListener("pointerup", release);
    return () => window.removeEventListener("pointerup", release);
  }, [springs]);

  useFrame((_, delta) => {
    if (!isSlotVisible(slot.id)) return;
    const dt = Math.min(delta, 1 / 30);
    const now = performance.now();

    if (!intro.current.scheduled) {
      intro.current.scheduled = true;
      keys.forEach((k, i) => {
        intro.current.at[i] = reduced ? 0 : now + 450 + (k.x + width / 2) * 70 + k.row * 30;
      });
    }

    let anyDown = false;
    keys.forEach((k, i) => {
      const s = springs[i];
      let pressed = s.down;
      const t0 = k.skill ? signals.keyPress.get(k.skill) : undefined;
      if (t0 !== undefined && now >= t0 && now - t0 < 170) pressed = true;
      const ti = intro.current.at[i];
      if (ti > 0 && now >= ti && now - ti < 150) pressed = true;
      stepSpring(s, pressed ? 1 : s.hover ? 0.28 : 0, 700, 32, dt);
      const g = groups.current[i];
      if (g) g.position.y = -s.x * TRAVEL;
      if (pressed) anyDown = true;
    });

    materials.led.emissiveIntensity += ((anyDown ? 4 : 0.25) - materials.led.emissiveIntensity) * 0.3;
    const spin = knobSpin.current;
    stepSpring(spin, spin.target, 90, 14, dt);
    if (knob.current) knob.current.rotation.y = -spin.x;

    if (board.current) {
      const px = reduced ? 0 : signals.pointer.x;
      const py = reduced ? 0 : signals.pointer.y;
      board.current.rotation.y += (px * 0.07 - board.current.rotation.y) * 0.06;
      board.current.rotation.x += (-py * 0.04 - board.current.rotation.x) * 0.06;
    }
  });

  // Frame the whole board regardless of the slot's aspect ratio.
  const aspect = size.width / Math.max(size.height, 1);
  const fov = 30;
  const halfTan = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  const needW = width + 1.8;
  const needH = (depth + 3.4) * 0.8;
  const distance = Math.max(needW / (2 * halfTan * aspect), needH / (2 * halfTan), 10);
  const elevation = THREE.MathUtils.degToRad(52);

  const onOver = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    springs[i].hover = true;
    setCursor("pointer");
  };
  const onOut = (i: number) => () => {
    springs[i].hover = false;
    springs[i].down = false;
    setCursor("");
  };
  const onDown = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    springs[i].down = true;
    press(i);
  };

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={fov}
        position={[0, distance * Math.sin(elevation), distance * Math.cos(elevation)]}
        onUpdate={(c) => c.lookAt(0, -0.75, 0.25)}
      />
      <Studio keyPosition={[5, 9, 6]} />
      <group ref={board}>
        <mesh geometry={caseGeometry} material={materials.body} position={[0, -0.3, -0.42]} />
        <group ref={knob} position={[width / 2 - 0.45, -0.02, -depth / 2 - 0.72]}>
          <mesh material={materials.knob}>
            <cylinderGeometry args={[0.3, 0.32, 0.26, 40]} />
          </mesh>
          <mesh position={[0, 0.131, -0.16]} material={materials.accent}>
            <boxGeometry args={[0.05, 0.01, 0.16]} />
          </mesh>
        </group>
        <mesh position={[width / 2 - 1.2, -0.02, -depth / 2 - 0.72]} material={materials.led}>
          <sphereGeometry args={[0.07, 20, 20]} />
        </mesh>
        {keys.map((k, i) => (
          <group key={k.id} ref={(g) => void (groups.current[i] = g)} position={[k.x, 0, k.z]}>
            <mesh
              geometry={capGeometry(k.w)}
              material={k.accent ? materials.accent : k.skill ? materials.alpha : materials.mod}
              onPointerOver={onOver(i)}
              onPointerOut={onOut(i)}
              onPointerDown={onDown(i)}
            />
            {legends && (
              <mesh geometry={legendGeometries[i]} position={[0, CAP_H + 0.004, 0]} rotation-x={-Math.PI / 2}>
                <meshBasicMaterial map={legends[i]} transparent depthWrite={false} toneMapped={false} />
              </mesh>
            )}
          </group>
        ))}
      </group>
      <SoftShadow
        width={width + 3.4}
        depth={depth + 4.4}
        position={[0, -0.585, -0.42]}
        opacity={theme === "dark" ? 0.7 : 0.32}
        color={theme === "dark" ? "#000000" : "#2a2a26"}
      />
    </>
  );
}
