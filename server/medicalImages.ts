import type { Response } from 'express';

export interface RealMedicalImageResult {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  thumbUrl: string;
  sourceUrl: string;
  author: string;
  license: string;
  source: 'Wikimedia Commons Medical Archive';
}

const ALLOWED_IMAGE_HOSTS = new Set([
  'upload.wikimedia.org',
  'thumb.wikimedia.org',
  'europepmc.org',
  'www.ncbi.nlm.nih.gov',
  'cdn.ncbi.nlm.nih.gov'
]);

const WIKI_USER_AGENT = 'MamoMedAI/1.0 (https://mamomed.ai; contact@mamomed.ai)';

const SEARCH_CACHE = new Map<
  string,
  { expiresAt: number; items: RealMedicalImageResult[] }
>();

const IMAGE_BYTES_CACHE = new Map<
  string,
  { contentType: string; buffer: Buffer; expiresAt: number }
>();

function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function isAllowedMedicalImageUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return null;
    if (parsed.username || parsed.password) return null;
    if (parsed.port && parsed.port !== '443') return null;
    const host = parsed.hostname.toLowerCase();
    if (!ALLOWED_IMAGE_HOSTS.has(host)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildProxiedImageUrl(upstreamUrl: string): string {
  return `/api/medical-images/proxy?url=${encodeURIComponent(upstreamUrl)}`;
}

export async function searchRealMedicalImages(
  rawQuery: string,
  limit = 16
): Promise<RealMedicalImageResult[]> {
  const cleanQuery = rawQuery.trim().slice(0, 140);
  if (cleanQuery.length < 2) return [];

  const safeLimit = Math.max(4, Math.min(limit, 30));
  const cacheKey = `${cleanQuery.toLowerCase()}::${safeLimit}`;
  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.items;
  }

  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
      cleanQuery
    )}&gsrlimit=${safeLimit + 8}&prop=imageinfo&iiprop=url|mime|size|extmetadata&iiurlwidth=640&format=json`;

    const res = await fetch(searchUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': WIKI_USER_AGENT
      },
      signal: AbortSignal.timeout(7500)
    });

    if (!res.ok) {
      return [];
    }

    const payload = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          {
            pageid?: number;
            title?: string;
            imageinfo?: Array<{
              url?: string;
              thumburl?: string;
              mime?: string;
              width?: number;
              height?: number;
              descriptionurl?: string;
              extmetadata?: {
                ImageDescription?: { value?: string };
                Artist?: { value?: string };
                LicenseShortName?: { value?: string };
              };
            }>;
          }
        >;
      };
    };

    const pages = Object.values(payload.query?.pages || {});
    const results: RealMedicalImageResult[] = [];
    const seenUrls = new Set<string>();

    for (const p of pages) {
      const info = p.imageinfo?.[0];
      if (!info) continue;
      if (info.mime !== 'image/jpeg' && info.mime !== 'image/png' && info.mime !== 'image/webp') {
        continue;
      }

      const rawTitle = (p.title || '').replace(/^File:/i, '').replace(/\.[^.]+$/, '');
      const lowerTitle = rawTitle.toLowerCase();
      if (
        /blausen|diagram|scheme|chart|graph|logo|icon|map|book|page|report_of|1910|1911|1912|1920|cover|portrait|illustration|drawing|vector|equipment|machine|apparatus|hospital|doctor|surgeon|stethoscope/.test(
          lowerTitle
        )
      ) {
        continue;
      }

      if ((info.width || 0) < 240 || (info.height || 0) < 180) {
        continue;
      }

      const upstreamThumb = (info.thumburl || info.url || '').split('?')[0];
      const upstreamFull = (info.url || info.thumburl || '').split('?')[0];
      if (!upstreamThumb || seenUrls.has(upstreamThumb)) continue;
      if (!isAllowedMedicalImageUrl(upstreamThumb) || !isAllowedMedicalImageUrl(upstreamFull)) {
        continue;
      }

      seenUrls.add(upstreamThumb);

      const meta = info.extmetadata;
      const caption = stripHtml(meta?.ImageDescription?.value || rawTitle.replace(/_/g, ' ')).slice(0, 320);
      const author = stripHtml(meta?.Artist?.value || 'Wikimedia Commons Contributor').slice(0, 120);
      const license = stripHtml(meta?.LicenseShortName?.value || 'Open Medical License').slice(0, 80);

      results.push({
        id: `WMC-${p.pageid || results.length + 1}`,
        title: rawTitle.replace(/_/g, ' '),
        caption: caption || rawTitle.replace(/_/g, ' '),
        thumbUrl: buildProxiedImageUrl(upstreamThumb),
        imageUrl: buildProxiedImageUrl(upstreamFull),
        sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title || '')}`,
        author: author || 'Medical Imaging Archive',
        license,
        source: 'Wikimedia Commons Medical Archive'
      });

      if (results.length >= safeLimit) break;
    }

    if (SEARCH_CACHE.size > 200) {
      const oldestKey = SEARCH_CACHE.keys().next().value;
      if (oldestKey) SEARCH_CACHE.delete(oldestKey);
    }
    SEARCH_CACHE.set(cacheKey, {
      expiresAt: Date.now() + 15 * 60 * 1000,
      items: results
    });

    return results;
  } catch {
    return [];
  }
}

export async function handleMedicalImageProxy(rawUrl: string, res: Response): Promise<void> {
  const parsed = isAllowedMedicalImageUrl(rawUrl);
  if (!parsed) {
    res.status(400).json({ error: 'Invalid or non-allowlisted medical image host.' });
    return;
  }

  const normalizedUrl = parsed.toString();
  const cached = IMAGE_BYTES_CACHE.get(normalizedUrl);
  if (cached && cached.expiresAt > Date.now()) {
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(cached.buffer);
    return;
  }

  try {
    const upstream = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': WIKI_USER_AGENT,
        Accept: 'image/jpeg,image/png,image/webp,image/*'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(9000)
    });

    if (!upstream.ok) {
      res.status(upstream.status === 404 ? 404 : 502).json({ error: 'Upstream medical image unavailable.' });
      return;
    }

    const finalParsed = isAllowedMedicalImageUrl(upstream.url || normalizedUrl);
    if (!finalParsed) {
      res.status(403).json({ error: 'Redirect target outside medical image allowlist.' });
      return;
    }

    const contentType = (upstream.headers.get('content-type') || '').toLowerCase();
    if (!contentType.startsWith('image/') || contentType.includes('svg')) {
      res.status(415).json({ error: 'Upstream response is not a raster clinical image.' });
      return;
    }

    const arrayBuf = await upstream.arrayBuffer();
    const maxSafeBytes = process.env.VERCEL ? Math.floor(4.1 * 1024 * 1024) : 8 * 1024 * 1024;
    if (arrayBuf.byteLength === 0) {
      res.status(413).json({ error: 'Medical image is empty.' });
      return;
    }
    if (arrayBuf.byteLength > maxSafeBytes) {
      res.redirect(302, finalParsed.toString());
      return;
    }

    const buffer = Buffer.from(arrayBuf);
    if (buffer.byteLength <= 1.8 * 1024 * 1024) {
      if (IMAGE_BYTES_CACHE.size >= 160) {
        const oldestKey = IMAGE_BYTES_CACHE.keys().next().value;
        if (oldestKey) IMAGE_BYTES_CACHE.delete(oldestKey);
      }
      IMAGE_BYTES_CACHE.set(normalizedUrl, {
        contentType,
        buffer,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(buffer);
  } catch {
    res.status(504).json({ error: 'Medical image proxy timeout.' });
  }
}

export interface RealMedicalVideoResult {
  id: string;
  title: string;
  caption: string;
  videoUrl: string;
  posterUrl: string;
  sourceUrl: string;
  mimeType: string;
  source: 'Wikimedia Commons Clinical Video Archive';
}

const VIDEO_SEARCH_CACHE = new Map<
  string,
  { expiresAt: number; items: RealMedicalVideoResult[] }
>();

export async function searchRealEchoVideos(
  rawQuery: string,
  limit = 10
): Promise<RealMedicalVideoResult[]> {
  const cleanQuery = rawQuery.trim().slice(0, 140);
  if (cleanQuery.length < 2) return [];

  const safeLimit = Math.max(2, Math.min(limit, 20));
  const cacheKey = `vid::${cleanQuery.toLowerCase()}::${safeLimit}`;
  const cached = VIDEO_SEARCH_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.items;
  }

  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
      `${cleanQuery} filetype:video`
    )}&gsrlimit=${safeLimit + 6}&prop=videoinfo|imageinfo&viprop=url|derivatives|mime&iiprop=url|mime|thumburl|extmetadata&iiurlwidth=640&format=json`;

    const res = await fetch(searchUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': WIKI_USER_AGENT
      },
      signal: AbortSignal.timeout(8500)
    });

    if (!res.ok) return [];

    const payload = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          {
            pageid?: number;
            title?: string;
            videoinfo?: Array<{
              url?: string;
              mime?: string;
              derivatives?: Array<{ src?: string; type?: string }>;
            }>;
            imageinfo?: Array<{
              url?: string;
              thumburl?: string;
              descriptionurl?: string;
              extmetadata?: {
                ImageDescription?: { value?: string };
              };
            }>;
          }
        >;
      };
    };

    const pages = Object.values(payload.query?.pages || {});
    const results: RealMedicalVideoResult[] = [];
    const seen = new Set<string>();

    for (const p of pages) {
      const vi = p.videoinfo?.[0];
      const ii = p.imageinfo?.[0];
      const derivs = vi?.derivatives || [];
      const webmDeriv = derivs.find((d) => String(d.src || '').endsWith('.webm'));
      const rawVideoUrl = (webmDeriv?.src || vi?.url || ii?.url || '').split('?')[0];
      if (!rawVideoUrl || seen.has(rawVideoUrl) || !isAllowedMedicalImageUrl(rawVideoUrl)) {
        continue;
      }

      const lowerUrl = rawVideoUrl.toLowerCase();
      const mimeType = lowerUrl.endsWith('.webm')
        ? 'video/webm'
        : lowerUrl.endsWith('.mp4')
          ? 'video/mp4'
          : lowerUrl.endsWith('.ogv') || lowerUrl.endsWith('.ogg')
            ? 'video/ogg'
            : vi?.mime || 'video/webm';

      seen.add(rawVideoUrl);

      const rawTitle = (p.title || '').replace(/^File:/i, '').replace(/\.[^.]+$/, '');
      const posterRaw = (ii?.thumburl || '').split('?')[0];
      const posterUrl =
        posterRaw && isAllowedMedicalImageUrl(posterRaw) ? buildProxiedImageUrl(posterRaw) : '';
      const caption = stripHtml(ii?.extmetadata?.ImageDescription?.value || rawTitle.replace(/_/g, ' ')).slice(0, 280);

      results.push({
        id: `WMC-VID-${p.pageid || results.length + 1}`,
        title: rawTitle.replace(/_/g, ' '),
        caption: caption || rawTitle.replace(/_/g, ' '),
        videoUrl: `/api/medical-videos/proxy?url=${encodeURIComponent(rawVideoUrl)}`,
        posterUrl,
        sourceUrl:
          ii?.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title || '')}`,
        mimeType,
        source: 'Wikimedia Commons Clinical Video Archive'
      });

      if (results.length >= safeLimit) break;
    }

    if (VIDEO_SEARCH_CACHE.size > 120) {
      const oldestKey = VIDEO_SEARCH_CACHE.keys().next().value;
      if (oldestKey) VIDEO_SEARCH_CACHE.delete(oldestKey);
    }
    VIDEO_SEARCH_CACHE.set(cacheKey, {
      expiresAt: Date.now() + 20 * 60 * 1000,
      items: results
    });

    return results;
  } catch {
    return [];
  }
}

export async function handleMedicalVideoProxy(
  rawUrl: string,
  rangeHeader: string | undefined,
  res: Response
): Promise<void> {
  const parsed = isAllowedMedicalImageUrl(rawUrl);
  if (!parsed) {
    res.status(400).json({ error: 'Invalid or non-allowlisted medical video host.' });
    return;
  }

  const normalizedUrl = parsed.toString();
  const MAX_CHUNK_BYTES = 3 * 1024 * 1024; // 3 MB keeps Vercel serverless responses safely below 4.5 MB
  let effectiveRange = rangeHeader;
  if (rangeHeader) {
    const m = /^bytes=(\d+)-(\d*)$/i.exec(rangeHeader.trim());
    if (m) {
      const start = Number(m[1]);
      const requestedEnd = m[2] ? Number(m[2]) : NaN;
      if (Number.isFinite(start)) {
        const maxAllowedEnd = start + MAX_CHUNK_BYTES - 1;
        const finalEnd =
          Number.isFinite(requestedEnd) && requestedEnd >= start
            ? Math.min(requestedEnd, maxAllowedEnd)
            : maxAllowedEnd;
        effectiveRange = `bytes=${start}-${finalEnd}`;
      }
    }
  } else if (process.env.VERCEL) {
    effectiveRange = `bytes=0-${MAX_CHUNK_BYTES - 1}`;
  }

  try {
    const fetchHeaders: Record<string, string> = {
      'User-Agent': WIKI_USER_AGENT,
      Accept: 'video/webm,video/mp4,video/ogg,application/ogg,*/*'
    };
    if (effectiveRange) {
      fetchHeaders.Range = effectiveRange;
    }

    const upstream = await fetch(normalizedUrl, {
      headers: fetchHeaders,
      redirect: 'follow',
      signal: AbortSignal.timeout(15000)
    });

    if (!upstream.ok && upstream.status !== 206) {
      res.status(upstream.status === 404 ? 404 : 502).json({ error: 'Upstream clinical video unavailable.' });
      return;
    }

    const finalParsed = isAllowedMedicalImageUrl(upstream.url || normalizedUrl);
    if (!finalParsed) {
      res.status(403).json({ error: 'Redirect target outside clinical media allowlist.' });
      return;
    }

    const ct = (upstream.headers.get('content-type') || '').toLowerCase();
    const isAllowedVideo =
      ct.startsWith('video/') ||
      ct.includes('application/ogg') ||
      ct.includes('application/octet-stream') ||
      normalizedUrl.toLowerCase().endsWith('.webm') ||
      normalizedUrl.toLowerCase().endsWith('.ogv');

    if (!isAllowedVideo) {
      res.status(415).json({ error: 'Upstream response is not a valid clinical video stream.' });
      return;
    }

    const contentLength = upstream.headers.get('content-length');
    const contentRange = upstream.headers.get('content-range');
    const acceptRanges = upstream.headers.get('accept-ranges') || 'bytes';

    res.status(upstream.status === 206 ? 206 : 200);
    res.setHeader(
      'Content-Type',
      ct && !ct.includes('octet-stream')
        ? ct
        : normalizedUrl.toLowerCase().endsWith('.webm')
          ? 'video/webm'
          : 'video/ogg'
    );
    res.setHeader('Accept-Ranges', acceptRanges);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const arrayBuf = await upstream.arrayBuffer();
    if (arrayBuf.byteLength > 28 * 1024 * 1024) {
      res.status(413).json({ error: 'Clinical video exceeds safe stream buffer limit.' });
      return;
    }
    res.send(Buffer.from(arrayBuf));
  } catch {
    res.status(504).json({ error: 'Clinical video proxy timeout.' });
  }
}
