import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 1500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      values[i * 3] = (Math.random() - 0.5) * 16;
      values[i * 3 + 1] = (Math.random() - 0.5) * 10;
      values[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return values;
  }, [count]);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.012;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.05;
  });
  return <points ref={ref} frustumCulled><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#b7bab2" size={0.018} transparent opacity={0.42} sizeAttenuation /></points>;
}

function Grid({ anatomy = false }: { anatomy?: boolean }) {
  return <>
    <gridHelper args={[24, 24, '#333a39', '#151b1b']} position={[0, -2.8, 0]} rotation={[0, 0, 0]} />
    <mesh position={[0, 1.4, -4]} rotation={[0, 0, 0]}>
      <planeGeometry args={[16, 9]} />
      <meshBasicMaterial color={anatomy ? '#101719' : '#0d1112'} transparent opacity={0.92} />
    </mesh>
  </>;
}

function FloatingRing() {
  return <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.5}><mesh rotation={[Math.PI / 2, 0, 0]} position={[2.8, 0.4, -1]}><torusGeometry args={[1.6, 0.025, 12, 80]} /><meshBasicMaterial color="#d7ff52" transparent opacity={0.7} /></mesh></Float>;
}

function DojoScene({ anatomy = false }: { anatomy?: boolean }) {
  return <>
    <color attach="background" args={['#070909']} />
    <fog attach="fog" args={['#070909', 4, 15]} />
    <ambientLight intensity={0.5} color="#9aa29a" />
    <pointLight position={[3, 4, 2]} intensity={6} distance={12} color="#e6ff88" />
    <pointLight position={[-4, 1, 1]} intensity={3} distance={10} color="#be4e27" />
    <ParticleField count={anatomy ? 900 : 1500} />
    <Grid anatomy={anatomy} />
    {!anatomy && <FloatingRing />}
  </>;
}

export function Experience({ anatomy = false, className = '' }: { anatomy?: boolean; className?: string }) {
  return <div className={`scene ${className}`} aria-hidden="true"><Canvas fallback={<div className="scene-fallback">3D LAYER OFFLINE / PERFORMANCE MODE</div>} dpr={[1, 1.6]} gl={{ antialias: true, powerPreference: 'high-performance' }}><PerspectiveCamera makeDefault position={[0, 1, 8]} fov={45} /><DojoScene anatomy={anatomy} /></Canvas></div>;
}

export function AnatomyModel({ onSelect, selected }: { onSelect: (id: string) => void; selected: string | null }) {
  return <group position={[0, -1.7, 0]}>
    <mesh position={[0, 3.4, 0]}><sphereGeometry args={[0.46, 20, 20]} /><meshStandardMaterial color="#9ca49d" roughness={0.7} /></mesh>
    <mesh position={[0, 2.1, 0]}><capsuleGeometry args={[0.72, 1.6, 8, 16]} /><meshStandardMaterial color="#6c746f" roughness={0.8} metalness={0.2} /></mesh>
    <mesh position={[-1.03, 1.95, 0]} rotation={[0, 0, -0.18]}><capsuleGeometry args={[0.18, 1.55, 8, 12]} /><meshStandardMaterial color="#78817b" /></mesh>
    <mesh position={[1.03, 1.95, 0]} rotation={[0, 0, 0.18]}><capsuleGeometry args={[0.18, 1.55, 8, 12]} /><meshStandardMaterial color="#78817b" /></mesh>
    <mesh position={[-0.38, 0.35, 0]} rotation={[0, 0, 0.05]}><capsuleGeometry args={[0.24, 2.5, 8, 12]} /><meshStandardMaterial color="#7d857f" /></mesh>
    <mesh position={[0.38, 0.35, 0]} rotation={[0, 0, -0.05]}><capsuleGeometry args={[0.24, 2.5, 8, 12]} /><meshStandardMaterial color="#7d857f" /></mesh>
    <mesh position={[-1.2, 1.2, 0.24]} onClick={() => onSelect('jaw')}><sphereGeometry args={[0.16, 12, 12]} /><meshBasicMaterial color={selected === 'jaw' ? '#e8ff65' : '#b94c2f'} /></mesh>
    <mesh position={[-0.62, 2.25, 0.47]} onClick={() => onSelect('ribs')}><sphereGeometry args={[0.18, 12, 12]} /><meshBasicMaterial color={selected === 'ribs' ? '#e8ff65' : '#b94c2f'} /></mesh>
    <mesh position={[0.45, 1.65, 0.5]} onClick={() => onSelect('abdomen')}><sphereGeometry args={[0.2, 12, 12]} /><meshBasicMaterial color={selected === 'abdomen' ? '#e8ff65' : '#b94c2f'} /></mesh>
    <mesh position={[-0.7, 0.3, 0.3]} onClick={() => onSelect('thighs')}><sphereGeometry args={[0.22, 12, 12]} /><meshBasicMaterial color={selected === 'thighs' ? '#e8ff65' : '#b94c2f'} /></mesh>
  </group>;
}

export function AnatomyScene({ onSelect, selected }: { onSelect: (id: string) => void; selected: string | null }) {
  return <div className="scene anatomy-scene"><Canvas fallback={<div className="scene-fallback">MODEL UNAVAILABLE / USE THE REGION INSPECTOR</div>} dpr={[1, 1.5]} camera={{ position: [0, 2.2, 9], fov: 40 }}><DojoScene anatomy /><AnatomyModel onSelect={onSelect} selected={selected} /><OrbitControls enablePan={false} minDistance={6} maxDistance={12} /></Canvas></div>;
}
