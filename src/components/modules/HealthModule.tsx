import React, { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { Download, HeartPulse, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { MedicalSceneCanvas } from '../three/MedicalSceneCanvas';

interface HealthLogItem {
  id: string;
  logType: 'vital' | 'symptom' | 'medication' | 'appointment';
  label: string;
  value: string;
  unit: string;
  notes: string;
}

export function HealthModule() {
  const { language, user, isGuest, setView, t, reducedMotion } = useApp();
  const isAr = language === 'ar';

  const [logs, setLogs] = useState<HealthLogItem[]>([]);
  const [logType, setLogType] = useState<'vital' | 'symptom' | 'medication' | 'appointment'>('vital');
  const [label, setLabel] = useState('Blood Pressure');
  const [value, setValue] = useState('118/76');
  const [unit, setUnit] = useState('mmHg');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user) {
      setLogs([]);
      return;
    }
    const q = query(
      collection(db, 'health_logs'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLogs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<HealthLogItem, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'health_logs')
    );
    return () => unsub();
  }, [user]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isGuest) return;
    try {
      await addDoc(collection(db, 'health_logs'), {
        userId: user.uid,
        logType,
        label: label.trim().slice(0, 160),
        value: value.trim().slice(0, 160),
        unit: unit.trim().slice(0, 40),
        notes: notes.trim().slice(0, 1000),
        createdAt: serverTimestamp()
      });
      setNotes('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'health_logs');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'health_logs', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `health_logs/${id}`);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), logs }, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mamo-med-health-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 space-y-4">
        <div className="glass-panel rounded-2xl p-4 h-48">
          <MedicalSceneCanvas mode="scanner" reducedMotion={reducedMotion} interactive />
        </div>

        <form onSubmit={handleAddLog} className="glass-panel rounded-2xl p-6 space-y-3.5">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#22D3EE]" />
            <h2 className="font-display text-base font-semibold">
              {isAr ? 'تسجيل مؤشر صحي شخصي' : 'Log Personal Health Entry'}
            </h2>
          </div>

          <select
            value={logType}
            onChange={(e) =>
              setLogType(e.target.value as 'vital' | 'symptom' | 'medication' | 'appointment')
            }
            className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
          >
            <option value="vital">Vital Sign</option>
            <option value="symptom">Symptom</option>
            <option value="medication">Medication</option>
            <option value="appointment">Appointment</option>
          </select>

          <input
            required
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={isAr ? 'المؤشر أو العرض' : 'Metric / Item Label'}
            className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              required
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={isAr ? 'القيمة' : 'Value'}
              className="rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm font-mono-tabular text-[#F4F7FB]"
            />
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder={isAr ? 'الوحدة' : 'Unit'}
              className="rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm font-mono-tabular text-[#F4F7FB]"
            />
          </div>

          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isAr ? 'ملاحظات إضافية' : 'Clinical or personal notes'}
            className="w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
          />

          {isGuest || !user ? (
            <button
              type="button"
              onClick={() => setView('auth')}
              className="btn-3d-primary w-full py-2.5 rounded-xl text-xs font-semibold text-white"
            >
              {t.signInGoogle}
            </button>
          ) : (
            <button
              type="submit"
              className="btn-3d-primary w-full py-2.5 rounded-xl text-xs font-semibold text-white"
            >
              {isAr ? 'حفظ في السجل الصحي' : 'Save Health Entry'}
            </button>
          )}
        </form>
      </div>

      <div className="lg:col-span-7 glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-base font-semibold">
            {isAr ? 'السجل الصحي وتصدير البيانات' : 'Personal Health Timeline & Export'}
          </h3>
          {logs.length > 0 && (
            <button
              type="button"
              onClick={handleExportJson}
              className="btn-3d-secondary px-3 py-1.5 rounded-lg text-xs font-medium text-[#22D3EE] inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير JSON' : 'Export JSON'}</span>
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-[#94A3B8]">
            {isGuest
              ? isAr
                ? 'سجّل الدخول لحفظ مؤشراتك الحيوية وتصدير أو حذف بياناتك الشخصية.'
                : 'Sign in with Google to record your personal vitals, medications, and export or delete your data anytime.'
              : isAr
                ? 'لم تتم إضافة مؤشرات صحية بعد.'
                : 'No health entries logged yet.'}
          </p>
        ) : (
          <div className="space-y-2.5">
            {logs.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-[#040914] border border-white/10 p-4 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="text-xs text-[#22D3EE] uppercase">{item.logType}</div>
                  <div className="text-sm font-semibold text-[#F4F7FB]">
                    {item.label} —{' '}
                    <span className="font-mono-tabular text-[#22D3EE]">
                      {item.value} {item.unit}
                    </span>
                  </div>
                  {item.notes && <p className="text-xs text-[#94A3B8]">{item.notes}</p>}
                </div>
                <button
                  type="button"
                  aria-label="Delete health log"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-[#94A3B8] hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
