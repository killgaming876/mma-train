import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, ArrowDown, Brain, ChevronRight, CircleDot, Dumbbell, Gauge, ShieldCheck, Utensils, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MagneticButton } from '../components/AppShell';
import { useMMAStore, UserProfile } from '../store/useMMAStore';

gsap.registerPlugin(ScrollTrigger);

let storyProgress = 0;
let pointerX = 0;
let pointerY = 0;

const initialForm: UserProfile = {
  name: '', age: '', experience: 'BEGINNER', goal: 'Build conditioning', trainingDays: '3 DAYS',
  sessionDuration: '30 MIN', conditioning: 'BUILDING', equipment: 'GLOVES', nutrition: 'NO PREFERENCE', sleep: '7 HOURS',
};

function PointerBus() {
  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      pointerY = -(event.clientY / window.innerHeight) * 2 + 1;
      document.documentElement.style.setProperty('--mx', `${event.clientX}px`);
      document.documentElement.style.setProperty('--my', `${event.clientY}px`);
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);
  return null;
}

function CameraRig() {
  const { camera } = useThree();
  const curve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2.2, 9),
    new THREE.Vector3(2.3, 1.8, 6.2),
    new THREE.Vector3(-2.0, 1.35, 3.1),
    new THREE.Vector3(0, 1.1, 0.8),
    new THREE.Vector3(2.2, 1.8, 3.9),
    new THREE.Vector3(0, 2.4, 8),
  ], false, 'catmullrom', 0.7), []);

  useFrame(() => {
    const point = curve.getPointAt(Math.min(0.86, storyProgress * 0.86));
    camera.position.lerp(point, 0.055);
    camera.lookAt(0, 1.1, -0.7);
    const perspective = camera as THREE.PerspectiveCamera;
    perspective.fov = THREE.MathUtils.lerp(48, 32, storyProgress);
    perspective.updateProjectionMatrix();
  });

  return null;
}

function BodyMaterial({ accent = false }: { accent?: boolean }) {
  return <meshPhysicalMaterial
    color={accent ? '#baff3d' : '#0a120d'}
    metalness={accent ? 0.82 : 0.5}
    roughness={accent ? 0.2 : 0.34}
    clearcoat={0.9}
    clearcoatRoughness={0.18}
    emissive={accent ? '#43ff16' : '#061007'}
    emissiveIntensity={accent ? 1.45 : 0.35}
  />;
}

function Fighter() {
  const group = useRef<THREE.Group>(null);
  const clock = useRef(0);

  useFrame((_, delta) => {
    clock.current += delta;
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointerX * 0.22 + storyProgress * Math.PI * 0.72, 0.045);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointerY * 0.08, 0.04);
    group.current.position.y = Math.sin(clock.current * 1.25) * 0.05 + Math.sin(storyProgress * Math.PI) * 0.3;
    group.current.scale.setScalar(THREE.MathUtils.lerp(0.88, 1.14, storyProgress));
  });

  return (
    <group ref={group} position={[0, -2.1, 0]}>
      <Float speed={1.05} rotationIntensity={0.07} floatIntensity={0.1}>
        <group>
          <mesh position={[0, 3.85, 0]} castShadow><sphereGeometry args={[0.5, 28, 22]} /><BodyMaterial /></mesh>
          <mesh position={[0, 3.53, -0.42]} scale={[0.4, 0.16, 0.08]}><sphereGeometry args={[1, 24, 12]} /><BodyMaterial accent /></mesh>
          <mesh position={[0, 2.5, 0]} scale={[0.96, 1.26, 0.56]} castShadow><capsuleGeometry args={[0.8, 1.42, 10, 22]} /><BodyMaterial /></mesh>
          <mesh position={[0, 1.57, 0]} scale={[0.72, 0.48, 0.44]}><sphereGeometry args={[1, 24, 18]} /><BodyMaterial /></mesh>
          <mesh position={[-0.9, 2.72, 0]} rotation={[0, 0, -0.2]} castShadow><capsuleGeometry args={[0.18, 1.58, 10, 18]} /><BodyMaterial /></mesh>
          <mesh position={[0.9, 2.72, 0]} rotation={[0, 0, 0.2]} castShadow><capsuleGeometry args={[0.18, 1.58, 10, 18]} /><BodyMaterial /></mesh>
          <mesh position={[-1.18, 1.8, -0.04]} rotation={[0, 0, 1.2]}><capsuleGeometry args={[0.14, 1.18, 10, 18]} /><BodyMaterial /></mesh>
          <mesh position={[1.18, 1.8, -0.04]} rotation={[0, 0, -1.2]}><capsuleGeometry args={[0.14, 1.18, 10, 18]} /><BodyMaterial /></mesh>
          <mesh position={[-1.45, 1.1, -0.08]}><sphereGeometry args={[0.26, 24, 16]} /><BodyMaterial accent /></mesh>
          <mesh position={[1.45, 1.1, -0.08]}><sphereGeometry args={[0.26, 24, 16]} /><BodyMaterial accent /></mesh>
          <mesh position={[-0.44, 0.22, 0]} rotation={[0, 0, 0.05]}><capsuleGeometry args={[0.25, 2.1, 10, 18]} /><BodyMaterial /></mesh>
          <mesh position={[0.44, 0.22, 0]} rotation={[0, 0, -0.05]}><capsuleGeometry args={[0.25, 2.1, 10, 18]} /><BodyMaterial /></mesh>
          <mesh position={[-0.6, -1.0, -0.1]} rotation={[0.08, 0.06, 0.05]}><capsuleGeometry args={[0.27, 1.62, 10, 18]} /><BodyMaterial /></mesh>
          <mesh position={[0.6, -1.0, -0.1]} rotation={[0.08, -0.06, -0.05]}><capsuleGeometry args={[0.27, 1.62, 10, 18]} /><BodyMaterial /></mesh>
          <mesh position={[-0.64, -2.05, -0.1]} scale={[1.18, 0.42, 2.2]}><sphereGeometry args={[0.45, 24, 16]} /><BodyMaterial /></mesh>
          <mesh position={[0.64, -2.05, -0.1]} scale={[1.18, 0.42, 2.2]}><sphereGeometry args={[0.45, 24, 16]} /><BodyMaterial /></mesh>
        </group>
      </Float>
      <pointLight position={[0, 2, 1.5]} intensity={5} distance={8} color="#b7ff38" />
    </group>
  );
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const count = 14000;
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = Math.pow(Math.random(), 0.45) * 15;
      const angle = Math.random() * Math.PI * 2;
      values[i * 3] = Math.cos(angle) * radius;
      values[i * 3 + 1] = (Math.random() - 0.5) * 11;
      values[i * 3 + 2] = Math.sin(angle) * radius - 2;
    }
    return values;
  }, []);
  const geometry = useMemo(() => new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)), [positions]);
  const material = useMemo(() => new THREE.PointsMaterial({ color: '#8bff42', size: 0.018, transparent: true, opacity: 0.38, depthWrite: false, blending: THREE.AdditiveBlending }), []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.012 + storyProgress * 0.45;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.03;
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, pointerX * 0.5, 0.02);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, -pointerY * 0.25, 0.02);
    material.size = 0.014 + storyProgress * 0.022;
    material.opacity = 0.22 + storyProgress * 0.3;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

function Portal() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.08 + storyProgress * Math.PI * 1.2;
    ref.current.scale.setScalar(1 + storyProgress * 0.9);
  });
  return <group ref={ref} position={[0, 1.1, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
    {[0, 1, 2].map((index) => (
      <mesh key={index} scale={1 + index * 0.23}>
        <torusGeometry args={[1.7, 0.012 + index * 0.008, 12, 128]} />
        <meshBasicMaterial color={index === 0 ? '#c6ff48' : '#2a6b25'} transparent opacity={0.6 - index * 0.12} blending={THREE.AdditiveBlending} />
      </mesh>
    ))}
  </group>;
}

function Cityscape() {
  const blocks = useMemo(() => Array.from({ length: 52 }, (_, index) => ({
    x: (index % 13 - 6) * 2,
    z: -8 - Math.floor(index / 13) * 2.4,
    height: 0.5 + ((index * 13) % 21) / 6,
  })), []);
  return <group position={[0, -3, 0]}>{blocks.map((block, index) => (
    <mesh key={index} position={[block.x, block.height / 2, block.z]} scale={[0.86, block.height, 0.86]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#08110b" emissive="#173816" emissiveIntensity={0.08 + (index % 5 === 0 ? 0.35 : 0)} metalness={0.52} roughness={0.7} />
    </mesh>
  ))}</group>;
}

function MorphGrid() {
  const mesh = useRef<THREE.Mesh>(null);
  const shader = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 } },
    vertexShader: 'uniform float uTime; uniform float uScroll; varying float vWave; void main(){vec3 p=position;float w=sin(p.x*1.3+uTime)*.15+cos(p.y*1.7-uTime*.8)*.11;p.z+=w*(.2+uScroll*1.1);vWave=w;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}',
    fragmentShader: 'varying float vWave; void main(){float a=.06+abs(vWave)*.65;gl_FragColor=vec4(.16,.95,.07,a);}',
  }), []);

  useFrame((state) => {
    shader.uniforms.uTime.value = state.clock.elapsedTime;
    shader.uniforms.uScroll.value = storyProgress;
    if (mesh.current) mesh.current.rotation.z = storyProgress * 0.2;
  });

  return <mesh ref={mesh} position={[0, 1, -5]} rotation={[0, 0, -0.12]} material={shader}>
    <planeGeometry args={[18, 9, 40, 24]} />
  </mesh>;
}

function PostFX() {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  const glitchRef = useRef<GlitchPass | null>(null);

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.08;
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 1.15, 0.7, 0.2));
    const glitch = new GlitchPass();
    glitch.enabled = false;
    composer.addPass(glitch);
    const rgb = new ShaderPass(RGBShiftShader);
    rgb.uniforms.amount.value = 0.0007;
    composer.addPass(rgb);
    composer.addPass(new OutputPass());
    composer.setSize(size.width, size.height);
    composerRef.current = composer;
    glitchRef.current = glitch;
    return () => {
      composer.dispose();
      composerRef.current = null;
    };
  }, [gl, scene, camera, size.width, size.height]);

  useFrame((_, delta) => {
    if (!composerRef.current) return;
    if (glitchRef.current) glitchRef.current.enabled = (storyProgress > 0.43 && storyProgress < 0.54) || (storyProgress > 0.82 && storyProgress < 0.88);
    composerRef.current.render(delta);
  }, 1);

  return null;
}

function ArenaScene() {
  return <>
    <color attach="background" args={['#020503']} />
    <fog attach="fog" args={['#020503', 5, 26]} />
    <ambientLight intensity={0.52} color="#708a72" />
    <directionalLight position={[4, 8, 4]} intensity={2.2} color="#d6ffd0" castShadow />
    <pointLight position={[-5, 2, 2]} intensity={7} distance={16} color="#35ff2a" />
    <pointLight position={[6, 1, -2]} intensity={6} distance={18} color="#baff48" />
    <CameraRig />
    <ParticleField />
    <Sparkles count={900} scale={[18, 10, 18]} size={1.15} speed={0.15} color="#b1ff76" opacity={0.24} />
    <Cityscape />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.1, -2]} receiveShadow>
      <planeGeometry args={[34, 34, 32, 32]} />
      <meshStandardMaterial color="#040906" metalness={0.9} roughness={0.16} emissive="#0d230e" emissiveIntensity={0.1} />
    </mesh>
    <Portal />
    <MorphGrid />
    <Fighter />
    <PostFX />
  </>;
}

function Section({ index, eyebrow, title, body, icon, dark = false }: { index: string; eyebrow: string; title: string; body: string; icon: React.ReactNode; dark?: boolean }) {
  return <section data-scroll-section className={`forge-section ${dark ? 'forge-section-dark' : ''}`}>
    <div className="section-index">{index}</div>
    <div className="section-copy">
      <div className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</div>
      <h2 className="split-title">{title}</h2>
      <p>{body}</p>
      <div className="section-action">EXPLORE SYSTEM <ChevronRight size={14} /></div>
    </div>
    <div className="section-icon">{icon}</div>
  </section>;
}

function Onboarding({ form, update, onClose, onSubmit }: { form: UserProfile; update: (key: keyof UserProfile, value: string) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <motion.div className="onboarding-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.form className="onboarding-panel onboarding-3d" onSubmit={onSubmit} initial={{ y: 70, opacity: 0, rotateX: 12 }} animate={{ y: 0, opacity: 1, rotateX: 0 }}>
      <button className="onboarding-close" type="button" onClick={onClose}><X size={18} /></button>
      <div className="eyebrow"><span className="eyebrow-line" /> ATHLETE DNA / CALIBRATION</div>
      <h2>Build your<br /><em>roadmap.</em></h2>
      <p className="form-intro">Give Forge a few starting signals. The existing profile store will receive them and your dashboard will take over from there.</p>
      <label>CALL SIGN<input autoFocus required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Your name" /></label>
      <div className="form-grid">
        <label>EXPERIENCE<select value={form.experience} onChange={(event) => update('experience', event.target.value)}><option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option></select></label>
        <label>TRAINING DAYS<select value={form.trainingDays} onChange={(event) => update('trainingDays', event.target.value)}><option>2 DAYS</option><option>3 DAYS</option><option>4 DAYS</option><option>5 DAYS</option></select></label>
        <label>PRIMARY GOAL<select value={form.goal} onChange={(event) => update('goal', event.target.value)}><option>Build conditioning</option><option>Learn MMA</option><option>Improve striking</option><option>Self-defense education</option></select></label>
        <label>SESSION LENGTH<select value={form.sessionDuration} onChange={(event) => update('sessionDuration', event.target.value)}><option>20 MIN</option><option>30 MIN</option><option>45 MIN</option><option>60 MIN</option></select></label>
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
  useEffect(() => { const move = () => { pointerX *= 0.99; pointerY *= 0.99; }; window.addEventListener('blur', move); return () => window.removeEventListener('blur', move); }, []);

  const update = (key: keyof UserProfile, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); setProfile(form); setShowOnboarding(false); navigate('/dashboard'); };

  useEffect(() => {
    const root = document.querySelector('.forge-landing') as HTMLElement | null;
    if (!root) return;
    const triggers: ScrollTrigger[] = [];
    const master = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        storyProgress = self.progress;
        setReadout(String(Math.round(self.progress * 100)).padStart(2, '0'));
        root.style.setProperty('--scroll-progress', self.progress.toFixed(4));
      },
    });
    triggers.push(master);
    gsap.utils.toArray<HTMLElement>('[data-scroll-section]').forEach((section) => {
      const tween = gsap.fromTo(section.querySelector('.section-copy'), { y: 110, opacity: 0, clipPath: 'inset(25% 0 0 0)' }, { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', ease: 'none', scrollTrigger: { trigger: section, start: 'top 82%', end: 'bottom 35%', scrub: 1.1 } });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });
    gsap.to('.hero-title .hero-word', { yPercent: -20, stagger: 0.08, scrollTrigger: { trigger: root, start: 'top top', end: '+=1050', scrub: true } });
    gsap.to('.hero-sub', { xPercent: 16, opacity: 0.25, scrollTrigger: { trigger: root, start: 'top top', end: '+=850', scrub: true } });
    gsap.to('.hero-ring', { rotation: 240, scale: 1.5, scrollTrigger: { trigger: root, start: 'top top', end: '+=1500', scrub: true } });
    return () => { triggers.forEach((trigger) => trigger.kill()); };
  }, []);

  return <div className="forge-landing">
    <PointerBus />
    <div className="forge-noise" />
    <div className="forge-grid" />
    <div className="forge-cursor"><span /></div>
    <div className="forge-progress"><span>SCROLL /</span><strong>{readout}</strong><i /></div>
    <div className="forge-side-rail"><span>FORGE / MMA</span><span>SCROLL TO ADAPT</span></div>
    <div className="forge-canvas-wrap"><Canvas shadows dpr={[1, 1.4]} camera={{ position: [0, 2.2, 9], fov: 48 }} gl={{ antialias: true, powerPreference: 'high-performance' }}><ArenaScene /></Canvas></div>
    <div className="hero-vignette" />

    <section className="forge-hero" data-scroll-section>
      <div className="hero-kicker"><span>01 / ENTRY PROTOCOL</span><span>WEBGL / SCROLL ENGINE / LIVE</span></div>
      <div className="hero-center">
        <div className="hero-micro">DISCIPLINE → FORM → IMPACT</div>
        <h1 className="hero-title"><span className="hero-word">FORGE</span><span className="hero-word title-offset">YOUR</span><span className="hero-word title-accent">FIGHT<b>.</b></span></h1>
        <p className="hero-sub">A cinematic MMA training system that turns your answers into a structured roadmap for training, recovery and nutrition.</p>
        <div className="hero-cta-row"><MagneticButton onClick={() => setShowOnboarding(true)}>BUILD MY ROADMAP</MagneticButton><button className="ghost-cta" onClick={() => navigate('/training')}>ENTER TRAINING <ChevronRight size={16} /></button></div>
      </div>
      <div className="hero-meta"><span><CircleDot size={11} /> 3D ENGINE ONLINE</span><span>ADAPTIVE / SAFE / ATHLETE-FIRST</span></div>
      <div className="hero-ring" />
      <div className="hero-bottom-scroll"><ArrowDown size={15} /> SCROLL THE EXPERIENCE</div>
    </section>

    <Section index="01" eyebrow="COMMAND" title="Your training becomes a system." body="Sessions, consistency and recovery become one connected progression instead of disconnected workouts." icon={<Gauge size={70} />} />
    <Section index="02" eyebrow="TRAINING" title="Learn movement. Repeat with intent." body="Use your current level, weekly schedule and equipment to shape the starting training rhythm." icon={<Dumbbell size={70} />} dark />
    <Section index="03" eyebrow="ANATOMY" title="See where the work lands." body="Make targets and training emphasis more understandable with an anatomy-first view." icon={<Brain size={70} />} />
    <Section index="04" eyebrow="FUEL" title="Performance is built outside the mat." body="Nutrition and recovery belong inside the training loop, not as an afterthought." icon={<Utensils size={70} />} dark />
    <Section index="05" eyebrow="PROGRESS" title="The graph should move because you did." body="Track completed sessions and training consistency so progress becomes visible." icon={<Activity size={70} />} />

    <section className="forge-final" data-scroll-section>
      <div className="final-grid" />
      <div className="final-copy"><div className="eyebrow"><span className="eyebrow-line" /> FINAL CALIBRATION</div><h2>BUILD THE<br /><em>ROADMAP.</em></h2><p>Give Forge the signals. Start with a plan. Keep adapting.</p><MagneticButton onClick={() => setShowOnboarding(true)}>GENERATE MY ROADMAP</MagneticButton></div>
      <div className="final-readout"><span>OUTPUT</span><strong>00 → 100</strong><i>TRAIN / RECOVER / REPEAT</i></div>
    </section>

    {showOnboarding && <Onboarding form={form} update={update} onClose={() => setShowOnboarding(false)} onSubmit={submit} />}
  </div>;
}
