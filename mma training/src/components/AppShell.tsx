import { ReactNode, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Activity, Brain, Dumbbell, Flame, Footprints, Gauge, Menu, UserRound, Utensils, X } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMMAStore } from '../store/useMMAStore';

const links = [
  { to: '/', label: 'DOJO', icon: Footprints }, { to: '/dashboard', label: 'COMMAND', icon: Gauge }, { to: '/training', label: 'TRAIN', icon: Dumbbell }, { to: '/anatomy', label: 'ANATOMY', icon: Brain }, { to: '/nutrition', label: 'FUEL', icon: Utensils }, { to: '/progress', label: 'PROGRESS', icon: Activity }, { to: '/profile', label: 'PROFILE', icon: UserRound },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profile = useMMAStore((state) => state.profile);
  const isLanding = location.pathname === '/';
  useEffect(() => setMenuOpen(false), [location.pathname]);
  return <div className="app-shell">
    {!isLanding && <header className="topbar"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={19} /></button><button className="brand-mark" onClick={() => navigate('/')}><span className="brand-symbol">↘</span><span>FORGE <small>/ MMA SYSTEM</small></span></button><div className="topbar-status"><span className="status-dot" /> SYSTEM ONLINE <span className="divider" /> {profile?.name ? profile.name.toUpperCase() : 'GUEST MODE'}</div><div className="topbar-id">ID / 0142 <span className="signal-bars">▂▅▇</span></div></header>}
    {!isLanding && <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}><div className="sidebar-head"><span>COMMAND RAIL</span><button className="close-menu" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={18} /></button></div><nav>{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={16} strokeWidth={1.5} /><span>{label}</span>{location.pathname === to && <motion.i layoutId="active-nav" />}</NavLink>)}</nav><div className="sidebar-footer"><span className="live-pulse" /> LIVE / TRAINING MODE<div className="sidebar-coordinates">37°46'12"N<br />122°25'09"W</div></div></aside>}
    {!isLanding && menuOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <main className={`content ${isLanding ? 'content-landing' : ''}`}><motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div></main>
    {!isLanding && <footer className="mobile-nav">{links.slice(0, 6).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={17} /><span>{label}</span></NavLink>)}</footer>}
  </div>;
}

export function PageLabel({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return <div className="page-heading"><div className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</div><h1>{title}</h1>{detail && <p>{detail}</p>}</div>;
}

export function MagneticButton({ children, onClick, variant = 'primary', type = 'button' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost'; type?: 'button' | 'submit' }) {
  return <motion.button type={type} className={`magnetic-button ${variant}`} whileHover={{ y: -2, scale: 1.015 }} whileTap={{ scale: 0.97 }} onClick={onClick}>{children}<span className="button-arrow">↗</span></motion.button>;
}

export function ProgressBar({ value, label, valueLabel }: { value: number; label?: string; valueLabel?: string }) {
  return <div className="progress-wrap">{label && <div className="progress-meta"><span>{label}</span><span>{valueLabel ?? `${value}%`}</span></div>}<div className="progress-track"><motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: 'easeOut' }} /></div></div>;
}

export function Stat({ value, label, accent = false }: { value: string | number; label: string; accent?: boolean }) {
  return <div className={`stat ${accent ? 'accent' : ''}`}><strong>{value}</strong><span>{label}</span></div>;
}

export function CornerMark() { return <span className="corner-mark">+</span>; }
