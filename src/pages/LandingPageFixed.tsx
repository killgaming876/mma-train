import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  const look = useRef(new THREE.Vector3(0, 1.1, 0));
  const targetLook = useRef(new THREE.Vector3());
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.6, 9.2),
    new THREE.Vector3(1.3, 1.45, 8.1),
    new THREE.Vector3(-1.1, 1.2, 6.3),
    new THREE.Vector3(0.8, 1.0, 4.4),
  ], false, 'catmullrom', 0.7), []);
  useFrame(() => {
    const point = curve.getPointAt(Math.min(0.9, scrollProgress * 0.88));
    point.x += pointerX * 0.26;
    point.y += pointerY * 0.12;
    camera.position.lerp(point, 0.025);
    targetLook.current.set(pointerX * 0.12, 1.15 + pointerY * 0.08, 0);
    look.current.lerp(targetLook.current, 0.035);
    camera.lookAt(look.current);
  });
  return null;
}

function DustField() {
  const ref = useRef<THREE.Points>(null);
  const count = typeof window !== 'undefined' && window.innerWidth < 760 ? 420 : 900;
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const radius = 3.5 + Math.random() * 11;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 2;
      seeds[i] = Math.random() * 6.28;
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    return g;
  }, [count]);
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 } },
    vertexShader: `attribute float aSeed; uniform float uTime; varying float vAlpha; void main(){vec3 p=position;p.x+=sin(uTime*.11+aSeed)*.05;p.y+=cos(uTime*.09+aSeed)*.045;p.z+=sin(uTime*.1+aSeed)*.04;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=1.25*(8.0/max(4.0,-mv.z));vAlpha=.08+.28*(.5+.5*sin(aSeed+uTime*.5));gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `varying float vAlpha;void main(){vec2 uv=gl_PointCoord-.5;float d=length(uv);float a=smoothstep(.5,.08,d)*vAlpha;gl_FragColor=vec4(.32,.68,1.0,a);}`,
  }), []);
  useFrame((state) => { material.uniforms.uTime.value = state.clock.elapsedTime; });
  return <points ref={ref} geometry={geometry} material={material} />;
}

function MMAHeroModel() {
  const group = useRef<THREE.Group>(null);
  const skin = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a9b7c2', roughness: 0.58, metalness: 0.08 }), []);
  const suit = useMemo(() => new THREE.MeshStandardMaterial({ color: '#07101a', roughness: 0.35, metalness: 0.55 }), []);
  const glove = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0c6dbe', roughness: 0.28, metalness: 0.36, emissive: '#082746', emissiveIntensity: 0.32 }), []);
  const edge = useMemo(() => new THREE.MeshBasicMaterial({ color: '#61c6ff', transparent: true, opacity: 0.16, wireframe: true }), []);

  useFrame((state) => {
    if (!group.current) return;
    const targetY = pointerX * 0.22 + scrollProgress * Math.PI * 0.48;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.035);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointerY * 0.06, 0.035);
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.65) * 0.035 + scrollProgress * 0.12;
    group.current.scale.setScalar(1.0 + scrollProgress * 0.08);
  });

  const Limb = ({ position, scale, rotation = [0, 0, 0] }: { position: [number, number, number]; scale: [number, number, number]; rotation?: [number, number, number] }) => (
    <mesh position={position} scale={scale} rotation={rotation} material={skin}>
      <capsuleGeometry args={[0.34, 1.15, 4, 8]} />
    </mesh>
  );

  return <group ref={group} position={[0.95, -2.25, 0.15]}>
    <mesh position={[0, 3.9, 0]} material={skin}><icosahedronGeometry args={[0.5, 2]} /></mesh>
    <mesh position={[0, 3.1, 0]} scale={[0.62, 0.28, 0.52]} material={suit}><sphereGeometry args={[0.72, 12, 8]} /></mesh>
    <mesh position={[0, 2.55, 0]} scale={[0.9, 1.25, 0.52]} material={skin}><capsuleGeometry args={[0.68, 1.25, 5, 10]} /></mesh>
    <mesh position={[0, 1.35, 0]} scale={[1.05, 0.5, 0.7]} material={suit}><boxGeometry args={[1.2, 0.9, 0.75]} /></mesh>
    <Limb position={[-0.9, 2.65, 0]} scale={[0.32, 0.9, 0.32]} rotation={[0, 0, -0.22]} />
    <Limb position={[0.9, 2.65, 0]} scale={[0.32, 0.9, 0.32]} rotation={[0, 0, 0.22]} />
    <Limb position={[-1.28, 1.85, -0.02]} scale={[0.26, 0.72, 0.26]} rotation={[0, 0, 0.85]} />
    <Limb position={[1.28, 1.85, -0.02]} scale={[0.26, 0.72, 0.26]} rotation={[0, 0, -0.85]} />
    <mesh position={[-1.68, 1.52, 0]} scale={[0.5, 0.4, 0.42]} material={glove}><dodecahedronGeometry args={[0.46, 1]} /></mesh>
    <mesh position={[1.68, 1.52, 0]} scale={[0.5, 0.4, 0.42]} material={glove}><dodecahedronGeometry args={[0.46, 1]} /></mesh>
    <Limb position={[-0.52, 0.35, 0]} scale={[0.36, 1.15, 0.36]} />
    <Limb position={[0.52, 0.35, 0]} scale={[0.36, 1.15, 0.36]} />
    <Limb position={[-0.6, -1.05, 0]} scale={[0.38, 0.95, 0.38]} />
    <Limb position={[0.6, -1.05, 0]} scale={[0.38, 0.95, 0.38]} />
    <mesh position={[-0.63, -2.0, 0.08]} scale={[0.7, 0.22, 1.25]} material={suit}><boxGeometry args={[1.1, 0.48, 1.8]} /></mesh>
    <mesh position={[0.63, -2.0, 0.08]} scale={[0.7, 0.22, 1.25]} material={suit}><boxGeometry args={[1.1, 0.48, 1.8]} /></mesh>
    <mesh scale={1.55} material={edge}><icosahedronGeometry args={[1.0, 2]} /></mesh>
  </group>;
}

function MainScene() {
  return <>
    <color attach="background" args={['#010204']} />
    <fog attach="fog" args={['#010204', 9, 24]} />
    <ambientLight intensity={0.38} color="#a8ddff" />
    <directionalLight position={[4, 6, 5]} intensity={1.2} color="#e1f4ff" />
    <pointLight position={[2, 2, 2]} intensity={1.8} distance={10} color="#318cff" />
    <pointLight position={[-3, 0, -2]} intensity={1.0} distance={8} color="#57c7ff" />
    <CameraRig />
    <DustField />
    <MMAHeroModel />
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
    <motion.form className="onboarding-panel onboarding-3d" onSubmit={onSubmit} initial={{ y: 50, opacity: 0, rotateX: 8 }} animate={{ y: 0, opacity: 1, rotateX: 0 }}>
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
    const master = ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.7, onUpdate: (self) => { scrollProgress = self.progress; setReadout(String(Math.round(self.progress * 100)).padStart(2, '0')); } });
    const sectionTriggers = gsap.utils.toArray<HTMLElement>('[data-scroll-section]').slice(1).map((section) => gsap.fromTo(section.querySelector('.section-copy'), { y: 70, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top 82%', end: 'bottom 42%', scrub: 0.8 } }).scrollTrigger);
    return () => { master.kill(); sectionTriggers.forEach((trigger) => trigger?.kill()); };
  }, []);

  return <div className="forge-landing">
    <InputBus />
    <div className="forge-canvas-wrap"><Canvas dpr={[0.75, 1.1]} camera={{ position: [0, 1.6, 9.2], fov: 46 }} gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}><MainScene /></Canvas></div>
    <div className="hero-vignette" />
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
