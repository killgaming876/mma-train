import { useEffect, useState } from 'react';
import { Check, ChevronRight, Pause, Play, RotateCcw, Timer, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMMAStore } from '../store/useMMAStore';
import { workouts } from '../data/training';
import { CornerMark, MagneticButton, PageLabel, ProgressBar } from '../components/AppShell';

export default function TrainingPage() {
  const workout = workouts[0];
  const [seconds, setSeconds] = useState(37);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [activeExercise, setActiveExercise] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const completeWorkout = useMMAStore((state) => state.completeWorkout);

  useEffect(() => { if (!running) return undefined; const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [running]);

  const finish = () => { setFinished(true); setRunning(false); completeWorkout(workout.id); };
  const reset = () => { setSeconds(37); setRunning(false); setFinished(false); };

  return <div className="page-shell training-page">
    <div className="page-top-row"><PageLabel eyebrow="TRAINING ROOM / CURRENT SESSION" title="Stance / distance." detail="Technical foundation · controlled output · 24 minutes" /><div className="session-id">SESSION<br /><strong>01 — 04</strong></div></div>
    <div className="training-grid">
      <section className="workout-stage glass-panel"><CornerMark />
        <div className="stage-header"><div><span className="eyebrow">BLOCK 01 / TECHNIQUE</span><h2>Move like you<br /><em>mean it.</em></h2></div><span className="stage-index">0{activeExercise + 1} / {String(workout.exercises.length).padStart(2, '0')}</span></div>
        <div className="training-visual"><div className="scan-grid" /><motion.div className="training-orb" animate={{ scale: running ? [1, 1.08, 1] : 1, rotate: running ? 360 : 0 }} transition={{ repeat: running ? Infinity : 0, duration: 8, ease: 'linear' }}><span>{workout.exercises[activeExercise].split(' ').slice(0, 2).join(' ')}<br /><small>RESET</small></span></motion.div><div className="visual-label label-one">CENTERLINE / 01</div><div className="visual-label label-two">BREATH / 4 × 4</div></div>
        <div className="timer-row"><div className="big-timer"><span>{running ? 'WORK' : finished ? 'DONE' : 'READY'}</span><strong>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</strong></div><button className="icon-button" onClick={reset} aria-label="Reset timer"><RotateCcw size={16} /></button><button className="icon-button" onClick={() => setRunning((value) => !value)} aria-label={running ? 'Pause timer' : 'Start timer'}>{running ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}</button><button className={`icon-button ${soundOn ? 'active' : ''}`} onClick={() => setSoundOn((value) => !value)} aria-label={soundOn ? 'Mute training sounds' : 'Enable training sounds'}>{soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}</button></div>
        <div className="stage-footer"><ProgressBar value={Math.min(100, 32 + activeExercise * 22 + (finished ? 30 : 0))} label="BLOCK PROGRESS" valueLabel={finished ? 'COMPLETE' : `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')} / 05:20`} /><MagneticButton onClick={finish}>{finished ? 'SESSION COMPLETE' : 'COMPLETE BLOCK'}</MagneticButton></div>
      </section>
      <aside className="exercise-rail"><div className="rail-heading"><span>SEQUENCE / {String(workout.exercises.length).padStart(2, '0')}</span><Timer size={15} /></div>{workout.exercises.map((exercise, index) => <button key={exercise} type="button" onClick={() => { setActiveExercise(index); setRunning(false); }} className={`exercise-item ${index === activeExercise ? 'active' : ''}`}><span className="exercise-number">0{index + 1}</span><span><strong>{exercise}</strong><small>{index === activeExercise ? 'IN PROGRESS' : index === activeExercise + 1 ? 'NEXT UP' : 'AVAILABLE'}</small></span><ChevronRight size={15} /></button>)}<div className="coach-note"><div className="eyebrow">COACH NOTE</div><p>“Make the reset so clean that it becomes automatic.”</p><span>— FORGE SYSTEM / 01</span></div><div className="safety-note"><Check size={15} /> Train within your range. Quality first.</div></aside>
    </div>
  </div>;
}
