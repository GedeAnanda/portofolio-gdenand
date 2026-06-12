"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus, Octahedron, Points, PointMaterial, Box } from "@react-three/drei";
import * as THREE from "three";

/* ===== Particle System ===== */
function Particles({ count = 300 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const [positions, originalPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return [pos, new Float32Array(pos)] as const;
  }, [count]);

  useFrame(({ pointer, clock }) => {
    mouseRef.current = { x: pointer.x * 4, y: pointer.y * 4 };
    if (!ref.current) return;
    const posArray = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const dx = posArray[ix] - mouseRef.current.x;
      const dy = posArray[ix + 1] - mouseRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2.5) {
        posArray[ix] += dx * 0.015;
        posArray[ix + 1] += dy * 0.015;
      } else {
        posArray[ix] += (originalPositions[ix] - posArray[ix]) * 0.008;
        posArray[ix + 1] += (originalPositions[ix + 1] - posArray[ix + 1]) * 0.008;
      }
      posArray[ix + 1] += Math.sin(t * 0.3 + i * 0.1) * 0.001;
      posArray[ix] += Math.cos(t * 0.2 + i * 0.15) * 0.0005;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ff6b2b"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.5}
      />
    </Points>
  );
}

/* ===== Grid Plane (backend/matrix aesthetic) ===== */
function GridPlane() {
  const ref = useRef<THREE.GridHelper>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.z = (clock.elapsedTime * 0.3) % 1;
    }
  });
  return (
    <gridHelper
      ref={ref}
      args={[20, 20, '#ff6b2b', '#1a1a1a']}
      position={[0, -3, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

/* ===== Server/Node Cluster ===== */
function ServerNodes() {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => [
    { pos: [-1.8, 0.8, 0] as [number, number, number], size: 0.25, color: "#ff6b2b" },
    { pos: [1.5, 1.2, -0.5] as [number, number, number], size: 0.2, color: "#60a5fa" },
    { pos: [0, -0.5, 1] as [number, number, number], size: 0.22, color: "#6c63ff" },
    { pos: [-0.8, 2, 0.5] as [number, number, number], size: 0.18, color: "#4ade80" },
    { pos: [2, -0.3, 0.8] as [number, number, number], size: 0.15, color: "#fbbf24" },
  ], []);

  // Connection lines between nodes
  const connections = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i].pos[0] - nodes[j].pos[0], 2) +
          Math.pow(nodes[i].pos[1] - nodes[j].pos[1], 2) +
          Math.pow(nodes[i].pos[2] - nodes[j].pos[2], 2)
        );
        if (dist < 3) {
          lines.push([
            new THREE.Vector3(...nodes[i].pos),
            new THREE.Vector3(...nodes[j].pos)
          ]);
        }
      }
    }
    return lines;
  }, [nodes]);

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      {connections.map((line, i) => {
        const points = line;
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({ color: "#ff6b2b", transparent: true, opacity: 0.15 });
        const lineObj = new THREE.Line(geo, mat);
        return (
          <primitive key={`line-${i}`} object={lineObj} />
        );
      })}

      {/* Server nodes */}
      {nodes.map((node, i) => (
        <Float key={i} speed={1.5 + i * 0.2} rotationIntensity={0.3} floatIntensity={0.6}>
          <group position={node.pos}>
            {/* Node cube */}
            <Box args={[node.size, node.size, node.size]}>
              <meshStandardMaterial
                color={node.color}
                emissive={node.color}
                emissiveIntensity={0.4}
                metalness={0.8}
                roughness={0.2}
              />
            </Box>
            {/* Glow */}
            <Sphere args={[node.size * 1.5, 16, 16]}>
              <meshBasicMaterial color={node.color} transparent opacity={0.05} />
            </Sphere>
          </group>
        </Float>
      ))}
    </group>
  );
}

/* ===== Main Geometry ===== */
function FloatingGeometry() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, pointer.y * 0.12, 0.04
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, pointer.x * 0.12, 0.04
    );
  });

  return (
    <group ref={groupRef}>
      {/* Central distorted sphere — the "core" */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
        <Sphere args={[1.3, 64, 64]} position={[0, 0.3, 0]}>
          <MeshDistortMaterial
            color="#111111"
            emissive="#ff6b2b"
            emissiveIntensity={0.12}
            roughness={0.2}
            metalness={0.9}
            distort={0.3}
            speed={1.5}
          />
        </Sphere>
      </Float>

      {/* Inner torus — orbit ring */}
      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={0.5}>
        <Torus args={[1.8, 0.015, 16, 100]} position={[0, 0.3, 0]} rotation={[0.6, 0.3, 0]}>
          <meshStandardMaterial
            color="#ff6b2b"
            emissive="#ff6b2b"
            emissiveIntensity={0.8}
            transparent
            opacity={0.5}
          />
        </Torus>
      </Float>

      {/* Outer torus — second orbit */}
      <Float speed={0.8} rotationIntensity={0.6} floatIntensity={0.3}>
        <Torus args={[2.5, 0.008, 16, 100]} position={[0, 0.3, 0]} rotation={[1.3, 0.8, 0.2]}>
          <meshStandardMaterial
            color="#6c63ff"
            emissive="#6c63ff"
            emissiveIntensity={0.6}
            transparent
            opacity={0.35}
          />
        </Torus>
      </Float>

      {/* Third orbit ring */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.4}>
        <Torus args={[2.2, 0.01, 16, 80]} position={[0, 0.3, 0]} rotation={[0.9, -0.5, 1.2]}>
          <meshStandardMaterial
            color="#4ade80"
            emissive="#4ade80"
            emissiveIntensity={0.5}
            transparent
            opacity={0.25}
          />
        </Torus>
      </Float>

      {/* Wireframe octahedron */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={1}>
        <Octahedron args={[0.35]} position={[2.8, 1.2, -0.5]}>
          <meshStandardMaterial
            color="#6c63ff"
            emissive="#6c63ff"
            emissiveIntensity={0.5}
            wireframe
          />
        </Octahedron>
      </Float>

      {/* Small wireframe box */}
      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={0.8}>
        <Box args={[0.3, 0.3, 0.3]} position={[-2.5, -0.5, 1]}>
          <meshStandardMaterial
            color="#ff6b2b"
            emissive="#ff6b2b"
            emissiveIntensity={0.4}
            wireframe
          />
        </Box>
      </Float>

      {/* Floating accent spheres */}
      {[
        { pos: [-2.2, 1.8, 0.8] as [number, number, number], color: "#4ade80", s: 0.08 },
        { pos: [2, -1, 1.2] as [number, number, number], color: "#60a5fa", s: 0.1 },
        { pos: [-1.5, -1.2, -0.8] as [number, number, number], color: "#fbbf24", s: 0.06 },
        { pos: [1.8, 2, -0.3] as [number, number, number], color: "#ff6b2b", s: 0.07 },
        { pos: [0.5, -2, 0.5] as [number, number, number], color: "#6c63ff", s: 0.09 },
        { pos: [-3, 0.3, -0.5] as [number, number, number], color: "#ff6b2b", s: 0.05 },
      ].map((dot, i) => (
        <Float key={i} speed={1.2 + i * 0.3} rotationIntensity={0.2} floatIntensity={1.2}>
          <Sphere args={[dot.s, 16, 16]} position={dot.pos}>
            <meshStandardMaterial
              color={dot.color}
              emissive={dot.color}
              emissiveIntensity={1}
            />
          </Sphere>
        </Float>
      ))}

      {/* Server nodes cluster */}
      <ServerNodes />
    </group>
  );
}

/* ===== Scene ===== */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, -4, 3]} color="#ff6b2b" intensity={3} distance={12} />
      <pointLight position={[4, 3, 3]} color="#6c63ff" intensity={1} distance={10} />
      <pointLight position={[-3, 4, -2]} color="#4ade80" intensity={0.5} distance={8} />
      <pointLight position={[0, 2, 5]} color="#ffffff" intensity={0.3} distance={10} />

      <FloatingGeometry />
      <Particles count={300} />
      <GridPlane />
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 6.5], fov: 48 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}
