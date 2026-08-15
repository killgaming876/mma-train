import { useMemo } from 'react';
import { Crosshair, Info, Move3d, RotateCcw } from 'lucide-react';
import { anatomyRegions } from '../data/training';
import { AnatomyScene } from '../scenes/Experience';
import { useMMAStore } from '../store/useMMAStore';
import { MagneticButton, PageLabel } from '../components/AppShell';

export default function AnatomyPage() {
  const selectedId = useMMAStore((state) => state.selectedBodyPart);
  const select = useMMAStore((state) => state.selectBodyPart);
  const selected = useMemo(() => anatomyRegions.find((region) => region.id === selectedId) ?? anatomyRegions[1], [selectedId]);
  return <div className="page-shell anatomy-page"><div className="page-top-row"><PageLabel eyebrow="STRIKING ROOM / BODY MECHANICS" title="Read the frame." detail="Anatomy, balance, and protective positioning — visualized." /><div className="anatomy-tools"><span><Move3d size={14} /> DRAG TO ORBIT</span><span><Crosshair size={14} /> TAP A NODE</span></div></div><div className="anatomy-layout"><section className="anatomy-stage glass-panel"><AnatomyScene onSelect={select} selected={selectedId} /><div className="anatomy-stage-ui"><span>MODEL / 01</span><span>EDUCATIONAL MODE</span><button onClick={() => select(null)}><RotateCcw size={13} /> RESET VIEW</button></div></section><aside className="anatomy-info glass-panel"><div className="panel-topline"><span>REGION INSPECTOR</span><Info size={15} /></div><div className="target-heading"><span className="target-ping" /><div><span>TARGET REGION</span><h2>{selected.label}</h2><small>{selected.region}</small></div></div><div className="anatomy-rule" /><div className="info-block"><span>WHY IT MATTERS</span><p>{selected.description}</p></div><div className="info-block"><span>DEFENSIVE CONSIDERATION</span><p>{selected.defensive}</p></div><div className="info-block"><span>SAFE TRAINING DRILL</span><p>{selected.drill}</p></div><MagneticButton variant="ghost" onClick={() => select(null)}>CLEAR TARGET</MagneticButton><div className="education-note">For supervised education and controlled practice. This tool is not medical advice and does not encourage targeting people.</div></aside></div></div>;
}
