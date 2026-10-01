"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ui, useStore } from "@/lib/store";
import { palette } from "@/lib/palette";
import { canvasTexture, cssFont, loadFonts, stepSpring, type Spring } from "../helpers";
import type { ProjectObjectProps } from "./types";

/*
 * Olahin: a Go API drawn as its clean-architecture layers. Requests (accent)
 * travel down to Postgres and responses travel back up. Hover pulls the
 * layers apart like an exploded diagram.
 */

const LAYERS = ["handlers", "services", "repositories"];
const W = 3.5;
const D = 2.3;
const H = 0.3;
const PACKETS = 8;

export default function Layers({ active, input }: ProjectObjectProps) {
  const theme = useStore(ui, (s) => s.theme);
  const reduced = useStore(ui, (s) => s.reducedMotion);
  const p = palette[theme];

  const geometry = useMemo(
    () => ({
      slab: new RoundedBoxGeometry(W, H, D, 4, 0.12),
      label: new THREE.PlaneGeometry(1.9, 0.19),
      packet: new RoundedBoxGeometry(0.17, 0.17, 0.17, 2, 0.04),
      port: new THREE.CylinderGeometry(0.11, 0.11, 0.08, 24),
    }),
    [],
  );
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry]);

  const materials = useMemo(
    () => ({
      slab: new THREE.MeshStandardMaterial({ color: p.ceramic, roughness: 0.42, metalness: 0.05 }),
      db: new THREE.MeshStandardMaterial({ color: p.ceramicDark, roughness: 0.35, metalness: 0.2 }),
      band: new THREE.MeshStandardMaterial({ color: p.accent, roughness: 0.4 }),
      packet: new THREE.MeshStandardMaterial({
        color: p.accent,
        roughness: 0.35,
        emissive: p.accent,
        emissiveIntensity: 0.25,
      }),
      reply: new THREE.MeshStandardMaterial({ color: p.ink, roughness: 0.4 }),
      port: new THREE.MeshStandardMaterial({ color: p.ceramicDark, roughness: 0.5 }),
    }),
    [p],
  );
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  const [labels, setLabels] = useState<THREE.CanvasTexture[] | null>(null);
  useEffect(() => {
    let alive = true;
    let made: THREE.CanvasTexture[] = [];
    (async () => {
      const mono = cssFont("--font-martian");
      await loadFonts([`500 40px ${mono}`]);
      if (!alive) return;
      // Slab labels sit at the left edge; the database label is centred so it hugs the curved wall.
      made = [...LAYERS, "postgres"].map((text, i) =>
        canvasTexture(760, 76, (ctx) => {
          ctx.fillStyle = p.ink;
          ctx.globalAlpha = 0.72;
          ctx.font = `500 40px ${mono}`;
          ctx.textBaseline = "middle";
          ctx.textAlign = i < LAYERS.length ? "left" : "center";
          ctx.fillText(text, i < LAYERS.length ? 4 : 380, 40);
        }),
      );
      setLabels(made);
    })();
    return () => {
      alive = false;
      made.forEach((t) => t.dispose());
    };
  }, [p]);

  const spin = useRef<THREE.Group>(null);
  const slabs = useRef<(THREE.Group | null)[]>([]);
  const db = useRef<THREE.Group>(null);
  const requests = useRef<THREE.InstancedMesh>(null);
  const replies = useRef<THREE.InstancedMesh>(null);
  const explode = useRef<Spring>({ x: 0, v: 0 });
  const turn = useRef({ angle: -0.55, vel: 0, lastX: 0, lastTaps: 0, pinned: false });
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!active && explode.current.x < 0.001) return;
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;
    const tr = turn.current;

    if (input.taps !== tr.lastTaps) {
      tr.lastTaps = input.taps;
      if (active && input.touch) tr.pinned = !tr.pinned;
    }
    const dx = input.totalX - tr.lastX;
    tr.lastX = input.totalX;
    if (active && input.dragging) tr.vel = (dx * 0.009) / Math.max(dt, 1 / 120);
    else tr.vel *= Math.exp(-dt * 3);
    tr.angle += (active && input.dragging ? dx * 0.009 : tr.vel * dt) + (reduced || input.dragging ? 0 : dt * 0.12);
    if (spin.current) spin.current.rotation.y = tr.angle;

    const open = active && (input.hover || tr.pinned);
    const e = stepSpring(explode.current, open ? 1 : 0, 120, 16, dt);
    const gap = 0.92 + e * 0.62;
    const ys = [1.5 * gap - 0.15, 0.5 * gap - 0.15, -0.5 * gap - 0.15];
    slabs.current.forEach((g, i) => {
      if (g) g.position.y = ys[i];
    });
    const dbY = -1.5 * gap - 0.35;
    if (db.current) db.current.position.y = dbY;

    // Requests fall on one side, replies rise on the other.
    const top = ys[0] + 0.75;
    const bottom = dbY + 0.45;
    const speed = reduced ? 0 : 0.22;
    for (const [mesh, down] of [
      [requests.current, true],
      [replies.current, false],
    ] as const) {
      if (!mesh) continue;
      for (let k = 0; k < PACKETS; k++) {
        const phase = (t * speed + k / PACKETS) % 1;
        const u = down ? phase : 1 - phase;
        const edge = Math.min(phase, 1 - phase);
        dummy.position.set(down ? -0.95 : 0.95, top + (bottom - top) * u, down ? 0.35 : -0.35);
        dummy.rotation.set(t * 0.8 + k, t * 0.6 + k, 0);
        dummy.scale.setScalar(Math.min(1, edge * 12));
        dummy.updateMatrix();
        mesh.setMatrixAt(k, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0.25, 0]}>
      <group ref={spin} rotation-x={0.08}>
        {LAYERS.map((name, i) => (
          <group key={name} ref={(g) => void (slabs.current[i] = g)}>
            <mesh geometry={geometry.slab} material={materials.slab} />
            {labels && (
              <mesh geometry={geometry.label} position={[-W / 2 + 1.12, 0, D / 2 + 0.004]}>
                <meshBasicMaterial map={labels[i]} transparent depthWrite={false} toneMapped={false} />
              </mesh>
            )}
            {i === 0 &&
              [-1, 0, 1].map((j) => (
                <mesh
                  key={j}
                  geometry={geometry.port}
                  material={materials.port}
                  position={[j * 0.55 + 0.8, H / 2 + 0.03, -0.45]}
                />
              ))}
          </group>
        ))}
        <group ref={db}>
          <mesh material={materials.db}>
            <cylinderGeometry args={[1.3, 1.3, 0.9, 72]} />
          </mesh>
          {[-0.16, 0.16].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation-x={Math.PI / 2} material={materials.band}>
              <torusGeometry args={[1.305, 0.018, 12, 96]} />
            </mesh>
          ))}
          {labels && (
            <mesh geometry={geometry.label} position={[0, 0, 1.302]} scale={0.8}>
              <meshBasicMaterial map={labels[3]} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          )}
        </group>
        <instancedMesh ref={requests} args={[geometry.packet, materials.packet, PACKETS]} frustumCulled={false} />
        <instancedMesh ref={replies} args={[geometry.packet, materials.reply, PACKETS]} frustumCulled={false} />
      </group>
    </group>
  );
}
