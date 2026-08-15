import { ReactNode, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Activity, ArrowUpRight, Brain, ChevronRight, Dumbbell, Flame, Footprints, Gauge, Globe2, Menu, Orbit, ShieldCheck, Sparkles, UserRound, Utensils, X, Zap } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { useMMAStore } from '../store/useMMAStore';
import { CinematicBackdrop } from './webgl/CinematicBackdrop';

const links = [
  { to: '/', label: 'DOJO', short: '01', icon: Footprints, description: 'Cinematic entry system' },
  { to: '/dashboard', label: 'COMMAND', short: '02', icon: Gauge, description: 'Daily operating picture' },
  { to: '/training', label: 'TRAIN', short: '03', icon: Dumbbell, description: 'Movement & conditioning' },
  { to: '/anatomy', label: 'ANATOMY', short: '04', icon: Brain, description: 'Target map & weak links' },
  { to: '/nutrition', label: 'FUEL', short: '05', icon: Utensils, description: 'Meals & recovery fuel' },
  { to: '/progress', label: 'PROGRESS', short: '06', icon: Activity, description: 'Consistency & adaptation' },
  { to: '/profile', label: 'PROFILE', short: '07', icon: UserRound, description: 'Athlete configuration' },
];

function GlassFooter({ onTop }: { onTop: () => void }) {
  const navigate = useNavigate();
  const profile = useMMAStore((state) => state.profile);
  const roadmap = useMMAStore((state) => state.roadmap);
  const completed = useMMAStore((state) => state.completedWorkouts);
  const streak = useMMAStore((state) => state.trainingStreak);
  const progress = roadmap.length ? Math.round((roadmap.filter((item) => item.complete).length / roadmap.length) * 100) : 0;
  const footerLinks = useMemo(() => links.filter((item) => item.to !== '/'), []);

  return <footer className="beast-footer">
    <div className="beast-footer-orbit beast-footer-orbit-a" />
    <div className="beast-footer-orbit beast-footer-orbit-b" />
    <div className="beast-footer-scan" />
    <div className="beast-footer-inner">
      <div className="footer-command-row">
        <div className="footer-brand-block">
          <button type="button" className="footer-brand" onClick={() => navigate('/')}><span className="footer-brand-mark"><Orbit size={19} /></span><span>FORGE <small>/ MMA SYSTEM</small></span></button>
          <p>Train with intent. Move with precision. Build an athlete system that reacts to the work you actually do.</p>
        </div>
        <div className="footer-live-readout"><span className="footer-status"><i /> SYSTEM ONLINE</span><strong>{String(progress).padStart(2, '0')}%</strong><small>ROADMAP OUTPUT</small></div>
      </div>
      <div className="footer-main-grid">
        <div className="footer-manifesto"><div className="footer-eyebrow"><span /> FORGE / 2026</div><h2>THE WORK<br /><em>IS THE DATA.</em></h2><p>{profile?.name ? `${profile.name.toUpperCase()}, YOUR CURRENT SYSTEM IS ${progress}% BUILT. KEEP MOVING.` : 'YOUR SYSTEM STARTS WITH A FEW SIGNALS. THE REST IS BUILT THROUGH CONSISTENT WORK.'}</p><div className="footer-actions"><button type="button" className="footer-primary" onClick={() => navigate(profile ? '/dashboard' : '/')} >{profile ? 'OPEN COMMAND' : 'BUILD ROADMAP'} <ArrowUpRight size={15} /></button><button type="button" className="footer-secondary" onClick={onTop}>BACK TO TOP <ChevronRight size={14} /></button></div></div>
        <div className="footer-nav-column"><span className="footer-column-label">COMMAND RAIL</span><nav>{footerLinks.map((item) => <button type="button" key={item.to} className="footer-link" onClick={() => navigate(item.to)}><span>{item.short}</span><strong>{item.label}</strong><ArrowUpRight size={13} /></button>)}</nav></div>
        <div className="footer-signal-panel"><span className="footer-column-label">LIVE SIGNALS</span><div className="footer-signal-card"><Zap size={15} /><div><strong>{completed.length}</strong><span>SESSIONS LOGGED</span></div></div><div className="footer-signal-card"><Flame size={15} /><div><strong>{streak}</strong><span>DAY STREAK</span></div></div><div className="footer-signal-card"><ShieldCheck size={15} /><div><strong>SAFE</strong><span>EDUCATIONAL MODE</span></div></div><div className="footer-chip-row"><span><Sparkles size={12} /> 3D ENGINE</span><span><Globe2 size={12} /> RESPONSIVE</span></div></div>
      </div>
      <div className="footer-bottom-bar"><span>FORGE / ATHLETE OPERATING SYSTEM</span><span>WEBGL · GSAP · R3F</span><span>V. 02.00</span></div>
    </div>
  </footer>;
}

function SidebarBody({ profile, menuOpen, setMenuOpen }: { profile: ReturnType<typeof useMMAStore.getState>['profile']; menuOpen: boolean; setMenuOpen: (value: boolean) => void }) {
  const navigate = useNavigate();
  return <>
    <div className="sidebar-head glass-subhead"><span>COMMAND RAIL / {profile ? 'ATHLETE' : 'GUEST'}</span>{menuOpen && <button className="close-menu glass-icon-button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={18} /></button>}</div>
    <div className="sidebar-orbit"><span /><span /><span /></div>
    <nav className="glass-nav-list">{links.map(({ to, label, short, icon: Icon, description }) => <NavLink key={to} end={to === '/'} to={to} className={({ isActive }) => `nav-link glass-nav-link ${isActive ? 'active' : ''}`}>{({ isActive }) => <><span className="nav-index">{short}</span><span className="nav-icon"><Icon size={16} strokeWidth={1.6} /></span><span className="nav-copy"><strong>{label}</strong><small>{description}</small></span>{isActive && <motion.i layoutId="shell-active-nav" className="nav-active-dot" />}</>}</NavLink>)}</nav>
    <div className="sidebar-command-card"><span className="live-pulse" /> LIVE / TRAINING MODE<strong>{profile?.name ? profile.name.toUpperCase() : 'GUEST ATHLETE'}</strong><button type="button" onClick={() => navigate('/profile')}>CONFIGURE SYSTEM <ArrowUpRight size={12} /></button></div>
  </>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useMMAStore((state) => state.profile);
  const isLanding = location.pathname === '/';
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 180, damping: 20, mass: 0.4 });

  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => { const onMove = (event: PointerEvent) => { x.set((event.clientX / window.innerWidth - 0.5) * 10); y.set((event.clientY / window.innerHeight - 0.5) * 7); document.documentElement.style.setProperty('--shell-mx', `${event.clientX}px`); document.documentElement.style.setProperty('--shell-my', `${event.clientY}px`); }; window.addEventListener('pointermove', onMove, { passive: true }); return () => window.removeEventListener('pointermove', onMove); }, [x, y]);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return <div className={`app-shell ${isLanding ? 'shell-landing' : 'shell-inner'}`}>
    {!isLanding && <CinematicBackdrop />}
    {!isLanding && <div className="shell-hud" aria-hidden="true"><span>3D / ACTIVE</span><span className="shell-hud-line" /><span>SCROLL FIELD / ONLINE</span></div>}
    {!isLanding && <header className="topbar glass-commandbar" style={{ transform: `translate3d(${springX.get()}px, ${springY.get()}px, 0)` }}><div className="topbar-left"><button className="mobile-menu glass-icon-button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={18} /></button><button className="brand-mark glass-brand" type="button" onClick={() => navigate('/')}><span className="brand-symbol"><Orbit size={13} /></span><span>FORGE <small>/ MMA SYSTEM</small></span></button></div><div className="topbar-status"><span className="status-dot" /> SYSTEM ONLINE <span className="divider" /> {profile?.name ? profile.name.toUpperCase() : 'GUEST MODE'}</div><button type="button" className="topbar-id glass-status-pill" onClick={() => navigate('/profile')}>ID / 0142 <span className="signal-bars">▂▅▇</span></button></header>}
    <AnimatePresence>{menuOpen && !isLanding && <><motion.button className="scrim glass-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} /><motion.aside className="sidebar glass-sidebar is-open mobile-sidebar" initial={{ x: -245, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -245, opacity: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}><SidebarBody profile={profile} menuOpen setMenuOpen={setMenuOpen} /></motion.aside></>}</AnimatePresence>
    {!isLanding && <aside className="sidebar glass-sidebar desktop-sidebar"><SidebarBody profile={profile} menuOpen={false} setMenuOpen={setMenuOpen} /></aside>}
    <main className={`content ${isLanding ? 'content-landing' : ''}`}><motion.div className="route-stage" key={location.pathname} initial={{ opacity: 0, y: 14, rotateX: 1.5 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div></main>
    {!isLanding && <footer className="mobile-nav glass-mobile-nav">{links.slice(0, 6).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}><Icon size={17} /><span>{label}</span></NavLink>)}</footer>}
    <GlassFooter onTop={scrollTop} />
  </div>;
}

export function PageLabel({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) { return <div className="page-heading"><div className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</div><h1>{title}</h1>{detail && <p>{detail}</p>}</div>; }
export function MagneticButton({ children, onClick, variant = 'primary', type = 'button' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost'; type?: 'button' | 'submit' }) { return <motion.button type={type} className={`magnetic-button ${variant} magnetic-system`} whileHover={{ y: -3, scale: 1.025, rotateX: 1.5 }} whileTap={{ scale: 0.96 }} onClick={onClick}>{children}<span className="button-arrow">↗</span><span className="button-glow" /></motion.button>; }
export function ProgressBar({ value, label, valueLabel }: { value: number; label?: string; valueLabel?: string }) { return <div className="progress-wrap">{label && <div className="progress-meta"><span>{label}</span><span>{valueLabel ?? `${value}%`}</span></div>}<div className="progress-track"><motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: 'easeOut' }} /></div></div>; }
export function Stat({ value, label, accent = false }: { value: string | number; label: string; accent?: boolean }) { return <div className={`stat ${accent ? 'accent' : ''}`}><strong>{value}</strong><span>{label}</span></div>; }
export function CornerMark() { return <span className="corner-mark">+</span>; }
