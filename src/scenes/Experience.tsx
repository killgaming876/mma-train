import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const RED = '#ff334d';
const RED_HOT = '#ff6878';
const BONE = '#d9d4c7';
const BONE_DARK = '#7f796d';
const VOID = '#040607';

function ParticleField({ count = 1800, color = '#ff3b52' }: { count?: number; color?: string }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 4 + Math.pow(Math.random(), 0.5) * 11;
      const theta = Math.random() * Math.PI * 2;
      values[i * 3] = Math.cos(theta) * radius;
      values[i * 3 + 1] = (Math.random() - 0.5) * 12;
      values[i * 3 + 2] = Math.sin(theta) * radius - 4;
    }
    return values;
  }, [count]);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [positions]);
  const material = useMemo(() => new THREE.PointsMaterial({ color, size: 0.019, transparent: true, opacity: 0.34, depthWrite: false, blending: THREE.AdditiveBlending }), [color]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.006;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.035;
    ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.16;
    ref.current.position.y = Math.cos(state.clock.elapsedTime * 0.09) * 0.08;
  });
  return <points ref={ref} geometry={geometry} material={material} frustumCulled />;
}

function ArenaGrid({ anatomy = false }: { anatomy?: boolean }) {
  return <>
    <gridHelper args={[28, 28, anatomy ? RED : '#5e181f', '#171a1b']} position={[0, -3.35, 0]} />
    <mesh position={[0, 1.8, -6]} rotation={[0, 0, 0]}>
      <planeGeometry args={[22, 13]} />
      <meshBasicMaterial color={anatomy ? '#0b0c0d' : '#0a0c0d'} transparent opacity={0.95} />
    </mesh>
  </>;
}

function FloatingRing({ color = RED }: { color?: string }) {
  return <Float speed={0.7} rotationIntensity={0.12} floatIntensity={0.35}><mesh rotation={[Math.PI / 2, 0, 0]} position={[3.2, 0.7, -1.5]}><torusGeometry args={[1.8, 0.02, 12, 120]} /><meshBasicMaterial color={color} transparent opacity={0.72} blending={THREE.AdditiveBlending} /></mesh></Float>;
}

function DojoScene({ anatomy = false }: { anatomy?: boolean }) {
  return <>
    <color attach="background" args={[anatomy ? '#040607' : '#050607']} />
    <fog attach="fog" args={[anatomy ? '#040607' : '#050607', 5, 24]} />
    <ambientLight intensity={0.54} color="#a6a09a" />
    <directionalLight position={[4, 8, 4]} intensity={2.4} color="#ffe3d8" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <pointLight position={[4, 4, 2]} intensity={9} distance={14} color={RED} />
    <pointLight position={[-5, 1, 3]} intensity={4} distance={11} color="#ffab98" />
    <pointLight position={[0, 4, -4]} intensity={2.5} distance={12} color="#6c1c29" />
    <ParticleField count={anatomy ? 2400 : 1800} color={anatomy ? '#ff4458' : '#ff596a'} />
    <ArenaGrid anatomy={anatomy} />
    {!anatomy && <FloatingRing color={RED} />}
  </>;
}

function BoneMaterial({ dark = false }: { dark?: boolean }) {
  return <meshPhysicalMaterial
    color={dark ? BONE_DARK : BONE}
    metalness={0.12}
    roughness={0.46}
    clearcoat={0.24}
    clearcoatRoughness={0.35}
    emissive="#2b0d12"
    emissiveIntensity={dark ? 0.12 : 0.06}
  />;
}

function BoneSegment({ start, end, radius, dark = false }: { start: THREE.Vector3; end: THREE.Vector3; radius: number; dark?: boolean }) {
  const midpoint = useMemo(() => start.clone().add(end).multiplyScalar(0.5), [start, end]);
  const direction = useMemo(() => end.clone().sub(start), [start, end]);
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()), [direction]);
  const length = direction.length();
  return <mesh position={midpoint} quaternion={quaternion} castShadow>
    <cylinderGeometry args={[radius * 0.92, radius, length, 14, 1]} />
    <BoneMaterial dark={dark} />
  </mesh>;
}

function Joint({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return <mesh position={position} scale={scale} castShadow><sphereGeometry args={[0.16, 18, 14]} /><BoneMaterial /></mesh>;
}

function Skull({ onSelect, selected }: { onSelect: (id: string) => void; selected: string | null }) {
  return <group>
    <mesh position={[0, 4.34, 0]} scale={[0.76, 0.9, 0.62]} castShadow onClick={() => onSelect('jaw')}>
      <sphereGeometry args={[1, 28, 22]} />
      <BoneMaterial />
    </mesh>
    <mesh position={[0, 3.98, 0.34]} scale={[0.56, 0.42, 0.28]} castShadow>
      <sphereGeometry args={[1, 24, 16]} />
      <BoneMaterial dark />
    </mesh>
    <mesh position={[-0.28, 4.38, 0.55]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.09, 0.025, 10, 28]} /><meshBasicMaterial color={selected === 'jaw' ? RED_HOT : RED} /></mesh>
    <mesh position={[0.28, 4.38, 0.55]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.09, 0.025, 10, 28]} /><meshBasicMaterial color={selected === 'jaw' ? RED_HOT : RED} /></mesh>
    <mesh position={[0, 3.98, 0.47]} scale={[0.16, 0.07, 0.08]}><sphereGeometry args={[1, 12, 10]} /><BoneMaterial dark /></mesh>
  </group>;
}

function RibCage({ onSelect, selected }: { onSelect: (id: string) => void; selected: string | null }) {
  const ribs = useMemo(() => {
    const values: Array<{ y: number; width: number; depth: number }> = [];
    for (let i = 0; i < 7; i += 1) values.push({ y: 3.22 - i * 0.27, width: 1.15 - i * 0.045, depth: 0.3 + i * 0.015 });
    return values;
  }, []);
  return <group>
    <BoneSegment start={new THREE.Vector3(0, 3.52, 0)} end={new THREE.Vector3(0, 1.72, 0)} radius={0.085} />
    {ribs.map((rib, index) => {
      const z = rib.depth;
      const y = rib.y;
      const width = rib.width;
      return <group key={index}>
        <mesh position={[0, y, 0.08]} rotation={[Math.PI / 2, 0, 0]} onClick={() => onSelect('ribs')}>
          <torusGeometry args={[width, 0.04, 10, 80]} />
          <meshPhysicalMaterial color={index === 0 && selected === 'ribs' ? RED_HOT : BONE} roughness={0.43} metalness={0.08} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, y, z]}><boxGeometry args={[0.08, 0.12, 0.18]} /><BoneMaterial dark /></mesh>
      </group>;
    })}
    <BoneSegment start={new THREE.Vector3(-0.92, 3.18, 0.05)} end={new THREE.Vector3(-1.5, 3.35, 0.08)} radius={0.065} />
    <BoneSegment start={new THREE.Vector3(0.92, 3.18, 0.05)} end={new THREE.Vector3(1.5, 3.35, 0.08)} radius={0.065} />
    <BoneSegment start={new THREE.Vector3(-0.72, 3.35, 0)} end={new THREE.Vector3(0, 2.12, 0)} radius={0.04} dark />
    <BoneSegment start={new THREE.Vector3(0.72, 3.35, 0)} end={new THREE.Vector3(0, 2.12, 0)} radius={0.04} dark />
  </group>;
}

function Pelvis() {
  return <group position={[0, 1.35, 0]}>
    <mesh scale={[1.05, 0.48, 0.58]} rotation={[0.02, 0, 0]} castShadow>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color={BONE} roughness={0.48} metalness={0.1} clipShadows />
    </mesh>
    <mesh position={[0, -0.13, 0.35]} scale={[0.72, 0.3, 0.22]}><sphereGeometry args={[1, 20, 14]} /><BoneMaterial /></mesh>
    <Joint position={[-0.74, 1.15, 0]} scale={1.15} />
    <Joint position={[0.74, 1.15, 0]} scale={1.15} />
  </group>;
}

function Limbs({ onSelect, selected }: { onSelect: (id: string) => void; selected: string | null }) {
  const left = -1;
  const right = 1;
  const armData = [
    { side: left, shoulder: [-1.08, 3.22, 0] as [number, number, number], elbow: [-1.7, 2.35, 0] as [number, number, number], wrist: [-1.92, 1.53, 0.02] as [number, number, number] },
    { side: right, shoulder: [1.08, 3.22, 0] as [number, number, number], elbow: [1.7, 2.35, 0] as [number, number, number], wrist: [1.92, 1.53, 0.02] as [number, number, number] },
  ];
  const legData = [
    { side: left, hip: [-0.7, 1.18, 0] as [number, number, number], knee: [-0.82, -0.48, 0] as [number, number, number], ankle: [-0.86, -1.98, 0.02] as [number, number, number] },
    { side: right, hip: [0.7, 1.18, 0] as [number, number, number], knee: [0.82, -0.48, 0] as [number, number, number], ankle: [0.86, -1.98, 0.02] as [number, number, number] },
  ];
  return <group>
    {armData.map((arm) => <group key={`arm-${arm.side}`}>
      <Joint position={arm.shoulder} /><BoneSegment start={new THREE.Vector3(...arm.shoulder)} end={new THREE.Vector3(...arm.elbow)} radius={0.11} />
      <Joint position={arm.elbow} /><BoneSegment start={new THREE.Vector3(...arm.elbow)} end={new THREE.Vector3(...arm.wrist)} radius={0.095} />
      <Joint position={arm.wrist} /><BoneSegment start={new THREE.Vector3(...arm.wrist)} end={new THREE.Vector3(arm.wrist[0] + arm.side * 0.16, arm.wrist[1] - 0.16, 0.05)} radius={0.065} dark />
    </group>)}
    {legData.map((leg) => <group key={`leg-${leg.side}`}>
      <BoneSegment start={new THREE.Vector3(...leg.hip)} end={new THREE.Vector3(...leg.knee)} radius={0.15} />
      <Joint position={leg.knee} scale={1.05} onClick={() => onSelect('thighs')} />
      <BoneSegment start={new THREE.Vector3(...leg.knee)} end={new THREE.Vector3(...leg.ankle)} radius={0.11} />
      <Joint position={leg.ankle} />
      <BoneSegment start={new THREE.Vector3(...leg.ankle)} end={new THREE.Vector3(leg.ankle[0] + leg.side * 0.05, -2.5, 0.22)} radius={0.075} dark />
    </group>)}
    <group onClick={() => onSelect('abdomen')}>
      <Joint position={[0, 1.62, 0.3]} scale={1.15} />
    </group>
    <group onClick={() => onSelect('jaw')}>
      <Joint position={[-0.28, 4.38, 0.55]} scale={0.55} />
    </group>
    <group onClick={() => onSelect('ribs')}>
      <Joint position={[-0.94, 2.7, 0.2]} scale={0.62} />
    </group>
    {selected === 'abdomen' && <mesh position={[0, 2, 0.55]}><sphereGeometry args={[0.34, 20, 16]} /><meshBasicMaterial color={RED_HOT} transparent opacity={0.55} blending={THREE.AdditiveBlending} /></mesh>}
    {selected === 'ribs' && <mesh position={[0, 2.75, 0.32]} scale={[1.35, 0.85, 0.6]}><sphereGeometry args={[1, 24, 18]} /><meshBasicMaterial color={RED} transparent opacity={0.13} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>}
    {selected === 'thighs' && <mesh position={[0, 0.1, 0.18]} scale={[1.2, 1.2, 0.55]}><sphereGeometry args={[1, 24, 18]} /><meshBasicMaterial color={RED} transparent opacity={0.11} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>}
  </group>;
}

function SkeletonModel({ onSelect, selected }: { onSelect: (id: string) => void; selected: string | null }) {
  const root = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!root.current) return;
    root.current.rotation.y += delta * 0.05;
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.025;
  });
  return <group ref={root} position={[0, -0.55, 0]}>
    <Skull onSelect={onSelect} selected={selected} />
    <RibCage onSelect={onSelect} selected={selected} />
    <Pelvis />
    <Limbs onSelect={onSelect} selected={selected} />
    <mesh position={[0, -3.0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.2, 0.018, 10, 96]} /><meshBasicMaterial color={RED} transparent opacity={0.2} /></mesh>
  </group>;
}

export function Experience({ anatomy = false, className = '' }: { anatomy?: boolean; className?: string }) {
  return <div className={`scene ${className}`} aria-hidden="true"><Canvas fallback={<div className="scene-fallback">3D LAYER OFFLINE / PERFORMANCE MODE</div>} dpr={[1, 1.6]} gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}><PerspectiveCamera makeDefault position={[0, 1, 8]} fov={45} /><DojoScene anatomy={anatomy} /></Canvas></div>;
}

export function AnatomyModel({ onSelect, selected }: { onSelect: (id: string) => void; selected: string | null }) {
  return <SkeletonModel onSelect={onSelect} selected={selected} />;
}

export function AnatomyScene({ onSelect, selected }: { onSelect: (id: string) => void; selected: string | null }) {
  return <div className="scene anatomy-scene"><Canvas fallback={<div className="scene-fallback">SKELETON MODEL UNAVAILABLE / USE THE REGION INSPECTOR</div>} dpr={[1, 1.6]} gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }} camera={{ position: [0, 1.8, 9], fov: 38 }}><DojoScene anatomy /><SkeletonModel onSelect={onSelect} selected={selected} /><OrbitControls enablePan={false} minDistance={6.2} maxDistance={12} enableDamping dampingFactor={0.08} /></Canvas></div>;
}
