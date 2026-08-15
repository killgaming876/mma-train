import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { AppShell } from './components/AppShell';
import { CommandCenter } from './components/CommandCenter';
import './styles/command-center.css';
import LandingPage from './pages/LandingPageFixed';
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TrainingPage = lazy(() => import('./pages/TrainingPage'));
const AnatomyPage = lazy(() => import('./pages/AnatomyPage'));
const NutritionPage = lazy(() => import('./pages/NutritionPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf); };
    frame = requestAnimationFrame(raf);
    gsap.defaults({ ease: 'power3.out', duration: 0.8 });
    return () => { cancelAnimationFrame(frame); lenis.destroy(); };
  }, []);
  return <AppShell><CommandCenter /><Suspense fallback={<div className="route-loading"><span className="status-dot" /> LOADING SYSTEM</div>}><Routes><Route path="/" element={<LandingPage />} /><Route path="/dashboard" element={<DashboardPage />} /><Route path="/training" element={<TrainingPage />} /><Route path="/anatomy" element={<AnatomyPage />} /><Route path="/nutrition" element={<NutritionPage />} /><Route path="/progress" element={<ProgressPage />} /><Route path="/profile" element={<ProfilePage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></Suspense></AppShell>;
}
