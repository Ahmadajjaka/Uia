import React, { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { Building2, Calendar, FileText, UserPlus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';

interface PatientItem {
  id: string;
  fullName: string;
  mrn: string;
  age: number;
  sex: 'Female' | 'Male' | 'Other';
  primaryCondition: string;
  allergies: string;
  status: 'active' | 'discharged';
}

interface VisitItem {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  visitType: 'Consultation' | 'Follow-up' | 'Urgent' | 'Telehealth';
  soapNote: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface ReportItem {
  id: string;
  patientId: string;
  title: string;
  content: string;
}

export function ClinicModule() {
  const {
    language,
    user,
    isGuest,
    setView,
    setActiveModule,
    consumeFeature,
    getFeatureGateState,
    t
  } = useApp();
  const isAr = language === 'ar';
  const gate = getFeatureGateState('clinic_suite');

  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [activeTab, setActiveTab] = useState<'patients' | 'visits' | 'reports'>('patients');

  // New Patient Form
  const [fullName, setFullName] = useState('');
  const [mrn, setMrn] = useState('');
  const [age, setAge] = useState('38');
  const [sex, setSex] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [primaryCondition, setPrimaryCondition] = useState('');
  const [allergies, setAllergies] = useState('NKDA');

  // New Visit Form
  const [visitPatientId, setVisitPatientId] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [visitType, setVisitType] = useState<'Consultation' | 'Follow-up' | 'Urgent' | 'Telehealth'>('Consultation');
  const [soapNote, setSoapNote] = useState('');

  // New Report Form
  const [reportPatientId, setReportPatientId] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPatients([]);
      setVisits([]);
      setReports([]);
      return;
    }

    const pUnsub = onSnapshot(
      query(collection(db, 'patient_records'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PatientItem, 'id'>) }));
        setPatients(list);
        if (list.length > 0 && !visitPatientId) setVisitPatientId(list[0].id);
        if (list.length > 0 && !reportPatientId) setReportPatientId(list[0].id);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'patient_records')
    );

    const vUnsub = onSnapshot(
      query(collection(db, 'patient_visits'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')),
      (snap) => {
        setVisits(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VisitItem, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'patient_visits')
    );

    const rUnsub = onSnapshot(
      query(collection(db, 'medical_reports'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')),
      (snap) => {
        setReports(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReportItem, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'medical_reports')
    );

    return () => {
      pUnsub();
      vUnsub();
      rUnsub();
    };
  }, [user]);

  const createPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isGuest) {
      setNotice(isAr ? 'سجّل الدخول لإضافة مرضى إلى سجل العيادة.' : 'Sign in with Google to save clinic patient records.');
      return;
    }
    setNotice(null);
    const charge = await consumeFeature('clinic_suite');
    if (!charge.ok) {
      setNotice(charge.message);
      return;
    }
    try {
      await addDoc(collection(db, 'patient_records'), {
        userId: user.uid,
        fullName: fullName.trim().slice(0, 160),
        mrn: (mrn.trim() || `MRN-${Date.now().toString().slice(-6)}`).slice(0, 64),
        age: Math.min(130, Math.max(0, Number(age) || 30)),
        sex,
        primaryCondition: primaryCondition.trim().slice(0, 240),
        allergies: allergies.trim().slice(0, 400) || 'NKDA',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setFullName('');
      setMrn('');
      setPrimaryCondition('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'patient_records');
    }
  };

  const createVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isGuest || !visitPatientId) return;
    const p = patients.find((x) => x.id === visitPatientId);
    if (!p) return;
    setNotice(null);
    const charge = await consumeFeature('clinic_suite');
    if (!charge.ok) {
      setNotice(charge.message);
      return;
    }
    try {
      await addDoc(collection(db, 'patient_visits'), {
        userId: user.uid,
        patientId: p.id,
        patientName: p.fullName,
        visitDate,
        visitType,
        soapNote: soapNote.trim().slice(0, 10000),
        status: 'scheduled',
        createdAt: serverTimestamp()
      });
      setSoapNote('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'patient_visits');
    }
  };

  const markVisitCompleted = async (visitId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'patient_visits', visitId), { status: 'completed' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `patient_visits/${visitId}`);
    }
  };

  const createReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isGuest || !reportPatientId) return;
    setNotice(null);
    const charge = await consumeFeature('clinic_suite');
    if (!charge.ok) {
      setNotice(charge.message);
      return;
    }
    try {
      await addDoc(collection(db, 'medical_reports'), {
        userId: user.uid,
        patientId: reportPatientId,
        title: reportTitle.trim().slice(0, 200),
        content: reportContent.trim().slice(0, 16000),
        createdAt: serverTimestamp()
      });
      setReportTitle('');
      setReportContent('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'medical_reports');
    }
  };

  if (isGuest || !user) {
    return (
      <div className="glass-panel rounded-2xl p-8 max-w-2xl space-y-4">
        <div className="flex items-center gap-3 text-[#22D3EE]">
          <Building2 className="w-6 h-6" />
          <h2 className="font-display text-xl font-bold text-[#F4F7FB]">
            {isAr ? 'إدارة العيادات والسجلات الطبية' : 'Clinic EHR & Patient Management'}
          </h2>
        </div>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          {isAr
            ? 'لحماية سرية سجلات المرضى، يتطلب إنشاء وعرض ملفات المرضى والمواعيد والتقارير تسجيل الدخول بحساب Google الموثق.'
            : 'To protect patient privacy under strict owner-isolated Firestore rules, clinic patient registries, appointments, and SOAP notes require verified Google Sign-In.'}
        </p>
        <button
          type="button"
          onClick={() => setView('auth')}
          className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white"
        >
          {t.signInGoogle}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#070E1C] border border-white/10">
          {(
            [
              { id: 'patients', icon: UserPlus, en: `Patients (${patients.length})`, ar: `المرضى (${patients.length})` },
              { id: 'visits', icon: Calendar, en: `Visits (${visits.length})`, ar: `الزيارات (${visits.length})` },
              { id: 'reports', icon: FileText, en: `Reports (${reports.length})`, ar: `التقارير (${reports.length})` }
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-2 ${
                  activeTab === item.id ? 'bg-[#1D6FEB] text-white' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? item.ar : item.en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {gate.lockedByPro && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-400/35 p-4 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-3">
          <span>
            {isAr
              ? 'إدارة العيادات وسجلات المرضى ميزة مخصصة لأعضاء PRO. يمكنك طلب الترقية من المحفظة.'
              : 'Clinic EHR & Patient Operations requires a PRO membership. Request PRO access in Wallet & Pro.'}
          </span>
          <button
            type="button"
            onClick={() => setActiveModule('wallet')}
            className="btn-3d-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
          >
            {isAr ? 'ترقية إلى PRO' : 'Upgrade to PRO'}
          </button>
        </div>
      )}

      {notice && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-3 text-xs text-amber-200 flex items-center justify-between gap-3">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setActiveModule('wallet')}
            className="text-amber-300 font-semibold hover:underline shrink-0"
          >
            {isAr ? 'المحفظة وبرو' : 'Wallet & Pro'}
          </button>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form onSubmit={createPatient} className="lg:col-span-4 glass-panel rounded-2xl p-6 space-y-3.5">
            <h3 className="font-display text-base font-semibold">
              {isAr ? 'إضافة سجل مريض' : 'Register Patient Record'}
            </h3>
            <input
              required
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isAr ? 'الاسم الكامل' : 'Patient Full Name'}
              className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={mrn}
                onChange={(e) => setMrn(e.target.value)}
                placeholder="MRN"
                className="rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs font-mono-tabular text-[#F4F7FB]"
              />
              <input
                required
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
                className="rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs font-mono-tabular text-[#F4F7FB]"
              />
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'Female' | 'Male' | 'Other')}
                className="rounded-xl bg-[#040914] border border-white/15 px-2 py-2 text-xs text-[#F4F7FB]"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <input
              required
              type="text"
              value={primaryCondition}
              onChange={(e) => setPrimaryCondition(e.target.value)}
              placeholder={isAr ? 'الحالة الأساسية' : 'Primary Condition'}
              className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            />
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder={isAr ? 'الحساسيات الدوائية' : 'Allergies'}
              className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            />
            <button type="submit" className="btn-3d-primary w-full py-2.5 rounded-xl text-xs font-semibold text-white">
              {isAr ? 'حفظ المريض' : 'Save Patient'}
            </button>
          </form>

          <div className="lg:col-span-8 glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="font-display text-base font-semibold">
              {isAr ? 'سجل مرضى العيادة' : 'Clinic Patient Directory'}
            </h3>
            {patients.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">
                {isAr ? 'لا يوجد مرضى مسجلون بعد.' : 'No patients registered yet.'}
              </p>
            ) : (
              <div className="divide-y divide-white/10">
                {patients.map((p) => (
                  <div key={p.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#F4F7FB]">{p.fullName}</div>
                      <div className="text-xs font-mono-tabular text-[#94A3B8]">
                        {p.mrn} · {p.age}y · {p.sex} · {p.primaryCondition}
                      </div>
                    </div>
                    <div className="text-xs text-[#22D3EE]">
                      {p.allergies} · {p.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'visits' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form onSubmit={createVisit} className="lg:col-span-4 glass-panel rounded-2xl p-6 space-y-3.5">
            <h3 className="font-display text-base font-semibold">
              {isAr ? 'جدولة زيارة أو توثيق SOAP' : 'Schedule Visit & SOAP Note'}
            </h3>
            <select
              required
              value={visitPatientId}
              onChange={(e) => setVisitPatientId(e.target.value)}
              className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            >
              <option value="">{isAr ? 'اختر المريض' : 'Select Patient'}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.mrn})
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs font-mono-tabular text-[#F4F7FB]"
              />
              <select
                value={visitType}
                onChange={(e) =>
                  setVisitType(e.target.value as 'Consultation' | 'Follow-up' | 'Urgent' | 'Telehealth')
                }
                className="rounded-xl bg-[#040914] border border-white/15 px-2 py-2 text-xs text-[#F4F7FB]"
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Urgent">Urgent</option>
                <option value="Telehealth">Telehealth</option>
              </select>
            </div>
            <textarea
              rows={4}
              value={soapNote}
              onChange={(e) => setSoapNote(e.target.value)}
              placeholder="S / O / A / P clinical notes…"
              className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            />
            <button
              type="submit"
              disabled={!visitPatientId}
              className="btn-3d-primary w-full py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
            >
              {isAr ? 'حفظ الزيارة' : 'Save Visit'}
            </button>
          </form>

          <div className="lg:col-span-8 glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="font-display text-base font-semibold">
              {isAr ? 'المواعيد والزيارات' : 'Clinic Encounters'}
            </h3>
            {visits.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">
                {isAr ? 'لا توجد زيارات مسجلة.' : 'No encounters recorded yet.'}
              </p>
            ) : (
              <div className="space-y-3">
                {visits.map((v) => (
                  <div key={v.id} className="rounded-xl bg-[#040914] border border-white/10 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-[#F4F7FB]">
                        {v.patientName} · {v.visitType}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono-tabular">
                        <span className="text-[#94A3B8]">{v.visitDate}</span>
                        <span className={v.status === 'completed' ? 'text-emerald-400' : 'text-[#22D3EE]'}>
                          {v.status}
                        </span>
                        {v.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => markVisitCompleted(v.id)}
                            className="text-emerald-300 hover:underline"
                          >
                            {isAr ? 'إتمام' : 'Complete'}
                          </button>
                        )}
                      </div>
                    </div>
                    {v.soapNote && <p className="text-xs text-[#CBD5E1] whitespace-pre-wrap">{v.soapNote}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <form onSubmit={createReport} className="lg:col-span-4 glass-panel rounded-2xl p-6 space-y-3.5">
            <h3 className="font-display text-base font-semibold">
              {isAr ? 'إنشاء تقرير طبي' : 'Create Medical Report'}
            </h3>
            <select
              required
              value={reportPatientId}
              onChange={(e) => setReportPatientId(e.target.value)}
              className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            >
              <option value="">{isAr ? 'اختر المريض' : 'Select Patient'}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>
            <input
              required
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder={isAr ? 'عنوان التقرير' : 'Report Title'}
              className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            />
            <textarea
              required
              rows={5}
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              placeholder={isAr ? 'محتوى التقرير الطبي والتوصيات…' : 'Clinical summary and follow-up plan…'}
              className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
            />
            <button
              type="submit"
              disabled={!reportPatientId}
              className="btn-3d-primary w-full py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
            >
              {isAr ? 'حفظ التقرير' : 'Save Report'}
            </button>
          </form>

          <div className="lg:col-span-8 glass-panel rounded-2xl p-6 space-y-3">
            <h3 className="font-display text-base font-semibold">
              {isAr ? 'التقارير الطبية المحفوظة' : 'Persisted Medical Reports'}
            </h3>
            {reports.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">
                {isAr ? 'لا توجد تقارير محفوظة بعد.' : 'No medical reports generated yet.'}
              </p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="rounded-xl bg-[#040914] border border-white/10 p-4 space-y-1.5">
                    <div className="text-sm font-semibold text-[#F4F7FB]">{r.title}</div>
                    <p className="text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed">{r.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
