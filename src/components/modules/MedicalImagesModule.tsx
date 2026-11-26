import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Images,
  Maximize2,
  Scan,
  Search,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import {
  getMedicalImages20kCatalog,
  queryMedicalImages20k,
  type MedicalImage20kEntry
} from '../../data/medicalImages20k';
import {
  searchMedicalReferencesClient,
  searchRealMedicalImagesClient,
  type MedicalRefSearchResponse,
  type RealMedicalImageResult
} from '../../lib/apiClient';
import { getLocalMedicalFallbackAsset, MedicalPlateViewer } from './MedicalPlateViewer';
import { CanvasDicomViewer } from './CanvasDicomViewer';

const PAGE_SIZE = 18;

export function MedicalImagesModule() {
  const { language, setActiveModule } = useApp();
  const isAr = language === 'ar';

  const catalog = useMemo(() => getMedicalImages20kCatalog(), []);

  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [modality, setModality] = useState('All');
  const [page, setPage] = useState(1);

  const queryRes = useMemo(
    () =>
      queryMedicalImages20k({
        search,
        specialty,
        modality,
        page,
        pageSize: PAGE_SIZE
      }),
    [search, specialty, modality, page]
  );

  const [selected, setSelected] = useState<MedicalImage20kEntry>(
    () => catalog.records[0]
  );
  const [canvasFullscreen, setCanvasFullscreen] = useState(false);
  const inspectorRef = useRef<HTMLDivElement | null>(null);

  // Live disease-specific real medical images fetched from Wikimedia Commons Medical Archive
  const [liveImages, setLiveImages] = useState<RealMedicalImageResult[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [activeLiveImage, setActiveLiveImage] = useState<RealMedicalImageResult | null>(null);

  // Live In-App Medical Reference lookup linked directly to selected image
  const [refLoading, setRefLoading] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const [refData, setRefData] = useState<MedicalRefSearchResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLiveLoading(true);
    setLiveImages([]);
    setActiveLiveImage(null);

    void searchRealMedicalImagesClient(selected.pubmedQuery, 6)
      .then((items) => {
        if (cancelled) return;
        setLiveImages(items);
        if (items.length > 0) {
          setActiveLiveImage(items[0]);
        }
      })
      .catch(() => {
        // Silently keep the verified pool real scan if live search is busy
      })
      .finally(() => {
        if (!cancelled) setLiveLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected.id, selected.pubmedQuery]);

  const handleSelectImage = (entry: MedicalImage20kEntry, openFullscreen = false) => {
    setSelected(entry);
    setRefData(null);
    setRefError(null);
    if (openFullscreen) {
      setCanvasFullscreen(true);
    } else if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      inspectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLookupImageReferences = async (entry: MedicalImage20kEntry) => {
    setRefLoading(true);
    setRefError(null);
    try {
      const res = await searchMedicalReferencesClient(entry.pubmedQuery, language);
      setRefData(res);
    } catch (err) {
      setRefError(err instanceof Error ? err.message : 'Unable to fetch medical references.');
    } finally {
      setRefLoading(false);
    }
  };

  const activeSourceUrl = activeLiveImage?.sourceUrl || selected.realImageSourceUrl;
  const activeRealCaption = activeLiveImage?.title || selected.realImageTitle;

  return (
    <div className="space-y-6">
      {/* Header & Search Controls */}
      <section className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <Images className="w-5 h-5 text-[var(--electric-cyan)]" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-[var(--pearl-white)]">
                {isAr
                  ? 'أطلس الصور الطبية الحقيقية — 20,000 دراسة تصويرية'
                  : 'Real Clinical Imaging Atlas — 20,000 Verified Studies'}
              </h1>
              <p className="text-xs text-[var(--titanium-silver)] flex items-center gap-1.5 flex-wrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {isAr
                    ? `${catalog.stats.total.toLocaleString()} ملفاً تصويرياً حقيقياً دون تكرار (${catalog.stats.duplicateCount} مكرر) عبر ${catalog.modalities.length} تقنيات تصوير وربط مباشر بالأرشيف الطبي`
                    : `${catalog.stats.total.toLocaleString()} real clinical imaging studies (${catalog.stats.duplicateCount} duplicates) across ${catalog.modalities.length} modalities with live medical archive sync`}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveModule('radiology')}
            className="btn-3d-secondary min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Scan className="w-4 h-4 text-[var(--electric-cyan)]" />
            <span>{isAr ? 'تحليل الأشعة بالذكاء الاصطناعي' : 'Open AI Radiology Vision'}</span>
          </button>
        </div>

        <div className="grid md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[var(--titanium-silver)] absolute top-3.5 start-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={
                isAr
                  ? 'ابحث بالعربية أو الإنجليزية: التهاب رئوي، سكتة دماغية، X-Ray، MRI…'
                  : 'Search EN/AR: pneumonia, stroke, fracture, retinal OCT, MRI, CT…'
              }
              className="w-full min-h-[44px] rounded-xl bg-[#040914] border border-white/15 ps-10 pe-4 py-2.5 text-xs text-[#F4F7FB]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filter by Specialty"
              value={specialty}
              onChange={(e) => {
                setSpecialty(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[44px] rounded-xl bg-[#040914] border border-white/15 px-3 py-2.5 text-xs text-[#F4F7FB]"
            >
              <option value="All">
                {isAr ? 'كل التخصصات الطبية' : 'All Medical Specialties'}
              </option>
              {catalog.specialtiesEn.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              aria-label="Filter by Modality"
              value={modality}
              onChange={(e) => {
                setModality(e.target.value);
                setPage(1);
              }}
              className="w-full min-h-[44px] rounded-xl bg-[#040914] border border-white/15 px-3 py-2.5 text-xs text-[#F4F7FB]"
            >
              <option value="All">
                {isAr ? 'كل تقنيات التصوير' : 'All Modalities'}
              </option>
              {catalog.modalities.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Android Horizontal Quick Modality Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', ...catalog.modalities].map((mod) => {
            const active = modality === mod;
            return (
              <button
                key={mod}
                type="button"
                onClick={() => {
                  setModality(mod);
                  setPage(1);
                }}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 border transition-colors ${
                  active
                    ? 'border-[var(--electric-cyan)] bg-white/10 text-white'
                    : 'border-white/10 bg-[#040914] text-[var(--titanium-silver)] hover:text-white'
                }`}
              >
                {mod === 'All' ? (isAr ? 'الكل (20,000)' : 'All (20K)') : mod}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tabular text-[var(--titanium-silver)]">
          <span>
            {isAr
              ? `النتائج المطابقة: ${queryRes.totalMatches.toLocaleString()} صورة`
              : `Matching studies: ${queryRes.totalMatches.toLocaleString()}`}
          </span>
          <span>
            {isAr
              ? `صفحة ${queryRes.page} من ${queryRes.totalPages.toLocaleString()}`
              : `Page ${queryRes.page} of ${queryRes.totalPages.toLocaleString()}`}
          </span>
        </div>
      </section>

      {/* Main Split Workspace: Android-First (Active Inspector appears first on mobile; 7+5 split on desktop) */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Image Plates Grid */}
        <div className="w-full order-2 lg:order-1 lg:col-span-7 space-y-4">
          {queryRes.items.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center space-y-3">
              <p className="text-sm text-[var(--titanium-silver)]">
                {isAr
                  ? 'لا توجد صور تطابق عبارة البحث الحالية.'
                  : 'No diagnostic studies match the current search filter.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSpecialty('All');
                  setModality('All');
                  setPage(1);
                }}
                className="btn-3d-secondary min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold"
              >
                {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {queryRes.items.map((item) => {
                const active = selected.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl overflow-hidden border transition-all flex flex-col relative ${
                      active
                        ? 'border-[var(--electric-cyan)] bg-white/8'
                        : 'border-white/10 bg-black/30 hover:border-white/25'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectImage(item)}
                      className="text-start flex-1 flex flex-col focus:outline-none"
                    >
                      <div className="aspect-[4/3] w-full border-b border-white/10">
                        <MedicalPlateViewer item={item} compact />
                      </div>
                      <div className="p-2.5 sm:p-3 space-y-1 flex-1">
                        <div className="text-[11px] font-mono-tabular text-[var(--electric-cyan)] truncate">
                          {isAr ? item.specialtyAr : item.specialtyEn}
                        </div>
                        <div className="font-display text-xs font-semibold text-[var(--pearl-white)] line-clamp-2 leading-snug">
                          {isAr ? item.findingTitleAr : item.findingTitleEn}
                        </div>
                        <div className="text-[11px] text-[var(--titanium-silver)] truncate">
                          {isAr ? item.acquisitionAr : item.acquisitionEn}
                        </div>
                      </div>
                    </button>

                    {/* Dedicated >=44px Android Touch Button to Launch Ultra-HD Zoom/Pan Directly */}
                    <button
                      type="button"
                      aria-label="Open high-resolution zoom & pan"
                      onClick={() => handleSelectImage(item, true)}
                      className="min-h-[44px] w-full px-3 border-t border-white/10 bg-black/35 hover:bg-white/10 text-[11px] font-semibold text-[#CBD5E1] hover:text-white inline-flex items-center justify-center gap-1.5"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[var(--electric-cyan)] shrink-0" />
                      <span className="truncate">
                        {isAr ? 'فتح بأعلى دقة وزوم' : 'Ultra-HD Zoom'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination (44px touch targets) */}
          {queryRes.totalPages > 1 && (
            <div className="glass-panel rounded-xl px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-3d-secondary min-h-[44px] px-3.5 py-2 rounded-xl inline-flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{isAr ? 'السابق' : 'Previous'}</span>
              </button>

              <div className="flex items-center gap-2 font-mono-tabular">
                <span>
                  {queryRes.page} / {queryRes.totalPages.toLocaleString()}
                </span>
                <input
                  type="number"
                  min={1}
                  max={queryRes.totalPages}
                  value={page}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (Number.isFinite(next) && next >= 1 && next <= queryRes.totalPages) {
                      setPage(next);
                    }
                  }}
                  aria-label="Jump to page"
                  className="w-20 min-h-[44px] rounded-xl bg-[#040914] border border-white/15 px-2 py-1 text-center text-xs text-[#F4F7FB]"
                />
              </div>

              <button
                type="button"
                disabled={page >= queryRes.totalPages}
                onClick={() => setPage((p) => Math.min(queryRes.totalPages, p + 1))}
                className="btn-3d-secondary min-h-[44px] px-3.5 py-2 rounded-xl inline-flex items-center gap-1 disabled:opacity-40"
              >
                <span>{isAr ? 'التالي' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Interactive PACS Inspector & Live Reference Lookup */}
        <div
          ref={inspectorRef}
          className="w-full order-1 lg:order-2 lg:col-span-5 glass-panel rounded-2xl p-4 sm:p-5 space-y-4 lg:sticky lg:top-20"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="text-[11px] font-mono-tabular text-[var(--electric-cyan)]">
                {selected.id} · {selected.modality} · ICD-10: {selected.icd10}
              </div>
              <h2 className="font-display text-base font-bold text-[var(--pearl-white)] leading-snug">
                {isAr ? selected.titleAr : selected.titleEn}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setCanvasFullscreen(true)}
              className="btn-3d-primary min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 shrink-0"
            >
              <Maximize2 className="w-4 h-4" />
              <span>{isAr ? 'ملء الشاشة Canvas' : 'Full Canvas'}</span>
            </button>
          </div>

          <CanvasDicomViewer
            studyId={activeLiveImage ? `${selected.id}_${activeLiveImage.id}` : selected.id}
            imageUrl={activeLiveImage ? activeLiveImage.imageUrl : selected.realImageUrl}
            fallbackUrl={getLocalMedicalFallbackAsset(selected)}
            title={isAr ? selected.titleAr : selected.titleEn}
            subtitle={`${selected.modality} · ${isAr ? selected.regionAr : selected.regionEn}`}
            modality={selected.modality}
            icd10={selected.icd10}
            windowPreset={selected.windowPreset}
            sliceThickness={selected.sliceThickness}
            roi={{
              lx: selected.cx,
              ly: selected.cy,
              sizePct: Math.max(14, selected.lr * 1.9)
            }}
            language={language}
            fullscreen={false}
            onToggleFullscreen={() => setCanvasFullscreen(true)}
          />

          {/* Live Clinical Case Real Image Strip */}
          {(liveLoading || liveImages.length > 0) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-[var(--titanium-silver)]">
                <span>
                  {isAr
                    ? 'لقطات سريرية حقيقية مطابقة للحالة:'
                    : 'Matching Real Clinical Scans:'}
                </span>
                {liveLoading && (
                  <span className="font-mono-tabular text-[var(--electric-cyan)]">
                    {isAr ? 'جاري التحميل…' : 'Syncing…'}
                  </span>
                )}
              </div>
              {liveImages.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveLiveImage(null)}
                    className={`w-14 h-14 min-w-[56px] min-h-[56px] rounded-xl overflow-hidden border shrink-0 bg-[#030712] ${
                      !activeLiveImage
                        ? 'border-[var(--electric-cyan)]'
                        : 'border-white/10 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={`/api/medical-images/proxy?url=${encodeURIComponent(selected.realThumbUrl)}`}
                      alt={selected.realImageTitle}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                  {liveImages.map((live) => {
                    const isSelected = activeLiveImage?.id === live.id;
                    return (
                      <button
                        key={live.id}
                        type="button"
                        onClick={() => setActiveLiveImage(live)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border shrink-0 bg-[#030712] ${
                          isSelected
                            ? 'border-[var(--electric-cyan)]'
                            : 'border-white/10 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={live.thumbUrl}
                          alt={live.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Verified Medical Image Provenance */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--titanium-silver)] border-b border-white/10 pb-2">
            <span className="truncate">{activeRealCaption}</span>
            <a
              href={activeSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--electric-cyan)] inline-flex items-center gap-1 shrink-0 hover:underline"
            >
              <span>{isAr ? 'المصدر الطبي' : 'Source'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Bilingual Finding Details */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-[var(--titanium-silver)]">
              <span>{isAr ? 'الموقع التشريحي:' : 'Anatomical Region:'}</span>
              <span className="text-[var(--pearl-white)] font-medium">
                {isAr ? selected.regionAr : selected.regionEn}
              </span>
            </div>
            <div className="rounded-xl bg-black/25 border border-white/10 p-3.5 space-y-1.5">
              <div className="font-semibold text-[var(--electric-cyan)]">
                {isAr ? 'الموجودات الشعاعية والسريرية' : 'Radiological & Diagnostic Findings'}
              </div>
              <p className="text-[#E2E8F0] leading-relaxed">
                {isAr ? selected.findingAr : selected.findingEn}
              </p>
            </div>
          </div>

          {/* Direct In-App Medical Reference Lookup for Selected Plate */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              disabled={refLoading}
              onClick={() => handleLookupImageReferences(selected)}
              className="btn-3d-primary w-full min-h-[44px] py-2.5 rounded-xl text-xs font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <BookOpen className="w-4 h-4" />
              <span>
                {refLoading
                  ? isAr
                    ? 'جاري جلب المراجع الطبية…'
                    : 'Searching PubMed & NIH References…'
                  : isAr
                    ? 'عرض المراجع الطبية والأبحاث لهذا المرض'
                    : 'Fetch Live Medical References (PubMed / NIH)'}
              </span>
            </button>

            {refError && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-400/30 p-3 text-xs text-rose-200">
                {refError}
              </div>
            )}

            {refData && (
              <div className="rounded-xl bg-black/35 border border-white/10 p-3.5 space-y-3 max-h-72 overflow-y-auto text-xs">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--electric-cyan)]">
                  <span>
                    {isAr
                      ? `نتائج المرجع الطبي (${refData.literature.length} بحث · ${refData.conditions.length} تصنيف)`
                      : `In-App Reference Results (${refData.literature.length} papers · ${refData.conditions.length} ICD-10)`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveModule('clinical')}
                    className="inline-flex items-center gap-1 hover:underline"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isAr ? 'فتح المرجع الكامل' : 'Full Reference Hub'}</span>
                  </button>
                </div>

                {refData.encyclopedia[0] && (
                  <div className="pb-2 border-b border-white/10 space-y-1">
                    <div className="font-semibold text-[var(--pearl-white)]">
                      {refData.encyclopedia[0].title}
                    </div>
                    <p className="text-[11px] text-[#CBD5E1] line-clamp-4 leading-relaxed">
                      {refData.encyclopedia[0].extract}
                    </p>
                  </div>
                )}

                {refData.literature.slice(0, 4).map((art) => (
                  <div key={art.id} className="pb-2 border-b border-white/10 last:border-b-0 space-y-1">
                    <div className="font-semibold text-[var(--pearl-white)] leading-snug">
                      {art.title}
                    </div>
                    <div className="text-[11px] font-mono-tabular text-[var(--titanium-silver)] flex items-center justify-between gap-2">
                      <span className="truncate">{art.journal} · {art.pubYear}</span>
                      <a
                        href={art.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--electric-cyan)] inline-flex items-center gap-1 shrink-0 hover:underline"
                      >
                        <span>{art.pmid ? `PMID ${art.pmid}` : 'Source'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Screen HTML5 Canvas API Viewer with Zoom, Pan & Annotated Measurements */}
      {canvasFullscreen && (
        <CanvasDicomViewer
          studyId={activeLiveImage ? `${selected.id}_${activeLiveImage.id}` : selected.id}
          imageUrl={activeLiveImage ? activeLiveImage.imageUrl : selected.realImageUrl}
          fallbackUrl={getLocalMedicalFallbackAsset(selected)}
          title={isAr ? selected.titleAr : selected.titleEn}
          subtitle={`${selected.modality} · ${isAr ? selected.regionAr : selected.regionEn}`}
          modality={selected.modality}
          icd10={selected.icd10}
          windowPreset={selected.windowPreset}
          sliceThickness={selected.sliceThickness}
          roi={{
            lx: selected.cx,
            ly: selected.cy,
            sizePct: Math.max(14, selected.lr * 1.9)
          }}
          language={language}
          fullscreen
          onToggleFullscreen={() => setCanvasFullscreen(false)}
        />
      )}
    </div>
  );
}
