import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Circle,
  Crosshair,
  Download,
  Hand,
  Maximize2,
  Minimize2,
  Pencil,
  RotateCcw,
  Ruler,
  SunMoon,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import type { Language } from '../../lib/i18n';
import { getProxiedMedicalImageUrl } from '../../lib/apiClient';

export type AnnotationTool = 'pan' | 'ruler' | 'arrow' | 'ellipse' | 'freehand' | 'text';

export interface CanvasPoint {
  nx: number; // normalized 0..1 relative to image width
  ny: number; // normalized 0..1 relative to image height
}

export interface CanvasAnnotation {
  id: string;
  tool: Exclude<AnnotationTool, 'pan'>;
  color: string;
  points: CanvasPoint[];
  label?: string;
}

interface CanvasDicomViewerProps {
  studyId: string;
  imageUrl: string;
  fallbackUrl: string;
  title: string;
  subtitle?: string;
  modality?: string;
  icd10?: string;
  windowPreset?: string;
  sliceThickness?: string;
  roi?: { lx: number; ly: number; sizePct: number };
  language: Language;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const ANNOTATION_COLORS = [
  { id: 'cyan', hex: '#22D3EE', label: 'Cyan' },
  { id: 'amber', hex: '#FBBF24', label: 'Amber' },
  { id: 'emerald', hex: '#34D399', label: 'Green' },
  { id: 'rose', hex: '#F87171', label: 'Red' }
] as const;

// Global LRU decoded image cache for high-throughput switching across 20,000+ studies
const DECODED_IMAGE_CACHE = new Map<string, HTMLImageElement>();
const MAX_IMAGE_CACHE = 40;

function cacheDecodedImage(url: string, img: HTMLImageElement) {
  if (DECODED_IMAGE_CACHE.has(url)) {
    DECODED_IMAGE_CACHE.delete(url);
  } else if (DECODED_IMAGE_CACHE.size >= MAX_IMAGE_CACHE) {
    const oldestKey = DECODED_IMAGE_CACHE.keys().next().value;
    if (oldestKey) DECODED_IMAGE_CACHE.delete(oldestKey);
  }
  DECODED_IMAGE_CACHE.set(url, img);
}

const STORAGE_KEY_PREFIX = 'mamo_canvas_ann_v1_';

function loadAnnotationsForStudy(studyId: string): CanvasAnnotation[] {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${studyId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CanvasAnnotation[]) : [];
  } catch {
    return [];
  }
}

function saveAnnotationsForStudy(studyId: string, list: CanvasAnnotation[]) {
  try {
    if (list.length === 0) {
      window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}${studyId}`);
    } else {
      window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${studyId}`, JSON.stringify(list.slice(-50)));
    }
  } catch {
    // ignore storage quota errors
  }
}

export function CanvasDicomViewer({
  studyId,
  imageUrl,
  fallbackUrl,
  title,
  subtitle,
  modality = 'DICOM',
  icd10,
  windowPreset,
  sliceThickness,
  roi,
  language,
  fullscreen = false,
  onToggleFullscreen
}: CanvasDicomViewerProps) {
  const isAr = language === 'ar';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  const resolvedUrl =
    imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
      ? getProxiedMedicalImageUrl(imageUrl)
      : imageUrl;

  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);
  const [imgStatus, setImgStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Viewport transforms (Zoom & Pan)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [contrast, setContrast] = useState<number>(105);
  const [brightness, setBrightness] = useState<number>(100);
  const [invert, setInvert] = useState<boolean>(false);
  const [showRoi, setShowRoi] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Annotation Tooling State
  const [tool, setTool] = useState<AnnotationTool>('pan');
  const [activeColor, setActiveColor] = useState<string>('#22D3EE');
  const [annotations, setAnnotations] = useState<CanvasAnnotation[]>(() =>
    loadAnnotationsForStudy(studyId)
  );
  const [draftAnnotation, setDraftAnnotation] = useState<CanvasAnnotation | null>(null);
  const [pendingTextPoint, setPendingTextPoint] = useState<CanvasPoint | null>(null);
  const [textDraft, setTextDraft] = useState<string>('');
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number } | null>(null);

  // Pointer & Pinch Tracking
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ dist: number; zoom: number; midX: number; midY: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 });
  const drawingActiveRef = useRef<boolean>(false);

  // Reload stored annotations when study changes
  useEffect(() => {
    setAnnotations(loadAnnotationsForStudy(studyId));
    setDraftAnnotation(null);
    setPendingTextPoint(null);
    setTextDraft('');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [studyId]);

  useEffect(() => {
    saveAnnotationsForStudy(studyId, annotations);
  }, [studyId, annotations]);

  // Fast cached image loader with fallback
  useEffect(() => {
    let cancelled = false;
    const cached = DECODED_IMAGE_CACHE.get(resolvedUrl);
    if (cached && cached.complete && cached.naturalWidth > 0) {
      setLoadedImg(cached);
      setImgStatus('ready');
      return;
    }

    setImgStatus('loading');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      if (cancelled) return;
      cacheDecodedImage(resolvedUrl, img);
      setLoadedImg(img);
      setImgStatus('ready');
    };

    img.onerror = () => {
      if (cancelled) return;
      if (fallbackUrl && resolvedUrl !== fallbackUrl) {
        const fbCached = DECODED_IMAGE_CACHE.get(fallbackUrl);
        if (fbCached && fbCached.complete && fbCached.naturalWidth > 0) {
          setLoadedImg(fbCached);
          setImgStatus('ready');
          return;
        }
        const fb = new Image();
        fb.onload = () => {
          if (cancelled) return;
          cacheDecodedImage(fallbackUrl, fb);
          setLoadedImg(fb);
          setImgStatus('ready');
        };
        fb.onerror = () => {
          if (!cancelled) setImgStatus('error');
        };
        fb.src = fallbackUrl;
      } else {
        setImgStatus('error');
      }
    };

    img.src = resolvedUrl;
    return () => {
      cancelled = true;
    };
  }, [resolvedUrl, fallbackUrl]);

  // Compute exact fitted image rect in CSS pixels on the canvas stage
  const getImageLayout = useCallback(
    (stageW: number, stageH: number, img: HTMLImageElement) => {
      const iw = img.naturalWidth || 1;
      const ih = img.naturalHeight || 1;
      const fitScale = Math.min((stageW - 16) / iw, (stageH - 16) / ih);
      const drawW = iw * fitScale * zoom;
      const drawH = ih * fitScale * zoom;
      const drawX = (stageW - drawW) / 2 + pan.x;
      const drawY = (stageH - drawH) / 2 + pan.y;
      return { drawX, drawY, drawW, drawH, fitScale };
    },
    [zoom, pan]
  );

  // Convert pointer screen coords -> normalized image space (0..1)
  const screenToNormalized = useCallback(
    (clientX: number, clientY: number): CanvasPoint | null => {
      const canvas = canvasRef.current;
      if (!canvas || !loadedImg) return null;
      const rect = canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const { drawX, drawY, drawW, drawH } = getImageLayout(rect.width, rect.height, loadedImg);
      if (drawW <= 0 || drawH <= 0) return null;
      return {
        nx: Math.max(0, Math.min(1, (sx - drawX) / drawW)),
        ny: Math.max(0, Math.min(1, (sy - drawY) / drawH))
      };
    },
    [loadedImg, getImageLayout]
  );

  // Draw one annotation in canvas coordinates
  const drawSingleAnnotation = (
    ctx: CanvasRenderingContext2D,
    ann: CanvasAnnotation,
    drawX: number,
    drawY: number,
    drawW: number,
    drawH: number,
    imgW: number,
    imgH: number
  ) => {
    const pts = ann.points.map((p) => ({
      x: drawX + p.nx * drawW,
      y: drawY + p.ny * drawH
    }));
    if (pts.length === 0) return;

    ctx.save();
    ctx.strokeStyle = ann.color;
    ctx.fillStyle = ann.color;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (ann.tool === 'ruler' && pts.length >= 2) {
      const a = pts[0];
      const b = pts[pts.length - 1];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      // End ticks
      [a, b].forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      const dxPx = (ann.points[ann.points.length - 1].nx - ann.points[0].nx) * imgW;
      const dyPx = (ann.points[ann.points.length - 1].ny - ann.points[0].ny) * imgH;
      const distPx = Math.hypot(dxPx, dyPx);
      // Calibrated nominal radiographic scale (~0.28 mm/px)
      const mmEstimate = (distPx * 0.28).toFixed(1);
      const label = `${mmEstimate} mm (${Math.round(distPx)} px)`;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2 - 10;
      ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
      const w = ctx.measureText(label).width + 10;
      ctx.fillStyle = 'rgba(2, 6, 15, 0.85)';
      ctx.fillRect(mx - w / 2, my - 11, w, 17);
      ctx.fillStyle = ann.color;
      ctx.fillText(label, mx - w / 2 + 5, my + 1);
    } else if (ann.tool === 'arrow' && pts.length >= 2) {
      const a = pts[0];
      const b = pts[pts.length - 1];
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      const headLen = 13;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - headLen * Math.cos(angle - Math.PI / 6), b.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(b.x - headLen * Math.cos(angle + Math.PI / 6), b.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    } else if (ann.tool === 'ellipse' && pts.length >= 2) {
      const a = pts[0];
      const b = pts[pts.length - 1];
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const rx = Math.max(4, Math.abs(b.x - a.x) / 2);
      const ry = Math.max(4, Math.abs(b.y - a.y) / 2);
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `${ann.color}1F`;
      ctx.fill();
    } else if (ann.tool === 'freehand' && pts.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
    } else if (ann.tool === 'text' && ann.label) {
      const pt = pts[0];
      ctx.font = '600 12px system-ui, -apple-system, sans-serif';
      const w = ctx.measureText(ann.label).width + 14;
      ctx.fillStyle = 'rgba(2, 6, 15, 0.88)';
      ctx.fillRect(pt.x - 4, pt.y - 14, w, 22);
      ctx.strokeStyle = ann.color;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(pt.x - 4, pt.y - 14, w, 22);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillText(ann.label, pt.x + 3, pt.y + 1);
    }

    ctx.restore();
  };

  // Main Canvas Paint Pipeline (coalesced via requestAnimationFrame)
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const stageW = Math.max(240, Math.floor(rect.width));
    const stageH = Math.max(240, Math.floor(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (canvas.width !== stageW * dpr || canvas.height !== stageH * dpr) {
      canvas.width = stageW * dpr;
      canvas.height = stageH * dpr;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background obsidian bed
    ctx.fillStyle = '#02050B';
    ctx.fillRect(0, 0, stageW, stageH);

    // Optional calibration measurement grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < stageW; gx += 32) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, stageH);
        ctx.stroke();
      }
      for (let gy = 0; gy < stageH; gy += 32) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(stageW, gy);
        ctx.stroke();
      }
    }

    if (loadedImg && imgStatus === 'ready') {
      const { drawX, drawY, drawW, drawH } = getImageLayout(stageW, stageH, loadedImg);

      // Render clinical scan using native Canvas filter pipeline
      ctx.save();
      ctx.filter = [
        `contrast(${contrast}%)`,
        `brightness(${brightness}%)`,
        invert ? 'invert(92%) hue-rotate(180deg)' : ''
      ]
        .filter(Boolean)
        .join(' ');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(loadedImg, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Automated lesion ROI crosshair overlay
      if (roi && showRoi) {
        const rx = drawX + (roi.lx / 100) * drawW;
        const ry = drawY + (roi.ly / 100) * drawH;
        const rRad = ((roi.sizePct / 100) * Math.min(drawW, drawH)) / 2;
        ctx.save();
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(rx, ry, Math.max(12, rRad), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Render stored + live draft annotations
      const allAnns = draftAnnotation ? [...annotations, draftAnnotation] : annotations;
      for (const ann of allAnns) {
        drawSingleAnnotation(
          ctx,
          ann,
          drawX,
          drawY,
          drawW,
          drawH,
          loadedImg.naturalWidth,
          loadedImg.naturalHeight
        );
      }
    } else if (imgStatus === 'loading') {
      ctx.fillStyle = '#22D3EE';
      ctx.font = '600 12px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        isAr ? 'جاري تحميل المصفوفة على Canvas…' : 'Decoding clinical scan onto HTML5 Canvas…',
        stageW / 2,
        stageH / 2
      );
    } else {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title, stageW / 2, stageH / 2);
    }

    ctx.restore();
  }, [
    loadedImg,
    imgStatus,
    contrast,
    brightness,
    invert,
    roi,
    showRoi,
    showGrid,
    annotations,
    draftAnnotation,
    getImageLayout,
    isAr,
    title
  ]);

  // Schedule smooth redraw whenever visual params change
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(renderCanvas);
    return () => cancelAnimationFrame(rafRef.current);
  }, [renderCanvas]);

  // Safe debounced ResizeObserver (prevents ResizeObserver loop error!)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(renderCanvas);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [renderCanvas]);

  const clampZoom = (z: number) => Math.min(8, Math.max(0.75, Number(z.toFixed(2))));

  const clampPan = (x: number, y: number, z: number) => {
    if (z <= 1.01) return { x: 0, y: 0 };
    const rect = containerRef.current?.getBoundingClientRect();
    const maxX = rect ? (rect.width * (z - 1)) / 2 + 160 : 800;
    const maxY = rect ? (rect.height * (z - 1)) / 2 + 160 : 800;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setContrast(105);
    setBrightness(100);
    setInvert(false);
  };

  // Cursor-anchored wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.18 : 0.84;
    const rect = containerRef.current?.getBoundingClientRect();
    const nextZoom = clampZoom(zoom * factor);
    if (rect) {
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      const scaleRatio = nextZoom / zoom;
      const nx = cx - (cx - pan.x) * scaleRatio;
      const ny = cy - (cy - pan.y) * scaleRatio;
      setPan(clampPan(nx, ny, nextZoom));
    }
    setZoom(nextZoom);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Multi-touch pinch zoom on Android / touchscreens
    if (pointersRef.current.size === 2) {
      drawingActiveRef.current = false;
      setDraftAnnotation(null);
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      pinchRef.current = {
        dist: Math.max(1, dist),
        zoom,
        midX: (pts[0].x + pts[1].x) / 2,
        midY: (pts[0].y + pts[1].y) / 2
      };
      return;
    }

    if (tool === 'pan') {
      const now = Date.now();
      const dt = now - lastTapRef.current.time;
      const dx = Math.abs(e.clientX - lastTapRef.current.x);
      const dy = Math.abs(e.clientY - lastTapRef.current.y);
      if (dt < 260 && dx < 24 && dy < 24) {
        if (zoom > 1.2) {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        } else {
          setZoom(2.5);
        }
        lastTapRef.current = { time: 0, x: 0, y: 0 };
      } else {
        lastTapRef.current = { time: now, x: e.clientX, y: e.clientY };
      }
      return;
    }

    const norm = screenToNormalized(e.clientX, e.clientY);
    if (!norm) return;

    if (tool === 'text') {
      setPendingTextPoint(norm);
      setTextDraft('');
      return;
    }

    drawingActiveRef.current = true;
    setDraftAnnotation({
      id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      tool,
      color: activeColor,
      points: [norm, norm]
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const norm = screenToNormalized(e.clientX, e.clientY);
    if (norm && loadedImg) {
      setCursorCoords({
        x: Math.round(norm.nx * loadedImg.naturalWidth),
        y: Math.round(norm.ny * loadedImg.naturalHeight)
      });
    }

    const prev = pointersRef.current.get(e.pointerId);
    if (!prev) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Pinch handling
    if (pointersRef.current.size === 2 && pinchRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const nextZoom = clampZoom(pinchRef.current.zoom * (dist / pinchRef.current.dist));
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const dMidX = midX - pinchRef.current.midX;
      const dMidY = midY - pinchRef.current.midY;
      pinchRef.current.midX = midX;
      pinchRef.current.midY = midY;
      setZoom(nextZoom);
      setPan((p) => clampPan(p.x + dMidX, p.y + dMidY, nextZoom));
      return;
    }

    if (tool === 'pan' && pointersRef.current.size === 1) {
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      setPan((p) => clampPan(p.x + dx, p.y + dy, zoom));
      return;
    }

    if (drawingActiveRef.current && norm) {
      setDraftAnnotation((curr) => {
        if (!curr) return null;
        if (curr.tool === 'freehand') {
          return { ...curr, points: [...curr.points, norm] };
        }
        return { ...curr, points: [curr.points[0], norm] };
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
    if (drawingActiveRef.current && draftAnnotation) {
      const pts = draftAnnotation.points;
      const first = pts[0];
      const last = pts[pts.length - 1];
      const moved = Math.hypot(last.nx - first.nx, last.ny - first.ny);
      if (moved > 0.01 || draftAnnotation.tool === 'freehand') {
        setAnnotations((prev) => [...prev, draftAnnotation]);
      }
      setDraftAnnotation(null);
      drawingActiveRef.current = false;
    }
  };

  const handleSubmitTextPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingTextPoint || !textDraft.trim()) {
      setPendingTextPoint(null);
      return;
    }
    setAnnotations((prev) => [
      ...prev,
      {
        id: `ann_txt_${Date.now()}`,
        tool: 'text',
        color: activeColor,
        points: [pendingTextPoint],
        label: textDraft.trim().slice(0, 60)
      }
    ]);
    setPendingTextPoint(null);
    setTextDraft('');
  };

  // High-resolution native Canvas PNG export with baked annotations
  const handleExportAnnotatedPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `${studyId}_annotated_canvas.png`;
    link.click();
  };

  return (
    <div
      className={`flex flex-col bg-[#030711] border border-white/15 overflow-hidden ${
        fullscreen ? 'fixed inset-0 z-50 rounded-none' : 'rounded-2xl'
      }`}
    >
      {/* Top Annotation & Zoom Toolbar (44px+ touch buttons) */}
      <div className="px-3 py-2 bg-[#070E1C] border-b border-white/10 flex flex-wrap items-center justify-between gap-1.5">
        {/* Drawing / Nav Tools */}
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              { id: 'pan', icon: Hand, labelEn: 'Pan', labelAr: 'تحريك' },
              { id: 'ruler', icon: Ruler, labelEn: 'Ruler', labelAr: 'مسطرة' },
              { id: 'arrow', icon: ArrowUpRight, labelEn: 'Arrow', labelAr: 'سهم' },
              { id: 'ellipse', icon: Circle, labelEn: 'ROI Circle', labelAr: 'دائرة' },
              { id: 'freehand', icon: Pencil, labelEn: 'Draw', labelAr: 'رسم' },
              { id: 'text', icon: Type, labelEn: 'Label', labelAr: 'نص' }
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = tool === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTool(item.id)}
                title={isAr ? item.labelAr : item.labelEn}
                className={`min-h-[40px] px-2.5 rounded-lg text-[11px] font-semibold border inline-flex items-center gap-1 transition-colors ${
                  active
                    ? 'bg-[#1D6FEB] border-[#22D3EE] text-white'
                    : 'bg-black/30 border-white/10 text-[#94A3B8] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{isAr ? item.labelAr : item.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Color Swatches + Undo/Clear/Fullscreen */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-black/30 border border-white/10">
            {ANNOTATION_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-label={`Select ${c.label} annotation color`}
                onClick={() => setActiveColor(c.hex)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  activeColor === c.hex ? 'border-white scale-110' : 'border-transparent opacity-70'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={annotations.length === 0}
            onClick={() => setAnnotations((prev) => prev.slice(0, -1))}
            aria-label="Undo last annotation"
            className="min-h-[40px] min-w-[40px] px-2 rounded-lg border border-white/10 bg-black/30 text-[#CBD5E1] disabled:opacity-35 inline-flex items-center justify-center"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={annotations.length === 0}
            onClick={() => setAnnotations([])}
            aria-label="Clear annotations"
            className="min-h-[40px] min-w-[40px] px-2 rounded-lg border border-white/10 bg-black/30 text-rose-300 disabled:opacity-35 inline-flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {onToggleFullscreen && (
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="btn-3d-primary min-h-[40px] px-3 rounded-lg text-xs font-semibold text-white inline-flex items-center gap-1.5"
            >
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span>{fullscreen ? (isAr ? 'إغلاق' : 'Exit') : isAr ? 'تكبير كامل' : 'Full Canvas'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Non-Blocking Text Pin Input (if active) */}
      {pendingTextPoint && (
        <form
          onSubmit={handleSubmitTextPin}
          className="px-3 py-2 bg-[#0A1529] border-b border-[#22D3EE]/40 flex items-center gap-2"
        >
          <input
            type="text"
            autoFocus
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
            placeholder={isAr ? 'اكتب الملاحظة التشخيصية هنا…' : 'Type diagnostic annotation label…'}
            className="flex-1 min-h-[38px] rounded-lg bg-black/40 border border-white/15 px-3 text-xs text-white"
          />
          <button type="submit" className="btn-3d-primary min-h-[38px] px-3 rounded-lg text-xs font-semibold text-white">
            {isAr ? 'تثبيت' : 'Pin'}
          </button>
          <button
            type="button"
            onClick={() => setPendingTextPoint(null)}
            className="min-h-[38px] px-2.5 rounded-lg bg-white/10 text-xs text-[#CBD5E1]"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </form>
      )}

      {/* Hardware-Accelerated HTML5 Canvas Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className={`relative w-full touch-none select-none overflow-hidden bg-[#02050B] ${
          fullscreen ? 'flex-1' : 'aspect-[4/3] sm:aspect-square'
        } ${tool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Subtle Non-Obstructive DICOM Telemetry HUD */}
        <div className="pointer-events-none absolute top-2.5 start-3 text-[10px] font-mono-tabular text-[#22D3EE] leading-tight drop-shadow">
          <div className="font-bold">{studyId} · CANVAS 2D</div>
          {icd10 && <div className="text-[#CBD5E1]">ICD-10: {icd10}</div>}
          {fullscreen && <div className="text-white text-xs mt-0.5">{title}</div>}
          {fullscreen && subtitle && <div className="text-[#94A3B8]">{subtitle}</div>}
        </div>

        <div className="pointer-events-none absolute top-2.5 end-3 text-[10px] font-mono-tabular text-[#E2E8F0] text-end leading-tight drop-shadow">
          <div>{modality}</div>
          {loadedImg && (
            <div className="text-[#22D3EE]">
              {loadedImg.naturalWidth} × {loadedImg.naturalHeight} px
            </div>
          )}
          {sliceThickness && <div className="text-[#94A3B8]">{sliceThickness}</div>}
        </div>

        <div className="pointer-events-none absolute bottom-2.5 start-3 flex items-center gap-3 text-[10px] font-mono-tabular text-[#CBD5E1]">
          {windowPreset && <span>{windowPreset}</span>}
          {cursorCoords && (
            <span>
              XY ({cursorCoords.x}, {cursorCoords.y})
            </span>
          )}
          <span>{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Bottom Zoom, Windowing & PNG Export Dock */}
      <div className="px-3 py-2.5 bg-[#070E1C] border-t border-white/10 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => {
              const nz = clampZoom(zoom - 0.35);
              setZoom(nz);
              setPan((p) => clampPan(p.x, p.y, nz));
            }}
            className="btn-3d-secondary min-h-[40px] min-w-[40px] px-2.5 rounded-lg inline-flex items-center justify-center"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono-tabular text-xs font-bold text-[#22D3EE] w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => {
              const nz = clampZoom(zoom + 0.35);
              setZoom(nz);
              setPan((p) => clampPan(p.x, p.y, nz));
            }}
            className="btn-3d-secondary min-h-[40px] min-w-[40px] px-2.5 rounded-lg inline-flex items-center justify-center"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setInvert((v) => !v)}
            className={`min-h-[40px] px-2.5 rounded-lg text-xs border inline-flex items-center gap-1 ${
              invert ? 'border-[#22D3EE] bg-white/10 text-white' : 'border-white/10 text-[#94A3B8]'
            }`}
          >
            <SunMoon className="w-3.5 h-3.5" />
            <span>{isAr ? 'عكس' : 'Invert'}</span>
          </button>

          {roi && (
            <button
              type="button"
              onClick={() => setShowRoi((r) => !r)}
              className={`min-h-[40px] px-2.5 rounded-lg text-xs border inline-flex items-center gap-1 ${
                showRoi ? 'border-[#22D3EE] bg-white/10 text-white' : 'border-white/10 text-[#94A3B8]'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>ROI</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowGrid((g) => !g)}
            className={`min-h-[40px] px-2.5 rounded-lg text-xs border ${
              showGrid ? 'border-[#22D3EE] bg-white/10 text-white' : 'border-white/10 text-[#94A3B8]'
            }`}
          >
            {isAr ? 'شبكة' : 'Grid'}
          </button>

          <button
            type="button"
            onClick={resetView}
            className="btn-3d-secondary min-h-[40px] px-2.5 rounded-lg text-xs inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>1×</span>
          </button>

          <button
            type="button"
            onClick={handleExportAnnotatedPng}
            className="btn-3d-secondary min-h-[40px] px-3 rounded-lg text-xs inline-flex items-center gap-1.5 ms-auto"
          >
            <Download className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>{isAr ? 'حفظ PNG مع التحديد' : 'Export PNG'}</span>
          </button>
        </div>

        {/* Contrast & Brightness Sliders */}
        <div className="grid sm:grid-cols-2 gap-2.5 text-[11px] font-mono-tabular text-[#94A3B8]">
          <label className="flex items-center gap-2">
            <span className="shrink-0 w-16">{isAr ? 'التباين:' : 'Contrast:'}</span>
            <input
              type="range"
              min={60}
              max={220}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="flex-1 min-h-[30px] accent-[#22D3EE]"
            />
            <span className="w-10 text-end text-[#F4F7FB]">{contrast}%</span>
          </label>
          <label className="flex items-center gap-2">
            <span className="shrink-0 w-16">{isAr ? 'السطوع:' : 'Bright:'}</span>
            <input
              type="range"
              min={60}
              max={180}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="flex-1 min-h-[30px] accent-[#22D3EE]"
            />
            <span className="w-10 text-end text-[#F4F7FB]">{brightness}%</span>
          </label>
        </div>
      </div>
    </div>
  );
}
