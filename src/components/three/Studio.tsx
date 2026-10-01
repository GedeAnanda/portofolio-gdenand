"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { ui, useStore } from "@/lib/store";
import { palette } from "@/lib/palette";

/**
 * Shared product-shot lighting: a key light, a cool rim and a procedural
 * environment built from light panels, so no HDR file is downloaded.
 */
export default function Studio({ keyPosition = [4, 7, 6] }: { keyPosition?: [number, number, number] }) {
  const theme = useStore(ui, (s) => s.theme);
  const p = palette[theme];

  return (
    <>
      <hemisphereLight args={[p.hemiSky, p.hemiGround, p.hemi]} />
      <directionalLight position={keyPosition} intensity={p.key} color="#fff3e6" />
      <directionalLight position={[-6, 3, -5]} intensity={p.rim} color="#e2e9ff" />
      <Environment resolution={128} frames={1} environmentIntensity={p.env}>
        <Lightformer form="rect" intensity={3} position={[0, 6, 1]} rotation-x={Math.PI / 2} scale={[12, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-7, 1.5, 2]} rotation-y={Math.PI / 2} scale={[6, 9, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[7, 0, -1]} rotation-y={-Math.PI / 2} scale={[5, 9, 1]} />
        <Lightformer form="ring" intensity={0.8} position={[0, 1, 8]} scale={4} />
      </Environment>
    </>
  );
}
