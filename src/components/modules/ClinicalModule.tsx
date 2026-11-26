import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Globe,
  Images,
  Microscope,
  Search,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { CLINICAL_GUIDELINES } from '../../data/medicalCatalog';
import {
  callAiRouter,
  searchMedicalReferencesClient,
  type MedicalLiteratureItem,
  type MedicalRefSearchResponse
} from '../../lib/apiClient';

type ReferenceTab = 'all' | 'literature' | 'conditions' | 'encyclopedia' | 'guidelines';

const QUICK_TOPICS_EN = [
  'Pneumonia',
  'Myocardial Infarction',
  'Ischemic Stroke',
  'Diabetes Mellitus',
  'Sepsis',
  'Pulmonary Embolism'
];

const QUICK_TOPICS_AR = [
  'التهاب رئوي',
  'احتشاء عضلة القلب',
  'السكتة الدماغية',
  'داء السكري',
  'إنتان الدم',
  'الانصمام الرئوي'
];

export function ClinicalModule() {
  const {
    language,
    user,
    isGuest,
    setActiveModule,
    consumeFeature,
    getFeatureGateState
  } = useApp();
  const isAr = language === 'ar';
  const gate = getFeatureGateState('clinical_protocol_ai');

  const [queryText, setQueryText] = useState('');
  const [activeTab, setActiveTab] = useState<ReferenceTab>('all');
  const [refData, setRefData] = useState<MedicalRefSearchResponse | null>(null);
  const [loadingRef, setLoadingRef] = useState(false);
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);

  const [aiAnswer, setAiAnswer] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const runLiveReferenceSearch = async (term: string) => {
    const clean = term.trim();
    if (clean.length < 2) {
      setNotice(
        isAr
          ? 'اكتب حرفين على الأقل للبحث في المراجع الطبية المعتمدة.'
          : 'Enter at least 2 characters to search connected medical references.'
      );
      return;
    }

    setNotice(null);
    setLoadingRef(true);
    setExpandedPaperId(null);
    try {
      const res = await searchMedicalReferencesClient(clean, language);
      setRefData(res);
      if (
        res.literature.length === 0 &&
        res.conditions.length === 0 &&
        res.encyclopedia.length === 0
      ) {
        setNotice(
          isAr
            ? `لم ترجع المراجع الخارجية نتائج لـ "${clean}". جرب مصطلحاً طبياً إنجليزياً أو عربياً أدق.`
            : `No external reference entries returned for "${clean}". Try another clinical term.`
        );
      }
    } catch (err) {
      setNotice(
        err instanceof Error
          ? err.message
          : isAr
            ? 'تعذر الاتصال بخدمة المراجع الطبية حالياً.'
            : 'Unable to reach live medical reference API right now.'
      );
    } finally {
      setLoadingRef(false);
    }
  };

  // Preload initial peer-reviewed medical summary on first open so users immediately see live in-app results
  useEffect(() => {
    if (!refData && !queryText) {
      void runLiveReferenceSearch('Community Acquired Pneumonia');
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runLiveReferenceSearch(queryText || 'Community Acquired Pneumonia');
  };

  const handleClinicalSearchAi = async () => {
    const targetQuery = queryText.trim() || refData?.query || '';
    if (!targetQuery) return;
    setNotice(null);

    if (isGuest || !user) {
      setNotice(
        isAr
          ? 'بحث المراجع الطبية المباشر متاح للجميع؛ سجّل الدخول لتشغيل التلخيص السريري بالذكاء الاصطناعي.'
          : 'Live medical reference search is open for all users; sign in with Google to run AI protocol synthesis.'
      );
      return;
    }

    const charge = await consumeFeature('clinical_protocol_ai');
    if (!charge.ok) {
      setNotice(charge.message);
      return;
    }

    const topAbstracts = (refData?.literature || [])
      .slice(0, 3)
      .map((a) => `- ${a.title} (${a.journal}, ${a.pubYear}): ${a.abstractText.slice(0, 320)}`)
      .join('\n');

    setLoadingAi(true);
    try {
      const res = await callAiRouter({
        module: 'clinical',
        prompt: `Provide an evidence-based clinical guideline summary, diagnostic workup, therapeutic protocol steps, key references, and uncertainty bounds for "${targetQuery}".\n\nLive retrieved literature context:\n${topAbstracts || 'No external abstract context attached.'}`,
        preferredProvider: 'grok',
        language
      });
      if (res.status !== 'success' || !res.content) {
        setNotice(res.message || 'Groq / Grok API key is not configured.');
      } else {
        setAiAnswer(res.content);
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Clinical AI synthesis failed.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSummarizePaper = async (paper: MedicalLiteratureItem) => {
    setNotice(null);
    if (isGuest || !user) {
      setNotice(
        isAr
          ? 'سجّل الدخول لتلخيص وترجمة هذا البحث الطبي عبر الذكاء الاصطناعي.'
          : 'Sign in with Google to summarize and translate this research paper with AI.'
      );
      return;
    }

    const charge = await consumeFeature('clinical_protocol_ai');
    if (!charge.ok) {
      setNotice(charge.message);
      return;
    }

    setLoadingAi(true);
    try {
      const res = await callAiRouter({
        module: 'clinical',
        prompt: `Summarize the clinical findings, methodology, and bedside applicability of this peer-reviewed study in structured format:\nTitle: ${paper.title}\nJournal: ${paper.journal} (${paper.pubYear})\nPMID: ${paper.pmid || 'N/A'}\nAbstract: ${paper.abstractText}`,
        preferredProvider: 'grok',
        language
      });
      if (res.status !== 'success' || !res.content) {
        setNotice(res.message || 'AI synthesis unavailable.');
      } else {
        setAiAnswer(res.content);
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Paper summary failed.');
    } finally {
      setLoadingAi(false);
    }
  };

  const filteredGuidelines = CLINICAL_GUIDELINES.filter((g) => {
    const q = queryText.trim().toLowerCase();
    if (!q) return true;
    return (
      g.title.toLowerCase().includes(q) ||
      g.specialty.toLowerCase().includes(q) ||
      g.summary.toLowerCase().includes(q)
    );
  });

  const quickTopics = isAr ? QUICK_TOPICS_AR : QUICK_TOPICS_EN;

  const totalLiveResults =
    (refData?.literature.length || 0) +
    (refData?.conditions.length || 0) +
    (refData?.encyclopedia.length || 0);

  return (
    <div className="space-y-6">
      {/* Live Medical Reference Search Bar */}
      <form onSubmit={handleSearchSubmit} className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Microscope className="w-5 h-5 text-[#22D3EE]" />
            <div>
              <h1 className="font-display text-lg font-bold text-[#F4F7FB]">
                {isAr
                  ? 'المرجع الطبي الموحد والبحث السريري المباشر'
                  : 'Connected Medical Reference & Clinical Evidence Hub'}
              </h1>
              <p className="text-xs text-[#94A3B8]">
                {isAr
                  ? 'بحث فوري داخل التطبيق في أبحاث PubMed / Europe PMC، وتصنيفات NIH ICD-10، والموسوعة الطبية، والإرشادات السريرية.'
                  : 'Live in-app search across Europe PMC / PubMed literature, NIH NLM ICD-10 conditions, Medical Encyclopedia & clinical guidelines.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveModule('medical-images')}
            className="btn-3d-secondary px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Images className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>{isAr ? 'أطلس 20,000 صورة طبية' : '20K Medical Images Atlas'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute top-3 start-3.5" />
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث عن مرض، دواء، بروتوكول، أو كود ICD-10 لتظهر النتائج داخل التطبيق…'
                  : 'Search any disease, syndrome, drug, or protocol — results render directly inside MAMO MED AI…'
              }
              className="w-full rounded-xl bg-[#040914] border border-white/15 ps-10 pe-4 py-2.5 text-sm text-[#F4F7FB]"
            />
          </div>

          <button
            type="submit"
            disabled={loadingRef}
            className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60"
          >
            <Search className="w-4 h-4" />
            <span>
              {loadingRef
                ? isAr
                  ? 'جاري البحث…'
                  : 'Searching…'
                : isAr
                  ? 'بحث في المراجع الطبية'
                  : 'Search Medical References'}
            </span>
          </button>

          <button
            type="button"
            disabled={loadingAi}
            onClick={handleClinicalSearchAi}
            className="btn-3d-secondary px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 text-[#22D3EE]" />
            <span>
              {loadingAi
                ? isAr
                  ? 'جاري التلخيص…'
                  : 'Synthesizing…'
                : `${isAr ? 'تلخيص ذكي' : 'AI Synthesis'}${
                    gate.cost > 0 ? ` (${gate.cost} ${isAr ? 'نقطة' : 'pts'})` : ''
                  }`}
            </span>
          </button>
        </div>

        {/* Quick Topic Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#94A3B8]">
            {isAr ? 'مواضيع شائعة:' : 'Quick lookup:'}
          </span>
          {quickTopics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => {
                setQueryText(topic);
                void runLiveReferenceSearch(topic);
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[#CBD5E1] hover:border-[#22D3EE]/50 hover:text-white transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </form>

      {notice && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-4 text-xs text-amber-200 flex items-center justify-between gap-3">
          <span>{notice}</span>
          {!isGuest && user && (
            <button
              type="button"
              onClick={() => setActiveModule('wallet')}
              className="text-amber-300 font-semibold hover:underline shrink-0"
            >
              {isAr ? 'المحفظة وبرو' : 'Wallet & Pro'}
            </button>
          )}
        </div>
      )}

      {aiAnswer && (
        <div className="glass-panel rounded-2xl p-6 space-y-2 border border-[#22D3EE]/30">
          <div className="text-xs font-semibold text-[#22D3EE] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>
              {isAr ? 'الخلاصة السريرية المعتمدة على المراجع' : 'AI Evidence Synthesis Built from Live References'}
            </span>
          </div>
          <div className="text-sm text-[#E2E8F0] whitespace-pre-wrap leading-relaxed">
            {aiAnswer}
          </div>
        </div>
      )}

      {/* Source Tabs & Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#070E1C] border border-white/10 p-1 rounded-xl text-xs">
          {[
            {
              id: 'all' as ReferenceTab,
              label: isAr
                ? `جميع النتائج (${totalLiveResults + filteredGuidelines.length})`
                : `All Sources (${totalLiveResults + filteredGuidelines.length})`
            },
            {
              id: 'literature' as ReferenceTab,
              label: isAr
                ? `أبحاث PubMed / Europe PMC (${refData?.literature.length || 0})`
                : `PubMed / Europe PMC (${refData?.literature.length || 0})`
            },
            {
              id: 'conditions' as ReferenceTab,
              label: isAr
                ? `تصنيفات NIH & ICD-10 (${refData?.conditions.length || 0})`
                : `NIH Conditions & ICD-10 (${refData?.conditions.length || 0})`
            },
            {
              id: 'encyclopedia' as ReferenceTab,
              label: isAr
                ? `الموسوعة الطبية (${refData?.encyclopedia.length || 0})`
                : `Medical Encyclopedia (${refData?.encyclopedia.length || 0})`
            },
            {
              id: 'guidelines' as ReferenceTab,
              label: isAr
                ? `الإرشادات السريرية (${filteredGuidelines.length})`
                : `Guidelines (${filteredGuidelines.length})`
            }
          ].map((tabItem) => (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setActiveTab(tabItem.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tabItem.id
                  ? 'bg-[#1D6FEB] text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {refData && (
          <div className="text-[11px] font-mono-tabular text-[#94A3B8]">
            {isAr ? 'الاستعلام:' : 'Query:'}{' '}
            <span className="text-[#22D3EE]">{refData.query}</span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loadingRef && (
        <div className="glass-panel rounded-2xl p-6 space-y-3 text-xs text-[#94A3B8]">
          <div className="h-4 w-2/3 rounded bg-white/10" />
          <div className="h-3 w-full rounded bg-white/5" />
          <div className="h-3 w-5/6 rounded bg-white/5" />
        </div>
      )}

      {/* Encyclopedia Summaries */}
      {!loadingRef &&
        (activeTab === 'all' || activeTab === 'encyclopedia') &&
        refData &&
        refData.encyclopedia.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#22D3EE]">
              <Globe className="w-4 h-4" />
              <span>{isAr ? 'الموسوعة الطبية المرجعية' : 'Clinical Encyclopedia Reference'}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {refData.encyclopedia.map((item) => (
                <article
                  key={`${item.language}_${item.title}`}
                  className="glass-panel rounded-2xl p-5 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono-tabular text-[#94A3B8]">
                      <span>{item.source}</span>
                      <span>{item.language.toUpperCase()}</span>
                    </div>
                    <h2 className="font-display text-base font-bold text-[#F4F7FB]">
                      {item.title}
                    </h2>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      {item.extract}
                    </p>
                  </div>
                  <a
                    href={item.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-[#22D3EE] inline-flex items-center gap-1 hover:underline pt-2"
                  >
                    <span>{isAr ? 'عرض المقال المرجعي الكامل' : 'Open Full Reference Entry'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}

      {/* NIH Clinical Conditions & ICD-10 Table */}
      {!loadingRef &&
        (activeTab === 'all' || activeTab === 'conditions') &&
        refData &&
        refData.conditions.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#22D3EE]">
              <FileText className="w-4 h-4" />
              <span>
                {isAr
                  ? 'الأمراض والتصنيف الدولي للأمراض (NIH NLM / ICD-10-CM)'
                  : 'NIH NLM Clinical Conditions & ICD-10-CM Codes'}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-3.5">
              {refData.conditions.map((cond) => (
                <div
                  key={cond.id}
                  className="glass-panel rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-sm font-bold text-[#F4F7FB]">
                      {cond.name}
                    </h3>
                    {cond.icd10Codes.length > 0 && (
                      <span className="font-mono-tabular text-[11px] text-[#22D3EE] shrink-0">
                        ICD-10: {cond.icd10Codes.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </div>
                  {cond.consumerName && cond.consumerName !== cond.name && (
                    <div className="text-xs text-[#CBD5E1]">{cond.consumerName}</div>
                  )}
                  {cond.synonyms.length > 0 && (
                    <div className="text-[11px] text-[#94A3B8]">
                      {isAr ? 'المرادفات: ' : 'Synonyms: '}
                      {cond.synonyms.join(' · ')}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="font-mono-tabular text-[#94A3B8]">{cond.source}</span>
                    <a
                      href={cond.infoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#22D3EE] inline-flex items-center gap-1 hover:underline"
                    >
                      <span>MedlinePlus / NIH</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* Europe PMC / PubMed Peer-Reviewed Literature */}
      {!loadingRef &&
        (activeTab === 'all' || activeTab === 'literature') &&
        refData &&
        refData.literature.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#22D3EE]">
              <BookOpen className="w-4 h-4" />
              <span>
                {isAr
                  ? 'الأبحاث والدراسات الطبية المحكمة (Europe PMC / PubMed)'
                  : 'Peer-Reviewed Biomedical Literature (Europe PMC / PubMed)'}
              </span>
            </div>
            <div className="space-y-3">
              {refData.literature.map((paper) => {
                const expanded = expandedPaperId === paper.id;
                return (
                  <article
                    key={paper.id}
                    className="glass-panel rounded-2xl p-5 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tabular text-[#94A3B8]">
                      <span className="text-[#22D3EE]">
                        {paper.journal} · {paper.pubYear}
                      </span>
                      <span>
                        {paper.pmid ? `PMID ${paper.pmid}` : paper.id}
                        {paper.citedByCount > 0 ? ` · ${paper.citedByCount} citations` : ''}
                        {paper.isOpenAccess ? ' · Open Access' : ''}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-semibold text-[#F4F7FB] leading-snug">
                      {paper.title}
                    </h3>
                    <div className="text-xs text-[#94A3B8]">{paper.authors}</div>

                    <p
                      className={`text-xs text-[#CBD5E1] leading-relaxed ${
                        expanded ? '' : 'line-clamp-3'
                      }`}
                    >
                      {paper.abstractText}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPaperId(expanded ? null : paper.id)
                          }
                          className="text-[#22D3EE] font-medium inline-flex items-center gap-1 hover:underline"
                        >
                          {expanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span>{isAr ? 'طي الملخص' : 'Collapse Abstract'}</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span>{isAr ? 'قراءة الملخص كاملاً' : 'Read Full Abstract'}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSummarizePaper(paper)}
                          disabled={loadingAi}
                          className="text-amber-300 font-medium inline-flex items-center gap-1 hover:underline disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isAr ? 'تلخيص وترجمة بالذكاء' : 'AI Summarize'}</span>
                        </button>
                      </div>

                      <a
                        href={paper.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#94A3B8] hover:text-white inline-flex items-center gap-1 font-mono-tabular"
                      >
                        <span>{paper.doi ? `DOI: ${paper.doi}` : 'PubMed'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

      {/* Curated Clinical Guidelines */}
      {(activeTab === 'all' || activeTab === 'guidelines') && (
        <section className="space-y-3">
          <div className="text-xs font-semibold text-[#22D3EE]">
            {isAr ? 'البروتوكولات والإرشادات السريرية المعتمدة' : 'Curated Clinical Guidelines'}
          </div>
          <div className="space-y-4">
            {filteredGuidelines.map((g) => (
              <div key={g.id} className="glass-panel rounded-2xl p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#94A3B8]">
                  <span className="text-[#22D3EE] font-medium">{g.specialty}</span>
                  <span className="font-mono-tabular">
                    {g.organization} · {g.year}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-[#F4F7FB]">
                  {g.title}
                </h3>
                <p className="text-sm text-[#CBD5E1] leading-relaxed">{g.summary}</p>
                <ul className="space-y-1.5 text-xs text-[#CBD5E1] list-disc ps-5">
                  {g.keyProtocol.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-white/10 text-xs text-[#94A3B8]">
                  <strong>Uncertainty Note: </strong>
                  {g.uncertaintyNote}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
