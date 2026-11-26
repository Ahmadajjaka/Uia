import React, { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { Maximize2, Scan, Sparkles, UploadCloud, ZoomIn, ZoomOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { SAMPLE_RADIOLOGY_STUDIES } from '../../data/medicalCatalog';
import { callAiRouter } from '../../lib/apiClient';
import { db, handleFirestoreError, OperationType, uploadMedicalAsset } from '../../lib/firebase';
import { HighResImageModal } from './HighResImageModal';

interface RadiologyItem {
  id: string;
  title: string;
  modality: 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound';
  studyDate: string;
  findings: string;
  impression: string;
  imageUrl?: string;
}

export function RadiologyModule() {
  const { language, user, isGuest, setActiveModule, consumeFeature, getFeatureGateState } = useApp();
  const isAr = language === 'ar';
  const gate = getFeatureGateState('radiology_vision');

  const [modalityFilter, setModalityFilter] = useState<'All' | 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound'>('All');
  const [userStudies, setUserStudies] = useState<RadiologyItem[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<RadiologyItem>(SAMPLE_RADIOLOGY_STUDIES[0]);
  const [zoom, setZoom] = useState(1);
  const [contrast, setContrast] = useState(105);
  const [uploadModality, setUploadModality] = useState<'X-Ray' | 'CT' | 'MRI' | 'Ultrasound'>('X-Ray');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [highResOpen, setHighResOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setUserStudies([]);
      return;
    }
    const q = query(
      collection(db, 'radiology_reports'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setUserStudies(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RadiologyItem, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'radiology_reports')
    );
    return () => unsub();
  }, [user]);

  const allStudies: RadiologyItem[] = [...userStudies, ...SAMPLE_RADIOLOGY_STUDIES];
  const filteredStudies =
    modalityFilter === 'All'
      ? allStudies
      : allStudies.filter((s) => s.modality === modalityFilter);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadedFile(file);
    setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedDataUrl(reader.result);
        setSelectedStudy({
          id: 'preview-upload',
          title: file.name,
          modality: uploadModality,
          studyDate: new Date().toISOString().slice(0, 10),
          findings: isAr ? 'جاهز للتحليل عبر Z.AI GLM Vision.' : 'Ready for Z.AI GLM Vision inspection.',
          impression: isAr ? 'اضغط على تحليل الصورة بالذكاء الاصطناعي.' : 'Click Analyze Scan with Z.AI Vision.',
          imageUrl: reader.result
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const analyzeCurrentScan = async () => {
    setNotice(null);
    if (isGuest || !user) {
      setNotice(
        isAr
          ? 'سجّل الدخول بحساب Google لتشغيل تحليل الأشعة عبر Z.AI Vision وحفظ التقرير.'
          : 'Sign in with Google to run Z.AI GLM Vision radiology analysis and save reports.'
      );
      return;
    }

    const imageSource = uploadedDataUrl || selectedStudy.imageUrl;
    if (!imageSource) return;

    const charge = await consumeFeature('radiology_vision');
    if (!charge.ok) {
      setNotice(charge.message);
      return;
    }

    setAnalyzing(true);
    try {
      let dataUrlToSend = uploadedDataUrl;
      if (!dataUrlToSend && selectedStudy.imageUrl) {
        const resp = await fetch(selectedStudy.imageUrl);
        const blob = await resp.blob();
        dataUrlToSend = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result || ''));
          r.readAsDataURL(blob);
        });
      }

      let storedUrl = selectedStudy.imageUrl || '';
      if (uploadedFile) {
        storedUrl = (await uploadMedicalAsset(uploadedFile, 'radiology', user.uid)) || '';
      }

      const res = await callAiRouter({
        module: 'radiology',
        prompt: `Review this ${selectedStudy.modality} imaging study (${selectedStudy.title}). Provide structured Findings, Clinical Impression, Plain-Language Patient Explanation, and Uncertainty Caveats.`,
        imageDataUrl: dataUrlToSend || undefined,
        preferredProvider: 'zai',
        language
      });

      await addDoc(collection(db, 'ai_usage'), {
        userId: user.uid,
        module: 'radiology',
        provider: res.provider,
        model: res.model,
        status: res.status,
        latencyMs: res.latencyMs,
        createdAt: serverTimestamp()
      }).catch(() => {});

      if (res.status !== 'success' || !res.content) {
        setNotice(res.message || 'Z.AI Vision API key is not configured yet.');
        return;
      }

      const newReport: Omit<RadiologyItem, 'id'> = {
        title: (uploadTitle || selectedStudy.title).slice(0, 180),
        modality: uploadModality,
        studyDate: new Date().toISOString().slice(0, 10),
        findings: res.content.slice(0, 12000),
        impression: `Z.AI GLM Vision (${res.model}) assisted review`,
        ...(storedUrl && storedUrl.startsWith('http') ? { imageUrl: storedUrl } : {})
      };

      await addDoc(collection(db, 'radiology_reports'), {
        userId: user.uid,
        ...newReport,
        createdAt: serverTimestamp()
      });

      setSelectedStudy({ id: 'latest', ...newReport, imageUrl: imageSource });
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Radiology analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Study Library & Modality Filter */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="glass-panel rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-[#22D3EE]" />
            <h2 className="font-display text-base font-semibold">
              {isAr ? 'مكتبة تقارير الأشعة' : 'Radiology Archive'}
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['All', 'X-Ray', 'CT', 'MRI', 'Ultrasound'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModalityFilter(m)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  modalityFilter === m
                    ? 'bg-[#1D6FEB] text-white'
                    : 'bg-white/5 text-[#94A3B8] hover:text-[#F4F7FB]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <label className="block rounded-xl border border-dashed border-white/20 bg-[#040914] p-3 text-center cursor-pointer hover:border-[#22D3EE]/50">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <div className="flex items-center justify-center gap-2 text-xs text-[#22D3EE] font-medium">
              <UploadCloud className="w-4 h-4" />
              <span>{isAr ? 'رفع صورة أشعة جديدة' : 'Upload Scan Image'}</span>
            </div>
          </label>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredStudies.map((study) => (
              <button
                key={study.id}
                type="button"
                onClick={() => {
                  setSelectedStudy(study);
                  setUploadedDataUrl(null);
                  setUploadedFile(null);
                }}
                className={`w-full text-start rounded-xl p-3 border transition-colors ${
                  selectedStudy.id === study.id
                    ? 'bg-[#1D6FEB]/20 border-[#22D3EE]/40'
                    : 'bg-[#040914] border-white/10 hover:border-white/25'
                }`}
              >
                <div className="text-xs font-semibold text-[#F4F7FB] truncate">{study.title}</div>
                <div className="text-[11px] font-mono-tabular text-[#94A3B8] mt-0.5">
                  {study.modality} · {study.studyDate}
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* PACS Image Viewer & Structured Findings */}
      <section className="lg:col-span-8 space-y-5">
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-semibold text-[#F4F7FB]">
                {selectedStudy.title}
              </h3>
              <p className="text-xs font-mono-tabular text-[#94A3B8]">
                {selectedStudy.modality} · {selectedStudy.studyDate}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label="Zoom out"
                onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.15).toFixed(2))))}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/5 text-[#94A3B8] hover:text-white flex items-center justify-center"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono-tabular text-[#CBD5E1] w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                aria-label="Zoom in"
                onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.15).toFixed(2))))}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl bg-white/5 text-[#94A3B8] hover:text-white flex items-center justify-center"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={70}
                max={150}
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                aria-label="Contrast adjustment"
                className="w-20 accent-[#22D3EE]"
              />
              {selectedStudy.imageUrl && (
                <button
                  type="button"
                  onClick={() => setHighResOpen(true)}
                  className="btn-3d-secondary min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Maximize2 className="w-4 h-4 text-[#22D3EE]" />
                  <span>{isAr ? 'أعلى دقة وزوم' : 'Ultra-HD Zoom'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="h-[300px] sm:h-[340px] rounded-xl bg-[#02050B] border border-white/10 overflow-hidden flex items-center justify-center">
            {selectedStudy.imageUrl ? (
              <img
                src={selectedStudy.imageUrl}
                alt={selectedStudy.title}
                referrerPolicy="no-referrer"
                onClick={() => setHighResOpen(true)}
                style={{
                  transform: `scale(${zoom})`,
                  filter: `contrast(${contrast}%)`
                }}
                className="max-h-full max-w-full object-contain transition-transform duration-150 cursor-zoom-in"
              />
            ) : (
              <div className="text-xs text-[#94A3B8]">
                {isAr ? 'لا توجد صورة مرفقة لهذه الدراسة.' : 'No preview image attached for this study.'}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <select
              value={uploadModality}
              onChange={(e) =>
                setUploadModality(e.target.value as 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound')
              }
              className="rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
            >
              <option value="X-Ray">X-Ray</option>
              <option value="CT">CT</option>
              <option value="MRI">MRI</option>
              <option value="Ultrasound">Ultrasound</option>
            </select>

            <button
              type="button"
              disabled={analyzing}
              onClick={analyzeCurrentScan}
              className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-2 disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {analyzing
                  ? isAr
                    ? 'جاري قراءة الصورة عبر Z.AI…'
                    : 'Analyzing with Z.AI Vision…'
                  : `${isAr ? 'تحليل الصورة بالذكاء الاصطناعي' : 'Analyze Scan with Z.AI Vision'}${
                      gate.proRequired ? ' [PRO]' : ''
                    }${gate.cost > 0 ? ` (${gate.cost} ${isAr ? 'نقطة' : 'pts'})` : ''}`}
              </span>
            </button>
          </div>
        </div>

        {notice && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-4 text-xs text-amber-200 flex items-center justify-between gap-3">
            <span>{notice}</span>
            {!isGuest && user && (
              <button
                type="button"
                onClick={() => setActiveModule('wallet')}
                className="text-amber-300 font-semibold hover:underline shrink-0"
              >
                {isAr ? 'ترقية PRO / شحن' : 'Upgrade / Top-Up'}
              </button>
            )}
          </div>
        )}

        <div className="glass-panel rounded-2xl p-5 space-y-3">
          <h4 className="font-display text-sm font-semibold text-[#22D3EE]">
            {isAr ? 'التقرير والشرح السريري' : 'Structured Findings & Explanation'}
          </h4>
          <p className="text-sm text-[#E2E8F0] whitespace-pre-wrap leading-relaxed">
            {selectedStudy.findings}
          </p>
          <div className="pt-3 border-t border-white/10 text-xs text-[#94A3B8]">
            <strong className="text-[#F4F7FB]">{isAr ? 'الخلاصة: ' : 'Impression: '}</strong>
            {selectedStudy.impression}
          </div>
        </div>
      </section>

      {selectedStudy.imageUrl && (
        <HighResImageModal
          open={highResOpen}
          onClose={() => setHighResOpen(false)}
          imageUrl={selectedStudy.imageUrl}
          title={selectedStudy.title}
          subtitle={`${selectedStudy.modality} · ${selectedStudy.studyDate}`}
          language={language}
          initialContrast={contrast}
        />
      )}
    </div>
  );
}
