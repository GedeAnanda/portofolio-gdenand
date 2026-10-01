"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ui, useStore } from "@/lib/store";
import { palette } from "@/lib/palette";
import { canvasTexture, clamp01, makeGlassMaterial, stepSpring, type Spring } from "../helpers";
import type { ProjectObjectProps } from "./types";

/*
 * LensLift: a camera lens. Dragging sideways twists the grip ring, which opens
 * and closes a nine-blade iris. Behind it a scan line sweeps the sensor, a nod
 * to the app's AI food-photo analysis.
 */

const BLADES = 9;
/** Opening radius when fully open (just inside the front plate) and fully closed. */
const R_OPEN = 1.06;
const R_CLOSED = 0.03;
/** Each blade sits slightly off-tangent, which gives the iris its pinwheel look. */
const TWIST = 0.32;
const RIDGES = 96;
const SENSOR_R = 1.58;

/**
 * One iris blade, lying flat. Its straight inner edge runs along x through the
 * origin; the body curves outwards (+y) and tucks under the front plate when open.
 */
function bladeGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-1.1, 0);
  s.lineTo(1.1, 0);
  s.quadraticCurveTo(1.15, 0.62, 0.3, 0.82);
  s.quadraticCurveTo(-0.6, 0.85, -1.1, 0.42);
  s.lineTo(-1.1, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false, curveSegments: 18 });
  g.rotateX(-Math.PI / 2);
  return g;
}

function barrelGeometry() {
  // Runs up the outside, across the front and back down the bore, so normals face out.
  const profile: [number, number][] = [
    [1.62, -1.1],
    [1.97, -1.1],
    [2.03, -1.02],
    [2.03, 0.83],
    [1.96, 0.9],
    [1.6, 0.9],
    [1.62, -1.1],
  ];
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    96,
  );
}

export default function Aperture({ active, input }: ProjectObjectProps) {
  const theme = useStore(ui, (s) => s.theme);
  const reduced = useStore(ui, (s) => s.reducedMotion);
  const p = palette[theme];

  const geometry = useMemo(
    () => ({
      blade: bladeGeometry(),
      barrel: barrelGeometry(),
      ridge: new THREE.BoxGeometry(0.09, 1.0, 0.05),
      plate: new THREE.RingGeometry(1.1, 1.62, 96).rotateX(-Math.PI / 2),
      sensor: new THREE.CircleGeometry(SENSOR_R, 72).rotateX(-Math.PI / 2),
      scan: new THREE.PlaneGeometry(1, 0.035).rotateX(-Math.PI / 2),
      dome: new THREE.SphereGeometry(3.2, 72, 18, 0, Math.PI * 2, 0, 0.52),
    }),
    [],
  );
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry]);

  const sensorTexture = useMemo(
    () =>
      canvasTexture(512, 512, (ctx) => {
        ctx.fillStyle = "#101010";
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = "rgba(255,255,255,0.07)";
        ctx.lineWidth = 2;
        for (let i = 0; i <= 512; i += 32) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 512);
          ctx.moveTo(0, i);
          ctx.lineTo(512, i);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.strokeRect(176, 176, 160, 160);
      }),
    [],
  );
  useEffect(() => () => sensorTexture.dispose(), [sensorTexture]);

  const materials = useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({ color: p.blade, roughness: 0.42, metalness: 0.6, side: THREE.DoubleSide }),
      ridge: new THREE.MeshStandardMaterial({ color: p.blade, roughness: 0.6, metalness: 0.4 }),
      blade: new THREE.MeshStandardMaterial({ color: "#56564f", roughness: 0.5, metalness: 0.25 }),
      metal: new THREE.MeshStandardMaterial({ color: p.metal, roughness: 0.22, metalness: 0.95 }),
      accent: new THREE.MeshStandardMaterial({ color: p.accent, roughness: 0.4 }),
      sensor: new THREE.MeshStandardMaterial({ map: sensorTexture, roughness: 0.35, metalness: 0.3 }),
      scan: new THREE.MeshBasicMaterial({ color: p.accent, toneMapped: false }),
      glass: makeGlassMaterial({ alpha: 0.03, edge: 0.32 }),
    }),
    [p, sensorTexture],
  );
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  const ridgeMesh = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = ridgeMesh.current;
    if (!mesh) return;
    const d = new THREE.Object3D();
    for (let k = 0; k < RIDGES; k++) {
      const a = (k / RIDGES) * Math.PI * 2;
      d.position.set(Math.cos(a) * 2.05, -0.22, Math.sin(a) * 2.05);
      d.rotation.set(0, -a, 0);
      d.updateMatrix();
      mesh.setMatrixAt(k, d.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  const blades = useRef<(THREE.Group | null)[]>([]);
  const ring = useRef<THREE.Group>(null);
  const scan = useRef<THREE.Mesh>(null);
  const open = useRef<Spring>({ x: 0, v: 0 });
  const twist = useRef<Spring>({ x: 0, v: 0 });
  const ctl = useRef({ target: 0.55, twist: 0, lastX: 0, lastTaps: 0, wasActive: false });

  useFrame((state, delta) => {
    const c = ctl.current;
    if (active && !c.wasActive) {
      // Each time the lens comes on stage it wakes up from closed.
      open.current.x = 0;
      open.current.v = 0;
      c.target = 0.55;
    }
    c.wasActive = active;
    if (!active) return;

    const dt = Math.min(delta, 1 / 30);
    const dx = input.totalX - c.lastX;
    c.lastX = input.totalX;
    if (input.dragging && dx !== 0) {
      c.target = clamp01(c.target + dx * 0.0035);
      c.twist += dx * 0.012;
    }
    if (input.taps !== c.lastTaps) {
      c.lastTaps = input.taps;
      c.target = c.target > 0.5 ? 0.08 : 0.9;
      c.twist += c.target > 0.5 ? 1.2 : -1.2;
    }

    const a = stepSpring(open.current, c.target, 60, 11, dt);
    const radius = R_CLOSED + (R_OPEN - R_CLOSED) * clamp01(a);
    blades.current.forEach((g, i) => {
      if (!g) return;
      // Slide each blade so its inner edge stays tangent to the opening circle.
      const theta = (i / BLADES) * Math.PI * 2;
      g.position.x = Math.cos(theta) * radius;
      g.position.z = Math.sin(theta) * radius;
    });
    stepSpring(twist.current, c.twist, 80, 14, dt);
    if (ring.current) ring.current.rotation.y = twist.current.x;

    if (scan.current) {
      const r = Math.max(0, (a - 0.25) / 0.75);
      scan.current.visible = r > 0.02;
      const z = reduced ? 0 : Math.sin(state.clock.elapsedTime * 1.7) * 0.95 * r;
      scan.current.position.z = z;
      scan.current.scale.x = 2 * Math.sqrt(Math.max(0, SENSOR_R * SENSOR_R - z * z)) * 0.98;
    }
  });

  return (
    <group rotation-y={0.55} position={[0, 0.1, 0]}>
      <group rotation-x={Math.PI / 2 + 0.38} scale={0.98}>
        <mesh geometry={geometry.barrel} material={materials.body} />
        <group ref={ring}>
          <instancedMesh ref={ridgeMesh} args={[geometry.ridge, materials.ridge, RIDGES]} />
          <mesh position={[0, 0.58, 0]} rotation-x={Math.PI / 2} material={materials.accent}>
            <torusGeometry args={[2.035, 0.026, 12, 128]} />
          </mesh>
        </group>
        <mesh position={[0, 0.9, 0]} rotation-x={Math.PI / 2} material={materials.metal}>
          <torusGeometry args={[1.8, 0.06, 16, 128]} />
        </mesh>
        <mesh geometry={geometry.plate} material={materials.body} position={[0, 0.84, 0]} />
        {Array.from({ length: BLADES }, (_, i) => {
          const theta = (i / BLADES) * Math.PI * 2;
          // Turn the blade's outward axis (+y of the shape, -z after rotateX) onto the radial direction.
          const facing = Math.atan2(-Math.cos(theta), -Math.sin(theta)) + TWIST;
          return (
            <group
              key={i}
              ref={(g) => void (blades.current[i] = g)}
              position={[Math.cos(theta) * R_OPEN, 0.56 + i * 0.006, Math.sin(theta) * R_OPEN]}
              rotation-y={facing}
            >
              <mesh geometry={geometry.blade} material={materials.blade} />
            </group>
          );
        })}
        <mesh geometry={geometry.sensor} material={materials.sensor} position={[0, -0.4, 0]} />
        <mesh ref={scan} geometry={geometry.scan} material={materials.scan} position={[0, -0.39, 0]} />
        <mesh geometry={geometry.dome} material={materials.glass} position={[0, 0.9 - 3.2 * Math.cos(0.52), 0]} />
      </group>
    </group>
  );
}
