import { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { BookOpen, CheckCircle2, RotateCw, XCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import {
  MED_SCHOOL_CASES,
  MED_SCHOOL_FLASHCARDS,
  MED_SCHOOL_MCQS
} from '../../data/medicalCatalog';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';

export function MedSchoolModule() {
  const { language, user } = useApp();
  const isAr = language === 'ar';

  const [tab, setTab] = useState<'mcq' | 'cases' | 'flashcards'>('mcq');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [progressLogs, setProgressLogs] = useState<Array<{ itemId: string; isCorrect: boolean }>>([]);

  useEffect(() => {
    if (!user) {
      setProgressLogs([]);
      return;
    }
    const q = query(
      collection(db, 'medschool_progress'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setProgressLogs(
          snap.docs.map((d) => ({
            itemId: d.data().itemId as string,
            isCorrect: Boolean(d.data().isCorrect)
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'medschool_progress')
    );
    return () => unsub();
  }, [user]);

  const specialties = ['All', 'Cardiology', 'Neurology', 'Pulmonology', 'Endocrinology', 'Pharmacology'];

  const handleSelectMcq = async (mcqId: string, specialty: string, chosenIdx: number, correctIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [mcqId]: chosenIdx }));
    if (user) {
      try {
        await addDoc(collection(db, 'medschool_progress'), {
          userId: user.uid,
          specialty,
          itemId: mcqId,
          itemType: 'mcq',
          isCorrect: chosenIdx === correctIdx,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'medschool_progress');
      }
    }
  };

  const correctCount = progressLogs.filter((p) => p.isCorrect).length;

  return (
    <div className="space-y-6">
      {/* Header + Student Progress */}
      <div className="glass-panel rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-[#22D3EE]" />
          <div>
            <h2 className="font-display text-lg font-semibold">
              {isAr ? 'أكاديمية كلية الطب التفاعلية' : 'Med School Interactive Academy'}
            </h2>
            <p className="text-xs text-[#94A3B8]">
              {isAr
                ? 'اختبارات MCQ، حالات سريرية، وبطاقات مراجعة مصنفة حسب الاختصاص'
                : 'Specialty MCQs, clinical case vignettes, and active-recall flashcards'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs font-mono-tabular">
          <div>
            <span className="text-[#94A3B8]">{isAr ? 'المحاولات المسجلة: ' : 'Logged Attempts: '}</span>
            <span className="text-[#F4F7FB] font-bold">{progressLogs.length}</span>
          </div>
          <div>
            <span className="text-[#94A3B8]">{isAr ? 'الإجابات الصحيحة: ' : 'Correct: '}</span>
            <span className="text-[#22D3EE] font-bold">{correctCount}</span>
          </div>
        </div>
      </div>

      {/* Mode Tabs + Specialty Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#070E1C] border border-white/10">
          {(
            [
              { id: 'mcq', en: 'MCQ Bank', ar: 'اختبارات MCQ' },
              { id: 'cases', en: 'Clinical Cases', ar: 'حالات سريرية' },
              { id: 'flashcards', en: 'Flashcards', ar: 'بطاقات مراجعة' }
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                tab === item.id ? 'bg-[#1D6FEB] text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {isAr ? item.ar : item.en}
            </button>
          ))}
        </div>

        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          className="rounded-xl bg-[#070E1C] border border-white/15 px-3 py-2 text-xs text-[#F4F7FB]"
        >
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Content */}
      {tab === 'mcq' && (
        <div className="space-y-4">
          {MED_SCHOOL_MCQS.filter(
            (q) => specialtyFilter === 'All' || q.specialty === specialtyFilter
          ).map((q) => {
            const chosen = selectedAnswers[q.id];
            const answered = typeof chosen === 'number';
            return (
              <div key={q.id} className="glass-panel rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>
                    {q.specialty} · {q.difficulty}
                  </span>
                  <span className="font-mono-tabular">{q.reference}</span>
                </div>
                <p className="text-sm sm:text-base text-[#F4F7FB] leading-relaxed">{q.stem}</p>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, idx) => {
                    const isSelected = chosen === idx;
                    const isCorrect = idx === q.correctIndex;
                    let cls = 'border-white/10 bg-[#040914] text-[#CBD5E1] hover:border-white/25';
                    if (answered) {
                      if (isCorrect) cls = 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100';
                      else if (isSelected) cls = 'border-rose-400/50 bg-rose-500/15 text-rose-100';
                    }
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectMcq(q.id, q.specialty, idx, q.correctIndex)}
                        className={`text-start rounded-xl border px-4 py-3 text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors ${cls}`}
                      >
                        <span>{opt}</span>
                        {answered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {answered && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div className="rounded-xl bg-[#040914] border border-[#22D3EE]/25 p-4 text-xs text-[#CBD5E1] leading-relaxed">
                    <strong className="text-[#22D3EE]">Explanation: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'cases' && (
        <div className="grid md:grid-cols-2 gap-5">
          {MED_SCHOOL_CASES.filter(
            (c) => specialtyFilter === 'All' || c.specialty.includes(specialtyFilter)
          ).map((c) => (
            <div key={c.id} className="glass-panel rounded-2xl p-6 space-y-3">
              <div className="text-xs text-[#22D3EE]">
                {c.specialty} · {c.difficulty}
              </div>
              <h3 className="font-display text-lg font-semibold text-[#F4F7FB]">{c.title}</h3>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">{c.vignette}</p>
              <div className="rounded-xl bg-[#040914] border border-white/10 p-3 text-xs font-mono-tabular text-[#94A3B8]">
                {c.vitals}
              </div>
              <div className="text-xs text-[#CBD5E1] space-y-1 pt-2 border-t border-white/10">
                <div>
                  <strong className="text-[#F4F7FB]">Key Finding: </strong>
                  {c.keyFinding}
                </div>
                <div>
                  <strong className="text-[#22D3EE]">Management Pearl: </strong>
                  {c.managementPearl}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'flashcards' && (
        <div className="grid md:grid-cols-3 gap-5">
          {MED_SCHOOL_FLASHCARDS.filter(
            (f) => specialtyFilter === 'All' || f.specialty === specialtyFilter
          ).map((fc) => {
            const flipped = Boolean(flippedCards[fc.id]);
            return (
              <button
                key={fc.id}
                type="button"
                onClick={() => setFlippedCards((prev) => ({ ...prev, [fc.id]: !prev[fc.id] }))}
                className="glass-panel-interactive rounded-2xl p-6 min-h-[210px] text-start flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between text-xs text-[#22D3EE]">
                  <span>{fc.specialty}</span>
                  <RotateCw className="w-3.5 h-3.5" />
                </div>
                <div className="text-sm text-[#F4F7FB] leading-relaxed">
                  {flipped ? fc.back : fc.front}
                </div>
                <div className="text-[11px] text-[#94A3B8]">
                  {flipped ? (isAr ? 'الإجابة — اضغط للقلب' : 'Answer · Click to flip') : isAr ? 'اضغط لعرض الإجابة' : 'Click to reveal answer'}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
