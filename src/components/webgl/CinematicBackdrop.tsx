import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const pointer = { x: 0, y: 0 };
let scrollProgress = 0;

function InputBus() {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = THREE.MathUtils.clamp(window.scrollY / max, 0, 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  return null;
}

function CameraRig() {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 0.35, 0));
  const targetLook = useRef(new THREE.Vector3());
  const path = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.35, 9.6),
    new THREE.Vector3(1.6, 0.7, 8.1),
    new THREE.Vector3(-1.2, 0.15, 6.4),
    new THREE.Vector3(0.9, -0.2, 4.8),
  ], false, 'catmullrom', 0.7), []);
  useFrame(() => {
    const target = path.getPointAt(Math.min(0.92, scrollProgress * 0.88));
    target.x += pointer.x * 0.28;
    target.y += pointer.y * 0.16;
    camera.position.lerp(target, 0.022);
    targetLook.current.set(pointer.x * 0.12, 0.4 + pointer.y * 0.08, 0);
    look.current.lerp(targetLook.current, 0.032);
    camera.lookAt(look.current);
  });
  return null;
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const count = typeof window !== 'undefined' && window.innerWidth < 760 ? 650 : 1400;
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const radius = 4 + Math.random() * 12;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 4;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    return g;
  }, [count]);
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uPointer: { value: new THREE.Vector2() } },
    vertexShader: `attribute float aSeed; uniform float uTime; uniform float uScroll; uniform vec2 uPointer; varying float vAlpha; void main(){vec3 p=position; p.x+=sin(uTime*.12+aSeed)*.06+uPointer.x*.04; p.y+=cos(uTime*.1+aSeed)*.05+uScroll*.35; p.z+=sin(uTime*.11+aSeed)*.05+uPointer.y*.04; p.y=mod(p.y+5.5,11.0)-5.5; vec4 mv=modelViewMatrix*vec4(p,1.0); gl_PointSize=(1.2+.9*(.5+.5*sin(aSeed+uTime)))*10.0/max(5.0,-mv.z); vAlpha=.10+.32*(.5+.5*sin(aSeed+uTime*.45)); gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `varying float vAlpha;void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);float a=smoothstep(.5,.06,d)*vAlpha;gl_FragColor=vec4(.28,.62,1.0,a);}`,
  }), []);
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uScroll.value = scrollProgress;
    material.uniforms.uPointer.value.set(pointer.x, pointer.y);
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.0025 + scrollProgress * 0.12;
  });
  return <points ref={ref} geometry={geometry} material={material} />;
}

function SignalCore() {
  const group = useRef<THREE.Group>(null);
  const core = useMemo(() => new THREE.MeshStandardMaterial({ color: '#07121e', metalness: 0.58, roughness: 0.28, emissive: '#0c4772', emissiveIntensity: 0.18 }), []);
  const edge = useMemo(() => new THREE.MeshBasicMaterial({ color: '#58b8ff', transparent: true, opacity: 0.22 }), []);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.22 + scrollProgress * Math.PI * 0.55, 0.035);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * 0.1, 0.035);
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.55) * 0.05 + scrollProgress * 0.18;
  });
  return <group ref={group} position={[0, 0.15, -1.9]}>
    <mesh material={core}><icosahedronGeometry args={[1.45, 3]} /></mesh>
    <mesh scale={1.06} material={edge}><icosahedronGeometry args={[1.45, 2]} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} material={edge}><torusGeometry args={[1.8, 0.009, 8, 64]} /></mesh>
  </group>;
}

function BackdropScene() {
  return <>
    <color attach="background" args={['#010204']} />
    <fog attach="fog" args={['#010204', 9, 24]} />
    <ambientLight intensity={0.28} color="#9fdcff" />
    <directionalLight position={[4, 6, 5]} intensity={1.15} color="#d9efff" />
    <pointLight position={[-4, 2, 2]} intensity={1.2} distance={10} color="#378dff" />
    <CameraRig />
    <ParticleField />
    <SignalCore />
  </>;
}

export function CinematicBackdrop() {
  return <div className="cinematic-backdrop dark-awwwards-world" aria-hidden="true">
    <InputBus />
    <Canvas dpr={[0.65, 1.0]} camera={{ position: [0, 0.35, 9.6], fov: 45 }} gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}>
      <BackdropScene />
    </Canvas>
  </div>;
}
