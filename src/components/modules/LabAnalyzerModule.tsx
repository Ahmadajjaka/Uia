import React, { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { FlaskConical, UploadCloud } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { callAiRouter } from '../../lib/apiClient';
import { db, handleFirestoreError, OperationType, uploadMedicalAsset } from '../../lib/firebase';

interface LabMarker {
  name: string;
  value: number;
  unit: string;
  minRef: number;
  maxRef: number;
}

interface SavedLabRecord {
  id: string;
  panelName: string;
  summary: string;
  abnormalCount: number;
  markers: LabMarker[];
}

const DEFAULT_MARKERS: LabMarker[] = [
  { name: 'Hemoglobin', value: 11.4, unit: 'g/dL', minRef: 12.0, maxRef: 16.0 },
  { name: 'WBC', value: 12.8, unit: 'x10^3/uL', minRef: 4.0, maxRef: 11.0 },
  { name: 'Creatinine', value: 1.05, unit: 'mg/dL', minRef: 0.6, maxRef: 1.2 },
  { name: 'HbA1c', value: 6.9, unit: '%', minRef: 4.0, maxRef: 5.6 },
  { name: 'Potassium', value: 4.3, unit: 'mEq/L', minRef: 3.5, maxRef: 5.1 }
];

export function LabAnalyzerModule() {
  const { language, user, isGuest, setActiveModule, consumeFeature, getFeatureGateState } = useApp();
  const isAr = language === 'ar';
  const gate = getFeatureGateState('lab_ai_interpret');

  const [panelName, setPanelName] = useState('CBC & Metabolic Panel');
  const [markers, setMarkers] = useState<LabMarker[]>(DEFAULT_MARKERS);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<string>('');
  const [notice, setNotice] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState<SavedLabRecord[]>([]);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }
    const q = query(
      collection(db, 'lab_results'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setHistory(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SavedLabRecord, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'lab_results')
    );
    return () => unsub();
  }, [user]);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') setImageDataUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageDataUrl(null);
    }
  };

  const updateMarkerValue = (idx: number, val: string) => {
    const num = Number(val);
    if (Number.isNaN(num)) return;
    setMarkers((prev) => prev.map((m, i) => (i === idx ? { ...m, value: num } : m)));
  };

  const abnormalMarkers = markers.filter((m) => m.value < m.minRef || m.value > m.maxRef);

  const runLabAnalysis = async () => {
    setNotice(null);
    if (isGuest || !user) {
      setNotice(
        isAr
          ? 'سجّل الدخول بحساب Google لتفسير التحاليل بالذكاء الاصطناعي وحفظ السجل.'
          : 'Sign in with Google to run AI lab interpretation and persist results.'
      );
      return;
    }

    const charge = await consumeFeature('lab_ai_interpret');
    if (!charge.ok) {
      setNotice(charge.message);
      return;
    }

    setAnalyzing(true);
    try {
      let imageUrl = '';
      if (selectedFile && imageDataUrl) {
        imageUrl = (await uploadMedicalAsset(selectedFile, 'labs', user.uid)) || '';
      }

      const markerSummary = markers
        .map(
          (m) =>
            `${m.name}: ${m.value} ${m.unit} (Ref ${m.minRef}-${m.maxRef}) [${
              m.value < m.minRef ? 'LOW' : m.value > m.maxRef ? 'HIGH' : 'NORMAL'
            }]`
        )
        .join('\n');

      const res = await callAiRouter({
        module: 'lab-analyzer',
        prompt: imageDataUrl
          ? `Extract all laboratory biomarkers from this uploaded lab image, highlight out-of-reference values, and also interpret these structured markers:\n${markerSummary}`
          : `Interpret this laboratory panel (${panelName}), explain out-of-reference biomarkers, possible clinical correlations, and recommended follow-up questions:\n${markerSummary}`,
        imageDataUrl: imageDataUrl || undefined,
        preferredProvider: imageDataUrl ? 'zai' : 'grok',
        language
      });

      await addDoc(collection(db, 'ai_usage'), {
        userId: user.uid,
        module: 'lab-analyzer',
        provider: res.provider,
        model: res.model,
        status: res.status,
        latencyMs: res.latencyMs,
        createdAt: serverTimestamp()
      }).catch(() => {});

      if (res.status !== 'success' || !res.content) {
        setNotice(res.message || 'AI provider not configured yet.');
        return;
      }

      setAiReport(res.content);
      await addDoc(collection(db, 'lab_results'), {
        userId: user.uid,
        panelName: panelName.slice(0, 160),
        summary: res.content.slice(0, 12000),
        abnormalCount: abnormalMarkers.length,
        sourceType: imageDataUrl ? 'image' : 'manual',
        ...(imageUrl ? { imageUrl } : {}),
        markers,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Lab interpretation error.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Upload + Biomarker Editor */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FlaskConical className="w-5 h-5 text-[#22D3EE]" />
              <h2 className="font-display text-lg font-semibold">
                {isAr ? 'تحليل المختبرات والمؤشرات الحيوية' : 'Laboratory Biomarker Panel'}
              </h2>
            </div>
            <span className="text-xs font-mono-tabular text-amber-300">
              {abnormalMarkers.length} {isAr ? 'خارج المجال' : 'Out of Range'}
            </span>
          </div>

          {/* Drag & Drop Lab Image Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            className={`rounded-2xl border border-dashed p-5 text-center transition-colors ${
              dragOver ? 'border-[#22D3EE] bg-[#22D3EE]/10' : 'border-white/20 bg-[#040914]'
            }`}
          >
            <UploadCloud className="w-6 h-6 text-[#22D3EE] mx-auto mb-2" />
            <p className="text-xs text-[#CBD5E1]">
              {isAr
                ? 'اسحب وأفلت صورة ورقة التحليل هنا لقراءتها عبر Z.AI Vision'
                : 'Drag & drop a lab report image here for Z.AI Vision extraction'}
            </p>
            <label className="mt-2 inline-block text-xs font-semibold text-[#22D3EE] cursor-pointer hover:underline">
              <input
                type="file"
                accept="image/*,.csv,.txt"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
                className="hidden"
              />
              {selectedFile ? selectedFile.name : isAr ? 'أو اختر ملفاً' : 'Or browse file'}
            </label>
          </div>

          <label className="block text-xs text-[#94A3B8]">
            {isAr ? 'اسم الفحص' : 'Panel Name'}
            <input
              type="text"
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            />
          </label>

          {/* Editable Biomarker Table */}
          <div className="space-y-2.5">
            {markers.map((m, idx) => {
              const outOfRange = m.value < m.minRef || m.value > m.maxRef;
              return (
                <div
                  key={m.name}
                  className={`rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-3 ${
                    outOfRange
                      ? 'border-amber-400/40 bg-amber-500/5'
                      : 'border-white/10 bg-[#040914]'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-[#F4F7FB]">{m.name}</div>
                    <div className="text-[11px] font-mono-tabular text-[#94A3B8]">
                      Ref: {m.minRef} – {m.maxRef} {m.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={m.value}
                      onChange={(e) => updateMarkerValue(idx, e.target.value)}
                      className="w-20 rounded-lg bg-[#070E1C] border border-white/15 px-2 py-1 text-right text-sm font-mono-tabular text-[#F4F7FB]"
                    />
                    <span
                      className={`text-[11px] font-mono-tabular w-14 text-end ${
                        outOfRange ? 'text-amber-300 font-semibold' : 'text-emerald-400'
                      }`}
                    >
                      {m.value < m.minRef ? 'LOW' : m.value > m.maxRef ? 'HIGH' : 'OK'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            disabled={analyzing}
            onClick={runLabAnalysis}
            className="btn-3d-primary w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
          >
            {analyzing
              ? isAr
                ? 'جاري التحليل المخبري…'
                : 'Interpreting Panel…'
              : `${isAr ? 'تحليل وتفسير النتائج' : 'Analyze & Interpret Lab Panel'}${
                  gate.cost > 0 ? ` (${gate.cost} ${isAr ? 'نقطة' : 'pts'})` : ''
                }`}
          </button>
        </div>

        {/* Visual Range Chart + AI Report + History */}
        <div className="lg:col-span-6 space-y-5">
          {/* Reference Range SVG Visualization */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-display text-sm font-semibold text-[#F4F7FB]">
              {isAr ? 'مخطط القيم مقابل المجال المرجعي' : 'Reference Range Telemetry Chart'}
            </h3>
            <div className="space-y-3">
              {markers.map((m) => {
                const span = m.maxRef * 1.4 || 1;
                const valPct = Math.min(100, Math.max(4, (m.value / span) * 100));
                const minPct = (m.minRef / span) * 100;
                const maxPct = (m.maxRef / span) * 100;
                const isAbnormal = m.value < m.minRef || m.value > m.maxRef;
                return (
                  <div key={m.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono-tabular">
                      <span className="text-[#CBD5E1]">{m.name}</span>
                      <span className={isAbnormal ? 'text-amber-300' : 'text-[#22D3EE]'}>
                        {m.value} {m.unit}
                      </span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-white/8 overflow-hidden">
                      <div
                        className="absolute inset-y-0 bg-emerald-400/20 border-x border-emerald-400/40"
                        style={{ left: `${minPct}%`, width: `${Math.max(4, maxPct - minPct)}%` }}
                      />
                      <div
                        className={`absolute top-0 bottom-0 w-2 rounded-full ${
                          isAbnormal ? 'bg-amber-400' : 'bg-[#22D3EE]'
                        }`}
                        style={{ left: `calc(${valPct}% - 4px)` }}
                      />
                    </div>
                  </div>
                );
              })}
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
                  {isAr ? 'المحفظة وبرو' : 'Wallet & Pro'}
                </button>
              )}
            </div>
          )}

          {aiReport && (
            <div className="glass-panel rounded-2xl p-5 text-sm text-[#E2E8F0] whitespace-pre-wrap leading-relaxed">
              {aiReport}
            </div>
          )}

          {history.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 space-y-2.5">
              <h3 className="font-display text-sm font-semibold">
                {isAr ? 'سجل التحاليل السابقة' : 'Persisted Lab History'}
              </h3>
              {history.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPanelName(item.panelName);
                    setAiReport(item.summary);
                    if (Array.isArray(item.markers) && item.markers.length > 0) {
                      setMarkers(item.markers);
                    }
                  }}
                  className="w-full text-start rounded-xl bg-[#040914] border border-white/10 p-3 flex items-center justify-between hover:border-[#22D3EE]/35"
                >
                  <span className="text-xs font-medium text-[#F4F7FB]">{item.panelName}</span>
                  <span className="text-[11px] font-mono-tabular text-amber-300">
                    {item.abnormalCount} flagged
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
