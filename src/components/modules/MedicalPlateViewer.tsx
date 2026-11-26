import React, { useEffect, useState } from 'react';
import { Maximize2, Scan } from 'lucide-react';
import type { MedicalImage20kEntry } from '../../data/medicalImages20k';
import { getProxiedMedicalImageUrl } from '../../lib/apiClient';
import sampleChestImg from '../../assets/images/sample_chest_radiograph_1795639844971.jpg';
import sampleBrainImg from '../../assets/images/sample_brain_mri_1795639844636.jpg';
import sampleEchoImg from '../../assets/images/sample_cardiac_echo_1795639845130.jpg';

interface MedicalPlateViewerProps {
  item: MedicalImage20kEntry;
  compact?: boolean;
  zoom?: number;
  contrast?: number;
  invert?: boolean;
  showAnnotations?: boolean;
  overrideSrc?: string | null;
  imgRef?: React.RefObject<HTMLImageElement | null>;
  onOpenHighRes?: () => void;
  highResLabel?: string;
}

export function getLocalMedicalFallbackAsset(item: MedicalImage20kEntry): string {
  if (item.archetype === 'mri-brain' || item.archetype === 'mri-spine') {
    return sampleBrainImg;
  }
  if (item.archetype === 'ultrasound' || item.archetype === 'echo-doppler') {
    return sampleEchoImg;
  }
  return sampleChestImg;
}

export function MedicalPlateViewer({
  item,
  compact = false,
  zoom = 1,
  contrast = 105,
  invert = false,
  showAnnotations = true,
  overrideSrc = null,
  imgRef,
  onOpenHighRes,
  highResLabel = 'HD Zoom'
}: MedicalPlateViewerProps) {
  const { cx, cy, lr, variantSeed, modality, id, icd10 } = item;

  const targetSrc = overrideSrc
    ? getProxiedMedicalImageUrl(overrideSrc)
    : getProxiedMedicalImageUrl(compact ? item.realThumbUrl : item.realImageUrl);

  const [imgSrc, setImgSrc] = useState<string>(targetSrc);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setImgSrc(targetSrc);
    setLoaded(false);
    setFailed(false);
    setPan({ x: 0, y: 0 });
  }, [targetSrc]);

  useEffect(() => {
    if (zoom <= 1.01) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoom]);

  const jitterX = ((variantSeed % 7) - 3) * 0.45;
  const jitterY = (((variantSeed >>> 4) % 7) - 3) * 0.45;
  const lx = Math.max(14, Math.min(86, cx + jitterX));
  const ly = Math.max(14, Math.min(86, cy + jitterY));

  const filterCss = [
    `contrast(${contrast}%)`,
    invert ? 'invert(92%) hue-rotate(180deg)' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      onPointerDown={(e) => {
        if (compact || zoom <= 1.01) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragOrigin({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }}
      onPointerMove={(e) => {
        if (!dragOrigin || zoom <= 1.01) return;
        const limit = 180 * (zoom - 1);
        const nx = Math.max(-limit, Math.min(limit, e.clientX - dragOrigin.x));
        const ny = Math.max(-limit, Math.min(limit, e.clientY - dragOrigin.y));
        setPan({ x: nx, y: ny });
      }}
      onPointerUp={() => setDragOrigin(null)}
      onPointerCancel={() => setDragOrigin(null)}
      className={`relative w-full h-full bg-[#030712] overflow-hidden select-none flex items-center justify-center ${
        !compact && zoom > 1.01 ? 'touch-none cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      {!failed ? (
        <img
          ref={imgRef}
          src={imgSrc}
          alt={item.realImageTitle || item.titleEn}
          draggable={false}
          referrerPolicy="no-referrer"
          loading={compact ? 'lazy' : 'eager'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            const fallbackUrl = getLocalMedicalFallbackAsset(item);
            if (imgSrc !== fallbackUrl) {
              setImgSrc(fallbackUrl);
            } else {
              setFailed(true);
            }
          }}
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            filter: filterCss
          }}
          className={`w-full h-full transition-opacity duration-200 ${
            compact ? 'object-cover' : 'object-contain'
          } ${loaded ? 'opacity-100' : 'opacity-40'}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center bg-gradient-to-br from-[#071122] to-[#030712]">
          <Scan className="w-6 h-6 text-[#22D3EE]" />
          <span className="text-[11px] font-medium text-[#CBD5E1] line-clamp-2">
            {item.findingTitleEn}
          </span>
        </div>
      )}

      {/* Subtle Clinical ROI Crosshair Overlay on Full PACS Inspector */}
      {!compact && showAnnotations && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute border border-dashed border-[#22D3EE]/75 rounded-full"
          style={{
            left: `${lx}%`,
            top: `${ly}%`,
            width: `${Math.max(14, lr * 1.9)}%`,
            height: `${Math.max(14, lr * 1.9)}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}

      {/* Measured contrast scrims for legibility over real scans */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/75 via-black/35 to-transparent"
      />
      {!compact && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
        />
      )}

      {/* Subtle DICOM Corner Metadata */}
      <div className="pointer-events-none absolute top-2 start-2.5 text-[10px] font-mono-tabular text-[#22D3EE] leading-tight">
        <div>{id}</div>
        {!compact && <div className="text-[#CBD5E1]">ICD-10: {icd10}</div>}
      </div>
      <div className="pointer-events-none absolute top-2 end-2.5 text-[10px] font-mono-tabular text-[#E2E8F0] text-end leading-tight">
        <div>{modality}</div>
        {!compact && <div className="text-[#CBD5E1]">{item.sliceThickness}</div>}
      </div>

      {!compact && onOpenHighRes && (
        <button
          type="button"
          onClick={onOpenHighRes}
          aria-label="Open full-screen ultra-high-resolution zoom and pan viewer"
          className="absolute bottom-2.5 end-2.5 z-10 min-h-[44px] px-3 py-2 rounded-xl bg-black/75 hover:bg-black/90 border border-[#22D3EE]/50 text-xs font-semibold text-[#F4F7FB] inline-flex items-center gap-1.5 backdrop-blur-sm"
        >
          <Maximize2 className="w-4 h-4 text-[#22D3EE]" />
          <span>{highResLabel}</span>
        </button>
      )}

      {!compact && (
        <div className="pointer-events-none absolute bottom-3 start-2.5 flex items-center gap-3 text-[10px] font-mono-tabular text-[#CBD5E1]">
          <span>{item.windowPreset}</span>
          <span>ROI ({Math.round(lx)}, {Math.round(ly)})</span>
        </div>
      )}
    </div>
  );
}
