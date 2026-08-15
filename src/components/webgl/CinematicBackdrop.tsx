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
    targetLook.set(pointer.x * 0.15, 0.45 + pointer.y * 0.1, 0);
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
    uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uScroll: { value: 0 } },
    vertexShader: `attribute float aSeed; attribute float aScale; uniform float uTime; uniform vec2 uMouse; uniform float uScroll; varying float vAlpha; void main(){vec3 p=position;float wave=sin(uTime*.22+aSeed+p.x*.08)*.07;p.x+=sin(uTime*.11+aSeed)*.12+uMouse.x*.06;p.y+=cos(uTime*.14+aSeed)*.11+wave;p.z+=sin(uTime*.13+aSeed)*.09+uScroll*.15;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=(1.1+aScale*1.8)*(15.0/max(4.0,-mv.z));vAlpha=.16+.42*(.5+.5*sin(aSeed+uTime*.55));gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `varying float vAlpha;void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);float a=smoothstep(.5,.03,d)*vAlpha;vec3 c=mix(vec3(.24,.58,1.0),vec3(.47,.96,1.0),a);gl_FragColor=vec4(c,a);}`,
  }), []);
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uMouse.value.set(pointer.x, pointer.y);
    material.uniforms.uScroll.value = scrollProgress;
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.004 + scrollProgress * 0.2;
  });
  return <points ref={ref} geometry={geometry} material={material} />;
}

function SignalRings() {
  const group = useRef<THREE.Group>(null);
  const rings = useMemo(() => [
    { radius: 2.2, opacity: 0.16, tilt: 0.08 },
    { radius: 3.45, opacity: 0.11, tilt: -0.055 },
    { radius: 4.8, opacity: 0.075, tilt: 0.035 },
  ], []);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.z = state.clock.elapsedTime * 0.02;
    group.current.rotation.y = pointer.x * 0.1 + scrollProgress * 0.4;
  });
  return <group ref={group} rotation={[Math.PI * 0.43, 0, 0]} position={[0, 0.35, -1]}>
    {rings.map((ring) => <mesh key={ring.radius} rotation={[0, 0, ring.tilt]}><torusGeometry args={[ring.radius, 0.012, 12, 160]} /><meshBasicMaterial color="#63b9ff" transparent opacity={ring.opacity} /></mesh>)}
  </group>;
}

function Cityscape() {
  const group = useRef<THREE.Group>(null);
  const buildings = useMemo(() => Array.from({ length: 84 }, (_, i) => {
    const lane = i % 21;
    const depth = Math.floor(i / 21);
    return {
      x: (lane - 10) * 0.72 + (Math.random() - 0.5) * 0.25,
      z: -2.5 - depth * 1.2 - Math.random() * 0.8,
      y: 0.18 + Math.random() * 2.6 * (1 - depth / 24),
      w: 0.25 + Math.random() * 0.35,
    };
  }), []);
  useFrame((state) => {
    if (group.current) group.current.position.z = (state.clock.elapsedTime * 0.012 + scrollProgress * 1.4) % 1;
  });
  return <group ref={group} position={[0, -2.5, -5.5]}>
    {buildings.map((b, i) => <mesh key={i} position={[b.x, b.y, b.z]} scale={[b.w, b.y, b.w]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#071019" emissive="#0c3c66" emissiveIntensity={0.24} roughness={0.35} metalness={0.7} /></mesh>)}
  </group>;
}

function LiquidField() {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uScroll: { value: 0 } },
    vertexShader: `uniform float uTime;uniform vec2 uMouse;uniform float uScroll;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;float d=distance(uv,vec2(.5)+uMouse*.12);p.z+=sin(d*24.0-uTime*1.5)*exp(-d*8.0)*.22;p.z+=sin((uv.x+uv.y+uTime*.05)*18.0)*.04;p.z+=uScroll*.05;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader: `uniform float uTime;varying vec2 vUv;void main(){vec2 p=vUv-.5;float r=length(p);float ring=smoothstep(.17,0.0,abs(r-.22))+smoothstep(.28,0.0,abs(r-.36))*.45;float scan=.45+.55*sin(vUv.y*100.0+uTime*.25);float glow=exp(-r*5.0)*.55;vec3 c=vec3(.03,.15,.28)+vec3(0.0,.2,.42)*(ring+glow)*scan;float alpha=.08+ring*.12+glow*.08;gl_FragColor=vec4(c,alpha);}`,
  }), []);
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uMouse.value.set(pointer.x, pointer.y);
    material.uniforms.uScroll.value = scrollProgress;
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.004;
  });
  return <mesh ref={ref} rotation={[-Math.PI / 2.08, 0, 0]} position={[0, -2.55, -1.5]} scale={[1.8, 1.3, 1]}><planeGeometry args={[14, 14, 80, 80]} /><primitive attach="material" object={material} /></mesh>;
}

function HeroCore() {
  const group = useRef<THREE.Group>(null);
  const shell = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#07111c', roughness: 0.22, metalness: 0.74, clearcoat: 1, clearcoatRoughness: 0.12, emissive: '#0a3a69', emissiveIntensity: 0.32 }), []);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.32 + scrollProgress * Math.PI * 0.75, 0.035);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * 0.14, 0.03);
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    group.current.scale.setScalar(1 + scrollProgress * 0.08);
  });
  return <group ref={group} position={[0, 0.05, 0]}><mesh material={shell}><icosahedronGeometry args={[1.7, 4]} /></mesh><mesh scale={1.045}><icosahedronGeometry args={[1.7, 4]} /><meshBasicMaterial color="#63b9ff" wireframe transparent opacity={0.07} /></mesh><mesh scale={1.26} rotation={[Math.PI / 2.8, 0, 0]}><torusGeometry args={[1.55, 0.014, 8, 128]} /><meshBasicMaterial color="#65baff" transparent opacity={0.26} /></mesh></group>;
}

function Scene() {
  return <><color attach="background" args={['#010305']} /><fog attach="fog" args={['#010305', 7, 25]} /><ambientLight intensity={0.28} color="#b9d8ff" /><directionalLight position={[4, 6, 5]} intensity={1.6} color="#b9dcff" /><pointLight position={[0, 2, 2]} intensity={4.5} distance={12} color="#3e9fff" /><pointLight position={[-4, 0, -4]} intensity={2.4} distance={10} color="#173dff" /><CameraRig /><ParticleField /><SignalRings /><Cityscape /><LiquidField /><HeroCore /></>;
}

export function CinematicBackdrop() {
  return <div className="cinematic-backdrop dark-awwwards-world" aria-hidden="true"><InputBus /><Canvas dpr={[1, 1.35]} camera={{ position: [0, 0.35, 9.8], fov: 45 }} gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}><Scene /></Canvas></div>;
}
