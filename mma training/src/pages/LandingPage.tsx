import { FormEvent, useState } from 'react';
import { ArrowDown, ChevronRight, CircleDot, ShieldCheck, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Experience } from '../scenes/Experience';
import { useMMAStore, UserProfile } from '../store/useMMAStore';
import { MagneticButton } from '../components/AppShell';

const initialForm: UserProfile = { name: '', age: '', experience: 'BEGINNER', goal: 'Build conditioning', trainingDays: '3 DAYS', sessionDuration: '30 MIN', conditioning: 'BUILDING', equipment: 'GLOVES', nutrition: 'NO PREFERENCE', sleep: '7 HOURS' };

export default function LandingPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [form, setForm] = useState(initialForm);
  const setProfile = useMMAStore((state) => state.setProfile);
  const navigate = useNavigate();
  const update = (key: keyof UserProfile, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); setProfile(form); navigate('/dashboard'); };
  return <div className="landing-page"><Experience className="hero-scene" /><div className="hero-vignette" /><section className="hero-content"><div className="hero-kicker"><span>01 / ENTRY PROTOCOL</span><span>EST. 2025 // ATHLETE OPERATING SYSTEM</span></div><div className="hero-title-wrap"><div className="hero-index">[ 00.01 ]</div><h1 className="hero-title"><span>FORGE</span><span className="title-offset">YOUR</span><span className="title-accent">WEAPON<span className="title-dot">.</span></span></h1><div className="hero-side-note">A performance system for<br />the disciplined few.</div></div><div className="hero-bottom"><p>TRAIN WITH INTENT.<br />MOVE WITH PRECISION.</p><MagneticButton onClick={() => setShowOnboarding(true)}>ENTER THE DOJO</MagneticButton><div className="hero-scroll"><ArrowDown size={15} /> SCROLL TO EXPLORE</div></div></section><div className="hero-coordinates">LAT 37.7749° N <span /> LONG 122.4194° W</div><div className="hero-footer"><span>WEBGL / ACTIVE</span><span><CircleDot size={11} /> ADAPTIVE EXPERIENCE</span><span>V. 01.01</span></div>
    {showOnboarding && <motion.div className="onboarding-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><motion.form className="onboarding-panel" onSubmit={submit} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><button className="onboarding-close" type="button" onClick={() => setShowOnboarding(false)}><X size={18} /></button><div className="eyebrow"><span className="eyebrow-line" /> ENTRY PROFILE / 01</div><h2>Build your<br /><em>baseline.</em></h2><p className="form-intro">Four quick signals help shape your first week. You can revise them at any time.</p><label>CALL SIGN<input autoFocus required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" /></label><div className="form-grid"><label>EXPERIENCE<select value={form.experience} onChange={(e) => update('experience', e.target.value)}><option>BEGINNER</option><option>INTERMEDIATE</option><option>ADVANCED</option></select></label><label>TRAINING DAYS<select value={form.trainingDays} onChange={(e) => update('trainingDays', e.target.value)}><option>2 DAYS</option><option>3 DAYS</option><option>4 DAYS</option><option>5 DAYS</option></select></label><label>PRIMARY GOAL<select value={form.goal} onChange={(e) => update('goal', e.target.value)}><option>Build conditioning</option><option>Learn MMA</option><option>Improve striking</option><option>Self-defense education</option></select></label><label>SESSION LENGTH<select value={form.sessionDuration} onChange={(e) => update('sessionDuration', e.target.value)}><option>20 MIN</option><option>30 MIN</option><option>45 MIN</option><option>60 MIN</option></select></label></div><div className="form-footer"><span><ShieldCheck size={15} /> EDUCATIONAL / ADAPTIVE / SAFE</span><MagneticButton type="submit">GENERATE ROADMAP</MagneticButton></div></motion.form></motion.div>}
  </div>;
}
