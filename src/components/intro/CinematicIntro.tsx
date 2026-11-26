import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { MedicalSceneCanvas } from '../three/MedicalSceneCanvas';

export function CinematicIntro() {
  const { t, language, reducedMotion, theme3d, setView, updateSkipIntro } = useApp();
  const [scenePhase, setScenePhase] = useState<1 | 2 | 3>(1);
  const [dontRepeat, setDontRepeat] = useState(false);
  const titleGroupRef = useRef<HTMLDivElement>(null);

  const finishIntro = () => {
    window.sessionStorage.setItem('mamo_intro_seen', '1');
    if (dontRepeat) {
      void updateSkipIntro(true);
    }
    setView('landing');
  };

  useEffect(() => {
    if (reducedMotion) {
      setScenePhase(2);
      return;
    }

    const t1 = window.setTimeout(() => setScenePhase(2), 1850);
    const t2 = window.setTimeout(() => setScenePhase(3), 4700);
    const t3 = window.setTimeout(() => {
      window.sessionStorage.setItem('mamo_intro_seen', '1');
      setView('landing');
    }, 5600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reducedMotion, setView]);

  useEffect(() => {
    if (scenePhase === 2 && titleGroupRef.current && !reducedMotion) {
      gsap.fromTo(
        titleGroupRef.current,
        { opacity: 0, scale: 0.92, y: 18 },
        { opacity: 1, scale: 1, y: 0, duration: 1.05, ease: 'power3.out' }
      );
    }
  }, [scenePhase, reducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: scenePhase === 3 ? 0 : 1 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 bg-[#050B16] overflow-hidden flex flex-col justify-between"
    >
      {/* Volumetric background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(29, 111, 235, 0.22) 0%, rgba(34, 211, 238, 0.08) 32%, rgba(5, 11, 22, 0.96) 72%)'
        }}
      />

      {/* Fullscreen 3D neural-DNA WebGL scene */}
      <div className="absolute inset-0">
        <MedicalSceneCanvas
          mode="intro"
          theme3d={theme3d}
          reducedMotion={reducedMotion}
          interactive={false}
          converging={scenePhase >= 2}
        />
      </div>

      {/* Top Skip control */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-6">
        <span className="text-xs tracking-[0.22em] text-[#94A3B8] font-mono-tabular">
          {language === 'ar' ? 'تجربة ثلاثية الأبعاد' : '3D MEDICAL UNIVERSE'}
        </span>

        <div className="flex items-center gap-4">
          <label className="hidden sm:flex items-center gap-2 text-xs text-[#94A3B8] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontRepeat}
              onChange={(e) => setDontRepeat(e.target.checked)}
              className="rounded border-white/20 bg-[#0D192E] text-[#1D6FEB]"
            />
            <span>{language === 'ar' ? 'عدم التكرار تلقائياً' : 'Do not show again'}</span>
          </label>
          <button
            type="button"
            onClick={finishIntro}
            className="btn-3d-secondary px-4 py-2 rounded-xl text-xs font-semibold text-[#F4F7FB] flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <span>{t.skipIntro}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Metallic 3D Title Reveal (Scene 2) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
        {scenePhase >= 2 && (
          <div ref={titleGroupRef} className="max-w-3xl space-y-4">
            <h1
              className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 38%, #22D3EE 72%, #F4F7FB 100%)',
                textShadow: '0 18px 48px rgba(34, 211, 238, 0.25)'
              }}
            >
              MAMO MED AI
            </h1>
            <p className="text-base sm:text-xl text-[#CBD5E1] font-medium tracking-wide">
              {t.tagline}
            </p>
            <p className="text-xs sm:text-sm text-[#94A3B8]">{t.founderCredit}</p>
          </div>
        )}
      </div>

      {/* Bottom progress indicator & Enter button for reduced-motion */}
      <div className="relative z-10 pb-8 px-6 flex flex-col items-center gap-4">
        {reducedMotion && (
          <button
            type="button"
            onClick={finishIntro}
            className="btn-3d-primary px-6 py-3 rounded-xl text-sm font-semibold text-white"
          >
            {t.exploreMamoMed}
          </button>
        )}
        <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: scenePhase === 1 ? '45%' : scenePhase === 2 ? '88%' : '100%' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#1D6FEB] to-[#22D3EE]"
          />
        </div>
      </div>
    </motion.div>
  );
}
