import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowUpRight, Brain, Command, Dumbbell, Flame, Gauge, Search, Sparkles, Target, Utensils, X, Zap } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMMAStore } from '../store/useMMAStore';

type CommandItem = { label: string; path: string; description: string; icon: typeof Gauge };

const commands: CommandItem[] = [
  { label: 'COMMAND CENTER', path: '/dashboard', description: 'Daily operating picture', icon: Gauge },
  { label: 'TRAINING', path: '/training', description: 'Movement & conditioning', icon: Dumbbell },
  { label: 'ANATOMY', path: '/anatomy', description: 'Target map & weak links', icon: Target },
  { label: 'FUEL', path: '/nutrition', description: 'Meals & recovery', icon: Utensils },
  { label: 'PROGRESS', path: '/progress', description: 'Consistency & adaptation', icon: Activity },
  { label: 'PROFILE', path: '/profile', description: 'Athlete configuration', icon: Brain },
];

export function CommandCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useMMAStore((state) => state.profile);
  const streak = useMMAStore((state) => state.trainingStreak);
  const completed = useMMAStore((state) => state.completedWorkouts.length);
  const roadmap = useMMAStore((state) => state.roadmap);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coachOpen, setCoachOpen] = useState(false);
  const [intensity, setIntensity] = useState(72);

  const roadmapProgress = roadmap.length ? Math.round((roadmap.filter((step) => step.complete).length / roadmap.length) * 100) : 0;
  const filtered = useMemo(() => commands.filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(query.toLowerCase())), [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === 'Escape') {
        setOpen(false);
        setCoachOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  return <>
    {!location.pathname.includes('/profile') && <div className="command-center-bar">
      <button type="button" className="command-search-trigger" onClick={() => setOpen(true)} aria-label="Open command search">
        <Search size={14} /><span>SEARCH COMMANDS / TECHNIQUES / MEALS</span><kbd>⌘ K</kbd>
      </button>
      <div className="command-live-metrics">
        <span><Flame size={13} /> {streak}D STREAK</span>
        <span><Zap size={13} /> {completed} SESSIONS</span>
        <span><span className="status-dot" /> {roadmapProgress}% ROADMAP</span>
      </div>
      <button type="button" className={`coach-trigger ${coachOpen ? 'active' : ''}`} onClick={() => setCoachOpen((value) => !value)}><Sparkles size={14} /> AI COACH</button>
    </div>}

    <AnimatePresence>
      {coachOpen && <motion.aside className="context-ai-bar" initial={{ opacity: 0, y: -14, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: .98 }}>
        <div className="ai-orb"><Sparkles size={17} /></div>
        <div className="ai-copy"><span>CONTEXTUAL COACH / LIVE</span><strong>{profile?.name ? `${profile.name.toUpperCase()}, PUSH THE QUALITY.` : 'BUILD YOUR ATHLETE PROFILE FIRST.'}</strong><small>{profile ? `Current training intensity is ${intensity}%. Keep technique clean before adding volume.` : 'Your roadmap, recovery and training targets will appear here after onboarding.'}</small></div>
        <div className="ai-controls"><label>INTENSITY <b>{intensity}%</b><input aria-label="Training intensity" type="range" min="20" max="100" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} /></label><button type="button" onClick={() => go(profile ? '/training' : '/profile')}>{profile ? 'START SESSION' : 'CONFIGURE'} <ArrowUpRight size={13} /></button></div>
        <button type="button" className="ai-close" aria-label="Close AI coach" onClick={() => setCoachOpen(false)}><X size={15} /></button>
      </motion.aside>}
    </AnimatePresence>

    <AnimatePresence>
      {open && <motion.div className="command-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setOpen(false)}>
        <motion.div className="quick-switcher" initial={{ opacity: 0, y: -18, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: .98 }} transition={{ duration: .22 }} onMouseDown={(event) => event.stopPropagation()}>
          <div className="quick-switcher-head"><Command size={15} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Jump to a system..." /><kbd>ESC</kbd></div>
          <div className="quick-switcher-section">SYSTEMS</div>
          <div className="quick-switcher-list">{filtered.map((item, index) => { const Icon = item.icon; return <button type="button" key={item.path} className="quick-command" onClick={() => go(item.path)}><span className="quick-index">0{index + 1}</span><span className="quick-icon"><Icon size={16} /></span><span><strong>{item.label}</strong><small>{item.description}</small></span><ArrowUpRight size={14} /></button>; })}</div>
          {!filtered.length && <div className="quick-empty">NO COMMAND MATCHES / TRY “TRAIN”, “FUEL” OR “ANATOMY”</div>}
          <div className="quick-switcher-foot"><span><Command size={11} /> QUICK SWITCHER</span><span>ENTER OPEN / ESC CLOSE</span></div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </>;
}
