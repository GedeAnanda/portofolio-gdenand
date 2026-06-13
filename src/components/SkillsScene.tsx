"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { skills, categoryColors } from "@/lib/skills";

interface SkillNodeProps {
  name: string;
  position: [number, number, number];
  color: string;
  proficiency: number;
}

function SkillNode({ name, position, color, proficiency }: SkillNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.08;
    if (glowRef.current) {
      glowRef.current.scale.setScalar(hovered ? 2.5 : 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2);
    }
  });

  return (
    <group>
      {/* Glow */}
      <mesh ref={glowRef} position={position}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {/* Core sphere */}
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.5 : 0.8}
        />
      </mesh>

      {/* Tooltip */}
      {hovered && (
        <Html position={[position[0], position[1] + 0.4, position[2]]} center>
          <div
            className="glass-strong rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none"
            style={{ minWidth: "120px" }}
          >
            <p className="text-xs font-semibold text-[var(--text-primary)]">{name}</p>
            <div className="mt-1.5 w-full h-1 bg-[var(--surface)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${proficiency}%`, background: color }}
              />
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">{proficiency}%</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function CategoryLines() {
  const categories = Object.keys(categoryColors);

  return (
    <>
      {categories.map((cat) => {
        const catSkills = skills.filter((s) => s.category === cat);
        const lines: [number, number, number][][] = [];

        for (let i = 0; i < catSkills.length; i++) {
          for (let j = i + 1; j < catSkills.length; j++) {
            lines.push([catSkills[i].position, catSkills[j].position]);
          }
        }

        return lines.map((points, i) => (
          <Line
            key={`${cat}-${i}`}
            points={points}
            color={categoryColors[cat]}
            lineWidth={0.5}
            transparent
            opacity={0.15}
          />
        ));
      })}
    </>
  );
}

function ConstellationScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />

      <group ref={groupRef}>
        <CategoryLines />
        {skills.map((skill) => (
          <SkillNode
            key={skill.name}
            name={skill.name}
            position={skill.position}
            color={skill.color}
            proficiency={skill.proficiency}
          />
        ))}
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
      />
    </>
  );
}

export default function SkillsScene({ isDesktop = true }: { isDesktop?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      dpr={isDesktop ? [1, 2] : [1, 1]}
      gl={{ antialias: isDesktop, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ConstellationScene />
    </Canvas>
  );
}
