import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, PerspectiveCamera, Sparkles, Trail } from '@react-three/drei';
import { EffectComposer, RenderPass, OutputPass, UnrealBloomPass, BokehPass, SSRPass, GlitchPass, ShaderPass } from 'three/addons/postprocessing/index.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ChevronRight, CircleDot, ShieldCheck, X, Activity, Crosshair, Dumbbell, Utensils, Brain, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMMAStore, UserProfile } from '../store/useMMAStore';
import { MagneticButton } from '../components/AppShell';

gsap.registerPlugin(ScrollTrigger);

let scrollProgress = 0;
let pointerX = 0;
let pointerY = 0;

const setScrollProgress = (value: number) => { scrollProgress = THREE.MathUtils.clamp(value, 0, 1); };

const initialForm: UserProfile = {
  name: '', age: '', experience: 'BEGINNER', goal: 'Build conditioning', trainingDays: '3 DAYS', sessionDuration: '30 MIN',
  conditioning: 'BUILDING', equipment: 'GLOVES', nutrition: 'NO PREFERENCE', sleep: '7 HOURS'
};

function usePointerBus() {
  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = -(event.clientY / window.innerHeight) * 2 + 1;
      document.documentElement.style.setProperty('--mx', `${event.clientX}px`);
      document.documentElement.style.setProperty('--my', `${event.clientY}px`);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
}

function CameraRig() {
  const { camera } = useThree();
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2.2, 9),
    new THREE.Vector3(1.8, 1.8, 6.6),
    new THREE.Vector3(-2.2, 1.5, 3.1),
    new THREE.Vector3(0.5, 1.15, 0.9),
    new THREE.Vector3(2.3, 1.8, 4.5),
    new THREE.Vector3(0, 2.4, 8.2),
  ], false, 'catmullrom', 0.7), []);

  useFrame((state) => {
    const p = scrollProgress;
    const t = THREE.MathUtils.smoothstep(p, 0, 1);
    const point = curve.getPointAt(t * 0.82);
    const look = new THREE.Vector3(0, 1.05 + Math.sin(state.clock.elapsedTime * 0.25) * 0.08, -0.7);
    camera.position.lerp(point, 0.055);
    camera.lookAt(look);
    (camera as THREE.PerspectiveCamera).fov = THREE.MathUtils.lerp(47, 32, p);
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });
  return null;
}

function FighterMaterial({ accent = false }: { accent?: boolean }) {
  return <meshPhysicalMaterial color={accent ? '#b9ff39' : '#0f1712'} metalness={accent ? 0.78 : 0.58} roughness={accent ? 0.2 : 0.34} clearcoat={0.85} clearcoatRoughness={0.18} emissive={accent ? '#4cff21' : '#071008'} emissiveIntensity={accent ? 1.7 : 0.5} />;
}

function Fighter() {
  const root = useRef<THREE.Group>(null);
  const pulse = useRef(0);
  useFrame((state, delta) => {
    const p = scrollProgress;
    pulse.current += delta;
    if (!root.current) return;
    root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, pointerX * 0.28 + p * Math.PI * 0.7, 0.04);
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, pointerY * 0.09, 0.04);
    root.current.position.y = Math.sin(pulse.current * 1.15) * 0.05 + Math.sin(p * Math.PI) * 0.35;
    root.current.scale.setScalar(THREE.MathUtils.lerp(0.9, 1.12, p));
  });

  return <group ref={root} position={[0, -2.15, 0]}>
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.12}>
      <group>
        <mesh position={[0, 3.85, 0]} castShadow><sphereGeometry args={[0.5, 32, 24]} /><FighterMaterial /></mesh>
        <mesh position={[0, 3.52, -0.44]} scale={[0.42, 0.18, 0.1]} castShadow><sphereGeometry args={[1, 24, 12]} /><FighterMaterial accent /></mesh>
        <mesh position={[0, 2.52, 0]} scale={[0.96, 1.28, 0.54]} castShadow><capsuleGeometry args={[0.8, 1.45, 12, 24]} /><FighterMaterial /></mesh>
        <mesh position={[0, 1.63, 0]} scale={[0.7, 0.47, 0.42]} castShadow><sphereGeometry args={[1, 28, 18]} /><FighterMaterial /></mesh>
        <mesh position={[-0.92, 2.72, 0]} rotation={[0, 0, -0.2]} castShadow><capsuleGeometry args={[0.18, 1.62, 10, 18]} /><FighterMaterial /></mesh>
        <mesh position={[0.92, 2.72, 0]} rotation={[0, 0, 0.2]} castShadow><capsuleGeometry args={[0.18, 1.62, 10, 18]} /><FighterMaterial /></mesh>
        <mesh position={[-1.18, 1.83, -0.05]} rotation={[0, 0, 1.25]} castShadow><capsuleGeometry args={[0.14, 1.2, 10, 18]} /><FighterMaterial /></mesh>
        <mesh position={[1.18, 1.83, -0.05]} rotation={[0, 0, -1.25]} castShadow><capsuleGeometry args={[0.14, 1.2, 10, 18]} /><FighterMaterial /></mesh>
        <mesh position={[-1.45, 1.18, -0.08]} rotation={[0, 0, 1.04]} castShadow><sphereGeometry args={[0.27, 24, 18]} /><FighterMaterial accent /></mesh>
        <mesh position={[1.45, 1.18, -0.08]} rotation={[0, 0, -1.04]} castShadow><sphereGeometry args={[0.27, 24, 18]} /><FighterMaterial accent /></mesh>
        <mesh position={[-0.44, 0.25, 0]} rotation={[0, 0, 0.055]} castShadow><capsuleGeometry args={[0.25, 2.15, 10, 18]} /><FighterMaterial /></mesh>
        <mesh position={[0.44, 0.25, 0]} rotation={[0, 0, -0.055]} castShadow><capsuleGeometry args={[0.25, 2.15, 10, 18]} /><FighterMaterial /></mesh>
        <mesh position={[-0.6, -1.02, -0.08]} rotation={[0.08, 0.06, 0.05]} castShadow><capsuleGeometry args={[0.28, 1.65, 10, 18]} /><FighterMaterial /></mesh>
        <mesh position={[0.6, -1.02, -0.08]} rotation={[0.08, -0.06, -0.05]} castShadow><capsuleGeometry args={[0.28, 1.65, 10, 18]} /><FighterMaterial /></mesh>
        <mesh position={[-0.63, -2.05, -0.1]} scale={[1.2, 0.44, 2.3]} castShadow><sphereGeometry args={[0.46, 24, 18]} /><FighterMaterial /></mesh>
        <mesh position={[0.63, -2.05, -0.1]} scale={[1.2, 0.44, 2.3]} castShadow><sphereGeometry args={[0.46, 24, 18]} /><FighterMaterial /></mesh>
        <mesh position={[0, 1.98, 0.46]} scale={[0.75, 0.09, 0.06]}><boxGeometry args={[1.3, 1, 1]} /><FighterMaterial accent /></mesh>
      </group>
    </Float>
    <pointLight position={[0, 2, 1.5]} color="#bcff3f" intensity={5} distance={8} />
    <Trail width={1.2} length={3} color="#8dff23" attenuation={(t) => t * t}><mesh position={[0, -2.15, 0]} visible={false}><sphereGeometry args={[0.1]} /><meshBasicMaterial /></mesh></Trail>
  </group>;
}

const fighterVertex = `varying vec2 vUv; uniform float uTime; uniform float uScroll; uniform vec2 uPointer; void main(){ vUv=uv; vec3 p=position; float wave=sin(p.y*4.4+uTime*1.7)*0.05; float radial=sin(length(p.xz)*7.0-uTime*1.2)*0.025; p += normal*(wave+radial)*(0.35+uScroll*1.2); p.x += uPointer.x*0.035*(1.0-uScroll); gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`;
const fighterFragment = `varying vec2 vUv; uniform float uTime; uniform float uScroll; uniform vec2 uPointer; void main(){ float grid=abs(sin(vUv.x*90.0))*0.04+abs(sin(vUv.y*70.0))*0.04; float edge=smoothstep(0.8,0.22,abs(vUv.y-0.5)); vec3 base=mix(vec3(0.01,0.03,0.02),vec3(0.33,1.0,0.08),pow(edge,5.0)*(0.45+uScroll*0.8)); base+=grid*vec3(0.15,0.9,0.08); gl_FragColor=vec4(base,1.0); }`;

function EnergyCore() {
  const ref = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScroll: { value: 0 }, uPointer: { value: new THREE.Vector2() } }), []);
  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uScroll.value = scrollProgress;
    uniforms.uPointer.value.lerp(new THREE.Vector2(pointerX, pointerY), 0.08);
    if (ref.current) {
      ref.current.rotation.x += 0.004;
      ref.current.rotation.y += 0.009;
      ref.current.scale.setScalar(0.8 + Math.sin(state.clock.elapsedTime * 1.6) * 0.07 + scrollProgress * 0.22);
    }
  });
  return <mesh ref={ref} position={[0, 2.25, 0]} scale={0.9}>
    <icosahedronGeometry args={[1, 5]} />
    <shaderMaterial vertexShader={fighterVertex} fragmentShader={fighterFragment} uniforms={uniforms} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
  </mesh>;
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const count = 18000;
  const { positions, seeds } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 0.45) * 15;
      const a = Math.random() * Math.PI * 2;
      p[i * 3] = Math.cos(a) * r;
      p[i * 3 + 1] = (Math.random() - 0.5) * 11;
      p[i * 3 + 2] = Math.sin(a) * r - 2;
      s[i] = Math.random();
    }
    return { positions: p, seeds: s };
  }, []);
  const material = useMemo(() => new THREE.PointsMaterial({ color: '#8dff42', size: 0.022, transparent: true, opacity: 0.48, depthWrite: false, blending: THREE.AdditiveBlending }), []);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.012 + scrollProgress * 0.45;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.04;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, pointerX * 0.55, 0.015);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, -pointerY * 0.25, 0.02);
    material.size = 0.016 + scrollProgress * 0.022;
    material.opacity = 0.26 + scrollProgress * 0.38;
  });
  return <points ref={ref} geometry={new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))} material={material} />;
}

function Portal() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.z = state.clock.elapsedTime * 0.08 + scrollProgress * Math.PI * 1.3;
    group.current.scale.setScalar(1 + scrollProgress * 0.9);
  });
  return <group ref={group} position={[0, 1.15, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
    {[0, 1, 2].map((i) => <mesh key={i} scale={1 + i * 0.25}><torusGeometry args={[1.75, 0.012 + i * 0.008, 12, 140]} /><meshBasicMaterial color={i === 0 ? '#caff4b' : '#315f2b'} transparent opacity={0.62 - i * 0.12} blending={THREE.AdditiveBlending} /></mesh>)}
  </group>;
}

function LiquidFloor() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.08 + scrollProgress * 0.18;
    ref.current.rotation.z = scrollProgress * 0.015;
    ref.current.position.z = -scrollProgress * 0.4;
    const uniform = (m as THREE.MeshStandardMaterial & { userData: { wave?: number } }).userData;
    uniform.wave = state.clock.elapsedTime;
  });
  return <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.1, -2]} receiveShadow>
    <planeGeometry args={[34, 34, 40, 40]} />
    <meshStandardMaterial color="#050a06" metalness={0.88} roughness={0.16} emissive="#0b1e0c" emissiveIntensity={0.09} />
  </mesh>;
}

function Cityscape() {
  const blocks = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    x: (i % 12 - 5.5) * 1.9,
    z: -8 - Math.floor(i / 12) * 2.2,
    h: 0.5 + ((i * 17) % 23) / 6,
    r: ((i * 37) % 100) / 100,
  })), []);
  return <group position={[0, -3, 0]}>
    {blocks.map((b, i) => <mesh key={i} position={[b.x, b.h / 2, b.z]} scale={[0.9, b.h, 0.9]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={b.r > 0.82 ? '#18291b' : '#0a120c'} emissive="#113014" emissiveIntensity={b.r > 0.82 ? 0.45 : 0.08} metalness={0.5} roughness={0.72} />
    </mesh>)}
  </group>;
}

function VolumetricBeams() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.18 + scrollProgress * 0.7;
    group.current.children.forEach((child, i) => child.rotation.z = Math.sin(state.clock.elapsedTime * 0.2 + i) * 0.04);
  });
  return <group ref={group} position={[0, 1, -2]}>
    {[-4, -1.7, 1.8, 4.2].map((x, i) => <mesh key={i} position={[x, 2, -3.5]} rotation={[0.15, 0.2, (i - 1.5) * 0.08]}>
      <coneGeometry args={[0.75, 7, 24, 1, true]} />
      <meshBasicMaterial color="#7dff4a" transparent opacity={0.035 + scrollProgress * 0.025} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>)}
  </group>;
}

function MorphGrid() {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(() => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uPointer: { value: new THREE.Vector2() } }, vertexShader: `uniform float uTime; uniform float uScroll; varying float vWave; void main(){ vec3 p=position; float w=sin(p.x*1.2+uTime)*0.16+cos(p.y*1.5-uTime*.8)*0.13; p.z += w*(0.25+uScroll*1.2); vWave=w; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`, fragmentShader: `varying float vWave; void main(){ float a=.10+abs(vWave)*.9; gl_FragColor=vec4(.16,.9,.06,a); }` }), []);
  useFrame((state) => { material.uniforms.uTime.value = state.clock.elapsedTime; material.uniforms.uScroll.value = scrollProgress; if (ref.current) ref.current.rotation.z = scrollProgress * 0.22; });
  return <mesh ref={ref} position={[0, 1, -5]} rotation={[0, 0, -0.12]} material={material}><planeGeometry args={[18, 9, 42, 24]} /></mesh>;
}

function PostFX() {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  const glitchRef = useRef<GlitchPass | null>(null);
  const bokehRef = useRef<BokehPass | null>(null);
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.12;
    const composer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    const ssr = new SSRPass({ renderer: gl, scene, camera, width: Math.max(1, size.width), height: Math.max(1, size.height) });
    ssr.opacity = 0.32;
    ssr.maxDistance = 24;
    ssr.thickness = 0.02;
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 1.4, 0.65, 0.18);
    const bokeh = new BokehPass(scene, camera, { focus: 6, aperture: 0.00018, maxblur: 0.008 });
    const glitch = new GlitchPass();
    glitch.goWild = false;
    glitch.enabled = false;
    const rgb = new ShaderPass(RGBShiftShader);
    rgb.uniforms.amount.value = 0.0008;
    const output = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(ssr);
    composer.addPass(bloom);
    composer.addPass(bokeh);
    composer.addPass(glitch);
    composer.addPass(rgb);
    composer.addPass(output);
    composer.setSize(size.width, size.height);
    composerRef.current = composer;
    bokehRef.current = bokeh;
    glitchRef.current = glitch;
    return () => { composer.dispose(); composerRef.current = null; };
  }, [gl, scene, camera, size.width, size.height]);

  useFrame((_, delta) => {
    const composer = composerRef.current;
    if (!composer) return;
    const p = scrollProgress;
    if (bokehRef.current) {
      bokehRef.current.uniforms.focus.value = THREE.MathUtils.lerp(8.5, 3.2, p);
      bokehRef.current.uniforms.aperture.value = THREE.MathUtils.lerp(0.00012, 0.00032, p);
    }
    if (glitchRef.current) {
      glitchRef.current.enabled = (p > 0.42 && p < 0.55) || (p > 0.82 && p < 0.88);
      glitchRef.current.goWild = p > 0.83 && p < 0.865;
    }
    composer.render(delta);
  }, 1);
  return null;
}

function ArenaScene() {
  return <>
    <color attach="background" args={['#020503']} />
    <fog attach="fog" args={['#020503', 5, 25]} />
    <ambientLight intensity={0.55} color="#6d876c" />
    <directionalLight position={[4, 8, 4]} intensity={2.4} color="#caffba" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <pointLight position={[-5, 2, 2]} intensity={8} distance={16} color="#3cff2c" />
    <pointLight position={[6, 1, -2]} intensity={7} distance={18} color="#b6ff55" />
    <pointLight position={[0, 0, 7]} intensity={4} distance={11} color="#ff8b41" />
    <CameraRig />
    <Environment preset="night" />
    <ParticleField />
    <Sparkles count={1200} scale={[18, 10, 18]} size={1.2} speed={0.16} color="#a1ff58" opacity={0.26} />
    <Cityscape />
    <LiquidFloor />
    <VolumetricBeams />
    <Portal />
    <MorphGrid />
    <EnergyCore />
    <Fighter />
    <PostFX />
  </>;
}

function Onboarding({ onClose, onSubmit, form, update }: { onClose: () => void; onSubmit: (e: FormEvent) => void; form: UserProfile; update: (key: keyof UserProfile, value: string) => void }) {
  return <motion.div className="onboarding-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.form className="onboarding-panel onboarding-3d" onSubmit={onSubmit} initial={{ y: 70, opacity: 0, rotateX: 12 }} animate={{ y: 0, opacity: 1, rotateX: 0 }}>
      <button className="onboarding-close" type="button" onClick={onClose}><X size={18} /></button>
      <div className="eyebrow"><span className="eyebrow-line" /> ATHLETE DNA / CALIBRATION</div>
      <h2>Build your<br /><em>roadmap.</em></h2>
      <p className="form-intro">Feed the system a few signals. Forge will build your starting training path, recovery rhythm and nutrition direction.</p>
      <label>CALL SIGN<input autoFocus required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" /></label>
      <div className="form-grid">
        <label>EXPERIENCE<select value={form.experience} onChange={(e) => update('experience', e.target.value)}><option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option></select></label>
        <label>TRAINING DAYS<select value={form.trainingDays} onChange={(e) => update('trainingDays', e.target.value)}><option>2 DAYS</option><option>3 DAYS</option><option>4 DAYS</option><option>5 DAYS</option></select></label>
        <label>PRIMARY GOAL<select value={form.goal} onChange={(e) => update('goal', e.target.value)}><option>Build conditioning</option><option>Learn MMA</option><option>Improve striking</option><option>Self-defense education</option></select></label>
        <label>SESSION LENGTH<select value={form.sessionDuration} onChange={(e) => update('sessionDuration', e.target.value)}><option>20 MIN</option><option>30 MIN</option><option>45 MIN</option><option>60 MIN</option></select></label>
      </div>
      <div className="form-footer"><span><ShieldCheck size={15} /> EDUCATIONAL / ADAPTIVE / SAFE</span><MagneticButton type="submit">GENERATE ROADMAP</MagneticButton></div>
    </motion.form>
  </motion.div>;
}

function ScrollSection({ eyebrow, title, body, index, icon, action, dark = false }: { eyebrow: string; title: string; body: string; index: string; icon: React.ReactNode; action?: string; dark?: boolean }) {
  return <section className={`forge-section ${dark ? 'forge-section-dark' : ''}`} data-scroll-section>
    <div className="section-index">{index}</div>
    <div className="section-copy">
      <div className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</div>
      <h2 className="split-title">{title}</h2>
      <p>{body}</p>
      {action && <div className="section-action">{action} <ChevronRight size={15} /></div>}
    </div>
    <div className="section-icon" aria-hidden="true">{icon}</div>
  </section>;
}

export default function LandingPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [progressLabel, setProgressLabel] = useState('00');
  const setProfile = useMMAStore((state) => state.setProfile);
  const navigate = useNavigate();
  usePointerBus();

  const update = (key: keyof UserProfile, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); setProfile(form); setShowOnboarding(false); navigate('/dashboard'); };

  useEffect(() => {
    const root = document.querySelector('.landing-page');
    if (!root) return;
    const sections = gsap.utils.toArray<HTMLElement>('[data-scroll-section]');
    const triggers = sections.map((section, index) => gsap.fromTo(section.querySelector('.section-copy'), { y: 100, opacity: 0, clipPath: 'inset(20% 0 0 0)' }, {
      y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', ease: 'none', scrollTrigger: { trigger: section, start: 'top 80%', end: 'bottom 35%', scrub: 1.1 }
    }).scrollTrigger);

    const master = ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => {
      setScrollProgress(self.progress);
      setProgressLabel(String(Math.round(self.progress * 100)).padStart(2, '0'));
      root.style.setProperty('--scroll-progress', self.progress.toFixed(4));
    } });

    gsap.to('.hero-title .hero-word', { yPercent: -22, stagger: 0.08, scrollTrigger: { trigger: root, start: 'top top', end: '+=1000', scrub: true } });
    gsap.to('.hero-sub', { xPercent: 16, opacity: 0.25, scrollTrigger: { trigger: root, start: 'top top', end: '+=850', scrub: true } });
    gsap.to('.hero-ring', { rotate: 250, scale: 1.5, scrollTrigger: { trigger: root, start: 'top top', end: '+=1600', scrub: true } });
    gsap.utils.toArray<HTMLElement>('.section-icon').forEach((el, i) => gsap.to(el, { y: i % 2 ? -80 : 80, rotate: i % 2 ? -18 : 18, scrollTrigger: { trigger: el.closest('[data-scroll-section]') as HTMLElement, start: 'top bottom', end: 'bottom top', scrub: true } }));

    return () => { master.kill(); triggers.forEach((t) => t?.kill()); ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, []);

  return <div className="landing-page forge-landing">
    <div className="forge-noise" />
    <div className="forge-grid" />
    <div className="forge-cursor"><span /></div>
    <div className="forge-progress"><span>SCROLL /</span><strong>{progressLabel}</strong><i /></div>

    <div className="forge-canvas-wrap"><Canvas shadows dpr={[1, 1.45]} camera={{ position: [0, 2.2, 9], fov: 47 }} gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}><PerspectiveCamera makeDefault position={[0, 2.2, 9]} fov={47} /><ArenaScene /></Canvas></div>
    <div className="hero-vignette" />
    <div className="forge-side-rail"><span>FORGE / MMA</span><span>SCROLL TO ADAPT</span></div>

    <section className="forge-hero" data-scroll-section>
      <div className="hero-kicker"><span>01 / ENTRY PROTOCOL</span><span>WEBGL PERFORMANCE SYSTEM / V. 02</span></div>
      <div className="hero-center">
        <div className="hero-micro">DISCIPLINE → FORM → IMPACT</div>
        <h1 className="hero-title"><span className="hero-word">FORGE</span><span className="hero-word title-offset">YOUR</span><span className="hero-word title-accent">FIGHT.<b>.</b></span></h1>
        <p className="hero-sub">A cinematic MMA training system that turns your profile into a living roadmap for movement, conditioning and recovery.</p>
        <div className="hero-cta-row"><MagneticButton onClick={() => setShowOnboarding(true)}>BUILD MY ROADMAP</MagneticButton><button className="ghost-cta" onClick={() => navigate('/training')}>ENTER TRAINING <ChevronRight size={16} /></button></div>
      </div>
      <div className="hero-meta"><span><CircleDot size={11} /> LIVE 3D ENGINE</span><span>ADAPTIVE / SAFE / ATHLETE-FIRST</span></div>
      <div className="hero-ring" />
      <div className="hero-bottom-scroll"><ArrowDown size={16} /> SCROLL THE EXPERIENCE</div>
    </section>

    <ScrollSection index="01" eyebrow="THE COMMAND LAYER" title="Your training becomes a system." body="Every session is part of a larger loop. Strength, conditioning, technique, recovery and nutrition are treated as connected signals instead of isolated workouts." icon={<Gauge size={74} strokeWidth={1} />} action="OPEN COMMAND" />
    <ScrollSection index="02" eyebrow="TRAINING ENGINE" title="Learn the movement. Repeat with intent." body="Progressive striking, conditioning and movement blocks are surfaced around your current level, available equipment and weekly training rhythm." icon={<Dumbbell size={74} strokeWidth={1} />} action="START TRAINING" dark />
    <ScrollSection index="03" eyebrow="ANATOMY LAYER" title="See where the work lands." body="Explore target zones, weak links and training emphasis through an anatomical layer designed to make your preparation more deliberate." icon={<Brain size={74} strokeWidth={1} />} action="OPEN ANATOMY" />
    <ScrollSection index="04" eyebrow="FUEL PROTOCOL" title="Performance is built outside the mat." body="Use your roadmap to organize meals, hydration and recovery habits around the workload you actually train, rather than generic fitness advice." icon={<Utensils size={74} strokeWidth={1} />} action="OPEN FUEL" dark />
    <ScrollSection index="05" eyebrow="PROGRESS SIGNAL" title="The graph should move because you did." body="Track consistency, completed sessions and training streaks so the app becomes a feedback loop instead of another dashboard you forget to open." icon={<Activity size={74} strokeWidth={1} />} action="VIEW PROGRESS" />

    <section className="forge-final" data-scroll-section>
      <div className="final-grid" />
      <div className="final-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> FINAL CALIBRATION</div>
        <h2>BUILD THE<br /><em>ROADMAP.</em></h2>
        <p>Give Forge the signals. Start with a plan. Keep adjusting as the athlete changes.</p>
        <MagneticButton onClick={() => setShowOnboarding(true)}>GENERATE MY ROADMAP</MagneticButton>
      </div>
      <div className="final-readout"><span>OUTPUT</span><strong>00 → 100</strong><i>TRAIN / RECOVER / REPEAT</i></div>
    </section>

    {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} onSubmit={submit} form={form} update={update} />}
  </div>;
}
