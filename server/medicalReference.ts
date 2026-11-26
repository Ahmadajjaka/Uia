export interface MedicalLiteratureItem {
  id: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title: string;
  authors: string;
  journal: string;
  pubYear: string;
  citedByCount: number;
  isOpenAccess: boolean;
  abstractText: string;
  source: 'Europe PMC / PubMed';
  externalUrl: string;
}

export interface MedicalConditionItem {
  id: string;
  name: string;
  consumerName: string;
  icd10Codes: string[];
  synonyms: string[];
  infoUrl: string;
  source: 'NIH NLM Clinical Tables';
}

export interface MedicalEncyclopediaItem {
  title: string;
  language: 'en' | 'ar';
  extract: string;
  pageUrl: string;
  source: 'Medical Encyclopedia';
}

export interface MedicalRefSearchResponse {
  query: string;
  language: 'en' | 'ar';
  fetchedAt: string;
  literature: MedicalLiteratureItem[];
  conditions: MedicalConditionItem[];
  encyclopedia: MedicalEncyclopediaItem[];
  sourcesStatus: {
    europePmc: 'ok' | 'unavailable';
    nihConditions: 'ok' | 'unavailable';
    encyclopedia: 'ok' | 'unavailable';
  };
}

function stripHtmlTags(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchEuropePmc(query: string): Promise<{
  ok: boolean;
  items: MedicalLiteratureItem[];
}> {
  try {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
      query
    )}&format=json&resultType=core&pageSize=12&sort_cited=y`;

    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'MAMO-MED-AI/1.0' },
      signal: AbortSignal.timeout(7500)
    });

    if (!res.ok) {
      return { ok: false, items: [] };
    }

    const data = (await res.json()) as {
      resultList?: {
        result?: Array<{
          id?: string;
          pmid?: string;
          pmcid?: string;
          doi?: string;
          title?: string;
          authorString?: string;
          journalTitle?: string;
          pubYear?: string;
          citedByCount?: number;
          isOpenAccess?: string;
          abstractText?: string;
          source?: string;
        }>;
      };
    };

    const rawResults = data.resultList?.result || [];
    const seenTitles = new Set<string>();
    const items: MedicalLiteratureItem[] = [];

    for (const r of rawResults) {
      const title = stripHtmlTags(r.title || '');
      if (!title || seenTitles.has(title.toLowerCase())) continue;
      seenTitles.add(title.toLowerCase());

      const pmid = r.pmid || undefined;
      const pmcid = r.pmcid || undefined;
      const id = pmid ? `PMID-${pmid}` : pmcid || r.id || `EPMC-${items.length + 1}`;
      const externalUrl = pmid
        ? `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(pmid)}/`
        : pmcid
          ? `https://europepmc.org/article/PMC/${encodeURIComponent(pmcid)}`
          : `https://europepmc.org/search?query=${encodeURIComponent(title)}`;

      items.push({
        id,
        pmid,
        pmcid,
        doi: r.doi || undefined,
        title,
        authors: r.authorString ? stripHtmlTags(r.authorString) : 'Indexed biomedical authors',
        journal: r.journalTitle || r.source || 'Peer-Reviewed Biomedical Journal',
        pubYear: r.pubYear || 'Recent',
        citedByCount: Number(r.citedByCount || 0),
        isOpenAccess: r.isOpenAccess === 'Y',
        abstractText: r.abstractText
          ? stripHtmlTags(r.abstractText)
          : 'Abstract text is indexed under the primary PubMed / Europe PMC record.',
        source: 'Europe PMC / PubMed',
        externalUrl
      });
    }

    return { ok: true, items };
  } catch {
    return { ok: false, items: [] };
  }
}

async function fetchNihConditions(query: string): Promise<{
  ok: boolean;
  items: MedicalConditionItem[];
}> {
  try {
    const url = `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${encodeURIComponent(
      query
    )}&df=primary_name,consumer_name,icd10cm_codes,synonyms,info_link_data&maxList=8`;

    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'MAMO-MED-AI/1.0' },
      signal: AbortSignal.timeout(7000)
    });

    if (!res.ok) {
      return { ok: false, items: [] };
    }

    // Response tuple: [totalCount, codes[], extraHash, displayMatrix[][], codeSystems?]
    const payload = (await res.json()) as [
      number,
      string[],
      Record<string, unknown>,
      Array<[string, string, string, string, string]>
    ];

    const codes = Array.isArray(payload?.[1]) ? payload[1] : [];
    const rows = Array.isArray(payload?.[3]) ? payload[3] : [];
    const items: MedicalConditionItem[] = [];

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i] || [];
      const primaryName = (row[0] || '').trim();
      if (!primaryName) continue;

      const consumerName = (row[1] || primaryName).trim();
      const icdRaw = (row[2] || '').trim();
      const synRaw = (row[3] || '').trim();
      const infoRaw = (row[4] || '').trim();

      const icd10Codes = icdRaw
        ? icdRaw
            .split(/[,;]+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 6)
        : [];
      const synonyms = synRaw
        ? synRaw
            .split(/[,;]+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 6)
        : [];

      let infoUrl = `https://medlineplus.gov/`;
      const urlMatch = infoRaw.match(/https?:\/\/[^\s,"]+/);
      if (urlMatch) {
        infoUrl = urlMatch[0];
      }

      items.push({
        id: codes[i] || `NLM-${i + 1}`,
        name: primaryName,
        consumerName,
        icd10Codes,
        synonyms,
        infoUrl,
        source: 'NIH NLM Clinical Tables'
      });
    }

    return { ok: true, items };
  } catch {
    return { ok: false, items: [] };
  }
}

async function fetchWikipediaSummary(
  query: string,
  lang: 'en' | 'ar'
): Promise<{ ok: boolean; items: MedicalEncyclopediaItem[] }> {
  try {
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query
    )}&srlimit=3&format=json&origin=*`;

    const sRes = await fetch(searchUrl, {
      headers: { Accept: 'application/json', 'User-Agent': 'MAMO-MED-AI/1.0' },
      signal: AbortSignal.timeout(6500)
    });

    if (!sRes.ok) {
      return { ok: false, items: [] };
    }

    const sData = (await sRes.json()) as {
      query?: { search?: Array<{ title?: string; pageid?: number }> };
    };
    const hits = sData.query?.search || [];
    if (hits.length === 0) {
      return { ok: true, items: [] };
    }

    const titlesParam = hits
      .map((h) => h.title)
      .filter((t): t is string => Boolean(t))
      .join('|');

    const extractUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts|info&exintro=1&explaintext=1&inprop=url&titles=${encodeURIComponent(
      titlesParam
    )}&format=json&origin=*`;

    const eRes = await fetch(extractUrl, {
      headers: { Accept: 'application/json', 'User-Agent': 'MAMO-MED-AI/1.0' },
      signal: AbortSignal.timeout(6500)
    });

    if (!eRes.ok) {
      return { ok: false, items: [] };
    }

    const eData = (await eRes.json()) as {
      query?: {
        pages?: Record<
          string,
          { title?: string; extract?: string; fullurl?: string }
        >;
      };
    };

    const pages = Object.values(eData.query?.pages || {});
    const items: MedicalEncyclopediaItem[] = [];
    for (const p of pages) {
      if (!p.title || !p.extract || p.extract.trim().length < 40) continue;
      items.push({
        title: p.title,
        language: lang,
        extract: p.extract.trim().slice(0, 1200),
        pageUrl:
          p.fullurl ||
          `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/\s+/g, '_'))}`,
        source: 'Medical Encyclopedia'
      });
    }

    return { ok: true, items };
  } catch {
    return { ok: false, items: [] };
  }
}

export async function searchMedicalReferences(
  rawQuery: string,
  language: 'en' | 'ar'
): Promise<MedicalRefSearchResponse> {
  const cleanQuery = rawQuery.trim().slice(0, 160);

  // Run trusted biomedical sources concurrently
  const [epmcRes, nihRes, wikiPrimaryRes, wikiSecondaryRes] = await Promise.all([
    fetchEuropePmc(cleanQuery),
    fetchNihConditions(cleanQuery),
    fetchWikipediaSummary(cleanQuery, language),
    language === 'ar'
      ? fetchWikipediaSummary(cleanQuery, 'en')
      : Promise.resolve({ ok: true, items: [] as MedicalEncyclopediaItem[] })
  ]);

  const combinedEncyclopedia = [
    ...wikiPrimaryRes.items,
    ...wikiSecondaryRes.items.filter(
      (sec) => !wikiPrimaryRes.items.some((pri) => pri.title.toLowerCase() === sec.title.toLowerCase())
    )
  ];

  return {
    query: cleanQuery,
    language,
    fetchedAt: new Date().toISOString(),
    literature: epmcRes.items,
    conditions: nihRes.items,
    encyclopedia: combinedEncyclopedia,
    sourcesStatus: {
      europePmc: epmcRes.ok ? 'ok' : 'unavailable',
      nihConditions: nihRes.ok ? 'ok' : 'unavailable',
      encyclopedia: wikiPrimaryRes.ok ? 'ok' : 'unavailable'
    }
  };
}
