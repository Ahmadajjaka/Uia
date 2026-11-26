import React, { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { Brain, AlertTriangle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { callAiRouter } from '../../lib/apiClient';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { MedicalSceneCanvas } from '../three/MedicalSceneCanvas';

interface DifferentialHypothesis {
  condition: string;
  likelihood: string;
  supportingReasoning: string;
  uncertaintyCaveat: string;
}

interface SavedDiagnosisItem {
  id: string;
  chiefComplaint: string;
  vitalsSummary: string;
  differentials: string;
}

export function DiagnosisModule() {
  const {
    language,
    user,
    isGuest,
    reducedMotion,
    theme3d,
    t,
    setActiveModule,
    consumeFeature,
    getFeatureGateState
  } = useApp();
  const isAr = language === 'ar';
  const gate = getFeatureGateState('diagnosis_workup');

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [vitalsSummary, setVitalsSummary] = useState('BP 128/82 mmHg · HR 84 bpm · Temp 37.2°C · SpO2 98%');
  const [examFindings, setExamFindings] = useState('');
  const [labSummary, setLabSummary] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [hypotheses, setHypotheses] = useState<DifferentialHypothesis[]>([]);
  const [rawSummary, setRawSummary] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [savedCases, setSavedCases] = useState<SavedDiagnosisItem[]>([]);

  useEffect(() => {
    if (!user) {
      setSavedCases([]);
      return;
    }
    const q = query(
      collection(db, 'diagnosis_cases'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setSavedCases(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SavedDiagnosisItem, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'diagnosis_cases')
    );
    return () => unsub();
  }, [user]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) return;
    setNotice(null);

    if (isGuest || !user) {
      setNotice(
        isAr
          ? 'سجّل الدخول بحساب Google لتشغيل التشخيص التفريقي بالذكاء الاصطناعي وحفظ الحالة.'
          : 'Sign in with Google to generate Groq / Grok-assisted differential diagnosis cards and save cases.'
      );
      return;
    }

    const charge = await consumeFeature('diagnosis_workup');
    if (!charge.ok) {
      setNotice(charge.message);
      return;
    }

    setAnalyzing(true);
    try {
      const prompt = `Generate a structured differential diagnosis JSON array (strictly valid JSON array of 3 to 4 objects with keys: condition, likelihood, supportingReasoning, uncertaintyCaveat) for this clinical case:
Chief Complaint: ${chiefComplaint}
Vitals: ${vitalsSummary}
Physical Exam: ${examFindings || 'Not provided'}
Labs: ${labSummary || 'Not provided'}`;

      const res = await callAiRouter({
        module: 'diagnosis',
        prompt,
        preferredProvider: 'grok',
        language
      });

      await addDoc(collection(db, 'ai_usage'), {
        userId: user.uid,
        module: 'diagnosis',
        provider: res.provider,
        model: res.model,
        status: res.status,
        latencyMs: res.latencyMs,
        createdAt: serverTimestamp()
      }).catch(() => {});

      if (res.status !== 'success' || !res.content) {
        setNotice(res.message || 'Groq / Grok API is not configured yet.');
        return;
      }

      setRawSummary(res.content);
      let parsed: DifferentialHypothesis[] = [];
      try {
        const jsonMatch = res.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]) as DifferentialHypothesis[];
        }
      } catch {
        parsed = [];
      }
      setHypotheses(parsed);

      await addDoc(collection(db, 'diagnosis_cases'), {
        userId: user.uid,
        chiefComplaint: chiefComplaint.slice(0, 500),
        vitalsSummary: vitalsSummary.slice(0, 500),
        examFindings: examFindings.slice(0, 2000),
        labSummary: labSummary.slice(0, 2000),
        differentials: res.content.slice(0, 16000),
        createdAt: serverTimestamp()
      });
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Differential diagnosis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Structured Clinical Intake */}
        <form onSubmit={handleAnalyze} className="lg:col-span-5 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-[#22D3EE]" />
            <h2 className="font-display text-lg font-semibold">
              {isAr ? 'نموذج التقييم السريري' : 'Clinical Workup Intake'}
            </h2>
          </div>

          <label className="block text-xs text-[#94A3B8]">
            {isAr ? 'الشكوى الرئيسية والأعراض' : 'Chief Complaint & Symptoms'}
            <textarea
              required
              rows={3}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder={
                isAr
                  ? 'مثال: ألم صدري ضاغط منذ ساعتين مع تعرق…'
                  : 'e.g. Acute substernal chest pressure with diaphoresis for 2 hours…'
              }
              className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            />
          </label>

          <label className="block text-xs text-[#94A3B8]">
            {isAr ? 'العلامات الحيوية' : 'Vital Signs'}
            <input
              type="text"
              value={vitalsSummary}
              onChange={(e) => setVitalsSummary(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm font-mono-tabular text-[#F4F7FB]"
            />
          </label>

          <label className="block text-xs text-[#94A3B8]">
            {isAr ? 'نتائج الفحص السريري' : 'Physical Exam Findings'}
            <textarea
              rows={2}
              value={examFindings}
              onChange={(e) => setExamFindings(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            />
          </label>

          <label className="block text-xs text-[#94A3B8]">
            {isAr ? 'ملخص المختبر' : 'Laboratory Highlights'}
            <textarea
              rows={2}
              value={labSummary}
              onChange={(e) => setLabSummary(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            />
          </label>

          <button
            type="submit"
            disabled={analyzing}
            className="btn-3d-primary w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          >
            {analyzing
              ? isAr
                ? 'جاري تحليل التشخيص التفريقي…'
                : 'Synthesizing Differential…'
              : `${isAr ? 'توليد التشخيص التفريقي' : 'Generate Differential Cards'}${
                  gate.cost > 0 ? ` (${gate.cost} ${isAr ? 'نقطة' : 'pts'})` : ''
                }`}
          </button>
        </form>

        {/* Differential Results & 3D Anatomy */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl p-4 h-48">
            <MedicalSceneCanvas mode="brain" theme3d={theme3d} reducedMotion={reducedMotion} interactive />
          </div>

          {notice && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-4 text-xs text-amber-200 flex items-center justify-between gap-2.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{notice}</span>
              </div>
              {!isGuest && user && (
                <button
                  type="button"
                  onClick={() => setActiveModule('wallet')}
                  className="text-amber-300 font-semibold hover:underline shrink-0"
                >
                  {isAr ? 'شحن / PRO' : 'Wallet & Pro'}
                </button>
              )}
            </div>
          )}

          {hypotheses.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {hypotheses.map((h, i) => (
                <div key={i} className="glass-panel rounded-2xl p-5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-semibold text-sm text-[#F4F7FB]">
                      {h.condition}
                    </h3>
                    <span className="text-xs font-mono-tabular text-[#22D3EE]">
                      {h.likelihood}
                    </span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">{h.supportingReasoning}</p>
                  <div className="pt-2 border-t border-white/10 text-[11px] text-[#94A3B8]">
                    {isAr ? 'درجة عدم اليقين: ' : 'Uncertainty: '}
                    {h.uncertaintyCaveat}
                  </div>
                </div>
              ))}
            </div>
          ) : rawSummary ? (
            <div className="glass-panel rounded-2xl p-5 text-sm text-[#E2E8F0] whitespace-pre-wrap leading-relaxed">
              {rawSummary}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6 text-xs text-[#94A3B8] leading-relaxed">
              {t.medicalDisclaimer}
            </div>
          )}

          {savedCases.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 space-y-3">
              <h3 className="font-display text-sm font-semibold">
                {isAr ? 'الحالات المحفوظة' : 'Saved Workups'}
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {savedCases.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setRawSummary(sc.differentials)}
                    className="w-full text-start rounded-xl bg-[#040914] border border-white/10 p-3 hover:border-[#22D3EE]/35"
                  >
                    <div className="text-xs font-medium text-[#F4F7FB] truncate">
                      {sc.chiefComplaint}
                    </div>
                    <div className="text-[11px] font-mono-tabular text-[#94A3B8] truncate">
                      {sc.vitalsSummary}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
