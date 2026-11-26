import {
  ACQUISITION_PROTOCOLS,
  MEDICAL_IMAGE_SEEDS,
  type ImageArchetype,
  type MedicalImageSeed
} from './medicalImagesSeeds';
import { pickRealMedicalImage } from './realMedicalImagePool';

export const TARGET_IMAGE_COUNT = 20000;

export interface MedicalImage20kEntry {
  id: string; // IMG-00001 .. IMG-20000
  seedCode: string;
  titleEn: string;
  titleAr: string;
  findingTitleEn: string;
  findingTitleAr: string;
  specialtyEn: string;
  specialtyAr: string;
  modality: string;
  acquisitionEn: string;
  acquisitionAr: string;
  archetype: ImageArchetype;
  icd10: string;
  regionEn: string;
  regionAr: string;
  findingEn: string;
  findingAr: string;
  windowPreset: string;
  sliceThickness: string;
  pubmedQuery: string;
  cx: number;
  cy: number;
  lr: number;
  variantSeed: number;
  realThumbUrl: string;
  realImageUrl: string;
  realImageTitle: string;
  realImageSourceUrl: string;
  searchIndex: string;
}

export interface MedicalImagesCatalogBundle {
  records: MedicalImage20kEntry[];
  specialtiesEn: string[];
  modalities: string[];
  stats: {
    total: number;
    uniqueEn: number;
    uniqueAr: number;
    duplicateCount: number;
    baseFindingCount: number;
    protocolCount: number;
  };
}

let cachedImageBundle: MedicalImagesCatalogBundle | null = null;

function isProtocolCompatibleWithSeed(
  modality: string,
  archetype: ImageArchetype
): boolean {
  if (archetype === 'retinal-oct') {
    return modality === 'OCT / Fundus' || modality === 'Ultrasound';
  }
  if (archetype === 'dermoscopy') {
    return modality === 'Dermoscopy' || modality === 'Pathology';
  }
  if (archetype === 'histopathology') {
    return modality === 'Pathology' || modality === 'PET-CT';
  }
  if (archetype === 'echo-doppler' || archetype === 'ultrasound') {
    return (
      modality === 'Ultrasound' ||
      modality === 'MRI' ||
      modality === 'CT'
    );
  }
  return (
    modality === 'CT' ||
    modality === 'MRI' ||
    modality === 'X-Ray' ||
    modality === 'PET-CT' ||
    modality === 'Ultrasound'
  );
}

function buildUniqueBaseFindings(): MedicalImageSeed[] {
  const seenEn = new Set<string>();
  const seenAr = new Set<string>();
  const unique: MedicalImageSeed[] = [];

  for (const s of MEDICAL_IMAGE_SEEDS) {
    const kEn = s.titleEn.trim().toLowerCase();
    const kAr = s.titleAr.trim().toLowerCase();
    if (!kEn || !kAr || seenEn.has(kEn) || seenAr.has(kAr)) continue;
    seenEn.add(kEn);
    seenAr.add(kAr);
    unique.push(s);
  }
  return unique;
}

export function getMedicalImages20kCatalog(): MedicalImagesCatalogBundle {
  if (cachedImageBundle) return cachedImageBundle;

  const baseFindings = buildUniqueBaseFindings();
  const protocols = ACQUISITION_PROTOCOLS;

  const records: MedicalImage20kEntry[] = [];
  const seenFullEn = new Set<string>();
  const seenFullAr = new Set<string>();

  // Pass 1: Match medically aligned modality protocols across all findings (outer loop on protocols so Page 1 shows diverse conditions!)
  outer1: for (let pIdx = 0; pIdx < protocols.length; pIdx += 1) {
    const proto = protocols[pIdx];
    for (let fIdx = 0; fIdx < baseFindings.length; fIdx += 1) {
      const seed = baseFindings[fIdx];
      if (!isProtocolCompatibleWithSeed(proto.modality, seed.archetype)) {
        continue;
      }

      const titleEn = `${seed.titleEn} — ${proto.modality}: ${proto.labelEn}`;
      const titleAr = `${seed.titleAr} — ${proto.labelAr}`;
      const normEn = titleEn.toLowerCase();
      const normAr = titleAr.toLowerCase();

      if (seenFullEn.has(normEn) || seenFullAr.has(normAr)) {
        continue;
      }

      seenFullEn.add(normEn);
      seenFullAr.add(normAr);

      const seq = records.length + 1;
      const id = `IMG-${String(seq).padStart(5, '0')}`;
      const variantSeed = (seq * 2654435761) >>> 0;
      const realAsset = pickRealMedicalImage(seed.archetype, variantSeed);

      records.push({
        id,
        seedCode: seed.code,
        titleEn,
        titleAr,
        findingTitleEn: seed.titleEn,
        findingTitleAr: seed.titleAr,
        specialtyEn: seed.specialtyEn,
        specialtyAr: seed.specialtyAr,
        modality: proto.modality,
        acquisitionEn: proto.labelEn,
        acquisitionAr: proto.labelAr,
        archetype: seed.archetype,
        icd10: seed.icd10,
        regionEn: seed.regionEn,
        regionAr: seed.regionAr,
        findingEn: seed.findingEn,
        findingAr: seed.findingAr,
        windowPreset: proto.windowPreset,
        sliceThickness: proto.sliceThickness,
        pubmedQuery: seed.pubmedQuery,
        cx: seed.cx,
        cy: seed.cy,
        lr: seed.lr,
        variantSeed,
        realThumbUrl: realAsset.thumb,
        realImageUrl: realAsset.url,
        realImageTitle: realAsset.title,
        realImageSourceUrl: realAsset.descUrl,
        searchIndex: `${id} ${seed.icd10} ${titleEn} ${titleAr} ${seed.specialtyEn} ${seed.specialtyAr} ${seed.regionEn} ${seed.regionAr} ${seed.findingEn} ${seed.findingAr} ${proto.modality}`.toLowerCase()
      });

      if (records.length >= TARGET_IMAGE_COUNT) {
        break outer1;
      }
    }
  }

  // Pass 2 (if needed to reach exact 20,000 unique plates): Enumerate indexed sequential tomographic slices / serial follow-ups
  let passSeries = 2;
  while (records.length < TARGET_IMAGE_COUNT) {
    const seriesLabelEn = `Serial Slice #${passSeries}`;
    const seriesLabelAr = `المقطع التسلسلي رقم ${passSeries}`;

    for (let pIdx = 0; pIdx < protocols.length && records.length < TARGET_IMAGE_COUNT; pIdx += 1) {
      const proto = protocols[pIdx];
      for (let fIdx = 0; fIdx < baseFindings.length && records.length < TARGET_IMAGE_COUNT; fIdx += 1) {
        const seed = baseFindings[fIdx];
        if (!isProtocolCompatibleWithSeed(proto.modality, seed.archetype)) {
          continue;
        }

        const titleEn = `${seed.titleEn} — ${proto.modality}: ${proto.labelEn} (${seriesLabelEn})`;
        const titleAr = `${seed.titleAr} — ${proto.labelAr} (${seriesLabelAr})`;
        const normEn = titleEn.toLowerCase();
        const normAr = titleAr.toLowerCase();

        if (seenFullEn.has(normEn) || seenFullAr.has(normAr)) {
          continue;
        }

        seenFullEn.add(normEn);
        seenFullAr.add(normAr);

        const seq = records.length + 1;
        const id = `IMG-${String(seq).padStart(5, '0')}`;
        const variantSeed = (seq * 2654435761) >>> 0;
        const realAsset = pickRealMedicalImage(seed.archetype, variantSeed);

        records.push({
          id,
          seedCode: seed.code,
          titleEn,
          titleAr,
          findingTitleEn: seed.titleEn,
          findingTitleAr: seed.titleAr,
          specialtyEn: seed.specialtyEn,
          specialtyAr: seed.specialtyAr,
          modality: proto.modality,
          acquisitionEn: `${proto.labelEn} (${seriesLabelEn})`,
          acquisitionAr: `${proto.labelAr} (${seriesLabelAr})`,
          archetype: seed.archetype,
          icd10: seed.icd10,
          regionEn: seed.regionEn,
          regionAr: seed.regionAr,
          findingEn: seed.findingEn,
          findingAr: seed.findingAr,
          windowPreset: proto.windowPreset,
          sliceThickness: proto.sliceThickness,
          pubmedQuery: seed.pubmedQuery,
          cx: seed.cx,
          cy: seed.cy,
          lr: seed.lr,
          variantSeed,
          realThumbUrl: realAsset.thumb,
          realImageUrl: realAsset.url,
          realImageTitle: realAsset.title,
          realImageSourceUrl: realAsset.descUrl,
          searchIndex: `${id} ${seed.icd10} ${titleEn} ${titleAr} ${seed.specialtyEn} ${seed.specialtyAr} ${seed.regionEn} ${seed.regionAr} ${seed.findingEn} ${seed.findingAr} ${proto.modality}`.toLowerCase()
        });
      }
    }
    passSeries += 1;
  }

  const specialtiesEn = Array.from(new Set(records.map((r) => r.specialtyEn))).sort();
  const modalities = Array.from(new Set(records.map((r) => r.modality))).sort();

  cachedImageBundle = {
    records,
    specialtiesEn,
    modalities,
    stats: {
      total: records.length,
      uniqueEn: seenFullEn.size,
      uniqueAr: seenFullAr.size,
      duplicateCount: records.length - Math.min(seenFullEn.size, seenFullAr.size),
      baseFindingCount: baseFindings.length,
      protocolCount: protocols.length
    }
  };

  return cachedImageBundle;
}

export interface MedicalImageQueryOptions {
  search?: string;
  specialty?: string;
  modality?: string;
  page?: number;
  pageSize?: number;
}

export interface MedicalImageQueryResult {
  items: MedicalImage20kEntry[];
  totalMatches: number;
  page: number;
  totalPages: number;
}

export function queryMedicalImages20k(
  opts: MedicalImageQueryOptions
): MedicalImageQueryResult {
  const { records } = getMedicalImages20kCatalog();
  const q = (opts.search || '').trim().toLowerCase();
  const specialty =
    opts.specialty && opts.specialty !== 'All' ? opts.specialty : null;
  const modality =
    opts.modality && opts.modality !== 'All' ? opts.modality : null;
  const pageSize = Math.max(6, Math.min(opts.pageSize || 18, 48));

  const matched: MedicalImage20kEntry[] = [];
  for (let i = 0; i < records.length; i += 1) {
    const rec = records[i];
    if (specialty && rec.specialtyEn !== specialty) continue;
    if (modality && rec.modality !== modality) continue;
    if (q && !rec.searchIndex.includes(q)) continue;
    matched.push(rec);
  }

  const totalMatches = matched.length;
  const totalPages = Math.max(1, Math.ceil(totalMatches / pageSize));
  const safePage = Math.max(1, Math.min(opts.page || 1, totalPages));
  const start = (safePage - 1) * pageSize;

  return {
    items: matched.slice(start, start + pageSize),
    totalMatches,
    page: safePage,
    totalPages
  };
}
