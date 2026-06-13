"use client";

import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

/* ================================================================
   PHYSICS CONSTANTS
   ================================================================ */
const NUM_SEGS   = 32;
const SEG_LEN    = 0.175;
const GRAVITY    = -22;
const DAMPING    = 0.991;
const CARD_W     = 2.6;
const CARD_H     = 3.8;
const CARD_DEPTH = 0.06;
const ANCHOR     = new THREE.Vector3(0.2, 5.8, 0);

/* ================================================================
   VERLET ROPE
   ================================================================ */
interface Pt { pos: THREE.Vector3; old: THREE.Vector3; pinned: boolean; }

function mkPt(x: number, y: number, pinned = false): Pt {
  return { pos: new THREE.Vector3(x, y, 0), old: new THREE.Vector3(x, y, 0), pinned };
}
function initRope(): Pt[] {
  return Array.from({ length: NUM_SEGS + 1 }, (_, i) =>
    mkPt(ANCHOR.x, ANCHOR.y, i === 0)
  );
}
function stepRope(pts: Pt[], dt: number, dragPos: THREE.Vector3 | null, iterations: number) {
  const d = Math.min(dt, 0.032);
  for (const p of pts) {
    if (p.pinned) continue;
    const vel = new THREE.Vector3().subVectors(p.pos, p.old).multiplyScalar(DAMPING);
    p.old.copy(p.pos);
    p.pos.add(vel);
    p.pos.y += GRAVITY * d * d;
  }
  if (dragPos) {
    const tip = pts[NUM_SEGS];
    tip.pos.lerp(dragPos, 0.5);
    tip.old.copy(tip.pos);
  }
  for (let iter = 0; iter < iterations; iter++) {
    pts[0].pos.copy(ANCHOR);
    for (let i = 0; i < NUM_SEGS; i++) {
      const a = pts[i], b = pts[i + 1];
      const diff = new THREE.Vector3().subVectors(b.pos, a.pos);
      const dist = diff.length();
      if (dist < 1e-7) continue;
      const corr = diff.multiplyScalar((dist - SEG_LEN) / dist * 0.5);
      if (!a.pinned) a.pos.add(corr);
      if (!b.pinned) b.pos.sub(corr);
    }
    pts[0].pos.copy(ANCHOR);
  }
}

/* ================================================================
   CARD CANVAS TEXTURE — big photo, premium badge
   ================================================================ */
async function buildCardTexture(photoSrc: string): Promise<THREE.CanvasTexture> {
  const W = 780, H = 1150;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d")!;

  /* --- Background --- */
  const bg = c.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1d1d21");
  bg.addColorStop(1, "#0c0c0f");
  c.fillStyle = bg;
  c.beginPath();
  if (c.roundRect) c.roundRect(0, 0, W, H, 36); else c.rect(0, 0, W, H);
  c.fill();

  /* --- Subtle grid --- */
  c.strokeStyle = "rgba(255,255,255,0.022)"; c.lineWidth = 1;
  for (let x = 0; x <= W; x += 44) { c.beginPath(); c.moveTo(x,0); c.lineTo(x,H); c.stroke(); }
  for (let y = 0; y <= H; y += 44) { c.beginPath(); c.moveTo(0,y); c.lineTo(W,y); c.stroke(); }

  /* --- Top orange bar --- */
  const topG = c.createLinearGradient(0, 0, W, 0);
  topG.addColorStop(0, "#ff6b2b"); topG.addColorStop(0.5, "#ffaa6b"); topG.addColorStop(1, "#ff6b2b");
  c.fillStyle = topG; c.fillRect(0, 0, W, 8);

  /* --- Lanyard hole + metal ring --- */
  c.fillStyle = "#090909";
  c.beginPath(); c.arc(W / 2, 58, 30, 0, Math.PI * 2); c.fill();
  const ringG = c.createRadialGradient(W/2-8, 50, 4, W/2, 58, 30);
  ringG.addColorStop(0, "#777"); ringG.addColorStop(1, "#333");
  c.strokeStyle = ringG; c.lineWidth = 4.5;
  c.beginPath(); c.arc(W / 2, 58, 30, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = "rgba(255,255,255,0.18)"; c.lineWidth = 1.5;
  c.beginPath(); c.arc(W/2 - 8, 50, 14, 0.8, 2.4); c.stroke();

  /* =============================================
     LOAD PHOTO
     ============================================= */
  const loaded = await new Promise<HTMLImageElement | null>((res) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => res(img);
    img.onerror = () => res(null);
    img.src = photoSrc;
  });

  /* =============================================
     BIG PHOTO — 68% of card height, full width
     ============================================= */
  const photoTop = 98;
  const photoH   = Math.round(H * 0.68);
  const photoBot = photoTop + photoH;

  c.save();
  c.beginPath();
  if (c.roundRect) c.roundRect(0, photoTop, W, photoH, 0);
  else c.rect(0, photoTop, W, photoH);
  c.clip();

  if (loaded) {
    const ar = loaded.width / loaded.height;
    const targetAR = W / photoH;
    let sx = 0, sy = 0, sw = loaded.width, sh = loaded.height;
    if (ar > targetAR) { sw = loaded.height * targetAR; sx = (loaded.width - sw) / 2; }
    else { sh = loaded.width / targetAR; sy = 0; }
    // ✅ Brightness + contrast boost
    c.filter = "brightness(1.85) contrast(1.05) saturate(1.1)";
    c.drawImage(loaded, sx, sy, sw, sh, 0, photoTop, W, photoH);
    c.filter = "none";
  } else {
    const fb = c.createLinearGradient(0, photoTop, 0, photoBot);
    fb.addColorStop(0, "#2a2a2e"); fb.addColorStop(1, "#141416");
    c.fillStyle = fb; c.fillRect(0, photoTop, W, photoH);
    c.fillStyle = "#ff6b2b"; c.font = `bold ${Math.round(photoH*0.4)}px Arial`;
    c.textAlign = "center"; c.fillText("N", W/2, photoTop + photoH * 0.65);
  }
  c.restore();

  // Strong bottom fade: photo → dark card bg
  const fadeH = 180;
  const fade = c.createLinearGradient(0, photoBot - fadeH, 0, photoBot);
  fade.addColorStop(0, "rgba(13,13,15,0)");
  fade.addColorStop(1, "rgba(13,13,15,1)");
  c.fillStyle = fade;
  c.fillRect(0, photoBot - fadeH, W, fadeH + 2);

  // Orange accent left bar
  c.fillStyle = "rgba(255,107,43,0.7)"; c.fillRect(0, photoTop, 5, photoH);
  c.fillStyle = "rgba(255,107,43,0.25)"; c.fillRect(W - 5, photoTop, 5, photoH);

  /* =============================================
     NAME + ROLE overlaid on bottom of photo
     ============================================= */
  const overlayY = photoBot - 170;

  c.shadowColor = "rgba(0,0,0,0.9)"; c.shadowBlur = 20; c.shadowOffsetY = 3;
  c.fillStyle = "#ffffff"; c.font = "bold 68px Arial, sans-serif"; c.textAlign = "left";
  c.fillText("Nanda", 44, overlayY);
  c.shadowColor = "transparent"; c.shadowBlur = 0; c.shadowOffsetY = 0;

  c.fillStyle = "#ff6b2b";
  c.beginPath();
  if (c.roundRect) c.roundRect(44, overlayY + 14, 268, 40, 20);
  else c.rect(44, overlayY + 14, 268, 40);
  c.fill();
  c.fillStyle = "#fff"; c.font = "bold 15px monospace"; c.textAlign = "left";
  c.fillText("BACKEND ENGINEER", 70, overlayY + 40);

  /* =============================================
     INFO SECTION (bottom ~30%)
     ============================================= */
  const infoTop = photoBot + 10;

  c.fillStyle = "#777"; c.font = "15px monospace"; c.textAlign = "center";
  c.fillText("Telkom University  ·  Bandung, ID", W / 2, infoTop + 22);

  const dg = c.createLinearGradient(60, 0, W-60, 0);
  dg.addColorStop(0,"transparent"); dg.addColorStop(0.3,"#2e2e38");
  dg.addColorStop(0.7,"#2e2e38"); dg.addColorStop(1,"transparent");
  c.strokeStyle = dg; c.lineWidth = 1;
  c.beginPath(); c.moveTo(60, infoTop + 38); c.lineTo(W-60, infoTop + 38); c.stroke();

  const rows = [
    { k: "Stack",  v: "Go · Node.js · PostgreSQL" },
    { k: "Also",   v: "Swift · React · Python"    },
    { k: "Status", v: "Active Builder 🟢"         },
  ];
  rows.forEach(({ k, v }, i) => {
    const ry = infoTop + 50 + i * 54;
    c.fillStyle = "rgba(255,255,255,0.03)";
    c.beginPath();
    if (c.roundRect) c.roundRect(44, ry, W-88, 44, 8); else c.rect(44, ry, W-88, 44);
    c.fill();
    c.fillStyle = "#4a4a5a"; c.font = "13px monospace"; c.textAlign = "left";
    c.fillText(k, 66, ry + 28);
    c.fillStyle = "#d8d8e0"; c.font = "bold 13px monospace"; c.textAlign = "right";
    c.fillText(v, W - 66, ry + 28);
  });

  const bcY = infoTop + 50 + rows.length * 54 + 8;
  const bars = [3,1,4,1,5,9,2,6,5,3,3,8,4,6,2,6,4,3,3,8,2,7,1,3,2,1,4,2,1,3];
  let bx = 44;
  bars.forEach((w, idx) => {
    const bw = w * 3.8 + 1.2;
    c.fillStyle = idx % 2 === 0 ? `rgba(255,107,43,${0.4 + (idx%7)*0.08})` : "rgba(255,255,255,0.03)";
    c.fillRect(bx, bcY, bw, 30);
    bx += bw + 2.2;
  });
  c.fillStyle = "#333"; c.font = "11px monospace"; c.textAlign = "center";
  c.fillText("NDA · 2026 · BE · 001", W/2, bcY + 48);

  c.strokeStyle = "rgba(255,107,43,0.22)"; c.lineWidth = 2;
  c.beginPath();
  if (c.roundRect) c.roundRect(1,1,W-2,H-2,36); else c.rect(1,1,W-2,H-2);
  c.stroke();

  return new THREE.CanvasTexture(cv);
}

/* ================================================================
   ROPE LINE — thick fabric lanyard using drei Line (fat line)
   ================================================================ */
function LanyardRope({ ptsRef }: { ptsRef: React.RefObject<Pt[]> }) {
  const [points, setPoints] = useState<THREE.Vector3[]>(() =>
    Array.from({ length: NUM_SEGS + 1 }, (_, i) =>
      new THREE.Vector3(ANCHOR.x, ANCHOR.y - i * SEG_LEN, 0)
    )
  );

  useFrame(() => {
    if (!ptsRef.current) return;
    setPoints(ptsRef.current.map((p) => p.pos.clone()));
  });

  if (points.length < 2) return null;

  return (
    <>
      {/* Main lanyard band — thick, fabric orange */}
      <Line
        points={points}
        lineWidth={8}
        color="#c85a20"
      />
      {/* Second highlight stripe — lighter center line */}
      <Line
        points={points}
        lineWidth={2.5}
        color="#ff9557"
        transparent
        opacity={0.7}
      />
    </>
  );
}

/* ================================================================
   MAIN SCENE
   ================================================================ */
function Scene({ cardTex, isDesktop }: { cardTex: THREE.CanvasTexture | null, isDesktop: boolean }) {
  const { camera, gl } = useThree();
  const ptsRef = useRef<Pt[]>(initRope());
  const cardRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const clipRef = useRef<THREE.Mesh>(null);
  const dragRef = useRef<{ active: boolean; pos: THREE.Vector3 }>({
    active: false, pos: new THREE.Vector3(),
  });
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const raycaster  = useMemo(() => new THREE.Raycaster(), []);

  const clientToNDC = useCallback((cx: number, cy: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      ((cx - rect.left) / rect.width) * 2 - 1,
      -((cy - rect.top) / rect.height) * 2 + 1,
    );
  }, [gl]);

  const ndcToWorld = useCallback((ndc: THREE.Vector2): THREE.Vector3 => {
    raycaster.setFromCamera(ndc, camera);
    const pt = new THREE.Vector3();
    raycaster.ray.intersectPlane(dragPlane.current, pt);
    return pt;
  }, [camera, raycaster]);

  const hitCard = useCallback((ndc: THREE.Vector2): boolean => {
    if (!cardRef.current) return false;
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObject(cardRef.current).length > 0;
  }, [camera, raycaster]);

  useEffect(() => {
    const el = gl.domElement;
    const start = (cx: number, cy: number) => {
      const ndc = clientToNDC(cx, cy);
      if (!hitCard(ndc)) return;
      dragRef.current.active = true;
      dragRef.current.pos.copy(ndcToWorld(ndc));
      el.style.cursor = "grabbing";
    };
    const move = (cx: number, cy: number) => {
      const ndc = clientToNDC(cx, cy);
      if (!dragRef.current.active) {
        el.style.cursor = hitCard(ndc) ? "grab" : "default";
        return;
      }
      dragRef.current.pos.copy(ndcToWorld(ndc));
    };
    const end = () => { dragRef.current.active = false; el.style.cursor = "default"; };

    const md = (e: MouseEvent) => start(e.clientX, e.clientY);
    const mm = (e: MouseEvent) => move(e.clientX, e.clientY);
    const ts = (e: TouchEvent) => { const t = e.touches[0]; if (t) start(t.clientX, t.clientY); };
    const tm = (e: TouchEvent) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); };

    el.addEventListener("mousedown", md);
    el.addEventListener("mousemove", mm);
    el.addEventListener("mouseup", end);
    el.addEventListener("touchstart", ts, { passive: true });
    el.addEventListener("touchmove", tm, { passive: true });
    el.addEventListener("touchend", end);
    return () => {
      el.removeEventListener("mousedown", md);
      el.removeEventListener("mousemove", mm);
      el.removeEventListener("mouseup", end);
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchmove", tm);
      el.removeEventListener("touchend", end);
    };
  }, [gl, clientToNDC, ndcToWorld, hitCard]);

  /* Hint swing — push left first, card swings right and settles */
  useEffect(() => {
    const t = setTimeout(() => {
      const pts = ptsRef.current;
      for (let i = 6; i <= NUM_SEGS; i++) {
        const frac = (i - 6) / (NUM_SEGS - 6);
        pts[i].old.x += frac * 2.8;
      }
    }, 600);
    return () => clearTimeout(t);
  }, []);

  useFrame((_, delta) => {
    const pts = ptsRef.current;
    stepRope(pts, delta, dragRef.current.active ? dragRef.current.pos : null, isDesktop ? 28 : 12);

    const tip  = pts[NUM_SEGS];
    const prev = pts[NUM_SEGS - 5];

    if (cardRef.current) {
      cardRef.current.position.set(tip.pos.x, tip.pos.y - CARD_H / 2, 0);
      const dir   = new THREE.Vector3().subVectors(tip.pos, prev.pos);
      const angle = Math.atan2(dir.x, -dir.y);
      cardRef.current.rotation.z = THREE.MathUtils.lerp(
        cardRef.current.rotation.z, angle * 0.6, 0.1
      );
    }
    if (ringRef.current && cardRef.current) {
      ringRef.current.position.set(tip.pos.x, tip.pos.y + 0.02, 0.04);
      ringRef.current.rotation.z = cardRef.current.rotation.z;
    }
    if (clipRef.current && cardRef.current) {
      clipRef.current.position.set(tip.pos.x, tip.pos.y - 0.12, 0.04);
      clipRef.current.rotation.z = cardRef.current.rotation.z;
    }
  });

  return (
    <>
      {/* Lighting — dramatic + warm */}
      <ambientLight intensity={0.35} />
      <pointLight position={[4,  7, 6]}  color="#ff6b2b" intensity={8}  distance={20} />
      <pointLight position={[-5, 3, 5]}  color="#6c63ff" intensity={3}  distance={14} />
      <pointLight position={[0, -4, 8]}  color="#ffffff" intensity={2.5} distance={12} />
      <pointLight position={[2, 2, 4]}   color="#ffcc88" intensity={1.5} distance={10} />

      {/* Anchor ceiling pin */}
      <mesh position={ANCHOR}>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 12]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Pin cap */}
      <mesh position={[ANCHOR.x, ANCHOR.y + 0.14, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ff6b2b" emissive="#ff6b2b" emissiveIntensity={0.8} metalness={0.5} roughness={0.2} />
      </mesh>
      {/* Pin glow */}
      <mesh position={[ANCHOR.x, ANCHOR.y + 0.14, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#ff6b2b" transparent opacity={0.1} />
      </mesh>

      {/* Thick fabric lanyard rope */}
      <LanyardRope ptsRef={ptsRef} />

      {/* Metal D-ring where lanyard meets card */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.12, 0.032, 14, 40]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.96} roughness={0.04}
          envMapIntensity={1} />
      </mesh>

      {/* Clip body */}
      <mesh ref={clipRef}>
        <boxGeometry args={[0.22, 0.28, 0.06]} />
        <meshStandardMaterial color="#999" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Card — the big draggable ID badge */}
      <mesh ref={cardRef} castShadow receiveShadow>
        <boxGeometry args={[CARD_W, CARD_H, CARD_DEPTH]} />
        {cardTex
          ? <meshStandardMaterial map={cardTex} roughness={0.18} metalness={0.22} envMapIntensity={0.4} />
          : <meshStandardMaterial color="#1a1a1e" roughness={0.4} metalness={0.15} />
        }
      </mesh>

      {/* Card edge glow */}
      {cardRef.current && (
        <mesh
          position={cardRef.current.position}
          rotation={cardRef.current.rotation}
        >
          <boxGeometry args={[CARD_W + 0.04, CARD_H + 0.04, CARD_DEPTH + 0.005]} />
          <meshBasicMaterial color="#ff6b2b" transparent opacity={0.04} side={THREE.BackSide} />
        </mesh>
      )}
    </>
  );
}

/* ================================================================
   EXPORTED COMPONENT
   ================================================================ */
export default function LanyardCard3D({ isDesktop }: { isDesktop: boolean }) {
  const [cardTex, setCardTex] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    buildCardTexture("/avatar.jpg").then(setCardTex);
  }, []);

  return (
    <div
      className="w-full h-full select-none"
      aria-label="Interactive lanyard card — drag to swing"
    >
      <Canvas
        camera={{ position: [0.2, 1, 13], fov: 38 }}
        dpr={isDesktop ? [1, 1.5] : [1, 1]}
        gl={{ antialias: isDesktop, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene cardTex={cardTex} isDesktop={isDesktop} />
      </Canvas>
    </div>
  );
}
