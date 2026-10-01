"use client";

import { useEffect, type RefObject } from "react";
import * as THREE from "three";
import { Canvas, advance, useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useStore } from "@/lib/store";
import { frame, views, type Slot } from "@/lib/stage";
import PinField from "./PinField";
import ProjectStage from "./ProjectStage";
import Keyboard from "./Keyboard";
import PushButton from "./PushButton";

/** Views only paint their own rectangles, so wipe the whole canvas first. */
function ClearEachFrame() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear(true, true, false);
  }, -1);
  return null;
}

function SceneFor({ slot }: { slot: Slot }) {
  switch (slot.kind) {
    case "pins":
      return <PinField slot={slot} />;
    case "projects":
      return <ProjectStage slot={slot} mode="stage" />;
    case "project":
      return <ProjectStage slot={slot} mode="single" />;
    case "keyboard":
      return <Keyboard slot={slot} />;
    case "button":
      return <PushButton slot={slot} />;
  }
}

export default function Stage() {
  const slots = useStore(views, (s) => s.slots);

  useEffect(() => {
    frame.advance = (seconds) => advance(seconds);
    frame.needsFlush = true;
    return () => {
      frame.advance = null;
    };
  }, []);

  const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.5 : 2);

  return (
    <Canvas
      className="stage-canvas"
      eventSource={document.body}
      frameloop="never"
      dpr={dpr}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.NeutralToneMapping,
      }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      aria-hidden="true"
    >
      <ClearEachFrame />
      {slots.map((slot) => (
        <View key={slot.id} track={slot.ref as RefObject<HTMLElement>} index={slot.index}>
          <SceneFor slot={slot} />
        </View>
      ))}
    </Canvas>
  );
}
