import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

let pointerX = 0;
let pointerY = 0;
let progress = 0;

function InputBus() {
  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    const scroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progress = THREE.MathUtils.clamp(window.scrollY / max, 0, 1);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    scroll();
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('scroll', scroll); };
  }, []);
  return null;
}

function Camera() {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointerX * 0.45, 0.02);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.2 + pointerY * 0.25, 0.02);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 8.5 - progress * 2.3, 0.025);
    camera.lookAt(0, 0.6 + pointerY * 0.08, 0);
  });
  return null;
}

function SparseParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 1400;
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const radius = 4 + Math.random() * 15;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 4;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    return g;
  }, []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `attribute float aSeed; uniform float uTime; varying float vAlpha; void main(){vec3 p=position;p.x+=sin(uTime*.16+aSeed)*.08;p.y+=cos(uTime*.11+aSeed)*.07;p.z+=sin(uTime*.13+aSeed)*.08;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=1.4+1.2*(.5+.5*sin(aSeed+uTime));gl_PointSize*=15.0/max(4.0,-mv.z);vAlpha=.22+.42*(.5+.5*sin(aSeed+uTime*.55));gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `varying float vAlpha;void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);float a=smoothstep(.5,.03,d)*vAlpha;gl_FragColor=vec4(.98,.88,.88,a);}`,
  }), []);
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.005 + progress * 0.18;
  });
  return <points ref={ref} geometry={geometry} material={material} />;
}

function BackdropScene() {
  return <>
    <color attach="background" args={['#480006']} />
    <fog attach="fog" args={['#480006', 7, 22]} />
    <ambientLight intensity={1.15} color="#ffe5e5" />
    <directionalLight position={[3, 6, 4]} intensity={1.5} color="#fff4f4" />
    <Camera />
    <SparseParticles />
  </>;
}

export function CinematicBackdrop() {
  return <div className="cinematic-backdrop red-only-backdrop" aria-hidden="true"><InputBus /><Canvas dpr={[1, 1.35]} camera={{ position: [0, 0.2, 8.5], fov: 46 }} gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}><BackdropScene /></Canvas></div>;
}
