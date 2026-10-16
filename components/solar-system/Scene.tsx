"use client";
import { useEffect, useMemo, useRef, useState, type ElementRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Planet } from "@/types";
import { PLANETS } from "@/lib/planets/data";

type Controls = ElementRef<typeof OrbitControls>;
type Positions = MutableRefObject<Record<string, THREE.Vector3>>;
const HOME = new THREE.Vector3(0, 48, 78);

function PlanetBody({ planet, index, selected, hovered, setHovered, onSelect, paused, showLabels, positions }: {
  planet: Planet; index: number; selected: boolean; hovered: boolean; setHovered: (s: string | null) => void;
  onSelect: (s: string) => void; paused: MutableRefObject<boolean>; showLabels: boolean; positions: Positions;
}) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const angle = useRef(index * 1.1);
  const { radius, orbit, speed } = planet.vis;
  useFrame((_, dt) => {
    if (!paused.current) { angle.current += dt * speed * 0.25; if (mesh.current) mesh.current.rotation.y += dt * 0.6; }
    const g = group.current; if (!g) return;
    g.position.set(Math.cos(angle.current) * orbit, 0, Math.sin(angle.current) * orbit);
    positions.current[planet.slug]?.copy(g.position);
  });
  const glow = selected ? 0.5 : hovered ? 0.3 : 0;
  return (
    <group ref={group}>
      <mesh ref={mesh} onClick={(e) => { e.stopPropagation(); onSelect(planet.slug); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(planet.slug); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(null); document.body.style.cursor = ""; }}>
        <sphereGeometry args={[radius, 40, 40]} />
        <meshStandardMaterial color={planet.colors[0]} emissive={planet.colors[0]} emissiveIntensity={glow} roughness={0.85} />
      </mesh>
      {planet.rings && (
        <mesh rotation={[-Math.PI / 2 + 0.45, 0, 0]}>
          <ringGeometry args={[radius * 1.35, radius * 2.2, 64]} />
          <meshBasicMaterial color="#e6d3a3" side={THREE.DoubleSide} transparent opacity={0.65} />
        </mesh>
      )}
      {(showLabels || selected || hovered) && <Html position={[0, radius + 0.9, 0]} center distanceFactor={40} style={{ pointerEvents: "none" }}><span className="whitespace-nowrap rounded bg-black/60 px-2 py-0.5 text-xs text-white">{planet.name}</span></Html>}
    </group>
  );
}

function Rig({ selected, resetKey, positions, transition, controls }: { selected: string | null; resetKey: number; positions: Positions; transition: MutableRefObject<boolean>; controls: MutableRefObject<Controls | null> }) {
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const want = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => { transition.current = true; }, [selected, resetKey, transition]);
  useFrame(({ camera }) => {
    const c = controls.current; if (!c) return;
    const p = selected ? positions.current[selected] : null;
    const pl = selected ? PLANETS.find((x) => x.slug === selected) : null;
    const goal = p ?? tmp.set(0, 0, 0);
    if (transition.current) {
      c.target.lerp(goal, 0.08);
      if (p && pl) { const d = pl.vis.radius * 4 + 3; want.copy(p).normalize().multiplyScalar(d).add(p); want.y += d * 0.4; } else want.copy(HOME);
      camera.position.lerp(want, 0.06);
      if (c.target.distanceTo(goal) < 0.05 && camera.position.distanceTo(want) < 0.3) transition.current = false;
    } else if (p) {
      const delta = tmp.copy(p).sub(c.target); c.target.add(delta); camera.position.add(delta);
    }
    c.update();
  });
  return null;
}

export interface SceneProps { selected: string | null; onSelect: (s: string | null) => void; paused: boolean; showOrbits: boolean; showLabels: boolean; resetKey: number; onContextLost: () => void }

export default function Scene({ selected, onSelect, paused, showOrbits, showLabels, resetKey, onContextLost }: SceneProps) {
  const pausedRef = useRef(paused); pausedRef.current = paused;
  const transition = useRef(true);
  const controls = useRef<Controls | null>(null);
  const positions = useRef<Record<string, THREE.Vector3>>(Object.fromEntries(PLANETS.map((p) => [p.slug, new THREE.Vector3(p.vis.orbit, 0, 0)])));
  return (
    <Canvas camera={{ position: [0, 48, 78], fov: 50, far: 600 }} dpr={[1, 2]} onPointerMissed={() => onSelect(null)}
      onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); onContextLost(); })}>
      <color attach="background" args={["#03050c"]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 0]} intensity={4000} decay={2} />
      <Stars radius={250} depth={60} count={4000} factor={5} fade speed={pausedRef.current ? 0 : 0.5} />
      <mesh><sphereGeometry args={[4, 48, 48]} /><meshBasicMaterial color="#ffb347" /></mesh>
      {showOrbits && PLANETS.map((p) => (
        <mesh key={p.slug} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[p.vis.orbit - 0.03, p.vis.orbit + 0.03, 128]} /><meshBasicMaterial color="#3b82f6" transparent opacity={0.25} side={THREE.DoubleSide} /></mesh>
      ))}
      <HoverPlanets selected={selected} onSelect={(s) => onSelect(s)} paused={pausedRef} showLabels={showLabels} positions={positions} />
      <OrbitControls ref={controls} enablePan={false} minDistance={3} maxDistance={160} enableDamping onStart={() => { transition.current = false; }} />
      <Rig selected={selected} resetKey={resetKey} positions={positions} transition={transition} controls={controls} />
    </Canvas>
  );
}

function HoverPlanets({ selected, onSelect, paused, showLabels, positions }: { selected: string | null; onSelect: (s: string) => void; paused: MutableRefObject<boolean>; showLabels: boolean; positions: Positions }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return <>{PLANETS.map((p, i) => <PlanetBody key={p.slug} planet={p} index={i} selected={selected === p.slug} hovered={hovered === p.slug} setHovered={setHovered} onSelect={onSelect} paused={paused} showLabels={showLabels} positions={positions} />)}</>;
}
