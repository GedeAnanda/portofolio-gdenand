"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ui, useStore } from "@/lib/store";
import { palette } from "@/lib/palette";
import { isSlotVisible, signals, type Slot } from "@/lib/stage";
import Studio from "./Studio";
import { stepSpring, type Spring } from "./helpers";

const TRAVEL = 0.22;
const SCREWS: [number, number][] = [
  [-1.38, -1.38],
  [1.38, -1.38],
  [-1.38, 1.38],
  [1.38, 1.38],
];

function lathe(points: [number, number][], segments = 72) {
  return new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}

/**
 * An industrial push button. It has no pointer handlers of its own: a real
 * <button> sits on top of it in the DOM and drives it through the store.
 */
export default function PushButton({ slot }: { slot: Slot }) {
  const theme = useStore(ui, (s) => s.theme);
  const reduced = useStore(ui, (s) => s.reducedMotion);
  const size = useThree((s) => s.size);
  const p = palette[theme];

  const geometry = useMemo(
    () => ({
      plate: new RoundedBoxGeometry(3.5, 0.36, 3.5, 4, 0.22),
      // Lathe profiles run outside-up-inside so the generated normals face outwards.
      bezel: lathe([
        [1.39, 0],
        [1.37, 0.18],
        [1.3, 0.3],
        [1.16, 0.33],
        [1.05, 0.29],
        [1.02, 0.2],
        [1.02, 0],
      ]),
      cap: lathe([
        [0, -0.2],
        [0.985, -0.2],
        [0.985, 0.34],
        [0.97, 0.46],
        [0.9, 0.54],
        [0.75, 0.6],
        [0.45, 0.645],
        [0, 0.66],
      ]),
      ring: new THREE.RingGeometry(1.0, 1.12, 96),
    }),
    [],
  );
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry]);

  const materials = useMemo(
    () => ({
      plate: new THREE.MeshStandardMaterial({ color: p.body, roughness: 0.4, metalness: 0.5 }),
      bezel: new THREE.MeshStandardMaterial({ color: p.metal, roughness: 0.26, metalness: 0.92 }),
      cap: new THREE.MeshPhysicalMaterial({
        color: p.accent,
        roughness: 0.34,
        clearcoat: 0.9,
        clearcoatRoughness: 0.25,
      }),
      screw: new THREE.MeshStandardMaterial({ color: p.metal, roughness: 0.35, metalness: 0.9 }),
      slot: new THREE.MeshStandardMaterial({ color: "#111110", roughness: 0.8 }),
      pulse: new THREE.MeshBasicMaterial({ color: p.accent, transparent: true, opacity: 0, depthWrite: false }),
    }),
    [p],
  );
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  const cap = useRef<THREE.Mesh>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const root = useRef<THREE.Group>(null);
  const travel = useRef<Spring>({ x: 0, v: 0 });

  useFrame((_, delta) => {
    if (!isSlotVisible(slot.id)) return;
    const dt = Math.min(delta, 1 / 30);
    const now = performance.now();
    const state = ui.get().pushButton;
    const sincePress = now - signals.buttonPress;
    const pressed = state === "down" || sincePress < 140;
    stepSpring(travel.current, pressed ? 1 : state === "hover" ? 0.22 : 0, 520, 24, dt);
    if (cap.current) cap.current.position.y = 0.12 - travel.current.x * TRAVEL;

    if (pulse.current) {
      const k = sincePress / 900;
      const visible = k >= 0 && k < 1 && !reduced;
      pulse.current.visible = visible;
      if (visible) {
        // Expands from the bezel to the edge of the plate.
        pulse.current.scale.setScalar(1.24 + k * 0.32);
        materials.pulse.opacity = (1 - k) * (1 - k) * 0.8;
      }
    }

    if (root.current) {
      const px = reduced ? 0 : signals.pointer.x;
      const py = reduced ? 0 : signals.pointer.y;
      root.current.rotation.z += (-px * 0.06 - root.current.rotation.z) * 0.06;
      root.current.rotation.x += (-py * 0.05 - root.current.rotation.x) * 0.06;
    }
  });

  const aspect = size.width / Math.max(size.height, 1);
  const halfTan = Math.tan(THREE.MathUtils.degToRad(15));
  const distance = Math.max(5.2 / (2 * halfTan * Math.min(aspect, 1)), 8.2);
  const elevation = THREE.MathUtils.degToRad(58);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={30}
        position={[0, distance * Math.sin(elevation), distance * Math.cos(elevation)]}
        onUpdate={(c) => c.lookAt(0, 0.1, 0)}
      />
      <Studio keyPosition={[3, 8, 5]} />
      <group ref={root}>
        <mesh geometry={geometry.plate} material={materials.plate} position={[0, -0.18, 0]} />
        {SCREWS.map(([x, z]) => (
          <group key={`${x}${z}`} position={[x, 0.005, z]} rotation-y={(x * z) / 3}>
            <mesh material={materials.screw}>
              <cylinderGeometry args={[0.11, 0.11, 0.04, 24]} />
            </mesh>
            <mesh material={materials.slot} position={[0, 0.021, 0]}>
              <boxGeometry args={[0.15, 0.01, 0.025]} />
            </mesh>
          </group>
        ))}
        <mesh geometry={geometry.bezel} material={materials.bezel} />
        <mesh ref={cap} geometry={geometry.cap} material={materials.cap} position={[0, 0.12, 0]} />
        <mesh
          ref={pulse}
          geometry={geometry.ring}
          material={materials.pulse}
          position={[0, 0.006, 0]}
          rotation-x={-Math.PI / 2}
        />
      </group>
      <ContactShadows
        position={[0, -0.37, 0]}
        scale={7}
        blur={2.4}
        far={2}
        resolution={256}
        opacity={theme === "dark" ? 0.8 : 0.45}
        color={theme === "dark" ? "#000000" : "#2a2a26"}
      />
    </>
  );
}
