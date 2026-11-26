import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ExternalLink,
  Film,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  Search
} from 'lucide-react';
import {
  ECHO_PROBE_CLOCK_POSITIONS,
  ECHO_REAL_VIDEO_MAP,
  type EchoSceneId
} from '../../data/echoCurriculum';
import {
  getProxiedMedicalImageUrl,
  getProxiedMedicalVideoUrl,
  searchRealEchoVideosClient,
  type RealMedicalVideoResult
} from '../../lib/apiClient';
import type { Language } from '../../lib/i18n';

interface RealEchoVideoPlayerProps {
  scene: EchoSceneId;
  language: Language;
  playing?: boolean;
  onTogglePlaying?: () => void;
  playbackSpeed?: number;
  depthCm?: number;
  gainPct?: number;
  nyquistCms?: number;
  sectorWidthPct?: number;
  posterUrl?: string;
  activeChapterTitle?: string;
  defaultSearchQuery?: string;
}

export function RealEchoVideoPlayer({
  scene,
  language,
  playing = true,
  onTogglePlaying,
  playbackSpeed = 1,
  depthCm = 16,
  gainPct = 62,
  nyquistCms = 60,
  sectorWidthPct = 85,
  posterUrl,
  activeChapterTitle,
  defaultSearchQuery
}: RealEchoVideoPlayerProps) {
  const isAr = language === 'ar';
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const curatedClips = useMemo(() => ECHO_REAL_VIDEO_MAP[scene] || ECHO_REAL_VIDEO_MAP.PLAX, [scene]);
  const [selectedClipIdx, setSelectedClipIdx] = useState(0);
  const [liveResults, setLiveResults] = useState<RealMedicalVideoResult[]>([]);
  const [activeLiveClip, setActiveLiveClip] = useState<RealMedicalVideoResult | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Reset active clip selection when anatomical scene changes
  useEffect(() => {
    setSelectedClipIdx(0);
    setActiveLiveClip(null);
    setVideoError(false);
    setVideoLoading(true);
    setSearchInput(defaultSearchQuery || curatedClips[0]?.searchQuery || 'echocardiogram');
  }, [scene, defaultSearchQuery, curatedClips]);

  const currentCurated = curatedClips[selectedClipIdx] || curatedClips[0];
  const activeVideoSrc = activeLiveClip
    ? getProxiedMedicalVideoUrl(activeLiveClip.videoUrl)
    : getProxiedMedicalVideoUrl(currentCurated.videoUrl);
  const activePosterSrc = activeLiveClip?.posterUrl
    ? getProxiedMedicalImageUrl(activeLiveClip.posterUrl)
    : posterUrl
      ? getProxiedMedicalImageUrl(posterUrl)
      : undefined;

  const activeTitle = activeLiveClip
    ? activeLiveClip.title
    : isAr
      ? currentCurated.titleAr
      : currentCurated.titleEn;

  const activeSourceLabel = activeLiveClip ? activeLiveClip.source : currentCurated.sourceLabel;
  const activeSourcePage = activeLiveClip ? activeLiveClip.sourceUrl : currentCurated.sourcePageUrl;

  // Keep HTML5 <video> play/pause + speed synchronized with session controls
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.playbackRate = Math.max(0.5, Math.min(2, playbackSpeed));
  }, [playbackSpeed, activeVideoSrc]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (playing) {
      const p = vid.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Browsers may defer autoplay until interaction; native video controls remain usable
        });
      }
    } else {
      vid.pause();
    }
  }, [playing, activeVideoSrc]);

  const handleSearchLiveVideos = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = (searchInput || currentCurated.searchQuery || 'echocardiogram').trim();
    if (q.length < 2) return;
    setSearching(true);
    try {
      const items = await searchRealEchoVideosClient(q, 8);
      setLiveResults(items);
    } catch {
      // ignore transient network errors
    } finally {
      setSearching(false);
    }
  };

  const probeInfo = ECHO_PROBE_CLOCK_POSITIONS[scene];

  // Real-time ultrasound optics applied onto genuine clinical video stream
  const brightnessVal = 0.55 + (gainPct / 100) * 0.78;
  const contrastVal = 92 + (gainPct - 50) * 0.65;
  const depthScale = Math.max(0.8, Math.min(1.22, 16 / depthCm));
  const sectorMaskPct = Math.max(55, Math.min(100, sectorWidthPct));

  return (
    <div className="rounded-2xl overflow-hidden bg-[#030711] border border-white/15 space-y-0">
      {/* Top Ultrasound Acquisition Bar */}
      <div className="px-3.5 py-2.5 bg-[#060D1C] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tabular text-[#94A3B8]">
        <div className="flex items-center gap-2.5 min-w-0">
          <Film className="w-4 h-4 text-[#22D3EE] shrink-0" />
          <span className="text-[#22D3EE] font-bold truncate">
            {isAr ? `فيديو إيكو سريري حقيقي · ${scene}` : `REAL CLINICAL ECHO CINE · ${scene}`}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span>{depthCm} cm</span>
          <span>Gn {gainPct}%</span>
          <span>Nyq ±{nyquistCms} cm/s</span>
          <span>Sec {sectorWidthPct}%</span>
        </div>
      </div>

      {/* Main Layout: Real Ultrasound Video Stage + Probe Marker Orientation Diagram */}
      <div className="flex flex-col md:flex-row items-stretch bg-black">
        <div className="flex-1 relative min-h-[260px] sm:min-h-[320px] flex items-center justify-center overflow-hidden bg-black">
          {/* Real Peer-Reviewed Echocardiogram <video> Stream */}
          <div
            className="w-full h-full flex items-center justify-center transition-all duration-200 overflow-hidden"
            style={{
              maxWidth: `${sectorMaskPct}%`,
              filter: `brightness(${brightnessVal}) contrast(${contrastVal}%)`,
              transform: `scale(${depthScale})`
            }}
          >
            <video
              ref={videoRef}
              key={activeVideoSrc}
              src={activeVideoSrc}
              poster={activePosterSrc}
              controls
              playsInline
              loop
              preload="metadata"
              onLoadStart={() => {
                setVideoLoading(true);
                setVideoError(false);
              }}
              onCanPlay={() => setVideoLoading(false)}
              onError={() => {
                setVideoLoading(false);
                setVideoError(true);
              }}
              aria-label={activeTitle}
              className="w-full max-h-[340px] object-contain bg-black"
            />
          </div>

          {videoLoading && !videoError && (
            <div className="pointer-events-none absolute top-3 start-3 px-2.5 py-1.5 rounded-lg bg-black/80 border border-white/15 text-[11px] font-mono-tabular text-[#22D3EE] inline-flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{isAr ? 'جاري تحميل مقطع الإيكو الحقيقي…' : 'Streaming real clinical cine…'}</span>
            </div>
          )}

          {videoError && (
            <div className="absolute inset-0 bg-[#050A14]/95 flex flex-col items-center justify-center p-5 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <p className="text-xs text-[#CBD5E1] max-w-md">
                {isAr
                  ? 'تعذر تحميل بث هذا المقطع من الأرشيف الطبي حالياً. يمكنك إعادة المحاولة أو البحث عن مقاطع سريرية بديلة.'
                  : 'Upstream medical video stream temporarily busy. Retry loading or pick another clinical cine from the archive.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVideoError(false);
                    setVideoLoading(true);
                    videoRef.current?.load();
                  }}
                  className="btn-3d-primary min-h-[44px] px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إعادة التحميل' : 'Retry Stream'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSearchLiveVideos()}
                  className="btn-3d-secondary min-h-[44px] px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>{isAr ? 'جلب مقاطع بديلة' : 'Fetch Archive Clips'}</span>
                </button>
              </div>
            </div>
          )}

          {activeChapterTitle && (
            <div className="pointer-events-none absolute top-3 end-3 max-w-[75%] px-2.5 py-1 rounded-lg bg-black/80 border border-white/15 text-[11px] font-medium text-white truncate">
              {activeChapterTitle}
            </div>
          )}
        </div>

        {/* Side Panel: Anatomical Probe Marker Orientation Reference (Strict Transducer Positioning Diagram Only) */}
        <aside className="w-full md:w-52 bg-[#070E1C] border-t md:border-t-0 md:border-s border-white/10 p-3.5 flex md:flex-col items-center justify-between gap-3">
          <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#94A3B8] text-center">
            {isAr ? 'بوصلة توجيه المجس' : 'Probe Marker Clock'}
          </div>

          <svg viewBox="0 0 100 100" className="w-20 h-20 shrink-0" aria-hidden="true">
            <circle cx="50" cy="50" r="42" fill="#040914" stroke="#334155" strokeWidth="2" />
            <text x="50" y="16" textAnchor="middle" fill="#64748B" fontSize="8" fontFamily="monospace">
              12
            </text>
            <text x="86" y="53" textAnchor="middle" fill="#64748B" fontSize="8" fontFamily="monospace">
              3
            </text>
            <text x="50" y="92" textAnchor="middle" fill="#64748B" fontSize="8" fontFamily="monospace">
              6
            </text>
            <text x="14" y="53" textAnchor="middle" fill="#64748B" fontSize="8" fontFamily="monospace">
              9
            </text>
            <g transform={`rotate(${probeInfo.deg} 50 50)`}>
              <line x1="50" y1="50" x2="50" y2="18" stroke="#22D3EE" strokeWidth="3.2" strokeLinecap="round" />
              <circle cx="50" cy="18" r="4.5" fill="#22D3EE" />
            </g>
            <circle cx="50" cy="50" r="3.5" fill="#F4F7FB" />
          </svg>

          <div className="text-center space-y-1">
            <div className="font-mono-tabular text-xs font-bold text-[#22D3EE]">{probeInfo.clock}</div>
            <div className="text-[11px] text-[#CBD5E1] leading-snug">
              {isAr ? probeInfo.siteAr : probeInfo.siteEn}
            </div>
            {onTogglePlaying && (
              <button
                type="button"
                onClick={onTogglePlaying}
                className="mt-2 min-h-[40px] w-full px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] font-semibold text-white inline-flex items-center justify-center gap-1.5"
              >
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{playing ? (isAr ? 'إيقاف' : 'Pause') : isAr ? 'تشغيل' : 'Play'}</span>
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Caption & Curated Multi-Clip Switcher + Live Clinical Archive Video Search */}
      <div className="p-3.5 bg-[#060D1C] border-t border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="min-w-0">
            <div className="font-semibold text-[#F4F7FB] truncate">{activeTitle}</div>
            <div className="text-[11px] text-[#94A3B8]">{activeSourceLabel}</div>
          </div>
          {activeSourcePage && (
            <a
              href={activeSourcePage}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[36px] px-2.5 rounded-lg border border-white/15 text-[11px] text-[#22D3EE] hover:bg-white/5 inline-flex items-center gap-1 shrink-0"
            >
              <span>{isAr ? 'المصدر العلمي' : 'Source'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Curated Clips Selector */}
        {curatedClips.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {curatedClips.map((clip, idx) => {
              const isSelected = !activeLiveClip && idx === selectedClipIdx;
              return (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => {
                    setActiveLiveClip(null);
                    setSelectedClipIdx(idx);
                    setVideoError(false);
                    setVideoLoading(true);
                  }}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-[11px] font-medium border text-start transition-colors ${
                    isSelected
                      ? 'bg-[#1D6FEB]/25 border-[#22D3EE] text-white'
                      : 'bg-black/40 border-white/10 text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {isAr ? clip.titleAr : clip.titleEn}
                </button>
              );
            })}
          </div>
        )}

        {/* Live Clinical Archive Video Search */}
        <form onSubmit={handleSearchLiveVideos} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={
              isAr
                ? 'ابحث عن فيديوهات إيكو سريرية حقيقية (مثال: tamponade, mitral regurgitation)...'
                : 'Search live clinical echo videos (e.g. mitral regurgitation, tamponade)...'
            }
            className="flex-1 min-h-[44px] px-3 rounded-xl bg-black/60 border border-white/15 text-xs text-[#F4F7FB] placeholder:text-[#64748B] focus:outline-none focus:border-[#22D3EE]"
          />
          <button
            type="submit"
            disabled={searching}
            className="btn-3d-secondary min-h-[44px] px-4 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 shrink-0"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin text-[#22D3EE]" /> : <Search className="w-4 h-4 text-[#22D3EE]" />}
            <span>{isAr ? 'جلب فيديوهات إيكو حقيقية' : 'Search Live Echo Videos'}</span>
          </button>
        </form>

        {liveResults.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-mono-tabular text-[#22D3EE]">
              {isAr
                ? `مقاطع فيديو سريرية مجلوبة من الأرشيف (${liveResults.length}):`
                : `Live Peer-Reviewed Clinical Cine Clips (${liveResults.length}):`}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pe-1">
              {liveResults.map((item) => {
                const selected = activeLiveClip?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveLiveClip(item);
                      setVideoError(false);
                      setVideoLoading(true);
                    }}
                    className={`min-h-[44px] p-2.5 rounded-xl border text-start transition-colors flex items-center gap-2.5 ${
                      selected
                        ? 'bg-[#1D6FEB]/25 border-[#22D3EE] text-white'
                        : 'bg-black/50 border-white/10 text-[#CBD5E1] hover:border-white/30'
                    }`}
                  >
                    <Film className="w-4 h-4 text-[#22D3EE] shrink-0" />
                    <span className="text-[11px] line-clamp-2 leading-snug">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
