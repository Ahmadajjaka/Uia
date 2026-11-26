import React, { useEffect, useRef, useState } from 'react';
import {
  Crosshair,
  Download,
  Move,
  RotateCcw,
  SunMoon,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { getProxiedMedicalImageUrl } from '../../lib/apiClient';
import type { Language } from '../../lib/i18n';

interface HighResImageModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  fallbackUrl?: string;
  title: string;
  subtitle?: string;
  language: Language;
  initialContrast?: number;
  initialInvert?: boolean;
  roi?: { lx: number; ly: number; sizePct: number; show: boolean };
}

export function HighResImageModal({
  open,
  onClose,
  imageUrl,
  fallbackUrl,
  title,
  subtitle,
  language,
  initialContrast = 105,
  initialInvert = false,
  roi
}: HighResImageModalProps) {
  const isAr = language === 'ar';

  const resolvedUrl =
    imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
      ? getProxiedMedicalImageUrl(imageUrl)
      : imageUrl;

  const [src, setSrc] = useState(resolvedUrl);
  const [loaded, setLoaded] = useState(false);
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number } | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contrast, setContrast] = useState(initialContrast);
  const [invert, setInvert] = useState(initialInvert);
  const [showRoi, setShowRoi] = useState(Boolean(roi?.show));
  const [isDragging, setIsDragging] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartRef = useRef<{ dist: number; zoom: number; midX: number; midY: number } | null>(
    null
  );
  const lastTapRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 });

  useEffect(() => {
    if (!open) return;
    setSrc(resolvedUrl);
    setLoaded(false);
    setNaturalDims(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setContrast(initialContrast);
    setInvert(initialInvert);
    setShowRoi(Boolean(roi?.show));
    pointersRef.current.clear();
    pinchStartRef.current = null;
  }, [open, resolvedUrl, initialContrast, initialInvert, roi?.show]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const clampZoom = (z: number) => Math.min(6, Math.max(1, Number(z.toFixed(2))));

  const clampPan = (x: number, y: number, currentZoom: number) => {
    if (currentZoom <= 1.01) return { x: 0, y: 0 };
    const rect = stageRef.current?.getBoundingClientRect();
    const maxX = rect ? (rect.width * (currentZoom - 1)) / 2 + 120 : 600;
    const maxY = rect ? (rect.height * (currentZoom - 1)) / 2 + 120 : 600;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  };

  const resetTransform = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const applyZoomStep = (delta: number) => {
    setZoom((prev) => {
      const next = clampZoom(prev + delta);
      setPan((p) => clampPan(p.x, p.y, next));
      return next;
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1) {
      setIsDragging(true);
      const now = Date.now();
      const dt = now - lastTapRef.current.time;
      const dx = Math.abs(e.clientX - lastTapRef.current.x);
      const dy = Math.abs(e.clientY - lastTapRef.current.y);
      if (dt < 280 && dx < 26 && dy < 26) {
        if (zoom > 1.2) {
          resetTransform();
        } else {
          setZoom(2.5);
        }
        lastTapRef.current = { time: 0, x: 0, y: 0 };
      } else {
        lastTapRef.current = { time: now, x: e.clientX, y: e.clientY };
      }
    } else if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      pinchStartRef.current = {
        dist: Math.max(1, dist),
        zoom,
        midX: (pts[0].x + pts[1].x) / 2,
        midY: (pts[0].y + pts[1].y) / 2
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointersRef.current.get(e.pointerId);
    if (!prev) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const scaleRatio = dist / pinchStartRef.current.dist;
      const nextZoom = clampZoom(pinchStartRef.current.zoom * scaleRatio);
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const dMidX = midX - pinchStartRef.current.midX;
      const dMidY = midY - pinchStartRef.current.midY;
      pinchStartRef.current.midX = midX;
      pinchStartRef.current.midY = midY;

      setZoom(nextZoom);
      setPan((p) => clampPan(p.x + dMidX, p.y + dMidY, nextZoom));
      return;
    }

    if (pointersRef.current.size === 1) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      setPan((p) => clampPan(p.x + dx, p.y + dy, zoom));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      setIsDragging(false);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const step = e.deltaY < 0 ? 0.35 : -0.35;
    applyZoomStep(step);
  };

  const handleDownloadHighRes = () => {
    const imgEl = imgRef.current;
    if (!imgEl || !imgEl.naturalWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#02050B';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.filter = [
      `contrast(${contrast}%)`,
      invert ? 'invert(92%) hue-rotate(180deg)' : ''
    ]
      .filter(Boolean)
      .join(' ');
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48)}_HD.png`;
    link.click();
  };

  const filterCss = [
    `contrast(${contrast}%)`,
    invert ? 'invert(92%) hue-rotate(180deg)' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-[#02050B]/98 flex flex-col"
    >
      {/* Top Diagnostic Header */}
      <header className="px-3 sm:px-5 py-2.5 border-b border-white/10 bg-[#050B16]/90 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <div className="font-display text-xs sm:text-sm font-bold text-[#F4F7FB] truncate">
            {title}
          </div>
          <div className="text-[11px] font-mono-tabular text-[#94A3B8] flex items-center gap-2 flex-wrap">
            {subtitle && <span className="truncate">{subtitle}</span>}
            {naturalDims && (
              <span className="text-[#22D3EE]">
                {naturalDims.w} × {naturalDims.h} px
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadHighRes}
            aria-label="Download High-Res PNG"
            className="btn-3d-secondary min-h-[44px] min-w-[44px] px-3 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[var(--electric-cyan)]" />
            <span className="hidden sm:inline">HD PNG</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close high-resolution viewer"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Pinch-to-Zoom & Drag-Pan Interactive Viewport */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className={`relative flex-1 overflow-hidden touch-none select-none flex items-center justify-center ${
          zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
      >
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-[#94A3B8] pointer-events-none">
            <span className="font-mono-tabular text-[#22D3EE]">
              {isAr ? 'جاري تحميل الصورة بأعلى دقة متاحة…' : 'Loading maximum resolution scan…'}
            </span>
          </div>
        )}

        <div
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transition: isDragging || pinchStartRef.current ? 'none' : 'transform 120ms ease-out'
          }}
          className="relative max-w-full max-h-full flex items-center justify-center will-change-transform"
        >
          <img
            ref={imgRef}
            src={src}
            alt={title}
            draggable={false}
            referrerPolicy="no-referrer"
            onLoad={(e) => {
              const el = e.currentTarget;
              setNaturalDims({ w: el.naturalWidth, h: el.naturalHeight });
              setLoaded(true);
            }}
            onError={() => {
              if (fallbackUrl && src !== fallbackUrl) {
                setSrc(fallbackUrl);
              } else {
                setLoaded(true);
              }
            }}
            style={{ filter: filterCss }}
            className={`max-h-[75vh] sm:max-h-[80vh] max-w-[96vw] object-contain pointer-events-none ${
              loaded ? 'opacity-100' : 'opacity-25'
            }`}
          />

          {roi && showRoi && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute border-2 border-dashed border-[#22D3EE]/80 rounded-full"
              style={{
                left: `${roi.lx}%`,
                top: `${roi.ly}%`,
                width: `${roi.sizePct}%`,
                height: `${roi.sizePct}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
        </div>

        {/* Non-obstructive mobile gesture hint */}
        <div className="pointer-events-none absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-black/65 border border-white/10 text-[11px] font-mono-tabular text-[#CBD5E1] inline-flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-[#22D3EE]" />
          <span>
            {isAr
              ? 'قرص للتكبير · اسحب للتحريك · نقر مزدوج'
              : 'Pinch to zoom · Drag to pan · Double-tap'}
          </span>
        </div>
      </div>

      {/* Bottom Thumb-Zone Control Dock (44px+ hit targets for Android) */}
      <footer className="px-3 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#050B16]/95 space-y-2.5 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2 max-w-4xl mx-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyZoomStep(-0.5)}
              aria-label="Zoom out"
              className="btn-3d-secondary min-h-[44px] min-w-[44px] px-3 rounded-xl inline-flex items-center justify-center"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono-tabular text-xs font-bold text-[#22D3EE] w-14 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => applyZoomStep(0.5)}
              aria-label="Zoom in"
              className="btn-3d-secondary min-h-[44px] min-w-[44px] px-3 rounded-xl inline-flex items-center justify-center"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetTransform}
              className="btn-3d-secondary min-h-[44px] px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>1×</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setInvert((v) => !v)}
              className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold border inline-flex items-center gap-1.5 ${
                invert
                  ? 'border-[var(--electric-cyan)] bg-white/10 text-white'
                  : 'border-white/15 text-[var(--titanium-silver)]'
              }`}
            >
              <SunMoon className="w-4 h-4" />
              <span>{isAr ? 'عكس' : 'Invert'}</span>
            </button>

            {roi && (
              <button
                type="button"
                onClick={() => setShowRoi((r) => !r)}
                className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold border inline-flex items-center gap-1.5 ${
                  showRoi
                    ? 'border-[var(--electric-cyan)] bg-white/10 text-white'
                    : 'border-white/15 text-[var(--titanium-silver)]'
                }`}
              >
                <Crosshair className="w-4 h-4" />
                <span>ROI</span>
              </button>
            )}
          </div>
        </div>

        <label className="max-w-4xl mx-auto flex items-center gap-3 text-xs text-[var(--titanium-silver)]">
          <span className="shrink-0">{isAr ? 'التباين:' : 'Window Contrast:'}</span>
          <input
            type="range"
            min={65}
            max={200}
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="flex-1 min-h-[36px] accent-[#22D3EE]"
          />
          <span className="font-mono-tabular w-11 text-end text-[#F4F7FB]">{contrast}%</span>
        </label>
      </footer>
    </div>
  );
}
