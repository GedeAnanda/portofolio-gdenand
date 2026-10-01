"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ui, useStore } from "@/lib/store";
import { palette } from "@/lib/palette";
import { canvasTexture, cssFont, loadFonts, stepSpring, type Spring } from "../helpers";
import type { ProjectObjectProps } from "./types";

/*
 * FirStep: three simulated career plans branching from "now" across five
 * years, with short dead-end twigs for the risks the simulator flags. The
 * plan under the pointer lights up and a pulse walks along it.
 */

const YEARS_X = [-2.05, -0.9, 0.25, 1.4, 2.55];
const ROOT = new THREE.Vector3(-3.25, 0, 0);
const PLANS = [
  { y: [0.42, 0.82, 1.18, 1.42, 1.58], z: [0.3, 0.55, 0.45, 0.25, 0.15] },
  { y: [0.04, 0.1, -0.04, 0.08, 0.02], z: [-0.25, -0.5, -0.65, -0.7, -0.62] },
  { y: [-0.44, -0.84, -1.14, -1.34, -1.52], z: [0.2, 0.45, 0.7, 0.8, 0.74] },
];
const RISKS = [
  { plan: 0, year: 2, offset: [0.5, 0.52, 0.3] },
  { plan: 1, year: 3, offset: [0.48, -0.5, 0.4] },
  { plan: 2, year: 1, offset: [0.55, -0.42, -0.35] },
] as const;

export default function Paths({ active, input }: ProjectObjectProps) {
  const theme = useStore(ui, (s) => s.theme);
  const reduced = useStore(ui, (s) => s.reducedMotion);
  const p = palette[theme];

  const curves = useMemo(
    () =>
      PLANS.map(
        (plan) =>
          new THREE.CatmullRomCurve3(
            [ROOT, ...YEARS_X.map((x, i) => new THREE.Vector3(x, plan.y[i], plan.z[i]))],
            false,
            "catmullrom",
            0.5,
          ),
      ),
    [],
  );
  const nodes = useMemo(
    () => PLANS.map((plan) => YEARS_X.map((x, i) => new THREE.Vector3(x, plan.y[i], plan.z[i]))),
    [],
  );
  const twigs = useMemo(
    () =>
      RISKS.map((r) => {
        const from = nodes[r.plan][r.year];
        const to = from.clone().add(new THREE.Vector3(...r.offset));
        const mid = from
          .clone()
          .lerp(to, 0.5)
          .add(new THREE.Vector3(0, r.offset[1] * 0.25, 0));
        return { curve: new THREE.QuadraticBezierCurve3(from, mid, to), to };
      }),
    [nodes],
  );

  const geometry = useMemo(
    () => ({
      tubes: curves.map((c) => new THREE.TubeGeometry(c, 160, 0.032, 10, false)),
      twigs: twigs.map((t) => new THREE.TubeGeometry(t.curve, 40, 0.017, 8, false)),
      node: new THREE.SphereGeometry(0.075, 24, 16),
      goal: new THREE.TorusGeometry(0.17, 0.028, 12, 48),
      root: new THREE.SphereGeometry(0.13, 32, 20),
      cross: new THREE.BoxGeometry(0.2, 0.035, 0.035),
      label: new THREE.PlaneGeometry(0.62, 0.2),
    }),
    [curves, twigs],
  );
  useEffect(
    () => () => {
      geometry.tubes.forEach((g) => g.dispose());
      geometry.twigs.forEach((g) => g.dispose());
      [geometry.node, geometry.goal, geometry.root, geometry.cross, geometry.label].forEach((g) => g.dispose());
    },
    [geometry],
  );

  // One material per plan so each can fade between ink and accent on its own.
  const planMaterials = useMemo(
    () =>
      PLANS.map(
        () => new THREE.MeshStandardMaterial({ color: p.ink, roughness: 0.4, transparent: true, opacity: 0.4 }),
      ),
    [p],
  );
  const shared = useMemo(
    () => ({
      root: new THREE.MeshStandardMaterial({ color: p.ink, roughness: 0.35 }),
      twig: new THREE.MeshStandardMaterial({ color: p.ink, roughness: 0.5, transparent: true, opacity: 0.35 }),
      pulse: new THREE.MeshBasicMaterial({ color: p.accent, toneMapped: false }),
    }),
    [p],
  );
  useEffect(
    () => () => {
      planMaterials.forEach((m) => m.dispose());
      Object.values(shared).forEach((m) => m.dispose());
    },
    [planMaterials, shared],
  );

  const [labels, setLabels] = useState<THREE.CanvasTexture[] | null>(null);
  useEffect(() => {
    let alive = true;
    let made: THREE.CanvasTexture[] = [];
    (async () => {
      const mono = cssFont("--font-martian");
      await loadFonts([`500 44px ${mono}`]);
      if (!alive) return;
      made = ["now", "1y", "2y", "3y", "4y", "5y"].map((text) =>
        canvasTexture(248, 80, (ctx) => {
          ctx.fillStyle = p.ink;
          ctx.globalAlpha = 0.55;
          ctx.font = `500 44px ${mono}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, 124, 42);
        }),
      );
      setLabels(made);
    })();
    return () => {
      alive = false;
      made.forEach((t) => t.dispose());
    };
  }, [p]);

  const accent = useMemo(() => new THREE.Color(), []);
  const ink = useMemo(() => new THREE.Color(), []);
  const glow = useRef(PLANS.map((_, i): Spring => ({ x: i === 0 ? 1 : 0, v: 0 })));
  const pulse = useRef<THREE.Mesh>(null);
  const spin = useRef<THREE.Group>(null);
  const ctl = useRef({ plan: 0, lastTaps: 0, lastX: 0, angle: -0.42, vel: 0, touched: false, since: 0 });

  useFrame((state, delta) => {
    if (!active) return;
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;
    const c = ctl.current;

    if (input.hover && !input.dragging) {
      c.plan = input.y > 0.18 ? 0 : input.y < -0.18 ? 2 : 1;
      c.touched = true;
    }
    if (input.taps !== c.lastTaps) {
      c.lastTaps = input.taps;
      if (input.touch) c.plan = (c.plan + 1) % PLANS.length;
      c.touched = true;
    }
    // Until someone interacts, walk through the plans so all three get seen.
    if (!c.touched && !reduced) {
      c.since += dt;
      if (c.since > 2.6) {
        c.since = 0;
        c.plan = (c.plan + 1) % PLANS.length;
      }
    }

    const dx = input.totalX - c.lastX;
    c.lastX = input.totalX;
    if (input.dragging) c.vel = (dx * 0.008) / Math.max(dt, 1 / 120);
    else c.vel *= Math.exp(-dt * 3);
    c.angle += input.dragging ? dx * 0.008 : c.vel * dt;
    c.angle += (-0.42 - c.angle) * (input.dragging ? 0 : 0.01);
    if (spin.current) spin.current.rotation.y = c.angle;

    accent.set(p.accent);
    ink.set(p.ink);
    planMaterials.forEach((m, i) => {
      const g = stepSpring(glow.current[i], i === c.plan ? 1 : 0, 120, 18, dt);
      m.color.copy(ink).lerp(accent, g);
      m.opacity = 0.32 + 0.68 * g;
      m.emissive.copy(accent).multiplyScalar(g * 0.25);
    });

    if (pulse.current) {
      const u = reduced ? 1 : (t * 0.32) % 1;
      pulse.current.position.copy(curves[c.plan].getPointAt(u));
      pulse.current.scale.setScalar(0.6 + 0.4 * Math.sin(u * Math.PI));
    }
  });

  return (
    <group position={[0.1, 0.05, 0]}>
      <group ref={spin} rotation-x={0.12}>
        <mesh geometry={geometry.root} material={shared.root} position={ROOT} />
        {geometry.tubes.map((g, i) => (
          <mesh key={i} geometry={g} material={planMaterials[i]} />
        ))}
        {nodes.map((plan, i) =>
          plan.map((v, j) =>
            j === plan.length - 1 ? (
              <mesh key={`${i}-${j}`} geometry={geometry.goal} material={planMaterials[i]} position={v} />
            ) : (
              <mesh key={`${i}-${j}`} geometry={geometry.node} material={planMaterials[i]} position={v} />
            ),
          ),
        )}
        {twigs.map((tw, i) => (
          <group key={i}>
            <mesh geometry={geometry.twigs[i]} material={shared.twig} />
            <group position={tw.to}>
              <mesh geometry={geometry.cross} material={shared.twig} rotation-z={Math.PI / 4} />
              <mesh geometry={geometry.cross} material={shared.twig} rotation-z={-Math.PI / 4} />
            </group>
          </group>
        ))}
        <mesh ref={pulse} material={shared.pulse}>
          <sphereGeometry args={[0.15, 24, 16]} />
        </mesh>
        {labels &&
          [ROOT.x, ...YEARS_X].map((x, i) => (
            <mesh key={i} geometry={geometry.label} position={[x, -2.45, 0]}>
              <meshBasicMaterial map={labels[i]} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          ))}
      </group>
    </group>
  );
}
