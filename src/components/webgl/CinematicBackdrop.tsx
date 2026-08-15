import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

let pointer = { x: 0, y: 0, vx: 0, vy: 0 };
let scrollProgress = 0;

function InputBus() {
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;
    const onMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      pointer.vx = x - lastX;
      pointer.vy = y - lastY;
      pointer.x = x;
      pointer.y = y;
      lastX = x;
      lastY = y;
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
    new THREE.Vector3(0, 0.35, 9.8),
    new THREE.Vector3(1.9, 0.8, 8.2),
    new THREE.Vector3(-1.4, 0.2, 6.2),
    new THREE.Vector3(1.2, -0.25, 4.6),
    new THREE.Vector3(-0.9, 0.4, 3.0),
  ], false, 'catmullrom', 0.65), []);
  useFrame(() => {
    const target = path.getPointAt(Math.min(0.95, scrollProgress * 0.9));
    target.x += pointer.x * 0.35;
    target.y += pointer.y * 0.2;
    camera.position.lerp(target, 0.025);
    targetLook.current.set(pointer.x * 0.15, 0.45 + pointer.y * 0.1, 0);
    look.current.lerp(targetLook.current, 0.035);
    camera.lookAt(look.current);
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = THREE.MathUtils.lerp(45, 37, scrollProgress);
    perspective.updateProjectionMatrix();
  });
  return null;
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const count = typeof window !== 'undefined' && window.innerWidth < 760 ? 2400 : 7200;
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const radius = 3 + Math.random() * 16;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 4;
      seeds[i] = Math.random() * Math.PI * 2;
      scales[i] = 0.4 + Math.random() * 1.2;
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    g.setAttribute('aScale', new THREE.Float32BufferAttribute(scales, 1));
    return g;
  }, [count]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uPointer: { value: new THREE.Vector2() } },
    vertexShader: `attribute float aSeed; attribute float aScale; uniform float uTime; uniform float uScroll; uniform vec2 uPointer; varying float vAlpha; void main(){vec3 p=position;float t=uTime;float flow=sin(p.x*.32+t*.18+aSeed)*.18+cos(p.z*.28+t*.15+aSeed)*.16;p.y+=flow+uScroll*.55;p.x+=sin(t*.12+aSeed)*.12+uPointer.x*.06;p.z+=cos(t*.1+aSeed)*.12+uPointer.y*.06;float wrapped=mod(p.y+6.0,12.0)-6.0;p.y=wrapped;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=(1.3+1.6*(.5+.5*sin(aSeed+t)))*aScale;gl_PointSize*=15.0/max(4.0,-mv.z);vAlpha=.14+.5*(.5+.5*sin(aSeed+t*.52));gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `varying float vAlpha;void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);float a=smoothstep(.5,.04,d)*vAlpha;vec3 c=mix(vec3(.22,.58,1.0),vec3(.65,.9,1.0),.5+.5*sin(vAlpha*9.0));gl_FragColor=vec4(c,a);}`,
  }), []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uScroll.value = scrollProgress;
    material.uniforms.uPointer.value.set(pointer.x, pointer.y);
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.004 + scrollProgress * 0.2;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

function SignalCore() {
  const group = useRef<THREE.Group>(null);
  const core = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#07121e', metalness: 0.72, roughness: 0.2, clearcoat: 0.7, clearcoatRoughness: 0.12,
    emissive: '#0b4a7a', emissiveIntensity: 0.25,
  }), []);
  const edge = useMemo(() => new THREE.MeshBasicMaterial({ color: '#58b8ff', transparent: true, opacity: 0.3 }), []);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.28 + scrollProgress * Math.PI * 0.85, 0.035);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * 0.12, 0.035);
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.08 + scrollProgress * 0.3;
    const s = 1.05 + Math.sin(state.clock.elapsedTime * 0.9) * 0.018 + scrollProgress * 0.18;
    group.current.scale.setScalar(s);
  });
  return <group ref={group} position={[0, 0.2, -1.8]}>
    <mesh material={core}><icosahedronGeometry args={[1.55, 5]} /></mesh>
    <mesh scale={1.08} material={edge}><icosahedronGeometry args={[1.55, 4]} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} material={edge}><torusGeometry args={[1.95, 0.012, 12, 160]} /></mesh>
    <mesh rotation={[0, Math.PI / 3, Math.PI / 2]} material={edge}><torusGeometry args={[2.25, 0.009, 12, 160]} /></mesh>
  </group>;
}

function BackdropScene() {
  return <>
    <color attach="background" args={['#010204']} />
    <fog attach="fog" args={['#010204', 8, 27]} />
    <ambientLight intensity={0.42} color="#9fdcff" />
    <directionalLight position={[4, 6, 5]} intensity={1.7} color="#d9efff" />
    <pointLight position={[-4, 2, 2]} intensity={2.6} distance={12} color="#378dff" />
    <pointLight position={[4, -1, -2]} intensity={1.5} distance={10} color="#59c7ff" />
    <CameraRig />
    <ParticleField />
    <SignalCore />
  </>;
}

export function CinematicBackdrop() {
  return <div className="cinematic-backdrop red-only-backdrop" aria-hidden="true"><InputBus /><Canvas dpr={[1, 1.35]} camera={{ position: [0, 0.35, 9.8], fov: 45 }} gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}><BackdropScene /></Canvas></div>;
}
