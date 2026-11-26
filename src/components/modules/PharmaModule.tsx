import React, { useMemo, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Coins,
  Database,
  Pill,
  Search,
  Sparkles,
  X
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { callAiRouter } from '../../lib/apiClient';
import { db } from '../../lib/firebase';
import {
  checkPharmaInteraction,
  getPharma20kCatalog,
  queryPharma20k,
  type Pharma20kEntry
} from '../../data/pharma20k';
import { MedicalSceneCanvas } from '../three/MedicalSceneCanvas';

export function PharmaModule() {
  const {
    language,
    user,
    isGuest,
    reducedMotion,
    theme3d,
    setActiveModule,
    consumeFeature,
    getFeatureGateState
  } = useApp();
  const isAr = language === 'ar';
  const gate = getFeatureGateState('pharma_ai_consult');

  const catalog = useMemo(() => getPharma20kCatalog(), []);

  const [queryText, setQueryText] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedRoute, setSelectedRoute] = useState('All');
  const [page, setPage] = useState(1);

  const [drugA, setDrugA] = useState(catalog.baseMolecules[0]?.en || 'Apixaban');
  const [drugB, setDrugB] = useState(catalog.baseMolecules[4]?.en || 'Warfarin Sodium');

  const [activeMed, setActiveMed] = useState<Pharma20kEntry | null>(null);

  // AI Clinical Pharmacist state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const queryResult = useMemo(
    () =>
      queryPharma20k({
        search: queryText,
        drugClass: selectedClass,
        route: selectedRoute,
        page,
        pageSize: 24
      }),
    [queryText, selectedClass, selectedRoute, page]
  );

  const interactionAlert = useMemo(() => checkPharmaInteraction(drugA, drugB), [drugA, drugB]);

  const handleSearchChange = (val: string) => {
    setQueryText(val);
    setPage(1);
  };

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    setPage(1);
  };

  const handleRouteChange = (val: string) => {
    setSelectedRoute(val);
    setPage(1);
  };

  const handleAiPharmacist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setAiNotice(null);

    if (isGuest || !user) {
      setAiNotice(
        isAr
          ? 'سجّل الدخول بحساب Google لتشغيل المستشار الدوائي الذكي.'
          : 'Sign in with Google to run AI Clinical Pharmacist consults.'
      );
      return;
    }

    const charge = await consumeFeature('pharma_ai_consult');
    if (!charge.ok) {
      setAiNotice(charge.message);
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Clinical Pharmacology Consult (Drug Registry 20K Bilingual Reference).
Selected Pair Context: ${drugA} + ${drugB}.
Question: ${aiQuestion.trim()}
Provide: mechanism summary, renal/hepatic dosing pearls, critical contraindications, and monitoring labs concisely.`;

      const res = await callAiRouter({
        module: 'pharma',
        prompt,
        preferredProvider: 'grok',
        language
      });

      await addDoc(collection(db, 'ai_usage'), {
        userId: user.uid,
        module: 'pharma',
        provider: res.provider,
        model: res.model,
        status: res.status,
        latencyMs: res.latencyMs,
        createdAt: serverTimestamp()
      }).catch(() => {});

      if (res.status !== 'success' || !res.content) {
        setAiNotice(res.message || 'AI provider unavailable.');
        return;
      }

      setAiAnswer(res.content);
    } catch (err) {
      setAiNotice(err instanceof Error ? err.message : 'Pharmacology AI error.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verified 20,000 Unique Bilingual Registry Banner */}
      <div className="glass-panel rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-[#22D3EE] shrink-0" />
          <div>
            <h2 className="font-display text-lg font-bold text-[#F4F7FB]">
              {isAr
                ? 'قاعدة البيانات الدوائية العالمية — 20,000 مستحضر مترجم دون تكرار'
                : 'Global Bilingual Pharmacology Atlas — 20,000 Unique Formulations'}
            </h2>
            <p className="text-xs text-[#94A3B8]">
              {isAr
                ? 'فهرس ثنائي اللغة (عربي / إنجليزي) خالٍ من التكرار مع الجرعات والقصور الكلوي والتداخلات الدوائية.'
                : 'Zero-duplicate EN/AR medication registry with ATC coding, renal adjustment, and clinical warnings.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-xl bg-[#040914]/90 border border-white/10 px-3.5 py-2">
            <div className="text-[11px] text-[#94A3B8]">{isAr ? 'إجمالي الأدوية' : 'Total Unique'}</div>
            <div className="font-mono-tabular text-sm font-bold text-[#22D3EE]">
              {catalog.stats.total.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl bg-[#040914]/90 border border-white/10 px-3.5 py-2">
            <div className="text-[11px] text-[#94A3B8]">{isAr ? 'المواد الفعالة' : 'INN Molecules'}</div>
            <div className="font-mono-tabular text-sm font-bold text-[#F4F7FB]">
              {catalog.stats.baseMoleculeCount}
            </div>
          </div>
          <div className="rounded-xl bg-[#040914]/90 border border-white/10 px-3.5 py-2">
            <div className="text-[11px] text-[#94A3B8]">{isAr ? 'الأشكال الصيدلانية' : 'Dosage Forms'}</div>
            <div className="font-mono-tabular text-sm font-bold text-[#F4F7FB]">
              {catalog.stats.dosageFormCount}
            </div>
          </div>
          <div className="rounded-xl bg-[#040914]/90 border border-white/10 px-3.5 py-2">
            <div className="text-[11px] text-[#94A3B8]">{isAr ? 'نسبة التكرار' : 'Duplicates'}</div>
            <div className="font-mono-tabular text-sm font-bold text-emerald-300">
              {catalog.stats.duplicateCount}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: 3D Molecule + Interaction Screener + AI Pharmacist */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-2xl p-4 h-48">
            <MedicalSceneCanvas
              mode="molecule"
              reducedMotion={reducedMotion}
              theme3d={theme3d}
              interactive
            />
          </div>

          {/* Dual-Drug Interaction Checker across all 382 INN Molecules */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <h3 className="font-display text-sm font-semibold">
                  {isAr ? 'فاحص التداخلات الدوائية الشامل' : 'Dual-Drug Interaction Screener'}
                </h3>
              </div>
              <span className="font-mono-tabular text-[11px] text-[#94A3B8]">
                {catalog.baseMolecules.length} INN
              </span>
            </div>

            <div className="space-y-2.5">
              <select
                value={drugA}
                onChange={(e) => setDrugA(e.target.value)}
                className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
              >
                {catalog.baseMolecules.map((m) => (
                  <option key={m.en} value={m.en}>
                    {isAr ? `${m.ar} — ${m.en}` : `${m.en} — ${m.ar}`}
                  </option>
                ))}
              </select>

              <select
                value={drugB}
                onChange={(e) => setDrugB(e.target.value)}
                className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
              >
                {catalog.baseMolecules.map((m) => (
                  <option key={m.en} value={m.en}>
                    {isAr ? `${m.ar} — ${m.en}` : `${m.en} — ${m.ar}`}
                  </option>
                ))}
              </select>
            </div>

            {interactionAlert ? (
              <div
                className={`rounded-xl border p-3 text-xs space-y-1 ${
                  interactionAlert.level === 'critical'
                    ? 'bg-rose-500/10 border-rose-400/40 text-rose-200'
                    : interactionAlert.level === 'moderate'
                      ? 'bg-amber-500/10 border-amber-400/35 text-amber-200'
                      : 'bg-emerald-500/10 border-emerald-400/25 text-emerald-200'
                }`}
              >
                <div className="font-semibold">
                  {isAr ? interactionAlert.severityAr : interactionAlert.severityEn}
                </div>
                <div className="leading-relaxed">
                  {isAr ? interactionAlert.noteAr : interactionAlert.noteEn}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-[#94A3B8]">
                {isAr
                  ? 'اختر مادتين فعالتين مختلفتين للفحص الفوري.'
                  : 'Select two distinct medications to screen.'}
              </div>
            )}
          </div>

          {/* AI Clinical Pharmacist */}
          <form onSubmit={handleAiPharmacist} className="glass-panel rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#22D3EE]" />
                <h3 className="font-display text-sm font-semibold">
                  {isAr ? 'المستشار الدوائي الذكي' : 'AI Clinical Pharmacist'}
                </h3>
              </div>
              <span className="font-mono-tabular text-[11px] text-[#22D3EE] inline-flex items-center gap-1">
                <Coins className="w-3 h-3" />
                {gate.cost} {isAr ? 'نقاط' : 'pts'}
              </span>
            </div>

            <textarea
              rows={3}
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder={
                isAr
                  ? 'اسأل عن تعديل الجرعة الكلوية، التداخلات، أو البديل الآمن في الحمل…'
                  : 'Ask about renal dosing adjustment, drug-drug timing, or safe alternatives…'
              }
              className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
            />

            <button
              type="submit"
              disabled={aiLoading || !aiQuestion.trim()}
              className="w-full btn-3d-primary py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60"
            >
              {aiLoading
                ? isAr
                  ? 'جارٍ التحليل الصيدلاني…'
                  : 'Analyzing Pharmacology…'
                : isAr
                  ? 'تشغيل الاستشارة الدوائية'
                  : 'Run Pharmacist Consult'}
            </button>

            {aiNotice && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-3 text-xs text-amber-200 space-y-2">
                <div>{aiNotice}</div>
                <button
                  type="button"
                  onClick={() => setActiveModule('wallet')}
                  className="underline font-semibold text-[#22D3EE]"
                >
                  {isAr ? 'شحن النقاط / إدارة الباقة' : 'Open Wallet & Points'}
                </button>
              </div>
            )}

            {aiAnswer && (
              <div className="rounded-xl bg-[#040914]/90 border border-[#22D3EE]/30 p-3.5 text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {aiAnswer}
              </div>
            )}
          </form>
        </div>

        {/* Right Workspace: Search + Class/Route Filters + Paginated 20K Directory */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel rounded-2xl p-4 space-y-3">
            <div className="grid md:grid-cols-12 gap-3">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-[#94A3B8] absolute top-2.5 start-3" />
                <input
                  type="text"
                  value={queryText}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={
                    isAr
                      ? 'ابحث بالعربي أو الإنجليزي أو كود ATC أو الاستطباب…'
                      : 'Search English, Arabic, ATC code, class, or indication…'
                  }
                  className="w-full rounded-xl bg-[#040914] border border-white/15 ps-9 pe-3 py-2 text-xs text-[#F4F7FB]"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="md:col-span-3 rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
              >
                <option value="All">{isAr ? 'كل الفئات الدوائية' : 'All Therapeutic Classes'}</option>
                {catalog.classesEn.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedRoute}
                onChange={(e) => handleRouteChange(e.target.value)}
                className="md:col-span-3 rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
              >
                <option value="All">{isAr ? 'كل طرق الإعطاء' : 'All Routes'}</option>
                {catalog.routesEn.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#94A3B8]">
              <span className="font-mono-tabular">
                {isAr
                  ? `عرض ${queryResult.items.length} من أصل ${queryResult.totalMatches.toLocaleString()} دواء مطابق`
                  : `Showing ${queryResult.items.length} of ${queryResult.totalMatches.toLocaleString()} matching preparations`}
              </span>
              <span className="font-mono-tabular">
                {isAr ? `صفحة ${queryResult.page} / ${queryResult.totalPages}` : `Page ${queryResult.page} / ${queryResult.totalPages}`}
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {queryResult.items.map((med) => (
              <button
                key={med.id}
                type="button"
                onClick={() => setActiveMed(med)}
                className="glass-panel-interactive text-start rounded-2xl p-5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono-tabular text-[11px] text-[#94A3B8]">
                      {med.id} · ATC {med.atc} · {isAr ? med.routeAr : med.routeEn}
                    </div>
                    <h3 className="font-display font-semibold text-sm text-[#F4F7FB] mt-0.5">
                      {isAr ? med.nameAr : med.nameEn}
                    </h3>
                    <div className="text-[11px] text-[#94A3B8]">
                      {isAr ? med.nameEn : med.nameAr}
                    </div>
                  </div>
                  <Pill className="w-4 h-4 text-[#22D3EE] shrink-0" />
                </div>

                <div className="text-xs font-medium text-[#22D3EE]">
                  {isAr ? med.classAr : med.classEn}
                </div>

                <p className="text-xs text-[#CBD5E1] line-clamp-2 leading-relaxed">
                  {isAr ? med.indAr : med.indEn}
                </p>

                <div className="text-[11px] text-amber-200/90 line-clamp-1">
                  <strong>{isAr ? 'تنبيه: ' : 'Warning: '}</strong>
                  {isAr ? med.warnAr : med.warnEn}
                </div>
              </button>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="glass-panel rounded-2xl p-3 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={queryResult.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{isAr ? 'السابق' : 'Previous'}</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-mono-tabular text-[#CBD5E1]">
              <span>{queryResult.page}</span>
              <span>/</span>
              <span>{queryResult.totalPages}</span>
            </div>

            <button
              type="button"
              disabled={queryResult.page >= queryResult.totalPages}
              onClick={() => setPage((p) => Math.min(queryResult.totalPages, p + 1))}
              className="btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1 disabled:opacity-40"
            >
              <span>{isAr ? 'التالي' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bilingual Monograph Detail Modal */}
      {activeMed && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-[#22D3EE]/35">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono-tabular text-xs text-[#22D3EE]">
                  {activeMed.id} · ATC {activeMed.atc} · {activeMed.formCode}
                </div>
                <h3 className="font-display text-xl font-bold text-[#F4F7FB] mt-1">
                  {isAr ? activeMed.nameAr : activeMed.nameEn}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {isAr ? activeMed.nameEn : activeMed.nameAr}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMed(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white"
                aria-label="Close monograph"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-[#040914] border border-white/10 p-3">
                <div className="text-[#94A3B8]">{isAr ? 'التصنيف العلمي' : 'Pharmacologic Class'}</div>
                <div className="font-semibold text-[#F4F7FB] mt-1">{activeMed.classEn}</div>
                <div className="text-[#22D3EE] mt-0.5">{activeMed.classAr}</div>
              </div>
              <div className="rounded-xl bg-[#040914] border border-white/10 p-3">
                <div className="text-[#94A3B8]">{isAr ? 'الشكل والتركيز وطريق الإعطاء' : 'Form, Strength & Route'}</div>
                <div className="font-semibold text-[#F4F7FB] mt-1">
                  {activeMed.formEn} · {activeMed.strengthEn} ({activeMed.routeEn})
                </div>
                <div className="text-[#22D3EE] mt-0.5">
                  {activeMed.formAr} · {activeMed.strengthAr} ({activeMed.routeAr})
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="rounded-xl bg-[#040914] border border-white/10 p-3.5">
                <div className="font-semibold text-[#F4F7FB] mb-1">
                  {isAr ? 'الاستطبابات السريرية' : 'Clinical Indications'}
                </div>
                <div className="text-[#CBD5E1]">{activeMed.indAr}</div>
                <div className="text-[#94A3B8] mt-1">{activeMed.indEn}</div>
              </div>

              <div className="rounded-xl bg-[#040914] border border-white/10 p-3.5">
                <div className="font-semibold text-[#F4F7FB] mb-1">
                  {isAr ? 'جرعة البالغين المعتادة' : 'Adult Dosing Reference'}
                </div>
                <div className="text-[#CBD5E1]">{activeMed.doseAr}</div>
                <div className="text-[#94A3B8] mt-1">{activeMed.doseEn}</div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-3.5">
                <div className="font-semibold text-amber-200 mb-1">
                  {isAr ? 'التحذيرات وموانع الاستعمال' : 'Critical Warnings & Contraindications'}
                </div>
                <div className="text-amber-100">{activeMed.warnAr}</div>
                <div className="text-amber-200/80 mt-1">{activeMed.warnEn}</div>
              </div>

              <div className="rounded-xl bg-[#040914] border border-white/10 p-3.5">
                <div className="font-semibold text-[#F4F7FB] mb-1">
                  {isAr ? 'تعديل الجرعة الكلوية والكبدية' : 'Renal / Hepatic Adjustment'}
                </div>
                <div className="text-[#CBD5E1]">{activeMed.renalAr}</div>
                <div className="text-[#94A3B8] mt-1">{activeMed.renalEn}</div>
              </div>

              <div className="rounded-xl bg-[#040914] border border-white/10 p-3.5">
                <div className="font-semibold text-[#F4F7FB] mb-1">
                  {isAr ? 'أهم التداخلات الدوائية' : 'Key Drug Interactions'}
                </div>
                <div className="text-[#22D3EE]">{activeMed.interactions.join(' · ')}</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDrugA(activeMed.moleculeEn);
                  setAiQuestion(
                    isAr
                      ? `قدم ملخصاً سريرياً لجرعة ${activeMed.nameAr} في حال قصور الكلية وتداخلاته الأهم.`
                      : `Summarize clinical pearls, renal adjustment, and key drug interactions for ${activeMed.nameEn}.`
                  );
                  setActiveMed(null);
                }}
                className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-semibold text-white"
              >
                {isAr ? 'استشارة الصيدلاني الذكي حول هذا الدواء' : 'Consult AI Pharmacist on This Drug'}
              </button>
              <button
                type="button"
                onClick={() => setActiveMed(null)}
                className="btn-3d-secondary px-4 py-2 rounded-xl text-xs font-semibold text-[#F4F7FB]"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
