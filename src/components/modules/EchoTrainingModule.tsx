import React, { useEffect, useMemo, useRef, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  GraduationCap,
  Images,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Scan,
  Sliders,
  Stethoscope,
  Volume2,
  VolumeX,
  XCircle,
  ZoomIn
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import {
  ECHO_DRILLS,
  ECHO_FINAL_CHECKLIST,
  ECHO_LEVEL_META,
  ECHO_SESSIONS,
  ECHO_SIGNS_CATALOG,
  type EchoLevelId,
  type EchoSceneId
} from '../../data/echoCurriculum';
import {
  getProxiedMedicalImageUrl,
  searchRealMedicalImagesClient,
  type RealMedicalImageResult
} from '../../lib/apiClient';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { RealEchoVideoPlayer } from './RealEchoVideoPlayer';
import { HighResImageModal } from './HighResImageModal';

type EchoTab = 'sessions' | 'signs' | 'simulator' | 'drills';

function formatClock(sec: number): string {
  const clamped = Math.max(0, Math.min(600, Math.floor(sec)));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function EchoTrainingModule() {
  const { language, user } = useApp();
  const isAr = language === 'ar';

  const [tab, setTab] = useState<EchoTab>('sessions');
  const [levelFilter, setLevelFilter] = useState<'all' | EchoLevelId>('all');

  // Tab 1: 10-Minute Session Player State
  const [selectedSessionId, setSelectedSessionId] = useState<string>(ECHO_SESSIONS[0].id);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [voiceOn, setVoiceOn] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<Record<string, boolean>>(() => {
    try {
      const raw = window.localStorage.getItem('mamo_echo_sessions_done');
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });

  // Tab 2: Signs & Radiology Archive State
  const [selectedSignId, setSelectedSignId] = useState<string>(ECHO_SIGNS_CATALOG[0].id);
  const [liveSignScans, setLiveSignScans] = useState<Record<string, RealMedicalImageResult[]>>({});
  const [loadingLiveScans, setLoadingLiveScans] = useState(false);

  // Tab 3: Interactive Simulator Controls
  const [simScene, setSimScene] = useState<EchoSceneId>('PLAX');
  const [simDepthCm, setSimDepthCm] = useState<number>(16);
  const [simGainPct, setSimGainPct] = useState<number>(62);
  const [simNyquistCms, setSimNyquistCms] = useState<number>(60);
  const [simSectorWidthPct, setSimSectorWidthPct] = useState<number>(85);

  // Tab 4: Progressive Drills & Final 12-Step Sign-Off
  const [drillAnswers, setDrillAnswers] = useState<Record<string, number>>(() => {
    try {
      const raw = window.localStorage.getItem('mamo_echo_drill_answers');
      return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch {
      return {};
    }
  });
  const [checklistDone, setChecklistDone] = useState<Record<string, boolean>>(() => {
    try {
      const raw = window.localStorage.getItem('mamo_echo_final_checklist');
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });
  const [firestoreLoggedIds, setFirestoreLoggedIds] = useState<Record<string, boolean>>({});

  // HighResImageModal State
  const [zoomModal, setZoomModal] = useState<{
    open: boolean;
    imageUrl: string;
    fallbackUrl?: string;
    title: string;
    subtitle?: string;
  }>({ open: false, imageUrl: '', title: '' });

  const lastSpokenChapterRef = useRef<string>('');

  // Load Firestore progress logs for echo_* items
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'medschool_progress'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const logged: Record<string, boolean> = {};
        const sessionsDone: Record<string, boolean> = {};
        snap.docs.forEach((docSnap) => {
          const d = docSnap.data();
          const itemId = String(d.itemId || '');
          if (itemId.startsWith('echo_')) {
            logged[itemId] = Boolean(d.isCorrect);
            if (itemId.startsWith('echo_s') && d.isCorrect) {
              sessionsDone[itemId] = true;
            }
          }
        });
        setFirestoreLoggedIds(logged);
        if (Object.keys(sessionsDone).length > 0) {
          setCompletedSessions((prev) => ({ ...prev, ...sessionsDone }));
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'medschool_progress')
    );
    return () => unsub();
  }, [user]);

  const filteredSessions = useMemo(
    () => (levelFilter === 'all' ? ECHO_SESSIONS : ECHO_SESSIONS.filter((s) => s.level === levelFilter)),
    [levelFilter]
  );

  const selectedSession = useMemo(
    () => ECHO_SESSIONS.find((s) => s.id === selectedSessionId) || ECHO_SESSIONS[0],
    [selectedSessionId]
  );

  const activeChapter = useMemo(() => {
    return (
      selectedSession.chapters.find((c) => currentSec >= c.startSec && currentSec < c.endSec) ||
      selectedSession.chapters[selectedSession.chapters.length - 1]
    );
  }, [selectedSession, currentSec]);

  const filteredSigns = useMemo(
    () => (levelFilter === 'all' ? ECHO_SIGNS_CATALOG : ECHO_SIGNS_CATALOG.filter((s) => s.level === levelFilter)),
    [levelFilter]
  );

  const selectedSign = useMemo(
    () => ECHO_SIGNS_CATALOG.find((s) => s.id === selectedSignId) || ECHO_SIGNS_CATALOG[0],
    [selectedSignId]
  );

  const filteredDrills = useMemo(
    () => (levelFilter === 'all' ? ECHO_DRILLS : ECHO_DRILLS.filter((d) => d.level === levelFilter)),
    [levelFilter]
  );

  // 10-Minute (600s) Video Playback Timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(1000 / playbackSpeed);
    const id = window.setInterval(() => {
      setCurrentSec((prev) => {
        if (prev + 1 >= 600) {
          setIsPlaying(false);
          return 600;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [isPlaying, playbackSpeed]);

  // Optional Browser SpeechSynthesis Audio Narration when chapter updates during playback
  useEffect(() => {
    if (!voiceOn || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }
    if (!isPlaying) {
      window.speechSynthesis.cancel();
      return;
    }
    const key = `${selectedSession.id}_${activeChapter.id}_${language}`;
    if (lastSpokenChapterRef.current === key) return;
    lastSpokenChapterRef.current = key;

    window.speechSynthesis.cancel();
    const text = isAr
      ? `${activeChapter.titleAr}. ${activeChapter.narrationAr}`
      : `${activeChapter.titleEn}. ${activeChapter.narrationEn}`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = isAr ? 'ar-SA' : 'en-US';
    utter.rate = Math.min(1.35, playbackSpeed);
    window.speechSynthesis.speak(utter);
  }, [voiceOn, isPlaying, selectedSession.id, activeChapter, language, isAr, playbackSpeed]);

  // Stop speech when leaving component
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const selectSession = (id: string) => {
    setSelectedSessionId(id);
    setCurrentSec(0);
    setIsPlaying(false);
    lastSpokenChapterRef.current = '';
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    const next = { ...completedSessions, [sessionId]: true };
    setCompletedSessions(next);
    try {
      window.localStorage.setItem('mamo_echo_sessions_done', JSON.stringify(next));
    } catch {
      // ignore storage quota
    }
    if (user) {
      try {
        await addDoc(collection(db, 'medschool_progress'), {
          userId: user.uid,
          specialty: 'Cardiology',
          itemId: sessionId,
          itemType: 'case',
          isCorrect: true,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'medschool_progress');
      }
    }
  };

  const handleLoadLiveScans = async (signId: string, queryStr: string) => {
    setLoadingLiveScans(true);
    try {
      const items = await searchRealMedicalImagesClient(queryStr, 6);
      setLiveSignScans((prev) => ({ ...prev, [signId]: items }));
    } catch {
      // fallback to curated plates if network archive busy
    } finally {
      setLoadingLiveScans(false);
    }
  };

  const handleAnswerDrill = async (drillId: string, chosenIdx: number, correctIdx: number) => {
    const next = { ...drillAnswers, [drillId]: chosenIdx };
    setDrillAnswers(next);
    try {
      window.localStorage.setItem('mamo_echo_drill_answers', JSON.stringify(next));
    } catch {
      // ignore
    }
    if (user) {
      try {
        await addDoc(collection(db, 'medschool_progress'), {
          userId: user.uid,
          specialty: 'Cardiology',
          itemId: drillId,
          itemType: 'mcq',
          isCorrect: chosenIdx === correctIdx,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'medschool_progress');
      }
    }
  };

  const handleToggleChecklist = async (stepId: string) => {
    const nextVal = !checklistDone[stepId];
    const next = { ...checklistDone, [stepId]: nextVal };
    setChecklistDone(next);
    try {
      window.localStorage.setItem('mamo_echo_final_checklist', JSON.stringify(next));
    } catch {
      // ignore
    }
    const allChecked = ECHO_FINAL_CHECKLIST.every((s) => (s.id === stepId ? nextVal : next[s.id]));
    if (allChecked && user && !firestoreLoggedIds['echo_final_closing_signoff']) {
      try {
        await addDoc(collection(db, 'medschool_progress'), {
          userId: user.uid,
          specialty: 'Cardiology',
          itemId: 'echo_final_closing_signoff',
          itemType: 'case',
          isCorrect: true,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'medschool_progress');
      }
    }
  };

  // Simulator Optimizer Diagnosis Feedback
  const simulatorFeedback = useMemo(() => {
    const warningsEn: string[] = [];
    const warningsAr: string[] = [];
    if (simDepthCm < 14) {
      warningsEn.push('Depth too shallow (<14 cm): risk of cropping posterior pericardium & descending aorta.');
      warningsAr.push('العمق قليل جداً (<14 سم): قد تُقص المسافة الخلفية والتامور والأبهر النازل.');
    }
    if (simDepthCm > 21) {
      warningsEn.push('Excessive depth (>21 cm): shrinks chamber details & slows frame rate.');
      warningsAr.push('العمق زائد (>21 سم): يُصغّر تفاصيل الحجرات ويبطئ معدل الإطارات.');
    }
    if (simGainPct > 78) {
      warningsEn.push('Gain too high (>78%): causes false echogenic smoke/thrombus inside chambers.');
      warningsAr.push('الكسب مرتفع جداً (>78%): يُحدث ضباباً رمادياً كاذباً يوحي بوجود خثرة.');
    }
    if (simGainPct < 38) {
      warningsEn.push('Gain too low (<38%): endocardial borders & valve cusps fade out.');
      warningsAr.push('الكسب منخفض جداً (<38%): تختفي حدود الشغاف ووريقات الصمامات.');
    }
    if (simNyquistCms < 45) {
      warningsEn.push('Color Nyquist < 45 cm/s: artificially exaggerates regurgitation jet size.');
      warningsAr.push('حد نيكويست أقل من 45 سم/ث: يضخم حجم نفثة القلس كاذباً.');
    }
    if (simSectorWidthPct > 92) {
      warningsEn.push('Wide sector lowers temporal frame rate (<35 fps); narrow over valve for crisp capture.');
      warningsAr.push('عرض القطاع الكبير يقلل سرعة الإطارات؛ ضيّق القطاع فوق الصمام لرفع الدقة.');
    }
    return { warningsEn, warningsAr, isOptimal: warningsEn.length === 0 };
  }, [simDepthCm, simGainPct, simNyquistCms, simSectorWidthPct]);

  // Overall Progress Computation
  const completedSessionCount = ECHO_SESSIONS.filter((s) => completedSessions[s.id]).length;
  const correctDrillCount = ECHO_DRILLS.filter((d) => drillAnswers[d.id] === d.correctIndex).length;
  const completedChecklistCount = ECHO_FINAL_CHECKLIST.filter((c) => checklistDone[c.id]).length;
  const totalItems = ECHO_SESSIONS.length + ECHO_DRILLS.length + ECHO_FINAL_CHECKLIST.length;
  const totalMastered = completedSessionCount + correctDrillCount + completedChecklistCount;
  const masteryPct = Math.round((totalMastered / totalItems) * 100);

  const openZoom = (imageUrl: string, fallbackUrl: string, title: string, subtitle?: string) => {
    setZoomModal({ open: true, imageUrl, fallbackUrl, title, subtitle });
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Header & Mastery Bar */}
      <section className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#22D3EE]/15 border border-[#22D3EE]/35 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-[#22D3EE]" />
            </div>
            <div className="space-y-1">
              <h1 className="font-display text-lg sm:text-xl font-bold text-[#F4F7FB]">
                {isAr
                  ? 'أكاديمية تدريب فحص الإيكو السريري المكثفة (ASE · EACVI · RUSH)'
                  : 'Intensive Clinical Echocardiography Mastery Academy'}
              </h1>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
                {isAr
                  ? 'منهج تطبيقي مكثف من المستوى الأول حتى الاحتراف واختتام التقرير: 10 جلسات تدريب على فيديوهات إيكو سريرية حقيقية (مدة الجلسة 10:00 دقائق)، علامات سريرية وصور شعاعية موثقة بتقنية التكبير والرسم على الكانفاس، وبروتوكول ضبط الجهاز.'
                  : 'Structured 4-level clinical mastery from knobology to full hemodynamic closing sign-off: 10 intensive 10:00-minute real peer-reviewed echo cine sessions, clinical & radiographic correlation plates with high-res zoom, and live calibration controls.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono-tabular text-xs bg-[#060D1C] border border-white/10 rounded-xl px-4 py-2.5">
            <div>
              <div className="text-[10px] text-[#94A3B8]">{isAr ? 'الجلسات' : 'Sessions'}</div>
              <div className="text-sm font-bold text-[#22D3EE]">
                {completedSessionCount}/{ECHO_SESSIONS.length}
              </div>
            </div>
            <div className="h-7 w-px bg-white/10" />
            <div>
              <div className="text-[10px] text-[#94A3B8]">{isAr ? 'التدريبات' : 'Drills'}</div>
              <div className="text-sm font-bold text-emerald-400">
                {correctDrillCount}/{ECHO_DRILLS.length}
              </div>
            </div>
            <div className="h-7 w-px bg-white/10" />
            <div>
              <div className="text-[10px] text-[#94A3B8]">{isAr ? 'قائمة الختام' : 'Sign-Off'}</div>
              <div className="text-sm font-bold text-[#F4F7FB]">
                {completedChecklistCount}/{ECHO_FINAL_CHECKLIST.length}
              </div>
            </div>
          </div>
        </div>

        {/* Mastery Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono-tabular">
            <span className="text-[#94A3B8]">
              {isAr ? 'نسبة الإتقان الشامل لمراحل فحص الإيكو' : 'Overall Comprehensive Echo Mastery'}
            </span>
            <span className="text-[#22D3EE] font-bold">{masteryPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1D6FEB] to-[#22D3EE] transition-all duration-300"
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>

        {/* Level Progression Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {ECHO_LEVEL_META.map((lvl) => {
            const active = levelFilter === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setLevelFilter((prev) => (prev === lvl.id ? 'all' : lvl.id))}
                className={`min-h-[44px] text-start p-3 rounded-xl border transition-colors ${
                  active
                    ? 'bg-[#1D6FEB]/20 border-[#22D3EE] text-[#F4F7FB]'
                    : 'bg-[#070E1C]/80 border-white/10 text-[#94A3B8] hover:border-white/25 hover:text-[#F4F7FB]'
                }`}
              >
                <div className="text-[10px] font-mono-tabular font-bold text-[#22D3EE]">{lvl.badge}</div>
                <div className="text-xs font-semibold text-[#F4F7FB] mt-0.5 line-clamp-1">
                  {isAr ? lvl.titleAr : lvl.titleEn}
                </div>
                <div className="text-[11px] text-[#94A3B8] mt-1 line-clamp-2">
                  {isAr ? lvl.descAr : lvl.descEn}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Primary Workspace Tabs (min-h-[44px] Android Thumb Targets) */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            {
              id: 'sessions',
              icon: Clock,
              en: '10-Min Guided Video Sessions (10)',
              ar: 'جلسات التدريب المكثفة — 10 دقائق (10)'
            },
            {
              id: 'signs',
              icon: Images,
              en: 'Clinical Signs & X-Ray Atlas',
              ar: 'العلامات السريرية والصور الشعاعية'
            },
            {
              id: 'simulator',
              icon: Sliders,
              en: 'Real Cine Knobology & Probe Controls',
              ar: 'معايرة الجهاز والمجس على الفيديو الحقيقي'
            },
            {
              id: 'drills',
              icon: GraduationCap,
              en: 'Drills & 12-Step Closing Exam',
              ar: 'التدريبات العملية وقائمة اختتام الفحص'
            }
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold border inline-flex items-center gap-2 transition-colors ${
                active
                  ? 'bg-[#1D6FEB] border-[#22D3EE]/50 text-white'
                  : 'bg-[#070E1C] border-white/10 text-[#94A3B8] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{isAr ? item.ar : item.en}</span>
            </button>
          );
        })}

        {levelFilter !== 'all' && (
          <button
            type="button"
            onClick={() => setLevelFilter('all')}
            className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border border-white/10 text-[#22D3EE] hover:bg-white/5"
          >
            {isAr ? 'إظهار جميع المستويات' : 'Show All 4 Levels'}
          </button>
        )}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: 10-MINUTE INTENSIVE GUIDED VIDEO & SIMULATION SESSIONS */}
      {/* ===================================================================== */}
      {tab === 'sessions' && (
        <div className="grid lg:grid-cols-12 gap-5 items-start">
          {/* Session List Column */}
          <aside className="lg:col-span-4 space-y-2 max-h-[680px] overflow-y-auto pe-1">
            {filteredSessions.map((sess) => {
              const active = sess.id === selectedSession.id;
              const done = Boolean(completedSessions[sess.id]);
              return (
                <button
                  key={sess.id}
                  type="button"
                  onClick={() => selectSession(sess.id)}
                  className={`w-full min-h-[44px] text-start p-3.5 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                    active
                      ? 'bg-white/10 border-[#22D3EE] text-[#F4F7FB]'
                      : 'bg-[#070E1C]/80 border-white/10 text-[#94A3B8] hover:border-white/25 hover:text-[#F4F7FB]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] font-mono-tabular">
                      <span className="text-[#22D3EE] font-bold">
                        {sess.level.toUpperCase()} · #0{sess.number === 10 ? '' : ''}
                        {sess.number}
                      </span>
                      <span className="text-[#94A3B8]">· 10:00 min</span>
                    </div>
                    <div className="text-xs font-semibold text-[#F4F7FB] leading-snug">
                      {isAr ? sess.titleAr : sess.titleEn}
                    </div>
                  </div>
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#64748B] shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </aside>

          {/* Active 10-Minute Video/Simulation Lab Stage */}
          <div className="lg:col-span-8 space-y-5">
            <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
              {/* Session Header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono-tabular text-[#22D3EE] font-bold">
                    {selectedSession.level.toUpperCase()} · {isAr ? 'مدة الفيديو التدريبي: 10:00 دقائق' : 'GUIDED SESSION DURATION: 10:00 MIN'}
                  </div>
                  <h2 className="font-display text-base sm:text-lg font-bold text-[#F4F7FB]">
                    {isAr ? selectedSession.titleAr : selectedSession.titleEn}
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    {isAr ? selectedSession.subtitleAr : selectedSession.subtitleEn}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCompleteSession(selectedSession.id)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 border ${
                    completedSessions[selectedSession.id]
                      ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-300'
                      : 'btn-3d-secondary text-[#F4F7FB]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {completedSessions[selectedSession.id]
                      ? isAr
                        ? 'مكتملة ومسجلة'
                        : 'Session Completed'
                      : isAr
                        ? 'اعتماد إتمام الجلسة (10 د)'
                        : 'Mark 10-Min Complete'}
                  </span>
                </button>
              </div>

              {/* Real Clinical Echocardiography Video Player */}
              <RealEchoVideoPlayer
                scene={selectedSession.scene}
                language={language}
                playing={isPlaying}
                onTogglePlaying={() => {
                  if (currentSec >= 600) setCurrentSec(0);
                  setIsPlaying((p) => !p);
                }}
                playbackSpeed={playbackSpeed}
                posterUrl={selectedSession.echoImageUrl}
                activeChapterTitle={isAr ? activeChapter.titleAr : activeChapter.titleEn}
                defaultSearchQuery={selectedSession.searchQuery}
              />

              {/* Real 10:00 (600-second) Timeline Controls */}
              <div className="p-3.5 rounded-xl bg-[#060D1C] border border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentSec >= 600) setCurrentSec(0);
                        setIsPlaying((p) => !p);
                      }}
                      className="btn-3d-primary min-h-[44px] px-4 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-2"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>
                        {isPlaying
                          ? isAr
                            ? 'إيقاف مؤقت'
                            : 'Pause'
                          : currentSec > 0 && currentSec < 600
                            ? isAr
                              ? 'متابعة'
                              : 'Resume'
                            : isAr
                              ? 'تشغيل جلسة الـ 10 دقائق'
                              : 'Play 10-Min Session'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentSec(0);
                      }}
                      aria-label="Reset session timer"
                      className="btn-3d-secondary min-h-[44px] min-w-[44px] px-3 rounded-xl inline-flex items-center justify-center"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPlaybackSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))
                      }
                      className="min-h-[44px] px-3 rounded-xl border border-white/15 bg-white/5 text-xs font-mono-tabular font-bold text-[#F4F7FB]"
                    >
                      {playbackSpeed}×
                    </button>

                    <button
                      type="button"
                      onClick={() => setVoiceOn((v) => !v)}
                      className={`min-h-[44px] px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 ${
                        voiceOn
                          ? 'border-[#22D3EE] bg-[#22D3EE]/15 text-[#22D3EE]'
                          : 'border-white/15 text-[#94A3B8]'
                      }`}
                    >
                      {voiceOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      <span className="hidden sm:inline">{isAr ? 'شرح صوتي' : 'Voice'}</span>
                    </button>
                  </div>

                  <div className="font-mono-tabular text-sm font-bold text-[#22D3EE]">
                    {formatClock(currentSec)} <span className="text-[#64748B]">/ 10:00</span>
                  </div>
                </div>

                {/* 0–600s Timeline Scrubber */}
                <input
                  type="range"
                  min={0}
                  max={600}
                  value={currentSec}
                  onChange={(e) => setCurrentSec(Number(e.target.value))}
                  aria-label="10-minute session scrubber"
                  className="w-full min-h-[32px] accent-[#22D3EE] cursor-pointer"
                />

                {/* 5 Timestamped Chapters */}
                <div className="grid sm:grid-cols-5 gap-1.5">
                  {selectedSession.chapters.map((ch) => {
                    const isCurr = ch.id === activeChapter.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setCurrentSec(ch.startSec);
                          lastSpokenChapterRef.current = '';
                        }}
                        className={`min-h-[44px] px-2.5 py-1.5 rounded-lg text-start border transition-colors ${
                          isCurr
                            ? 'bg-[#1D6FEB]/25 border-[#22D3EE] text-white'
                            : 'bg-black/25 border-white/10 text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        <div className="text-[10px] font-mono-tabular text-[#22D3EE]">
                          {formatClock(ch.startSec)}–{formatClock(ch.endSec)}
                        </div>
                        <div className="text-[11px] font-medium line-clamp-2 leading-tight mt-0.5">
                          {isAr ? ch.titleAr : ch.titleEn}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Chapter Clinical Script & Probe Cue */}
              <div className="rounded-xl p-4 bg-[#071124] border border-[#22D3EE]/30 space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs font-mono-tabular text-[#22D3EE]">
                  <span>
                    {formatClock(activeChapter.startSec)} – {formatClock(activeChapter.endSec)}
                  </span>
                  <span className="font-bold">{isAr ? activeChapter.titleAr : activeChapter.titleEn}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#F4F7FB] leading-relaxed">
                  {isAr ? activeChapter.narrationAr : activeChapter.narrationEn}
                </p>
                <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-black/30 border border-white/10 text-xs">
                    <div className="text-[10px] font-mono-tabular text-[#22D3EE] uppercase">
                      {isAr ? 'توجيه حركة المجس' : 'Probe Action Cue'}
                    </div>
                    <div className="text-[#CBD5E1] mt-1">
                      {isAr ? activeChapter.probeCueAr : activeChapter.probeCueEn}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-400/25 text-xs">
                    <div className="text-[10px] font-mono-tabular text-emerald-300 uppercase">
                      {isAr ? 'الخلاصة السريرية' : 'Key Clinical Pearl'}
                    </div>
                    <div className="text-emerald-100 mt-1">
                      {isAr ? activeChapter.keyTakeawayAr : activeChapter.keyTakeawayEn}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Positioning Specs + Real Reference Plates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#070E1C] border border-white/10 space-y-2.5 text-xs">
                  <div className="font-display font-semibold text-sm text-[#F4F7FB]">
                    {isAr ? 'معايير التنفيذ والتوضيع' : 'Technical Protocol Specs'}
                  </div>
                  <div>
                    <span className="text-[#94A3B8]">{isAr ? 'النافذة: ' : 'Window: '}</span>
                    <span className="text-[#F4F7FB]">
                      {isAr ? selectedSession.probeWindowAr : selectedSession.probeWindowEn}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8]">{isAr ? 'اتجاه المؤشر: ' : 'Marker Clock: '}</span>
                    <span className="text-[#22D3EE]">
                      {isAr ? selectedSession.markerClockAr : selectedSession.markerClockEn}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8]">{isAr ? 'وضعية المريض: ' : 'Position: '}</span>
                    <span className="text-[#F4F7FB]">
                      {isAr ? selectedSession.patientPositionAr : selectedSession.patientPositionEn}
                    </span>
                  </div>
                  <p className="text-[#CBD5E1] leading-relaxed pt-1 border-t border-white/10">
                    {isAr ? selectedSession.clinicalSummaryAr : selectedSession.clinicalSummaryEn}
                  </p>
                </div>

                {/* Clickable Real Echo & CXR Correlation Plates */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      openZoom(
                        selectedSession.echoImageUrl,
                        selectedSession.echoFallbackUrl,
                        isAr ? `صورة إيكو حقيقية — ${selectedSession.titleAr}` : `Real Echo Plate — ${selectedSession.titleEn}`,
                        selectedSession.probeWindowEn
                      )
                    }
                    className="group relative rounded-xl overflow-hidden border border-white/15 bg-black aspect-[4/3] text-start"
                  >
                    <img
                      src={getProxiedMedicalImageUrl(selectedSession.echoImageUrl)}
                      alt={selectedSession.titleEn}
                      onError={(e) => {
                        e.currentTarget.src = selectedSession.echoFallbackUrl;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent p-2.5 flex flex-col justify-between">
                      <span className="self-end p-1.5 rounded-lg bg-black/70 text-[#22D3EE]">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                      <span className="text-[11px] font-semibold text-white">
                        {isAr ? 'لقطة إيكو حقيقية (تكبير)' : 'Real Echo Scan (HD Zoom)'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openZoom(
                        selectedSession.radiographImageUrl,
                        selectedSession.radiographFallbackUrl,
                        isAr ? 'الارتباط الشعاعي بصورة الصدر CXR' : 'Thoracic Radiographic Correlation (CXR)',
                        selectedSession.titleEn
                      )
                    }
                    className="group relative rounded-xl overflow-hidden border border-white/15 bg-black aspect-[4/3] text-start"
                  >
                    <img
                      src={getProxiedMedicalImageUrl(selectedSession.radiographImageUrl)}
                      alt="Chest radiograph correlation"
                      onError={(e) => {
                        e.currentTarget.src = selectedSession.radiographFallbackUrl;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent p-2.5 flex flex-col justify-between">
                      <span className="self-end p-1.5 rounded-lg bg-black/70 text-[#22D3EE]">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                      <span className="text-[11px] font-semibold text-white">
                        {isAr ? 'مقارنة شعاعية CXR' : 'Radiograph Link (HD Zoom)'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Quantitative Reference Cutoffs Table */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="px-4 py-2.5 bg-[#070E1C] border-b border-white/10 text-xs font-display font-semibold text-[#F4F7FB]">
                  {isAr ? 'القيم المرجعية والعتبات المرضية المعتمدة (ASE/EACVI)' : 'Quantitative Normal Ranges & Diagnostic Thresholds'}
                </div>
                <div className="divide-y divide-white/10">
                  {selectedSession.cutoffs.map((c) => (
                    <div
                      key={c.parameterEn}
                      className="px-4 py-2.5 grid sm:grid-cols-3 gap-2 text-xs items-center bg-[#040914]"
                    >
                      <div className="font-semibold text-[#F4F7FB]">
                        {isAr ? c.parameterAr : c.parameterEn}
                      </div>
                      <div className="font-mono-tabular text-emerald-300">{c.normalRange}</div>
                      <div className="font-mono-tabular text-amber-300">{c.abnormalThreshold}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pitfalls & Guidelines Sources */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-400/25 space-y-2">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isAr ? 'أخطاء شائعة يجب تجنبها' : 'Common Clinical Pitfalls'}</span>
                  </div>
                  <ul className="space-y-1.5 text-[#CBD5E1] list-disc ps-4">
                    {(isAr ? selectedSession.pitfallsAr : selectedSession.pitfallsEn).map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#070E1C] border border-white/10 space-y-2">
                  <div className="font-semibold text-[#22D3EE]">
                    {isAr ? 'المصادر العلمية الموثقة' : 'Evidence-Based Sources'}
                  </div>
                  <ul className="space-y-1.5 text-[#94A3B8] list-disc ps-4">
                    {selectedSession.sources.map((src) => (
                      <li key={src}>{src}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: CLINICAL SIGNS, CASE EXAMPLES & RADIOGRAPHIC CORRELATIONS */}
      {/* ===================================================================== */}
      {tab === 'signs' && (
        <div className="grid lg:grid-cols-12 gap-5 items-start">
          <aside className="lg:col-span-4 space-y-2 max-h-[680px] overflow-y-auto pe-1">
            {filteredSigns.map((sign) => {
              const active = sign.id === selectedSign.id;
              return (
                <button
                  key={sign.id}
                  type="button"
                  onClick={() => setSelectedSignId(sign.id)}
                  className={`w-full min-h-[44px] text-start p-3.5 rounded-xl border transition-colors ${
                    active
                      ? 'bg-white/10 border-[#22D3EE] text-[#F4F7FB]'
                      : 'bg-[#070E1C]/80 border-white/10 text-[#94A3B8] hover:border-white/25 hover:text-[#F4F7FB]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tabular">
                    <span className="text-[#22D3EE] font-bold">{sign.windowTag}</span>
                    <span
                      className={
                        sign.severity === 'Critical'
                          ? 'text-red-400 font-bold'
                          : sign.severity === 'Quantitative'
                            ? 'text-emerald-400'
                            : 'text-amber-300'
                      }
                    >
                      {sign.severity}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-[#F4F7FB] mt-1 leading-snug">
                    {isAr ? sign.nameAr : sign.nameEn}
                  </div>
                </button>
              );
            })}
          </aside>

          <div className="lg:col-span-8 glass-panel rounded-2xl p-5 space-y-5">
            <div className="space-y-1">
              <div className="text-[11px] font-mono-tabular text-[#22D3EE] font-bold">
                {selectedSign.windowTag} · {selectedSign.level.toUpperCase()}
              </div>
              <h2 className="font-display text-lg font-bold text-[#F4F7FB]">
                {isAr ? selectedSign.nameAr : selectedSign.nameEn}
              </h2>
            </div>

            {/* Real Clinical Echo Video matching this sign */}
            <RealEchoVideoPlayer
              scene={selectedSign.scene}
              language={language}
              playing
              posterUrl={selectedSign.echoImageUrl}
              activeChapterTitle={isAr ? selectedSign.nameAr : selectedSign.nameEn}
              defaultSearchQuery={selectedSign.searchQuery}
            />

            {/* Real Echo + Real CXR Side-by-Side Plate Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-white/15 bg-[#040914] flex flex-col">
                <button
                  type="button"
                  onClick={() =>
                    openZoom(
                      selectedSign.echoImageUrl,
                      selectedSign.echoFallbackUrl,
                      isAr ? selectedSign.nameAr : selectedSign.nameEn,
                      selectedSign.windowTag
                    )
                  }
                  className="relative h-48 bg-black overflow-hidden group"
                >
                  <img
                    src={getProxiedMedicalImageUrl(selectedSign.echoImageUrl)}
                    alt={selectedSign.nameEn}
                    onError={(e) => {
                      e.currentTarget.src = selectedSign.echoFallbackUrl;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-2 end-2 p-2 rounded-lg bg-black/75 text-[#22D3EE]">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 to-transparent text-xs font-semibold text-white text-start">
                    {isAr ? 'مظهر الإيكو (اضغط للتكبير والتحريك)' : 'Echo Appearance (Tap HD Zoom)'}
                  </div>
                </button>
                <div className="p-3.5 text-xs text-[#CBD5E1] leading-relaxed">
                  {isAr ? selectedSign.echoFindingAr : selectedSign.echoFindingEn}
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-white/15 bg-[#040914] flex flex-col">
                <button
                  type="button"
                  onClick={() =>
                    openZoom(
                      selectedSign.radiographImageUrl,
                      selectedSign.radiographFallbackUrl,
                      isAr ? `الارتباط الشعاعي — ${selectedSign.nameAr}` : `Radiograph Link — ${selectedSign.nameEn}`,
                      'CXR / Thoracic CT Correlation'
                    )
                  }
                  className="relative h-48 bg-black overflow-hidden group"
                >
                  <img
                    src={getProxiedMedicalImageUrl(selectedSign.radiographImageUrl)}
                    alt="Chest radiograph correlation"
                    onError={(e) => {
                      e.currentTarget.src = selectedSign.radiographFallbackUrl;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-2 end-2 p-2 rounded-lg bg-black/75 text-[#22D3EE]">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 to-transparent text-xs font-semibold text-white text-start">
                    {isAr ? 'الربط الشعاعي CXR / CT (اضغط للتكبير)' : 'Chest X-Ray / CT Sign (Tap HD Zoom)'}
                  </div>
                </button>
                <div className="p-3.5 text-xs text-[#CBD5E1] leading-relaxed">
                  {isAr ? selectedSign.radiographCorrelationAr : selectedSign.radiographCorrelationEn}
                </div>
              </div>
            </div>

            {/* Diagnostic Thresholds + Patient Case Example */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#070E1C] border border-white/10 space-y-1.5">
                <div className="font-mono-tabular font-bold text-[#22D3EE]">
                  {isAr ? 'العتبات والأرقام التشخيصية' : 'Diagnostic Thresholds'}
                </div>
                <p className="text-[#F4F7FB] leading-relaxed">
                  {isAr ? selectedSign.thresholdsAr : selectedSign.thresholdsEn}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-400/25 space-y-1.5">
                <div className="font-mono-tabular font-bold text-emerald-300 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{isAr ? 'مثال وحالة سريرية تطبيقية' : 'Clinical Bedside Case Example'}</span>
                </div>
                <p className="text-[#CBD5E1] leading-relaxed">
                  {isAr ? selectedSign.caseExampleAr : selectedSign.caseExampleEn}
                </p>
              </div>
            </div>

            {/* On-Demand Live Wikimedia Archive Strip for Additional Real Plates */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#F4F7FB]">
                  {isAr ? 'صور أرشيفية حقيقية إضافية لهذه العلامة (Wikimedia)' : 'Live Clinical Archive Plates for This Sign'}
                </span>
                <button
                  type="button"
                  disabled={loadingLiveScans}
                  onClick={() => handleLoadLiveScans(selectedSign.id, selectedSign.searchQuery)}
                  className="btn-3d-secondary min-h-[44px] px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
                >
                  <Eye className="w-4 h-4 text-[#22D3EE]" />
                  <span>
                    {loadingLiveScans
                      ? isAr
                        ? 'جاري الجلب…'
                        : 'Loading…'
                      : isAr
                        ? 'جلب صور إضافية عالية الدقة'
                        : 'Fetch Live Archive Scans'}
                  </span>
                </button>
              </div>

              {liveSignScans[selectedSign.id] && liveSignScans[selectedSign.id].length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {liveSignScans[selectedSign.id].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        openZoom(item.imageUrl, selectedSign.echoFallbackUrl, item.title, item.source)
                      }
                      className="rounded-xl overflow-hidden border border-white/15 bg-black aspect-[4/3] relative group text-start"
                    >
                      <img
                        src={getProxiedMedicalImageUrl(item.thumbUrl || item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent text-[10px] text-white line-clamp-2">
                        {item.title}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: INTERACTIVE PROBE & KNOBOLOGY LAB */}
      {/* ===================================================================== */}
      {tab === 'simulator' && (
        <div className="grid lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 glass-panel rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-[#22D3EE]" />
                <h2 className="font-display text-base font-bold text-[#F4F7FB]">
                  {isAr ? 'مختبر محاكاة المجس وأزرار جهاز الإيكو' : 'Live Ultrasound Sector & Knobology Bench'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSimDepthCm(16);
                  setSimGainPct(62);
                  setSimNyquistCms(60);
                  setSimSectorWidthPct(85);
                }}
                className="btn-3d-secondary min-h-[44px] px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'ضبط المصنع المثالي' : 'Reset Optimal Preset'}</span>
              </button>
            </div>

            <RealEchoVideoPlayer
              scene={simScene}
              language={language}
              playing
              depthCm={simDepthCm}
              gainPct={simGainPct}
              nyquistCms={simNyquistCms}
              sectorWidthPct={simSectorWidthPct}
            />

            {/* Advisor Feedback */}
            <div
              className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                simulatorFeedback.isOptimal
                  ? 'bg-emerald-500/10 border-emerald-400/35 text-emerald-200'
                  : 'bg-amber-500/10 border-amber-400/35 text-amber-200'
              }`}
            >
              {simulatorFeedback.isOptimal ? (
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {isAr
                      ? 'إعدادات مثالية وفق توصيات ASE: العمق مناسب لكشف الانصباب، الكسب يحفظ سواد الدم، ومقياس نيكويست متوازن.'
                      : 'Optimal ASE Acquisition Calibration: Balanced depth, crisp blood-tissue contrast, high temporal frame rate, and neutral Nyquist scale.'}
                  </span>
                </div>
              ) : (
                <ul className="space-y-1 list-disc ps-4">
                  {(isAr ? simulatorFeedback.warningsAr : simulatorFeedback.warningsEn).map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Controls Column */}
          <aside className="lg:col-span-4 glass-panel rounded-2xl p-4 sm:p-5 space-y-5">
            <div className="space-y-2">
              <div className="text-xs font-display font-semibold text-[#F4F7FB] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#22D3EE]" />
                <span>{isAr ? 'اختيار المقطع القلبي والنافذة' : 'Select Anatomical Window'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'PLAX', label: 'PLAX (10:30)' },
                    { id: 'PSAX_AV', label: 'PSAX AV (1:30)' },
                    { id: 'PSAX_PM', label: 'PSAX Mid-LV' },
                    { id: 'A4C', label: 'Apical 4C (3:00)' },
                    { id: 'A5C_A2C_A3C', label: 'Apical 5C/2C' },
                    { id: 'SUBCOSTAL_IVC', label: 'Subcostal IVC' },
                    { id: 'SUPRASTERNAL', label: 'Suprasternal' },
                    { id: 'TAMPONADE', label: 'Tamponade' },
                    { id: 'MCCONNELL', label: 'PE McConnell' },
                    { id: 'DOPPLER_AS', label: 'Doppler CW/PW' }
                  ] as Array<{ id: EchoSceneId; label: string }>
                ).map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSimScene(w.id)}
                    className={`min-h-[44px] px-2.5 py-2 rounded-xl text-[11px] font-mono-tabular font-semibold border transition-colors ${
                      simScene === w.id
                        ? 'bg-[#1D6FEB] border-[#22D3EE] text-white'
                        : 'bg-[#070E1C] border-white/10 text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Machine Knobs */}
            <div className="space-y-4 pt-2 border-t border-white/10 text-xs">
              <label className="block space-y-1.5">
                <div className="flex justify-between font-mono-tabular">
                  <span className="text-[#CBD5E1]">{isAr ? 'العمق (Depth):' : 'Sector Depth:'}</span>
                  <span className="text-[#22D3EE] font-bold">{simDepthCm} cm</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={24}
                  value={simDepthCm}
                  onChange={(e) => setSimDepthCm(Number(e.target.value))}
                  className="w-full min-h-[36px] accent-[#22D3EE]"
                />
              </label>

              <label className="block space-y-1.5">
                <div className="flex justify-between font-mono-tabular">
                  <span className="text-[#CBD5E1]">{isAr ? 'الكسب الكلي (2D Gain):' : 'Overall 2D Gain:'}</span>
                  <span className="text-[#22D3EE] font-bold">{simGainPct}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={95}
                  value={simGainPct}
                  onChange={(e) => setSimGainPct(Number(e.target.value))}
                  className="w-full min-h-[36px] accent-[#22D3EE]"
                />
              </label>

              <label className="block space-y-1.5">
                <div className="flex justify-between font-mono-tabular">
                  <span className="text-[#CBD5E1]">{isAr ? 'حد نيكويست للملون:' : 'Color Nyquist Limit:'}</span>
                  <span className="text-[#22D3EE] font-bold">±{simNyquistCms} cm/s</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={90}
                  value={simNyquistCms}
                  onChange={(e) => setSimNyquistCms(Number(e.target.value))}
                  className="w-full min-h-[36px] accent-[#22D3EE]"
                />
              </label>

              <label className="block space-y-1.5">
                <div className="flex justify-between font-mono-tabular">
                  <span className="text-[#CBD5E1]">{isAr ? 'عرض القطاع (Frame Rate):' : 'Sector Width:'}</span>
                  <span className="text-[#22D3EE] font-bold">{simSectorWidthPct}%</span>
                </div>
                <input
                  type="range"
                  min={45}
                  max={100}
                  value={simSectorWidthPct}
                  onChange={(e) => setSimSectorWidthPct(Number(e.target.value))}
                  className="w-full min-h-[36px] accent-[#22D3EE]"
                />
              </label>
            </div>
          </aside>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: PROGRESSIVE LEVEL 1->4 DRILLS & 12-STEP FINAL CLOSING PROTOCOL */}
      {/* ===================================================================== */}
      {tab === 'drills' && (
        <div className="space-y-6">
          {/* Practical Progressive Drills */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-[#F4F7FB]">
                {isAr
                  ? 'التدريبات العملية المتدرجة (من المستوى 1 إلى المستوى 4)'
                  : 'Progressive Competency Drills (Level 1 → Level 4)'}
              </h2>
              <span className="text-xs font-mono-tabular text-[#22D3EE]">
                {correctDrillCount}/{ECHO_DRILLS.length} {isAr ? 'صحيحة' : 'Correct'}
              </span>
            </div>

            <div className="grid gap-4">
              {filteredDrills.map((q) => {
                const chosen = drillAnswers[q.id];
                const answered = typeof chosen === 'number';
                const opts = isAr ? q.optionsAr : q.optionsEn;
                return (
                  <div key={q.id} className="glass-panel rounded-2xl p-5 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tabular">
                      <span className="text-[#22D3EE] font-bold">
                        {isAr ? q.topicTagAr : q.topicTagEn}
                      </span>
                      <span className="text-[#94A3B8]">{q.reference}</span>
                    </div>

                    <p className="text-sm font-medium text-[#F4F7FB] leading-relaxed">
                      {isAr ? q.stemAr : q.stemEn}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {opts.map((opt, idx) => {
                        const isPicked = chosen === idx;
                        const isRight = idx === q.correctIndex;
                        let style =
                          'bg-[#070E1C] border-white/10 text-[#CBD5E1] hover:border-white/25 hover:text-white';
                        if (answered) {
                          if (isRight) {
                            style = 'bg-emerald-500/15 border-emerald-400/60 text-emerald-200';
                          } else if (isPicked) {
                            style = 'bg-red-500/15 border-red-400/60 text-red-200';
                          } else {
                            style = 'bg-[#070E1C]/60 border-white/5 text-[#64748B]';
                          }
                        }

                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleAnswerDrill(q.id, idx, q.correctIndex)}
                            className={`min-h-[44px] text-start p-3 rounded-xl border text-xs leading-snug flex items-start justify-between gap-2 transition-colors ${style}`}
                          >
                            <span>{opt}</span>
                            {answered && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                            {answered && isPicked && !isRight && (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {answered && (
                      <div className="p-3.5 rounded-xl bg-[#071124] border border-[#22D3EE]/30 text-xs text-[#CBD5E1] leading-relaxed">
                        <span className="font-bold text-[#22D3EE] me-1.5">
                          {isAr ? 'التفسير السريري:' : 'Clinical Explanation:'}
                        </span>
                        {isAr ? q.explanationAr : q.explanationEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Mandatory 12-Step Final ASE Echo Exam Closing Protocol */}
          <section className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ClipboardCheck className="w-5 h-5 text-[#22D3EE]" />
                <div>
                  <h2 className="font-display text-base font-bold text-[#F4F7FB]">
                    {isAr
                      ? 'بروتوكول الاختتام النهائي لفحص الإيكو (12 خطوة إلزامية قبل التوقيع)'
                      : '12-Point ASE Final Echo Closing & Sign-Off Protocol'}
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    {isAr
                      ? 'تحقق من استيفاء جميع الحجرات والصمامات والأوعية الكبرى والتنبيهات الإسعافية قبل رفع المجس وإصدار التقرير.'
                      : 'Audit every chamber, valve, great vessel, pericardial space, and urgent alert before concluding your examination.'}
                  </p>
                </div>
              </div>

              <div className="font-mono-tabular text-xs font-bold text-[#22D3EE]">
                {completedChecklistCount}/{ECHO_FINAL_CHECKLIST.length} {isAr ? 'مكتمل' : 'Signed Off'}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {ECHO_FINAL_CHECKLIST.map((step) => {
                const checked = Boolean(checklistDone[step.id]);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => handleToggleChecklist(step.id)}
                    className={`min-h-[44px] text-start p-3.5 rounded-xl border transition-colors flex items-start gap-3 ${
                      checked
                        ? 'bg-emerald-500/12 border-emerald-400/50 text-[#F4F7FB]'
                        : 'bg-[#070E1C] border-white/10 text-[#CBD5E1] hover:border-white/25'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 font-mono-tabular text-xs font-bold ${
                        checked
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-white/25 text-[#94A3B8]'
                      }`}
                    >
                      {checked ? '✓' : step.stepNumber}
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono-tabular text-[#22D3EE]">
                        {isAr ? step.categoryAr : step.categoryEn}
                      </div>
                      <div className="text-xs font-semibold text-[#F4F7FB]">
                        {isAr ? step.titleAr : step.titleEn}
                      </div>
                      <div className="text-[11px] text-[#94A3B8] leading-snug">
                        {isAr ? step.detailAr : step.detailEn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {completedChecklistCount === ECHO_FINAL_CHECKLIST.length && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/15 to-[#22D3EE]/15 border border-emerald-400/40 flex items-center gap-3">
                <Award className="w-7 h-7 text-emerald-400 shrink-0" />
                <div className="space-y-0.5">
                  <div className="font-display text-sm font-bold text-[#F4F7FB]">
                    {isAr
                      ? 'تهانينا دكتور! تم استيفاء كامل بروتوكول اختتام فحص الإيكو المعتمد (12/12)'
                      : 'Exam Sign-Off Protocol Verified (12/12 Comprehensive Echo Standards Met)'}
                  </div>
                  <p className="text-xs text-[#CBD5E1]">
                    {isAr
                      ? `نتيجتك الحالية في الاختبار العملي: ${correctDrillCount}/${ECHO_DRILLS.length} · الجلسات المكتملة: ${completedSessionCount}/${ECHO_SESSIONS.length}. تقرير الإيكو مكتمل المعايير وجاهز للاعتماد السريري.`
                      : `Drills Mastery: ${correctDrillCount}/${ECHO_DRILLS.length} · 10-Min Lab Sessions Completed: ${completedSessionCount}/${ECHO_SESSIONS.length}. Comprehensive TTE sign-off achieved.`}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Shared Android-Ready Pinch-Zoom & Drag-Pan High-Res Modal */}
      <HighResImageModal
        open={zoomModal.open}
        onClose={() => setZoomModal((prev) => ({ ...prev, open: false }))}
        imageUrl={zoomModal.imageUrl}
        fallbackUrl={zoomModal.fallbackUrl}
        title={zoomModal.title}
        subtitle={zoomModal.subtitle}
        language={language}
      />
    </div>
  );
}
