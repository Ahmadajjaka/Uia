import { PHARMA_DOSAGE_FORMS, type PharmaDosageForm } from './pharmaForms';
import { PHARMA_MOLECULES_A, type PharmaMoleculeSeed } from './pharmaMoleculesA';
import { PHARMA_MOLECULES_B } from './pharmaMoleculesB';
import { PHARMA_MOLECULES_C } from './pharmaMoleculesC';

export const TARGET_PHARMA_COUNT = 20000;

export interface Pharma20kEntry {
  id: string;
  atc: string;
  moleculeEn: string;
  moleculeAr: string;
  nameEn: string;
  nameAr: string;
  formCode: string;
  formEn: string;
  formAr: string;
  routeEn: string;
  routeAr: string;
  strengthEn: string;
  strengthAr: string;
  classEn: string;
  classAr: string;
  indEn: string;
  indAr: string;
  doseEn: string;
  doseAr: string;
  warnEn: string;
  warnAr: string;
  renalEn: string;
  renalAr: string;
  interactions: string[];
  searchIndex: string;
}

export interface PharmaCatalogBundle {
  records: Pharma20kEntry[];
  baseMolecules: PharmaMoleculeSeed[];
  classesEn: string[];
  routesEn: string[];
  stats: {
    total: number;
    uniqueEn: number;
    uniqueAr: number;
    duplicateCount: number;
    baseMoleculeCount: number;
    dosageFormCount: number;
  };
}

let cachedBundle: PharmaCatalogBundle | null = null;

function buildUniqueBaseMolecules(): PharmaMoleculeSeed[] {
  const raw = [...PHARMA_MOLECULES_A, ...PHARMA_MOLECULES_B, ...PHARMA_MOLECULES_C];
  const seenEn = new Set<string>();
  const seenAr = new Set<string>();
  const unique: PharmaMoleculeSeed[] = [];

  for (const mol of raw) {
    const keyEn = mol.en.trim().toLowerCase();
    const keyAr = mol.ar.trim().toLowerCase();
    if (!keyEn || !keyAr || seenEn.has(keyEn) || seenAr.has(keyAr)) {
      continue;
    }
    seenEn.add(keyEn);
    seenAr.add(keyAr);
    unique.push(mol);
  }
  return unique;
}

function buildUniqueDosageForms(): PharmaDosageForm[] {
  const seenFormKeys = new Set<string>();
  const unique: PharmaDosageForm[] = [];

  for (const form of PHARMA_DOSAGE_FORMS) {
    const key = `${form.formEn.toLowerCase()}|${form.strengthEn.toLowerCase()}`;
    if (seenFormKeys.has(key)) continue;
    seenFormKeys.add(key);
    unique.push(form);
  }
  return unique;
}

export function getPharma20kCatalog(): PharmaCatalogBundle {
  if (cachedBundle) return cachedBundle;

  const baseMolecules = buildUniqueBaseMolecules();
  const dosageForms = buildUniqueDosageForms();
  const records: Pharma20kEntry[] = [];

  const seenFullEn = new Set<string>();
  const seenFullAr = new Set<string>();

  // Outer loop on dosage forms ensures page 1 showcases distinct therapeutic molecules
  // across the 380+ INN ingredients before enumerating subsequent strengths & routes.
  outer: for (const form of dosageForms) {
    for (const mol of baseMolecules) {
      const nameEn = `${mol.en} — ${form.formEn} ${form.strengthEn}`;
      const nameAr = `${mol.ar} — ${form.formAr} ${form.strengthAr}`;
      const normEn = nameEn.toLowerCase();
      const normAr = nameAr.toLowerCase();

      if (seenFullEn.has(normEn) || seenFullAr.has(normAr)) {
        continue;
      }

      seenFullEn.add(normEn);
      seenFullAr.add(normAr);

      const seq = records.length + 1;
      const id = `RX-${String(seq).padStart(5, '0')}`;

      records.push({
        id,
        atc: mol.atc,
        moleculeEn: mol.en,
        moleculeAr: mol.ar,
        nameEn,
        nameAr,
        formCode: form.code,
        formEn: form.formEn,
        formAr: form.formAr,
        routeEn: form.routeEn,
        routeAr: form.routeAr,
        strengthEn: form.strengthEn,
        strengthAr: form.strengthAr,
        classEn: mol.classEn,
        classAr: mol.classAr,
        indEn: mol.indEn,
        indAr: mol.indAr,
        doseEn: mol.doseEn,
        doseAr: mol.doseAr,
        warnEn: mol.warnEn,
        warnAr: mol.warnAr,
        renalEn: mol.renalEn,
        renalAr: mol.renalAr,
        interactions: mol.interactions,
        searchIndex: `${id} ${mol.atc} ${nameEn} ${nameAr} ${mol.classEn} ${mol.classAr} ${mol.indEn} ${mol.indAr} ${form.routeEn} ${form.routeAr}`.toLowerCase()
      });

      if (records.length >= TARGET_PHARMA_COUNT) {
        break outer;
      }
    }
  }

  const classesEn = Array.from(new Set(baseMolecules.map((m) => m.classEn))).sort();
  const routesEn = Array.from(new Set(dosageForms.map((f) => f.routeEn))).sort();

  cachedBundle = {
    records,
    baseMolecules,
    classesEn,
    routesEn,
    stats: {
      total: records.length,
      uniqueEn: seenFullEn.size,
      uniqueAr: seenFullAr.size,
      duplicateCount: records.length - Math.min(seenFullEn.size, seenFullAr.size),
      baseMoleculeCount: baseMolecules.length,
      dosageFormCount: dosageForms.length
    }
  };

  return cachedBundle;
}

export interface PharmaQueryOptions {
  search?: string;
  drugClass?: string;
  route?: string;
  page?: number;
  pageSize?: number;
}

export interface PharmaQueryResult {
  items: Pharma20kEntry[];
  totalMatches: number;
  page: number;
  totalPages: number;
}

export function queryPharma20k(opts: PharmaQueryOptions): PharmaQueryResult {
  const { records } = getPharma20kCatalog();
  const q = (opts.search || '').trim().toLowerCase();
  const drugClass = opts.drugClass && opts.drugClass !== 'All' ? opts.drugClass : null;
  const route = opts.route && opts.route !== 'All' ? opts.route : null;
  const pageSize = Math.max(6, Math.min(opts.pageSize || 24, 60));

  const matched: Pharma20kEntry[] = [];
  for (let i = 0; i < records.length; i += 1) {
    const rec = records[i];
    if (drugClass && rec.classEn !== drugClass) continue;
    if (route && rec.routeEn !== route) continue;
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

export interface PharmaInteractionResult {
  severityEn: string;
  severityAr: string;
  level: 'critical' | 'moderate' | 'clear';
  noteEn: string;
  noteAr: string;
}

export function checkPharmaInteraction(
  molEnA: string,
  molEnB: string
): PharmaInteractionResult | null {
  if (!molEnA || !molEnB || molEnA === molEnB) return null;
  const { baseMolecules } = getPharma20kCatalog();
  const a = baseMolecules.find((m) => m.en === molEnA);
  const b = baseMolecules.find((m) => m.en === molEnB);
  if (!a || !b) return null;

  const lowerA = a.en.toLowerCase();
  const lowerB = b.en.toLowerCase();

  // Critical absolute contraindications
  const isNitrateA = /nitroglycerin|isosorbide/i.test(lowerA);
  const isNitrateB = /nitroglycerin|isosorbide/i.test(lowerB);
  const isPde5A = /sildenafil|tadalafil/i.test(lowerA);
  const isPde5B = /sildenafil|tadalafil/i.test(lowerB);

  if ((isNitrateA && isPde5B) || (isNitrateB && isPde5A)) {
    return {
      level: 'critical',
      severityEn: 'CONTRAINDICATED — Life-Threatening Hypotension',
      severityAr: 'تعارض خطير ممنوع — هبوط ضغط دم قاتل',
      noteEn: `${a.en} + ${b.en}: Combining organic nitrates with PDE5 inhibitors causes refractory vasodilatory shock.`,
      noteAr: `${a.ar} + ${b.ar}: الجمع بين النترات ومثبطات PDE5 يسبب هبوط ضغط حاداً ومهدداً للحياة.`
    };
  }

  if (
    (/tizanidine/i.test(lowerA) && /ciprofloxacin|fluvoxamine/i.test(lowerB)) ||
    (/tizanidine/i.test(lowerB) && /ciprofloxacin|fluvoxamine/i.test(lowerA))
  ) {
    return {
      level: 'critical',
      severityEn: 'CONTRAINDICATED — Extreme CYP1A2 Toxicity',
      severityAr: 'تعارض ممنوع — سمية شديدة عبر CYP1A2',
      noteEn: `${a.en} + ${b.en}: Potent CYP1A2 inhibition multiplies tizanidine exposure >10-fold causing profound hypotension and CNS sedation.`,
      noteAr: `${a.ar} + ${b.ar}: يضاعف تركيز التيزانيدين أكثر من 10 أضعاف مسبباً هبوط ضغط وتركيناً شديداً.`
    };
  }

  const aHitsB = a.interactions.some(
    (intName) =>
      lowerB.includes(intName.toLowerCase()) || intName.toLowerCase().includes(lowerB.split(' ')[0])
  );
  const bHitsA = b.interactions.some(
    (intName) =>
      lowerA.includes(intName.toLowerCase()) || intName.toLowerCase().includes(lowerA.split(' ')[0])
  );

  if (aHitsB || bHitsA) {
    return {
      level: 'moderate',
      severityEn: 'Documented Clinical Interaction — Monitor / Adjust',
      severityAr: 'تداخل دوائي موثق — يتطلب المراقبة أو تعديل الجرعة',
      noteEn: `${a.en} (${a.ar}) + ${b.en} (${b.ar}): Verified pharmacokinetic or pharmacodynamic interaction risk in monograph. Check renal/hepatic status and monitoring labs.`,
      noteAr: `${a.ar} + ${b.ar}: يوجد تداخل دوائي أو حركي موثق بين الدواءين؛ راجع الجرعة ووظائف الكبد والكلية.`
    };
  }

  if (
    (a.classEn.includes('Factor Xa') && b.classEn.includes('Vitamin K')) ||
    (b.classEn.includes('Factor Xa') && a.classEn.includes('Vitamin K')) ||
    (a.classEn.includes('Proton Pump') && b.classEn.includes('Proton Pump')) ||
    (a.classEn.includes('NSAID') && b.classEn.includes('NSAID'))
  ) {
    return {
      level: 'critical',
      severityEn: 'Duplicate Therapeutic Class Hazard',
      severityAr: 'خطر الازدواجية العلاجية في نفس الفئة',
      noteEn: `${a.en} + ${b.en} belong to overlapping high-risk therapeutic pathways, increasing bleeding or organ toxicity without added efficacy.`,
      noteAr: `${a.ar} + ${b.ar} ينتميان إلى مسار علاجي مكرر يرفع خطر النزف أو السمية دون فائدة إضافية.`
    };
  }

  return {
    level: 'clear',
    severityEn: 'No Major Direct Pair Alert Flagged',
    severityAr: 'لا يوجد تنبيه تداخل حاد مسجل مباشرة',
    noteEn: `No critical direct conflict flagged between ${a.en} and ${b.en} in core registry; always verify electrolytes, QTc, and renal clearance.`,
    noteAr: `لم يُرصد تعارض مباشر حرج بين ${a.ar} و${b.ar}؛ تأكد دوماً من الشوارد ووظيفة الكلية.`
  };
}
