export type Theme3dId =
  | 'midnight-cyan'
  | 'obsidian-gold'
  | 'emerald-bio'
  | 'crimson-cardiac'
  | 'arctic-platinum';

export interface Theme3dPalette {
  id: Theme3dId;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  premium: boolean;
  swatches: [string, string, string];
  three: {
    fogColor: number;
    fogDensity: number;
    hemiSky: number;
    hemiGround: number;
    keyColor: number;
    rimColor: number;
    accentLight: number;
    primaryMaterial: number;
    secondaryMaterial: number;
    metalTint: number;
    coreAccent: number;
    particleColor: number;
  };
}

export const THEME_3D_LIST: Theme3dPalette[] = [
  {
    id: 'midnight-cyan',
    nameEn: 'Midnight Medical Navy',
    nameAr: 'الأزرق الطبي الكحلي',
    descEn: 'Deep navy volumetric space with electric cyan DNA illumination',
    descAr: 'فضاء كحلي عميق مع إضاءة سماوية ثلاثية الأبعاد',
    premium: false,
    swatches: ['#050B16', '#1D6FEB', '#22D3EE'],
    three: {
      fogColor: 0x050b16,
      fogDensity: 0.055,
      hemiSky: 0x38bdf8,
      hemiGround: 0x050b16,
      keyColor: 0xf8fafc,
      rimColor: 0x22d3ee,
      accentLight: 0x8b5cf6,
      primaryMaterial: 0x1d6feb,
      secondaryMaterial: 0x22d3ee,
      metalTint: 0xb8c7dc,
      coreAccent: 0x8b5cf6,
      particleColor: 0x22d3ee
    }
  },
  {
    id: 'emerald-bio',
    nameEn: 'Bio-Genomic Emerald',
    nameAr: 'الزمرد الجيني الحيوي',
    descEn: 'Cellular bioluminescence with emerald titanium shaders',
    descAr: 'توهج حيوي زمردي مع خامات تيتانيوم دقيقة',
    premium: false,
    swatches: ['#04120E', '#10B981', '#2DD4BF'],
    three: {
      fogColor: 0x04120e,
      fogDensity: 0.055,
      hemiSky: 0x34d399,
      hemiGround: 0x04120e,
      keyColor: 0xecfdf5,
      rimColor: 0x2dd4bf,
      accentLight: 0x059669,
      primaryMaterial: 0x10b981,
      secondaryMaterial: 0x2dd4bf,
      metalTint: 0xa7f3d0,
      coreAccent: 0x34d399,
      particleColor: 0x5eead4
    }
  },
  {
    id: 'obsidian-gold',
    nameEn: 'Surgical Obsidian & Gold',
    nameAr: 'الأوبسيديان الجراحي والذهب',
    descEn: 'Anisotropic brushed gold metallurgy over matte carbon obsidian',
    descAr: 'معادن ذهبية مصقولة على خلفية كربونية داكنة',
    premium: true,
    swatches: ['#0A090E', '#D97706', '#FBBF24'],
    three: {
      fogColor: 0x0a090e,
      fogDensity: 0.052,
      hemiSky: 0xfbbf24,
      hemiGround: 0x0a090e,
      keyColor: 0xfffbeb,
      rimColor: 0xf59e0b,
      accentLight: 0xfde68a,
      primaryMaterial: 0xd97706,
      secondaryMaterial: 0xfbbf24,
      metalTint: 0xfde68a,
      coreAccent: 0xf59e0b,
      particleColor: 0xfcd34d
    }
  },
  {
    id: 'crimson-cardiac',
    nameEn: 'Cardiac Telemetry Crimson',
    nameAr: 'النبض القلبي القرمزي',
    descEn: 'Arterial crimson rim lighting crafted for cardiovascular telemetry',
    descAr: 'إضاءة شريانية قرمزية مصممة لمراقبة القلب والأوعية',
    premium: true,
    swatches: ['#12060B', '#E11D48', '#FB7185'],
    three: {
      fogColor: 0x12060b,
      fogDensity: 0.055,
      hemiSky: 0xfb7185,
      hemiGround: 0x12060b,
      keyColor: 0xfff1f2,
      rimColor: 0xf43f5e,
      accentLight: 0xfda4af,
      primaryMaterial: 0xe11d48,
      secondaryMaterial: 0xfb7185,
      metalTint: 0xe2e8f0,
      coreAccent: 0xf43f5e,
      particleColor: 0xfda4af
    }
  },
  {
    id: 'arctic-platinum',
    nameEn: 'Arctic Sapphire Studio',
    nameAr: 'البلاتين القطبي الياقوتي',
    descEn: 'High-clarity sapphire glass and frosted platinum diagnostic suite',
    descAr: 'زجاج ياقوتي نقي وبلاتين ثلجي للمختبرات المتقدمة',
    premium: true,
    swatches: ['#0B1322', '#38BDF8', '#E2E8F0'],
    three: {
      fogColor: 0x0b1322,
      fogDensity: 0.048,
      hemiSky: 0xbae6fd,
      hemiGround: 0x0b1322,
      keyColor: 0xffffff,
      rimColor: 0x38bdf8,
      accentLight: 0x818cf8,
      primaryMaterial: 0x0284c7,
      secondaryMaterial: 0x7dd3fc,
      metalTint: 0xf1f5f9,
      coreAccent: 0x818cf8,
      particleColor: 0xbae6fd
    }
  }
];

export function getTheme3dConfig(id?: string): Theme3dPalette {
  return THEME_3D_LIST.find((t) => t.id === id) || THEME_3D_LIST[0];
}
