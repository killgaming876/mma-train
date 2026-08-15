import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import * as THREE from 'three';

let pointer = { x: 0, y: 0 };
let pageProgress = 0;

function InputBus() {
  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    const onMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth) * 2 - 1;
      targetY = -(event.clientY / window.innerHeight) * 2 + 1;
      pointer.x += (targetX - pointer.x) * 0.12;
      pointer.y += (targetY - pointer.y) * 0.12;
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      pageProgress = THREE.MathUtils.clamp(window.scrollY / max, 0, 1);
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
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2.8, 12),
    new THREE.Vector3(2.8, 2.1, 8),
    new THREE.Vector3(-3.4, 1.8, 4),
    new THREE.Vector3(1.2, 2.7, 0),
    new THREE.Vector3(-2.4, 1.2, -4),
  ], false, 'catmullrom', 0.7), []);
  const look = useRef(new THREE.Vector3(0, 0.8, 0));
  useFrame(() => {
    const t = THREE.MathUtils.smoothstep(pageProgress, 0, 1);
    const point = curve.getPointAt(Math.min(0.98, t * 0.92));
    camera.position.lerp(point, 0.035);
    look.current.lerp(new THREE.Vector3(pointer.x * 0.7, 0.7 + pointer.y * 0.35, -1), 0.05);
    camera.lookAt(look.current);
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = THREE.MathUtils.lerp(50, 37, t);
    perspective.updateProjectionMatrix();
  });
  return null;
}

function FlowParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 20000;
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const radius = 5 + Math.random() * 17;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 13;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 5;
      seeds[i] = Math.random() * 6.28;
    }
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    buffer.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    return buffer;
  }, []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uProgress: { value: 0 }, uPointer: { value: new THREE.Vector2() } },
    vertexShader: `attribute float aSeed; uniform float uTime; uniform float uProgress; uniform vec2 uPointer; varying float vSize; void main(){vec3 p=position;float t=uTime*.18+aSeed;p.x+=sin(p.y*.42+t)*.5*uProgress;p.y+=sin(t+p.x)*.35;p.z+=cos(t+p.y)*.3;vSize=(0.5+0.5*sin(aSeed+uTime*1.3))*2.1;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=2.0+vSize*2.5+uProgress*2.0;gl_PointSize*=18.0/max(4.0,-mv.z);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `varying float vSize; void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);float glow=smoothstep(.5,.04,d);float scan=.7+.3*sin((uv.y+.5)*40.0);vec3 color=mix(vec3(.04,.18,.05),vec3(.58,1.0,.22),glow);gl_FragColor=vec4(color,glow*.55*scan);}`,
  }), []);
  useFrame((state) => {
    if (!ref.current) return;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uProgress.value = pageProgress;
    material.uniforms.uPointer.value.lerp(new THREE.Vector2(pointer.x, pointer.y), 0.04);
    ref.current.rotation.y = state.clock.elapsedTime * 0.009 + pageProgress * 0.65;
  });
  return <points ref={ref} geometry={geometry} material={material} />;
}

function FighterSilhouette() {
  const root = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!root.current) return;
    const p = pageProgress;
    root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, pointer.x * 0.28 + p * Math.PI * 0.9, 0.04);
    root.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.35) * 0.018;
    root.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.06 + p * 0.45;
    root.current.scale.setScalar(THREE.MathUtils.lerp(0.7, 1.05, p));
  });
  const body = <meshPhysicalMaterial color="#09150b" metalness={0.75} roughness={0.26} clearcoat={1} emissive="#153d16" emissiveIntensity={0.55} />;
  const accent = <meshPhysicalMaterial color="#baff46" metalness={0.82} roughness={0.2} emissive="#39ff16" emissiveIntensity={1.8} />;
  return <group ref={root} position={[0, -2.3, 0]}>
    <Float speed={1.1} floatIntensity={0.12} rotationIntensity={0.08}>
      <group>
        <mesh position={[0, 3.8, 0]} castShadow><sphereGeometry args={[0.48, 28, 20]} />{body}</mesh>
        <mesh position={[0, 2.55, 0]} scale={[0.95, 1.25, 0.55]} castShadow><capsuleGeometry args={[0.78, 1.42, 10, 22]} />{body}</mesh>
        <mesh position={[0, 1.65, 0]} scale={[0.7, 0.46, 0.42]} castShadow><sphereGeometry args={[1, 24, 18]} />{body}</mesh>
        {[-1, 1].map((side) => <group key={side}>
          <mesh position={[side * 0.92, 2.7, 0]} rotation={[0, 0, side * 0.2]} castShadow><capsuleGeometry args={[0.18, 1.6, 10, 18]} />{body}</mesh>
          <mesh position={[side * 1.18, 1.78, -0.02]} rotation={[0, 0, side * -1.18]} castShadow><capsuleGeometry args={[0.14, 1.18, 10, 18]} />{body}</mesh>
          <mesh position={[side * 1.44, 1.1, -0.06]} castShadow><sphereGeometry args={[0.26, 22, 16]} />{accent}</mesh>
          <mesh position={[side * 0.44, 0.25, 0]} rotation={[0, 0, -side * 0.05]} castShadow><capsuleGeometry args={[0.25, 2.1, 10, 18]} />{body}</mesh>
          <mesh position={[side * 0.62, -1.05, -0.08]} castShadow><capsuleGeometry args={[0.28, 1.65, 10, 18]} />{body}</mesh>
          <mesh position={[side * 0.64, -2.05, -0.1]} scale={[1.16, 0.42, 2.2]} castShadow><sphereGeometry args={[0.44, 24, 16]} />{body}</mesh>
        </group>)}
        <mesh position={[0, 3.48, -0.43]} scale={[0.42, 0.16, 0.08]}><sphereGeometry args={[1, 20, 12]} />{accent}</mesh>
      </group>
    </Float>
    <pointLight position={[0, 2.2, 1.7]} color="#baff46" intensity={4.5} distance={8} />
  </group>;
}

function MorphSurface() {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uProgress: { value: 0 }, uPointer: { value: new THREE.Vector2() } },
    vertexShader: `uniform float uTime;uniform float uProgress;uniform vec2 uPointer;varying float vWave;void main(){vec3 p=position;float n=sin(p.x*1.1+uTime*.55)*cos(p.y*1.4-uTime*.4);float ripple=sin(length(p.xy)*4.0-uTime*1.6);p.z+=(n*.12+ripple*.04)*(1.0+uProgress*2.1);p.x+=uPointer.x*.14*abs(p.y)*.05;vWave=n;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader: `varying float vWave;void main(){float lines=abs(sin(vWave*18.0));float alpha=.07+lines*.16;gl_FragColor=vec4(.22,.95,.08,alpha);}`,
  }), []);
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uProgress.value = pageProgress;
    material.uniforms.uPointer.value.lerp(new THREE.Vector2(pointer.x, pointer.y), 0.08);
    if (ref.current) ref.current.rotation.z = pageProgress * 0.22;
  });
  return <mesh ref={ref} position={[0, 1.5, -6]} rotation={[0, 0, -0.12]} material={material}><planeGeometry args={[20, 10, 52, 30]} /></mesh>;
}

function ArenaFloor() {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new THREE.PlaneGeometry(40, 40, 64, 64), []);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const base = new Float32Array(position.array as Float32Array);
  useFrame((state) => {
    for (let i = 0; i < position.count; i += 1) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const radial = Math.sqrt(x * x + y * y);
      position.setZ(i, Math.sin(radial * 1.2 - state.clock.elapsedTime * 1.15) * 0.035 * Math.exp(-radial * 0.035) + Math.exp(-Math.pow(radial - 3.5, 2)) * 0.11 * pageProgress);
    }
    position.needsUpdate = true;
    if (ref.current) ref.current.position.z = -pageProgress * 2.2;
  });
  return <mesh ref={ref} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.25, -2.5]} receiveShadow><meshStandardMaterial color="#040905" metalness={0.92} roughness={0.14} emissive="#0b210b" emissiveIntensity={0.12} /></mesh>;
}

function City() {
  const blocks = useMemo(() => Array.from({ length: 75 }, (_, i) => ({ x: (i % 15 - 7) * 2.1, z: -10 - Math.floor(i / 15) * 2.6, height: 0.6 + ((i * 17) % 29) / 5 })), []);
  return <group position={[0, -3, 0]}>{blocks.map((b, i) => <mesh key={i} position={[b.x, b.height / 2, b.z]} scale={[0.86, b.height, 0.86]}><boxGeometry /><meshStandardMaterial color={i % 7 === 0 ? '#112314' : '#071008'} emissive="#153818" emissiveIntensity={i % 7 === 0 ? 0.45 : 0.07} metalness={0.6} roughness={0.7} /></mesh>)}</group>;
}

function PortalField() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.z = state.clock.elapsedTime * 0.07 + pageProgress * Math.PI * 1.7;
    group.current.scale.setScalar(1 + pageProgress * 1.7);
  });
  return <group ref={group} position={[0, 1.2, -2]} rotation={[Math.PI / 2, 0, 0]}>{[0, 1, 2, 3].map((i) => <mesh key={i} scale={1 + i * 0.2}><torusGeometry args={[2, 0.012 + i * 0.008, 14, 180]} /><meshBasicMaterial color={i === 0 ? '#c9ff54' : '#236b25'} transparent opacity={0.55 - i * 0.08} blending={THREE.AdditiveBlending} /></mesh>)}</group>;
}

function PostFX() {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<EffectComposer | null>(null);
  const bokeh = useRef<BokehPass | null>(null);
  const glitch = useRef<GlitchPass | null>(null);
  useEffect(() => {
    const pipeline = new EffectComposer(gl);
    pipeline.addPass(new RenderPass(scene, camera));
    pipeline.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 1.25, 0.72, 0.2));
    const focus = new BokehPass(scene, camera, { focus: 7, aperture: 0.00016, maxblur: 0.008 });
    pipeline.addPass(focus);
    const glitchPass = new GlitchPass();
    glitchPass.enabled = false;
    pipeline.addPass(glitchPass);
    const rgb = new ShaderPass(RGBShiftShader);
    rgb.uniforms.amount.value = 0.0007;
    pipeline.addPass(rgb);
    pipeline.addPass(new OutputPass());
    pipeline.setSize(size.width, size.height);
    composer.current = pipeline;
    bokeh.current = focus;
    glitch.current = glitchPass;
    return () => { pipeline.dispose(); composer.current = null; };
  }, [gl, scene, camera, size.width, size.height]);
  useFrame((_, delta) => {
    if (!composer.current) return;
    const uniforms = bokeh.current?.uniforms as Record<string, { value: number }> | undefined;
    if (uniforms?.focus) uniforms.focus.value = THREE.MathUtils.lerp(9, 3.5, pageProgress);
    if (uniforms?.aperture) uniforms.aperture.value = THREE.MathUtils.lerp(0.00012, 0.0003, pageProgress);
    if (glitch.current) glitch.current.enabled = (pageProgress > 0.38 && pageProgress < 0.46) || (pageProgress > 0.72 && pageProgress < 0.78);
    composer.current.render(delta);
  }, 1);
  return null;
}

function Scene() {
  return <><CameraRig /><color attach="background" args={['#020502']} /><fog attach="fog" args={['#020502', 4, 28]} /><ambientLight intensity={0.45} color="#668266" /><directionalLight position={[4, 9, 4]} intensity={2.5} color="#d6ffba" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} /><pointLight position={[-6, 2, 2]} intensity={8} distance={18} color="#40ff2a" /><pointLight position={[5, 3, -1]} intensity={6} distance={16} color="#b6ff57" /><FlowParticles /><Sparkles count={900} scale={[20, 12, 20]} size={1.1} speed={0.16} color="#b1ff64" opacity={0.22} /><City /><ArenaFloor /><MorphSurface /><PortalField /><FighterSilhouette /><PostFX /></>;
}

export function CinematicBackdrop() {
  return <div className="cinematic-backdrop" aria-hidden="true"><InputBus /><Canvas shadows dpr={[1, 1.35]} gl={{ antialias: true, powerPreference: 'high-performance' }} camera={{ position: [0, 2.8, 12], fov: 50 }}><Scene /></Canvas></div>;
}
