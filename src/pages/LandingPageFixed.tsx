import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ChevronRight, X, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MagneticButton } from '../components/AppShell';
import { useMMAStore, UserProfile } from '../store/useMMAStore';

gsap.registerPlugin(ScrollTrigger);

let scrollProgress = 0;
let pointerX = 0;
let pointerY = 0;

const initialForm: UserProfile = {
  name: '', age: '', experience: 'BEGINNER', goal: 'Build conditioning', trainingDays: '3 DAYS', sessionDuration: '30 MIN',
  conditioning: 'BUILDING', equipment: 'GLOVES', nutrition: 'NO PREFERENCE', sleep: '7 HOURS',
};

function InputBus() {
  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    const scroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = THREE.MathUtils.clamp(window.scrollY / max, 0, 1);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    scroll();
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', scroll);
    };
  }, []);
  return null;
}

function CameraRig() {
  const { camera } = useThree();
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.8, 9.5),
    new THREE.Vector3(1.7, 1.5, 7),
    new THREE.Vector3(-1.5, 1.3, 4.2),
    new THREE.Vector3(0.8, 1.2, 1.8),
  ], false, 'catmullrom', 0.7), []);
  useFrame(() => {
    const point = curve.getPointAt(Math.min(0.92, scrollProgress * 0.92));
    camera.position.lerp(point, 0.045);
    const target = new THREE.Vector3(pointerX * 0.35, 1.05 + pointerY * 0.15, 0);
    camera.lookAt(target);
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = THREE.MathUtils.lerp(46, 34, scrollProgress);
    perspective.updateProjectionMatrix();
  });
  return null;
}

function SparseParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 1800;
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const radius = 4 + Math.random() * 14;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 11;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 3;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    return g;
  }, []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `attribute float aSeed; uniform float uTime; varying float vAlpha; void main(){vec3 p=position; p.x+=sin(uTime*.18+aSeed)*.12; p.y+=cos(uTime*.14+aSeed)*.1; p.z+=sin(uTime*.16+aSeed)*.1; vec4 mv=modelViewMatrix*vec4(p,1.0); gl_PointSize=1.6+1.8*(.5+.5*sin(aSeed+uTime)); gl_PointSize*=16.0/max(4.0,-mv.z); vAlpha=.2+.5*(.5+.5*sin(aSeed+uTime*.7)); gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `varying float vAlpha; void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);float a=smoothstep(.5,.04,d)*vAlpha;gl_FragColor=vec4(.98,.88,.87,a);}`,
  }), []);
  useFrame((state) => {
    if (!ref.current) return;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    ref.current.rotation.y = state.clock.elapsedTime * 0.008 + scrollProgress * 0.25;
  });
  return <points ref={ref} geometry={geometry} material={material} />;
}

function Fighter() {
  const ref = useRef<THREE.Group>(null);
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#090909', metalness: 0.3, roughness: 0.42, clearcoat: 0.35 }), []);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, pointerX * 0.18 + scrollProgress * Math.PI * 0.8, 0.04);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, pointerY * 0.06, 0.04);
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.05 + scrollProgress * 0.35;
    ref.current.scale.setScalar(0.9 + scrollProgress * 0.16);
    const breath = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.012;
    ref.current.scale.y *= breath;
  });
  const Limb = ({ x, y, z, sx, sy, sz, rz = 0 }: { x: number; y: number; z: number; sx: number; sy: number; sz: number; rz?: number }) => <mesh position={[x, y, z]} scale={[sx, sy, sz]} rotation={[0, 0, rz]} castShadow material={material}><capsuleGeometry args={[1, 1.5, 10, 18]} /></mesh>;
  return <group ref={ref} position={[0, -2.25, 0]}>
    <Float speed={0.9} rotationIntensity={0.05} floatIntensity={0.08}>
      <group>
        <mesh position={[0, 3.8, 0]} castShadow material={material}><sphereGeometry args={[0.5, 28, 22]} /></mesh>
        <mesh position={[0, 2.55, 0]} scale={[0.96, 1.25, 0.55]} castShadow material={material}><capsuleGeometry args={[0.8, 1.45, 10, 22]} /></mesh>
        <Limb x={-0.92} y={2.7} z={0} sx={0.22} sy={1.0} sz={0.22} rz={-0.2} />
        <Limb x={0.92} y={2.7} z={0} sx={0.22} sy={1.0} sz={0.22} rz={0.2} />
        <Limb x={-1.18} y={1.75} z={0} sx={0.17} sy={0.8} sz={0.17} rz={1.15} />
        <Limb x={1.18} y={1.75} z={0} sx={0.17} sy={0.8} sz={0.17} rz={-1.15} />
        <Limb x={-0.46} y={0.25} z={0} sx={0.29} sy={1.05} sz={0.29} />
        <Limb x={0.46} y={0.25} z={0} sx={0.29} sy={1.05} sz={0.29} />
        <Limb x={-0.6} y={-1.05} z={0} sx={0.31} sy={0.86} sz={0.31} />
        <Limb x={0.6} y={-1.05} z={0} sx={0.31} sy={0.86} sz={0.31} />
        <mesh position={[-0.62, -2.05, 0]} scale={[1.2, 0.4, 2.1]} material={material}><sphereGeometry args={[0.44, 24, 16]} /></mesh>
        <mesh position={[0.62, -2.05, 0]} scale={[1.2, 0.4, 2.1]} material={material}><sphereGeometry args={[0.44, 24, 16]} /></mesh>
      </group>
    </Float>
  </group>;
}

function MainScene() {
  return <>
    <color attach="background" args={['#480006']} />
    <fog attach="fog" args={['#480006', 8, 26]} />
    <ambientLight intensity={0.9} color="#ffd8d8" />
    <directionalLight position={[4, 7, 5]} intensity={2.6} color="#fff1f0" castShadow />
    <pointLight position={[0, 3, 3]} intensity={3} distance={10} color="#ffd8d8" />
    <CameraRig />
    <SparseParticles />
    <Fighter />
  </>;
}

function Section({ index, title, body }: { index: string; title: string; body: string }) {
  return <section data-scroll-section className="forge-section">
    <div className="section-index">{index}</div>
    <div className="section-copy"><div className="eyebrow"><span className="eyebrow-line" /> FORGE SYSTEM</div><h2 className="split-title">{title}</h2><p>{body}</p><div className="section-action">EXPLORE SYSTEM <ChevronRight size={14} /></div></div>
  </section>;
}

function Onboarding({ form, update, onClose, onSubmit }: { form: UserProfile; update: (key: keyof UserProfile, value: string) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <motion.div className="onboarding-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.form className="onboarding-panel onboarding-3d" onSubmit={onSubmit} initial={{ y: 60, opacity: 0, rotateX: 10 }} animate={{ y: 0, opacity: 1, rotateX: 0 }}>
      <button className="onboarding-close" type="button" onClick={onClose}><X size={18} /></button>
      <div className="eyebrow"><span className="eyebrow-line" /> ATHLETE DNA / CALIBRATION</div>
      <h2>Build your<br /><em>roadmap.</em></h2>
      <p className="form-intro">Give Forge a few signals and the existing profile system will build your starting plan.</p>
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

export default function LandingPageFixed() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [form, setForm] = useState<UserProfile>(initialForm);
  const [readout, setReadout] = useState('00');
  const setProfile = useMMAStore((state) => state.setProfile);
  const navigate = useNavigate();
  const update = (key: keyof UserProfile, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); setProfile(form); setShowOnboarding(false); navigate('/dashboard'); };

  useEffect(() => {
    const root = document.querySelector('.forge-landing') as HTMLElement | null;
    if (!root) return;
    const master = ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: (self) => { scrollProgress = self.progress; setReadout(String(Math.round(self.progress * 100)).padStart(2, '0')); } });
    const sectionTriggers = gsap.utils.toArray<HTMLElement>('[data-scroll-section]').map((section) => gsap.fromTo(section.querySelector('.section-copy'), { y: 100, opacity: 0, clipPath: 'inset(20% 0 0 0)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', ease: 'none', scrollTrigger: { trigger: section, start: 'top 82%', end: 'bottom 35%', scrub: 1.1 } }).scrollTrigger);
    return () => { master.kill(); sectionTriggers.forEach((trigger) => trigger?.kill()); };
  }, []);

  return <div className="forge-landing red-field-landing">
    <InputBus />
    <div className="forge-canvas-wrap"><Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 1.8, 9.5], fov: 46 }} gl={{ antialias: true, powerPreference: 'high-performance' }}><MainScene /></Canvas></div>
    <div className="hero-vignette red-vignette" />
    <div className="forge-progress"><span>SCROLL /</span><strong>{readout}</strong><i /></div>
    <section className="forge-hero" data-scroll-section>
      <div className="hero-kicker"><span>FORGE / MMA</span><span>3D TRAINING SYSTEM</span></div>
      <div className="hero-center">
        <div className="hero-micro">DISCIPLINE → FORM → IMPACT</div>
        <h1 className="hero-title"><span className="hero-word">FORGE</span><span className="hero-word title-offset">YOUR</span><span className="hero-word title-accent">FIGHT<b>.</b></span></h1>
        <p className="hero-sub">A responsive MMA training system that turns your profile into a practical starting roadmap for training, recovery and nutrition.</p>
        <div className="hero-cta-row"><MagneticButton onClick={() => setShowOnboarding(true)}>BUILD MY ROADMAP</MagneticButton><button className="ghost-cta" onClick={() => navigate('/training')}>ENTER TRAINING <ChevronRight size={16} /></button></div>
      </div>
      <div className="hero-bottom-scroll"><ArrowDown size={15} /> SCROLL THE EXPERIENCE</div>
    </section>
    <Section index="01" title="Training becomes a system." body="Sessions, consistency and recovery become one connected progression." />
    <Section index="02" title="Learn movement with intent." body="Use your current level, time and equipment to shape the starting rhythm." />
    <Section index="03" title="See the athlete, not just the workout." body="Understand anatomy, targets and progress through an interactive 3D environment." />
    <Section index="04" title="Keep recovery inside the loop." body="Nutrition and recovery belong inside the same plan as the training." />
    {showOnboarding && <Onboarding form={form} update={update} onClose={() => setShowOnboarding(false)} onSubmit={submit} />}
  </div>;
}
