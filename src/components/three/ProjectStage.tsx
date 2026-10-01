"use client";

import { useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { ui, useStore } from "@/lib/store";
import type { Slot } from "@/lib/stage";
import Studio from "./Studio";
import { stepSpring, usePointerInput, type Spring } from "./helpers";
import Layers from "./projects/Layers";
import Aperture from "./projects/Aperture";
import Paths from "./projects/Paths";
import Smoothie from "./projects/Smoothie";

// Same order as lib/projects.ts.
const OBJECTS = [Layers, Aperture, Paths, Smoothie];

/** Springs an object in (scale up while turning into place) and out again. */
function Presence({ show, instant, children }: { show: boolean; instant: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const s = useRef<Spring>({ x: instant && show ? 1 : 0, v: 0 });
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    const dt = Math.min(delta, 1 / 30);
    const value = stepSpring(s.current, show ? 1 : 0, show ? 80 : 160, show ? 12 : 22, dt);
    if (!show && value < 0.004) {
      s.current.x = 0;
      s.current.v = 0;
    }
    const v = Math.max(s.current.x, 0);
    g.visible = v > 0.004;
    g.scale.setScalar(v);
    g.rotation.y = (1 - Math.min(v, 1)) * (show ? -1.1 : 0.8);
  });
  return <group ref={ref}>{children}</group>;
}

export default function ProjectStage({ slot, mode }: { slot: Slot; mode: "stage" | "single" }) {
  const storeActive = useStore(ui, (s) => s.activeProject);
  const theme = useStore(ui, (s) => s.theme);
  const size = useThree((s) => s.size);
  const input = usePointerInput(slot.ref);
  const single = mode === "single";
  const active = single ? (slot.props?.project ?? 0) : storeActive;

  // Every object is built to fit inside a box about 6.4 units across.
  const aspect = size.width / Math.max(size.height, 1);
  const halfTan = Math.tan(THREE.MathUtils.degToRad(15));
  // A single object in a small square gets a little more air around it.
  const need = single ? 7.8 : 6.6;
  const distance = Math.max(need / (2 * halfTan), need / (2 * halfTan * aspect));

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={30}
        position={[0, distance * 0.2, distance]}
        onUpdate={(c) => c.lookAt(0, 0, 0)}
      />
      <Studio />
      {OBJECTS.map((Obj, i) =>
        single && i !== active ? null : (
          <Presence key={i} show={i === active} instant={single}>
            <Obj active={i === active} input={input} />
          </Presence>
        ),
      )}
      <ContactShadows
        position={[0, -2.45, 0]}
        scale={9}
        blur={2.6}
        far={4.5}
        resolution={256}
        opacity={theme === "dark" ? 0.7 : 0.38}
        color={theme === "dark" ? "#000000" : "#2a2a26"}
      />
    </>
  );
}
