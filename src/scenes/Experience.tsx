import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const RED = '#ff334d';
const HOT = '#ff7180';
const BONE = '#ddd8cc';
const DARK_BONE = '#787267';

function Particles({ count = 1600 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = 4 + Math.random() * 12;
      const t = Math.random() * Math.PI * 2;
      a[i * 3] = Math.cos(t) * r;
      a[i * 3 + 1] = (Math.random() - 0.5) * 11;
      a[i * 3 + 2] = Math.sin(t) * r - 4;
    }
    return a;
  }, [count]);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, [positions]);
  const material = useMemo(() => new THREE.PointsMaterial({ color: RED, size: 0.02, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  useFrame((state, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * 0.006;
    points.current.position.x = Math.sin(state.clock.elapsedTime * 0.14) * 0.12;
  });
  return <points ref={points} geometry={geometry} material={material} />;
}

function Environment({ anatomy = false }: { anatomy?: boolean }) {
  return <>
    <color attach="background" args={[anatomy ? '#040507' : '#050607']} />
    <fog attach="fog" args={[anatomy ? '#040507' : '#050607', 5, 25]} />
    <ambientLight intensity={0.5} color="#b4aaa2" />
    <directionalLight position={[4, 8, 5]} intensity={2.2} color="#ffe1da" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <pointLight position={[4, 4, 2]} intensity={8} distance={15} color={RED} />
    <pointLight position={[-4, 2, 3]} intensity={4} distance={11} color="#ff9e92" />
    <Particles count={anatomy ? 2200 : 1500} />
    <gridHelper args={[28, 28, anatomy ? RED : '#641b22', '#17191b']} position={[0, -3.35, 0]} />
    <mesh position={[0, 1.6, -7]}>
      <planeGeometry args={[22, 13]} />
      <meshBasicMaterial color="#090b0d" transparent opacity={0.94} />
    </mesh>
  </>;
}

function BoneMaterial({ dark = false }: { dark?: boolean }) {
  return <meshPhysicalMaterial color={dark ? DARK_BONE : BONE} metalness={0.12} roughness={0.48} clearcoat={0.22} clearcoatRoughness={0.36} emissive="#2e0b11" emissiveIntensity={0.06} />;
}

function BoneSegment({ start, end, radius, dark = false }: { start: THREE.Vector3; end: THREE.Vector3; radius: number; dark?: boolean }) {
  const midpoint = useMemo(() => start.clone().add(end).multiplyScalar(0.5), [start, end]);
  const direction = useMemo(() => end.clone().sub(start), [start, end]);
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()), [direction]);
  return <mesh position={midpoint} quaternion={quaternion} castShadow>
    <cylinderGeometry args={[radius * 0.92, radius, direction.length(), 14]} />
    <BoneMaterial dark={dark} />
  </mesh>;
}

type JointProps = { position: [number, number, number]; scale?: number; onClick?: () => void };

function Joint({ position, scale = 1, onClick }: JointProps) {
  return <mesh position={position} scale={scale} castShadow onClick={onClick} onPointerOver={(event) => event.stopPropagation()}>
    <sphereGeometry args={[0.16, 18, 14]} />
    <BoneMaterial />
  </mesh>;
}

function Skull({ select, selected }: { select: (id: string) => void; selected: string | null }) {
  return <group>
    <mesh position={[0, 4.38, 0]} scale={[0.78, 0.92, 0.64]} castShadow onClick={() => select('jaw')}>
      <sphereGeometry args={[1, 30, 24]} />
      <BoneMaterial />
    </mesh>
    <mesh position={[0, 4.02, 0.35]} scale={[0.58, 0.4, 0.28]}>
      <sphereGeometry args={[1, 24, 16]} />
      <BoneMaterial dark />
    </mesh>
    {[-0.28, 0.28].map((x) => <mesh key={x} position={[x, 4.42, 0.55]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.09, 0.024, 10, 30]} />
      <meshBasicMaterial color={selected === 'jaw' ? HOT : RED} />
    </mesh>)}
  </group>;
}

function RibCage({ select, selected }: { select: (id: string) => void; selected: string | null }) {
  const ribs = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ y: 3.28 - i * 0.25, width: 1.16 - i * 0.05 })), []);
  return <group>
    <BoneSegment start={new THREE.Vector3(0, 3.55, 0)} end={new THREE.Vector3(0, 1.72, 0)} radius={0.08} />
    {ribs.map((rib, i) => <mesh key={i} position={[0, rib.y, 0.1]} rotation={[Math.PI / 2, 0, 0]} onClick={() => select('ribs')}>
      <torusGeometry args={[rib.width, 0.038, 10, 82, Math.PI]} />
      <meshPhysicalMaterial color={selected === 'ribs' ? HOT : BONE} roughness={0.44} metalness={0.08} side={THREE.DoubleSide} />
    </mesh>)}
    <BoneSegment start={new THREE.Vector3(-0.9, 3.2, 0)} end={new THREE.Vector3(-1.55, 3.37, 0)} radius={0.06} />
    <BoneSegment start={new THREE.Vector3(0.9, 3.2, 0)} end={new THREE.Vector3(1.55, 3.37, 0)} radius={0.06} />
  </group>;
}

function Pelvis() {
  return <group position={[0, 1.25, 0]}>
    <mesh scale={[1.1, 0.46, 0.6]} castShadow>
      <sphereGeometry args={[1, 28, 18]} />
      <BoneMaterial />
    </mesh>
    <BoneSegment start={new THREE.Vector3(-0.72, 1.1, 0)} end={new THREE.Vector3(0, 0.7, 0.08)} radius={0.07} dark />
    <BoneSegment start={new THREE.Vector3(0.72, 1.1, 0)} end={new THREE.Vector3(0, 0.7, 0.08)} radius={0.07} dark />
    <Joint position={[-0.72, 1.1, 0]} scale={1.1} />
    <Joint position={[0.72, 1.1, 0]} scale={1.1} />
  </group>;
}

function Limbs({ select }: { select: (id: string) => void }) {
  const arms = [
    { s: -1, shoulder: [-1.05, 3.2, 0] as [number, number, number], elbow: [-1.7, 2.35, 0] as [number, number, number], wrist: [-1.92, 1.55, 0.04] as [number, number, number] },
    { s: 1, shoulder: [1.05, 3.2, 0] as [number, number, number], elbow: [1.7, 2.35, 0] as [number, number, number], wrist: [1.92, 1.55, 0.04] as [number, number, number] },
  ];
  const legs = [
    { s: -1, hip: [-0.72, 1.1, 0] as [number, number, number], knee: [-0.82, -0.48, 0] as [number, number, number], ankle: [-0.88, -1.98, 0] as [number, number, number] },
    { s: 1, hip: [0.72, 1.1, 0] as [number, number, number], knee: [0.82, -0.48, 0] as [number, number, number], ankle: [0.88, -1.98, 0] as [number, number, number] },
  ];
  return <group>
    {arms.map((a) => <group key={a.s}>
      <Joint position={a.shoulder} />
      <BoneSegment start={new THREE.Vector3(...a.shoulder)} end={new THREE.Vector3(...a.elbow)} radius={0.11} />
      <Joint position={a.elbow} />
      <BoneSegment start={new THREE.Vector3(...a.elbow)} end={new THREE.Vector3(...a.wrist)} radius={0.095} />
      <Joint position={a.wrist} />
      <BoneSegment start={new THREE.Vector3(...a.wrist)} end={new THREE.Vector3(a.wrist[0] + a.s * 0.18, a.wrist[1] - 0.18, 0.05)} radius={0.06} dark />
    </group>)}
    {legs.map((l) => <group key={l.s}>
      <BoneSegment start={new THREE.Vector3(...l.hip)} end={new THREE.Vector3(...l.knee)} radius={0.15} />
      <Joint position={l.knee} scale={1.05} onClick={() => select('thighs')} />
      <BoneSegment start={new THREE.Vector3(...l.knee)} end={new THREE.Vector3(...l.ankle)} radius={0.11} />
      <Joint position={l.ankle} />
      <BoneSegment start={new THREE.Vector3(...l.ankle)} end={new THREE.Vector3(l.ankle[0] + l.s * 0.05, -2.5, 0.2)} radius={0.07} dark />
    </group>)}
    <Joint position={[0, 1.63, 0.32]} scale={1.12} onClick={() => select('abdomen')} />
    <Joint position={[-0.3, 4.38, 0.55]} scale={0.55} onClick={() => select('jaw')} />
    <Joint position={[-0.92, 2.7, 0.2]} scale={0.62} onClick={() => select('ribs')} />
  </group>;
}

function Skeleton({ select, selected }: { select: (id: string) => void; selected: string | null }) {
  const root = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!root.current) return;
    root.current.rotation.y += delta * 0.045;
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.025;
  });
  return <group ref={root} position={[0, -1.7, 0]}>
    <Skull select={select} selected={selected} />
    <RibCage select={select} selected={selected} />
    <Pelvis />
    <Limbs select={select} />
    {selected === 'abdomen' && <mesh position={[0, 2.02, 0.54]}><sphereGeometry args={[0.34, 20, 16]} /><meshBasicMaterial color={HOT} transparent opacity={0.48} blending={THREE.AdditiveBlending} /></mesh>}
    {selected === 'ribs' && <mesh position={[0, 2.75, 0.35]} scale={[1.35, 0.86, 0.6]}><sphereGeometry args={[1, 24, 18]} /><meshBasicMaterial color={RED} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>}
    {selected === 'thighs' && <mesh position={[0, 0.05, 0.18]} scale={[1.2, 1.2, 0.55]}><sphereGeometry args={[1, 24, 18]} /><meshBasicMaterial color={RED} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>}
  </group>;
}

export function AnatomyModel({ onSelect, selected }: { onSelect: (id: string) => void; selected: string | null }) {
  return <Skeleton select={onSelect} selected={selected} />;
}

export function AnatomyScene({ onSelect, selected }: { onSelect: (id: string) => void; selected: string | null }) {
  return <div className="scene anatomy-scene"><Canvas fallback={<div className="scene-fallback">MODEL UNAVAILABLE / USE THE REGION INSPECTOR</div>} dpr={[1, 1.5]} camera={{ position: [0, 2.2, 9], fov: 40 }}><Environment anatomy /><AnatomyModel onSelect={onSelect} selected={selected} /><OrbitControls enablePan={false} minDistance={6} maxDistance={12} /></Canvas></div>;
}

export function Experience({ anatomy = false, className = '' }: { anatomy?: boolean; className?: string }) {
  return <div className={`scene ${className}`} aria-hidden="true"><Canvas fallback={<div className="scene-fallback">3D LAYER OFFLINE / PERFORMANCE MODE</div>} dpr={[1, 1.6]} gl={{ antialias: true, powerPreference: 'high-performance' }}><PerspectiveCamera makeDefault position={[0, 1, 8]} fov={45} /><Environment anatomy={anatomy} /></Canvas></div>;
}
