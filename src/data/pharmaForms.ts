export interface PharmaDosageForm {
  code: string;
  formEn: string;
  formAr: string;
  routeEn: string;
  routeAr: string;
  strengthEn: string;
  strengthAr: string;
}

export const PHARMA_DOSAGE_FORMS: PharmaDosageForm[] = [
  { code: 'TAB-01', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '2.5 mg', strengthAr: '2.5 ملغ' },
  { code: 'TAB-02', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '5 mg', strengthAr: '5 ملغ' },
  { code: 'TAB-03', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '10 mg', strengthAr: '10 ملغ' },
  { code: 'TAB-04', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '20 mg', strengthAr: '20 ملغ' },
  { code: 'TAB-05', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '25 mg', strengthAr: '25 ملغ' },
  { code: 'TAB-06', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '40 mg', strengthAr: '40 ملغ' },
  { code: 'TAB-07', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '50 mg', strengthAr: '50 ملغ' },
  { code: 'TAB-08', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '75 mg', strengthAr: '75 ملغ' },
  { code: 'TAB-09', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '100 mg', strengthAr: '100 ملغ' },
  { code: 'TAB-10', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '150 mg', strengthAr: '150 ملغ' },
  { code: 'TAB-11', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '200 mg', strengthAr: '200 ملغ' },
  { code: 'TAB-12', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '250 mg', strengthAr: '250 ملغ' },
  { code: 'TAB-13', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '500 mg', strengthAr: '500 ملغ' },
  { code: 'TAB-14', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '850 mg', strengthAr: '850 ملغ' },
  { code: 'TAB-15', formEn: 'Oral Tablet', formAr: 'قرص فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '1000 mg', strengthAr: '1000 ملغ' },

  { code: 'FCT-01', formEn: 'Film-Coated Tablet', formAr: 'قرص مغلف بالفيلم', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '5 mg', strengthAr: '5 ملغ' },
  { code: 'FCT-02', formEn: 'Film-Coated Tablet', formAr: 'قرص مغلف بالفيلم', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '10 mg', strengthAr: '10 ملغ' },
  { code: 'FCT-03', formEn: 'Film-Coated Tablet', formAr: 'قرص مغلف بالفيلم', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '20 mg', strengthAr: '20 ملغ' },
  { code: 'FCT-04', formEn: 'Film-Coated Tablet', formAr: 'قرص مغلف بالفيلم', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '40 mg', strengthAr: '40 ملغ' },
  { code: 'FCT-05', formEn: 'Film-Coated Tablet', formAr: 'قرص مغلف بالفيلم', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '80 mg', strengthAr: '80 ملغ' },
  { code: 'FCT-06', formEn: 'Film-Coated Tablet', formAr: 'قرص مغلف بالفيلم', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '160 mg', strengthAr: '160 ملغ' },
  { code: 'FCT-07', formEn: 'Film-Coated Tablet', formAr: 'قرص مغلف بالفيلم', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '300 mg', strengthAr: '300 ملغ' },
  { code: 'FCT-08', formEn: 'Film-Coated Tablet', formAr: 'قرص مغلف بالفيلم', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '600 mg', strengthAr: '600 ملغ' },

  { code: 'ERC-01', formEn: 'Extended-Release Capsule', formAr: 'كبسولة ممتدة المفعول', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '15 mg', strengthAr: '15 ملغ' },
  { code: 'ERC-02', formEn: 'Extended-Release Capsule', formAr: 'كبسولة ممتدة المفعول', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '30 mg', strengthAr: '30 ملغ' },
  { code: 'ERC-03', formEn: 'Extended-Release Capsule', formAr: 'كبسولة ممتدة المفعول', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '60 mg', strengthAr: '60 ملغ' },
  { code: 'ERC-04', formEn: 'Extended-Release Capsule', formAr: 'كبسولة ممتدة المفعول', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '120 mg', strengthAr: '120 ملغ' },
  { code: 'ERC-05', formEn: 'Extended-Release Capsule', formAr: 'كبسولة ممتدة المفعول', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '240 mg', strengthAr: '240 ملغ' },
  { code: 'ERC-06', formEn: 'Extended-Release Capsule', formAr: 'كبسولة ممتدة المفعول', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '300 mg', strengthAr: '300 ملغ' },

  { code: 'CAP-01', formEn: 'Hard Gelatin Capsule', formAr: 'كبسولة جيلاتينية صلبة', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '50 mg', strengthAr: '50 ملغ' },
  { code: 'CAP-02', formEn: 'Hard Gelatin Capsule', formAr: 'كبسولة جيلاتينية صلبة', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '100 mg', strengthAr: '100 ملغ' },
  { code: 'CAP-03', formEn: 'Hard Gelatin Capsule', formAr: 'كبسولة جيلاتينية صلبة', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '250 mg', strengthAr: '250 ملغ' },
  { code: 'CAP-04', formEn: 'Hard Gelatin Capsule', formAr: 'كبسولة جيلاتينية صلبة', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '400 mg', strengthAr: '400 ملغ' },
  { code: 'CAP-05', formEn: 'Hard Gelatin Capsule', formAr: 'كبسولة جيلاتينية صلبة', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '500 mg', strengthAr: '500 ملغ' },

  { code: 'ERT-01', formEn: 'Extended-Release Tablet', formAr: 'قرص مديد التحرر', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '25 mg', strengthAr: '25 ملغ' },
  { code: 'ERT-02', formEn: 'Extended-Release Tablet', formAr: 'قرص مديد التحرر', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '50 mg', strengthAr: '50 ملغ' },
  { code: 'ERT-03', formEn: 'Extended-Release Tablet', formAr: 'قرص مديد التحرر', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '100 mg', strengthAr: '100 ملغ' },
  { code: 'ERT-04', formEn: 'Extended-Release Tablet', formAr: 'قرص مديد التحرر', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '500 mg', strengthAr: '500 ملغ' },
  { code: 'ERT-05', formEn: 'Extended-Release Tablet', formAr: 'قرص مديد التحرر', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '750 mg', strengthAr: '750 ملغ' },
  { code: 'ERT-06', formEn: 'Extended-Release Tablet', formAr: 'قرص مديد التحرر', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '1000 mg', strengthAr: '1000 ملغ' },

  { code: 'ODT-01', formEn: 'Orally Disintegrating Tablet', formAr: 'قرص سريع الذوبان فموياً', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '4 mg', strengthAr: '4 ملغ' },
  { code: 'ODT-02', formEn: 'Orally Disintegrating Tablet', formAr: 'قرص سريع الذوبان فموياً', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '8 mg', strengthAr: '8 ملغ' },
  { code: 'ODT-03', formEn: 'Orally Disintegrating Tablet', formAr: 'قرص سريع الذوبان فموياً', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '15 mg', strengthAr: '15 ملغ' },

  { code: 'SYR-01', formEn: 'Oral Suspension', formAr: 'معلق فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '100 mg/5mL', strengthAr: '100 ملغ/5 مل' },
  { code: 'SYR-02', formEn: 'Oral Suspension', formAr: 'معلق فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '125 mg/5mL', strengthAr: '125 ملغ/5 مل' },
  { code: 'SYR-03', formEn: 'Oral Suspension', formAr: 'معلق فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '200 mg/5mL', strengthAr: '200 ملغ/5 مل' },
  { code: 'SYR-04', formEn: 'Oral Suspension', formAr: 'معلق فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '250 mg/5mL', strengthAr: '250 ملغ/5 مل' },
  { code: 'SYR-05', formEn: 'Oral Solution', formAr: 'محلول فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '1 mg/mL', strengthAr: '1 ملغ/مل' },
  { code: 'SYR-06', formEn: 'Oral Solution', formAr: 'محلول فموي', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '5 mg/5mL', strengthAr: '5 ملغ/5 مل' },
  { code: 'SYR-07', formEn: 'Oral Drops', formAr: 'قطرة فموية للأطفال', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '10 mg/mL', strengthAr: '10 ملغ/مل' },

  { code: 'IVV-01', formEn: 'IV Solution Vial', formAr: 'فيال محلول وريدي', routeEn: 'IV', routeAr: 'وريدي', strengthEn: '10 mg/mL', strengthAr: '10 ملغ/مل' },
  { code: 'IVV-02', formEn: 'IV Solution Vial', formAr: 'فيال محلول وريدي', routeEn: 'IV', routeAr: 'وريدي', strengthEn: '25 mg/5mL', strengthAr: '25 ملغ/5 مل' },
  { code: 'IVV-03', formEn: 'IV Solution Vial', formAr: 'فيال محلول وريدي', routeEn: 'IV', routeAr: 'وريدي', strengthEn: '50 mg/10mL', strengthAr: '50 ملغ/10 مل' },
  { code: 'IVV-04', formEn: 'IV Solution Vial', formAr: 'فيال محلول وريدي', routeEn: 'IV', routeAr: 'وريدي', strengthEn: '100 mg/10mL', strengthAr: '100 ملغ/10 مل' },
  { code: 'IVV-05', formEn: 'IV Lyophilized Powder', formAr: 'بودرة مجفدة للحقن الوريدي', routeEn: 'IV', routeAr: 'وريدي', strengthEn: '500 mg', strengthAr: '500 ملغ' },
  { code: 'IVV-06', formEn: 'IV Lyophilized Powder', formAr: 'بودرة مجفدة للحقن الوريدي', routeEn: 'IV', routeAr: 'وريدي', strengthEn: '1 g', strengthAr: '1 غرام' },
  { code: 'IVV-07', formEn: 'IV Lyophilized Powder', formAr: 'بودرة مجفدة للحقن الوريدي', routeEn: 'IV', routeAr: 'وريدي', strengthEn: '2 g', strengthAr: '2 غرام' },
  { code: 'IVB-01', formEn: 'Premixed IV Infusion Bag', formAr: 'كيس تسريب وريدي جاهز', routeEn: 'IV Infusion', routeAr: 'تسريب وريدي', strengthEn: '400 mg/100mL', strengthAr: '400 ملغ/100 مل' },

  { code: 'AMP-01', formEn: 'IM/IV Ampoule', formAr: 'أمبولة عضلي / وريدي', routeEn: 'IM/IV', routeAr: 'عضلي/وريدي', strengthEn: '4 mg/2mL', strengthAr: '4 ملغ/2 مل' },
  { code: 'AMP-02', formEn: 'IM/IV Ampoule', formAr: 'أمبولة عضلي / وريدي', routeEn: 'IM/IV', routeAr: 'عضلي/وريدي', strengthEn: '20 mg/2mL', strengthAr: '20 ملغ/2 مل' },
  { code: 'AMP-03', formEn: 'IM/IV Ampoule', formAr: 'أمبولة عضلي / وريدي', routeEn: 'IM/IV', routeAr: 'عضلي/وريدي', strengthEn: '40 mg/4mL', strengthAr: '40 ملغ/4 مل' },
  { code: 'AMP-04', formEn: 'IM/IV Ampoule', formAr: 'أمبولة عضلي / وريدي', routeEn: 'IM/IV', routeAr: 'عضلي/وريدي', strengthEn: '75 mg/3mL', strengthAr: '75 ملغ/3 مل' },

  { code: 'PFS-01', formEn: 'Pre-filled Syringe', formAr: 'محقنة معبأة مسبقاً', routeEn: 'SC', routeAr: 'تحت الجلد', strengthEn: '20 mg/0.2mL', strengthAr: '20 ملغ/0.2 مل' },
  { code: 'PFS-02', formEn: 'Pre-filled Syringe', formAr: 'محقنة معبأة مسبقاً', routeEn: 'SC', routeAr: 'تحت الجلد', strengthEn: '40 mg/0.4mL', strengthAr: '40 ملغ/0.4 مل' },
  { code: 'PFS-03', formEn: 'Pre-filled Syringe', formAr: 'محقنة معبأة مسبقاً', routeEn: 'SC', routeAr: 'تحت الجلد', strengthEn: '60 mg/0.6mL', strengthAr: '60 ملغ/0.6 مل' },
  { code: 'PFS-04', formEn: 'Pre-filled Pen Injector', formAr: 'قلم حقن مسبق التعبئة', routeEn: 'SC', routeAr: 'تحت الجلد', strengthEn: '100 IU/mL', strengthAr: '100 وحدة/مل' },

  { code: 'INH-01', formEn: 'Metered-Dose Inhaler', formAr: 'بخاخ استنشاق معاير الجرعة', routeEn: 'Inhalation', routeAr: 'استنشاق', strengthEn: '100 mcg/actuation', strengthAr: '100 مكغ/بخة' },
  { code: 'INH-02', formEn: 'Dry Powder Inhaler', formAr: 'بخاخ بودرة جافة للاستنشاق', routeEn: 'Inhalation', routeAr: 'استنشاق', strengthEn: '200 mcg/dose', strengthAr: '200 مكغ/جرعة' },
  { code: 'NEB-01', formEn: 'Nebulizer Solution', formAr: 'محلول استنشاق بالتبخير', routeEn: 'Nebulized', routeAr: 'تبخير', strengthEn: '2.5 mg/2.5mL', strengthAr: '2.5 ملغ/2.5 مل' },

  { code: 'NAS-01', formEn: 'Nasal Spray', formAr: 'بخاخ أنفي', routeEn: 'Nasal', routeAr: 'أنفي', strengthEn: '50 mcg/spray', strengthAr: '50 مكغ/رشة' },
  { code: 'OPH-01', formEn: 'Ophthalmic Drops', formAr: 'قطرة عينية معقمة', routeEn: 'Ophthalmic', routeAr: 'عيني', strengthEn: '0.5% (5 mL)', strengthAr: '0.5% (5 مل)' },
  { code: 'OPH-02', formEn: 'Ophthalmic Ointment', formAr: 'مرهم عيني معقم', routeEn: 'Ophthalmic', routeAr: 'عيني', strengthEn: '0.3% (3.5 g)', strengthAr: '0.3% (3.5 غ)' },
  { code: 'TOP-01', formEn: 'Topical Cream', formAr: 'كريم موضعي', routeEn: 'Topical', routeAr: 'موضعي', strengthEn: '1% (30 g)', strengthAr: '1% (30 غ)' },
  { code: 'TOP-02', formEn: 'Topical Gel', formAr: 'جل موضعي', routeEn: 'Topical', routeAr: 'موضعي', strengthEn: '2.5% (50 g)', strengthAr: '2.5% (50 غ)' },
  { code: 'TOP-03', formEn: 'Topical Ointment', formAr: 'مرهم موضعي', routeEn: 'Topical', routeAr: 'موضعي', strengthEn: '0.1% (30 g)', strengthAr: '0.1% (30 غ)' },
  { code: 'PAT-01', formEn: 'Transdermal Patch', formAr: 'لصقة جلدية ممتدة المفعول', routeEn: 'Transdermal', routeAr: 'عبر الجلد', strengthEn: '5 mg/24h', strengthAr: '5 ملغ/24 ساعة' },
  { code: 'SUP-01', formEn: 'Rectal Suppository', formAr: 'تحميلة شرجية', routeEn: 'Rectal', routeAr: 'شرجي', strengthEn: '50 mg', strengthAr: '50 ملغ' },
  { code: 'SUP-02', formEn: 'Rectal Suppository', formAr: 'تحميلة شرجية', routeEn: 'Rectal', routeAr: 'شرجي', strengthEn: '100 mg', strengthAr: '100 ملغ' },
  { code: 'EFF-01', formEn: 'Effervescent Tablet', formAr: 'قرص فوار', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '600 mg', strengthAr: '600 ملغ' },
  { code: 'SAC-01', formEn: 'Oral Powder Sachet', formAr: 'كيس بودرة فموية', routeEn: 'Oral', routeAr: 'فموي', strengthEn: '3 g', strengthAr: '3 غرام' }
];
