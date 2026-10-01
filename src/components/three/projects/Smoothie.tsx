"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { ui, useStore } from "@/lib/store";
import { palette } from "@/lib/palette";
import { canvasTexture, makeGlassMaterial, stepSpring, type Spring } from "../helpers";
import type { ProjectObjectProps } from "./types";

/*
 * Smoothies Sultan: a glass of mango smoothie. The liquid is a shader that
 * discards everything above a tilted surface plane; dragging the glass moves
 * and spins it, and that motion sloshes the surface.
 */

const CUP: [number, number][] = [
  [0.001, 0],
  [0.8, 0],
  [0.86, 0.03],
  [0.9, 0.1],
  [1.14, 2.62],
  [1.155, 2.66],
  [1.14, 2.7],
  [1.11, 2.7],
  [1.095, 2.66],
  [0.86, 0.36],
  [0.001, 0.36],
];
const LIQUID: [number, number][] = [
  [0.001, 0.37],
  [0.845, 0.37],
  [1.078, 2.58],
];
const LEVEL = 2.02;

const liquidVertex = /* glsl */ `
varying vec3 vWorld;
varying vec3 vNormalW;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const liquidFragment = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uSurface;
uniform vec3 uFoam;
uniform vec3 uCenter;
uniform float uScale;
uniform float uLevel;
uniform vec2 uWobble;
varying vec3 vWorld;
varying vec3 vNormalW;
void main() {
  vec3 rel = (vWorld - uCenter) / uScale;
  float plane = uLevel + uWobble.x * rel.x + uWobble.y * rel.z;
  float depth = plane - rel.y;
  if (depth < 0.0) discard;
  vec3 col;
  if (gl_FrontFacing) {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vWorld);
    float diffuse = 0.62 + 0.38 * max(dot(n, normalize(vec3(0.5, 0.8, 0.6))), 0.0);
    float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
    col = uColor * diffuse + rim * 0.12;
    col *= mix(0.8, 1.0, smoothstep(0.3, 2.0, rel.y));
    col = mix(col, uFoam, smoothstep(0.06, 0.0, depth) * 0.85);
  } else {
    col = uSurface;
  }
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

function lathe(points: [number, number][], segments = 96) {
  return new THREE.LatheGeometry(
    points.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}

export default function Smoothie({ active, input }: ProjectObjectProps) {
  const theme = useStore(ui, (s) => s.theme);
  const reduced = useStore(ui, (s) => s.reducedMotion);
  const p = palette[theme];

  const geometry = useMemo(() => {
    const strawCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.28, 0.55, 0.12),
      new THREE.Vector3(0.42, 2.85, 0.2),
      new THREE.Vector3(0.66, 3.45, 0.27),
      new THREE.Vector3(1.02, 3.7, 0.3),
    ]);
    return {
      cup: lathe(CUP),
      liquid: lathe(LIQUID),
      straw: new THREE.TubeGeometry(strawCurve, 96, 0.075, 16, false),
      ice: new RoundedBoxGeometry(0.44, 0.44, 0.44, 3, 0.09),
    };
  }, []);
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry]);

  const stripes = useMemo(
    () =>
      // u runs along the straw, v around it: slanted bands wrap into a spiral.
      canvasTexture(128, 64, (ctx) => {
        ctx.fillStyle = "#f4f4f0";
        ctx.fillRect(0, 0, 128, 64);
        ctx.fillStyle = "#e2602f";
        for (const x of [-64, 0, 64, 128]) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + 26, 0);
          ctx.lineTo(x + 90, 64);
          ctx.lineTo(x + 64, 64);
          ctx.fill();
        }
      }),
    [],
  );
  useEffect(() => {
    stripes.wrapS = stripes.wrapT = THREE.RepeatWrapping;
    stripes.repeat.set(9, 1);
    return () => stripes.dispose();
  }, [stripes]);

  const liquidUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color() },
      uSurface: { value: new THREE.Color() },
      uFoam: { value: new THREE.Color() },
      uCenter: { value: new THREE.Vector3() },
      uScale: { value: 1 },
      uLevel: { value: 0.4 },
      uWobble: { value: new THREE.Vector2() },
    }),
    [],
  );
  useEffect(() => {
    const accent = new THREE.Color(p.accent);
    liquidUniforms.uColor.value.copy(accent).multiplyScalar(0.92);
    liquidUniforms.uSurface.value.copy(accent).lerp(new THREE.Color("#ffd2b8"), 0.35);
    liquidUniforms.uFoam.value.set("#ffe6d6");
  }, [p, liquidUniforms]);

  const materials = useMemo(
    () => ({
      liquid: new THREE.ShaderMaterial({
        uniforms: liquidUniforms,
        vertexShader: liquidVertex,
        fragmentShader: liquidFragment,
        side: THREE.DoubleSide,
      }),
      glass: makeGlassMaterial({ alpha: 0.05, edge: 0.55 }),
      ice: makeGlassMaterial({ alpha: 0.07, edge: 0.6 }),
      straw: new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.45 }),
    }),
    [liquidUniforms, stripes],
  );
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  const cup = useRef<THREE.Group>(null);
  const ice = useRef<(THREE.Mesh | null)[]>([]);
  const fill = useRef<Spring>({ x: 0.4, v: 0 });
  const slide = useRef<Spring>({ x: 0, v: 0 });
  const tilt = useRef<Spring>({ x: 0, v: 0 });
  const ctl = useRef({
    angle: 0.3,
    vel: 0,
    lastX: 0,
    offset: 0,
    wobble: new THREE.Vector2(),
    lastAngle: 0.3,
    lastSlide: 0,
    lastVx: 0,
    lastSpin: 0,
    wasActive: false,
    lastTaps: 0,
  });
  const worldPos = useMemo(() => new THREE.Vector3(), []);
  const worldScale = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const c = ctl.current;
    if (active && !c.wasActive) {
      fill.current.x = 0.4;
      fill.current.v = 0;
    }
    c.wasActive = active;
    const g = cup.current;
    if (!g) return;
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;

    const dx = input.totalX - c.lastX;
    c.lastX = input.totalX;
    if (active && input.dragging) {
      c.offset = THREE.MathUtils.clamp(c.offset + dx * 0.004, -0.9, 0.9);
      c.vel = (dx * 0.012) / Math.max(dt, 1 / 120);
      c.angle += dx * 0.012;
    } else {
      c.offset = 0;
      c.vel *= Math.exp(-dt * 2.5);
      c.angle += c.vel * dt + (reduced ? 0 : dt * 0.15);
    }
    if (active && input.taps !== c.lastTaps) {
      c.lastTaps = input.taps;
      c.vel += 9;
    }

    const x = stepSpring(slide.current, c.offset, 70, 9, dt);
    const lean = stepSpring(tilt.current, -slide.current.v * 0.08, 90, 10, dt);
    g.position.x = x;
    g.rotation.y = c.angle;
    g.rotation.z = THREE.MathUtils.clamp(lean, -0.35, 0.35);

    // Slosh: changes in sideways speed or spin kick the surface, which then rings down.
    // Steady motion (like the idle turn) leaves it flat.
    const vx = (x - c.lastSlide) / dt;
    const spin = (c.angle - c.lastAngle) / dt;
    const kickX = vx - c.lastVx;
    const kickSpin = spin - c.lastSpin;
    c.lastSlide = x;
    c.lastAngle = c.angle;
    c.lastVx = vx;
    c.lastSpin = spin;
    c.wobble.x = THREE.MathUtils.clamp(c.wobble.x - kickX * 0.06 + kickSpin * 0.01, -0.4, 0.4);
    c.wobble.y = THREE.MathUtils.clamp(c.wobble.y + kickSpin * 0.012, -0.4, 0.4);
    c.wobble.multiplyScalar(Math.exp(-dt * 1.4));
    liquidUniforms.uWobble.value.set(c.wobble.x * Math.sin(t * 8), c.wobble.y * Math.cos(t * 8));

    const level = stepSpring(fill.current, active ? LEVEL : 0.4, 30, 8, dt);
    liquidUniforms.uLevel.value = level;
    g.getWorldPosition(worldPos);
    g.getWorldScale(worldScale);
    liquidUniforms.uCenter.value.copy(worldPos);
    liquidUniforms.uScale.value = Math.max(worldScale.y, 1e-3);

    ice.current.forEach((m, i) => {
      if (!m) return;
      m.position.y = level - 0.12 + Math.sin(t * 1.4 + i * 2) * 0.03;
      m.rotation.set(0.3 + Math.sin(t * 0.7 + i) * 0.1, i * 1.3 + t * 0.1, 0.2);
      m.visible = level > 0.9;
    });
  });

  return (
    <group position={[0, -2.25, 0]} scale={1.3}>
      <group ref={cup}>
        <mesh geometry={geometry.liquid} material={materials.liquid} renderOrder={1} />
        <mesh geometry={geometry.straw} material={materials.straw} />
        {[
          [-0.36, 0.22],
          [0.3, -0.34],
        ].map(([ix, iz], i) => (
          <mesh
            key={i}
            ref={(m) => void (ice.current[i] = m)}
            geometry={geometry.ice}
            material={materials.ice}
            position={[ix, LEVEL, iz]}
            renderOrder={2}
          />
        ))}
        <mesh geometry={geometry.cup} material={materials.glass} renderOrder={3} />
      </group>
    </group>
  );
}
