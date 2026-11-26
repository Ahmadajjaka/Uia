import React, { useEffect, useRef, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { FileImage, Plus, Send, Sparkles, Stethoscope, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { callAiRouter } from '../../lib/apiClient';
import { db, handleFirestoreError, OperationType, uploadMedicalAsset } from '../../lib/firebase';
import { MedicalSceneCanvas } from '../three/MedicalSceneCanvas';

interface ConversationItem {
  id: string;
  title: string;
  specialty: string;
  provider: 'auto' | 'grok' | 'zai';
  status: 'active' | 'archived';
}

interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  providerUsed: string;
  modelUsed: string;
  hasImage: boolean;
  imageUrl?: string;
}

export function AiDoctorModule() {
  const {
    language,
    user,
    isGuest,
    capabilities,
    reducedMotion,
    theme3d,
    t,
    setView,
    setActiveModule,
    consumeFeature,
    getFeatureGateState
  } = useApp();
  const isAr = language === 'ar';
  const gate = getFeatureGateState('ai_doctor_consult');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [specialty, setSpecialty] = useState('Internal Medicine');
  const [providerMode, setProviderMode] = useState<'auto' | 'grok' | 'zai'>('auto');
  const [overrideModel, setOverrideModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [attachedImage, setAttachedImage] = useState<{ dataUrl: string; file: File } | null>(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ConversationItem, 'id'>)
        }));
        setConversations(list);
        if (!activeConvId && list.length > 0) {
          setActiveConvId(list[0].id);
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'conversations')
    );

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !activeConvId) {
      setMessages([]);
      return;
    }

    const msgQ = query(
      collection(db, 'conversations', activeConvId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(
      msgQ,
      (snap) => {
        setMessages(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ChatMessageItem, 'id'>)
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `conversations/${activeConvId}/messages`)
    );

    return () => unsub();
  }, [user, activeConvId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotice(isAr ? 'يرجى اختيار صورة طبية صالحة.' : 'Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage({ dataUrl: reader.result, file });
        setNotice(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const createNewConversation = async (): Promise<string | null> => {
    if (!user) return null;
    const convId = `conv_${Date.now()}`;
    try {
      await setDoc(doc(db, 'conversations', convId), {
        userId: user.uid,
        title: prompt.trim().slice(0, 60) || `${specialty} Consult`,
        specialty,
        provider: providerMode,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setActiveConvId(convId);
      return convId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `conversations/${convId}`);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !attachedImage) return;
    setNotice(null);

    if (isGuest || !user) {
      setNotice(
        isAr
          ? 'يرجى تسجيل الدخول بحساب Google لتشغيل المحادثة الطبية الذكية وحفظ السجل.'
          : 'Sign in with Google to run server-authenticated AI Doctor queries and save your consultation history.'
      );
      return;
    }

    const charge = await consumeFeature('ai_doctor_consult');
    if (!charge.ok) {
      setNotice(charge.message);
      return;
    }

    setSending(true);
    try {
      const convId = activeConvId || (await createNewConversation());
      if (!convId) return;

      let uploadedUrl = '';
      if (attachedImage) {
        uploadedUrl = (await uploadMedicalAsset(attachedImage.file, 'chat', user.uid)) || '';
      }

      const cleanPrompt =
        prompt.trim() ||
        (isAr
          ? 'حلل هذه الصورة الطبية واذكر الملاحظات السريرية ودرجة عدم اليقين.'
          : 'Analyze this medical image with clinical observations, differential considerations, and uncertainty bounds.');

      // Save user message
      await addDoc(collection(db, 'conversations', convId, 'messages'), {
        userId: user.uid,
        role: 'user',
        content: cleanPrompt,
        providerUsed: providerMode,
        modelUsed: overrideModel || 'router',
        hasImage: Boolean(attachedImage),
        ...(uploadedUrl ? { imageUrl: uploadedUrl } : {}),
        createdAt: serverTimestamp()
      });

      const currentImageDataUrl = attachedImage?.dataUrl;
      setPrompt('');
      setAttachedImage(null);

      const aiRes = await callAiRouter({
        module: 'ai-doctor',
        prompt: cleanPrompt,
        systemPrompt: `Clinical Specialty Focus: ${specialty}. Always provide structured Clinical Assessment, Key References/Guidelines, and Uncertainty Caveats.`,
        imageDataUrl: currentImageDataUrl,
        preferredProvider: providerMode,
        overrideModel: overrideModel || undefined,
        language
      });

      // Log usage telemetry to Firestore
      await addDoc(collection(db, 'ai_usage'), {
        userId: user.uid,
        module: 'ai-doctor',
        provider: aiRes.provider,
        model: aiRes.model,
        status: aiRes.status,
        latencyMs: aiRes.latencyMs,
        createdAt: serverTimestamp()
      }).catch(() => {});

      if (aiRes.status === 'unconfigured' || aiRes.status === 'error') {
        setNotice(aiRes.message || 'AI provider requires configuration.');
      } else if (aiRes.content) {
        await addDoc(collection(db, 'conversations', convId, 'messages'), {
          userId: user.uid,
          role: 'assistant',
          content: aiRes.content,
          providerUsed: aiRes.provider,
          modelUsed: aiRes.model,
          hasImage: false,
          createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, 'conversations', convId), {
          updatedAt: serverTimestamp()
        }).catch(() => {});
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Unable to complete AI consultation.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      {/* Case Organizer & History Rail */}
      <aside className="lg:col-span-4 space-y-4">
        <div className="glass-panel rounded-2xl p-4 space-y-4">
          <div className="h-36 rounded-xl overflow-hidden bg-[#040914] border border-white/10">
            <MedicalSceneCanvas mode="brain" theme3d={theme3d} reducedMotion={reducedMotion} interactive />
          </div>

          <div className="space-y-3">
            <label className="block text-xs text-[#94A3B8]">
              {isAr ? 'الاختصاص السريري' : 'Clinical Specialty'}
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
              >
                <option value="Internal Medicine">Internal Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pulmonology">Pulmonology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
              </select>
            </label>

            <label className="block text-xs text-[#94A3B8]">
              {isAr ? 'موجّه الذكاء الاصطناعي' : 'AI Router Selection'}
              <select
                value={providerMode}
                onChange={(e) => {
                  setProviderMode(e.target.value as 'auto' | 'grok' | 'zai');
                  setOverrideModel('');
                }}
                className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
              >
                <option value="auto">
                  {isAr ? 'تلقائي (Groq للنص · Z.AI للصور)' : 'Smart Auto (Groq GPT-OSS-120B Text · Z.AI Vision)'}
                </option>
                <option value="grok">Groq Cloud (GPT-OSS-120B) / xAI</option>
                <option value="zai">Z.AI GLM Vision</option>
              </select>
            </label>

            {providerMode !== 'auto' && (
              <label className="block text-xs text-[#94A3B8]">
                {isAr ? 'تحديد النموذج يدوياً' : 'Manual Model'}
                <select
                  value={overrideModel}
                  onChange={(e) => setOverrideModel(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#040914] border border-white/15 px-3 py-2 text-sm text-[#F4F7FB]"
                >
                  <option value="">{isAr ? 'الافتراضي' : 'Server Default'}</option>
                  {(providerMode === 'grok'
                    ? capabilities?.grokModels || [
                        'openai/gpt-oss-120b',
                        'openai/gpt-oss-20b',
                        'llama-3.3-70b-versatile',
                        'meta-llama/llama-4-scout-17b-16e-instruct',
                        'grok-4.7'
                      ]
                    : capabilities?.zaiModels || ['glm-4.5v', 'glm-4.6v']
                  ).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>

        {/* Conversation History */}
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-[#F4F7FB]">
              {isAr ? 'سجل الاستشارات' : 'Consult History'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setActiveConvId(null);
                setMessages([]);
              }}
              className="inline-flex items-center gap-1 text-xs text-[#22D3EE] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'جديد' : 'New'}</span>
            </button>
          </div>

          {conversations.length === 0 ? (
            <p className="text-xs text-[#94A3B8]">
              {isGuest
                ? isAr
                  ? 'سجّل الدخول لحفظ سجل المحادثات الطبية.'
                  : 'Sign in to view and store persisted consult threads.'
                : isAr
                  ? 'لا توجد استشارات محفوظة بعد.'
                  : 'No saved consults yet. Start a clinical case on the right.'}
            </p>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveConvId(c.id)}
                  className={`w-full text-start px-3 py-2 rounded-xl text-xs transition-colors ${
                    activeConvId === c.id
                      ? 'bg-[#1D6FEB]/25 border border-[#22D3EE]/35 text-[#F4F7FB]'
                      : 'bg-white/4 text-[#94A3B8] hover:text-[#F4F7FB]'
                  }`}
                >
                  <div className="font-medium truncate">{c.title}</div>
                  <div className="text-[11px] opacity-75">{c.specialty}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Clinical Chat Canvas */}
      <section className="lg:col-span-8 glass-panel rounded-2xl flex flex-col min-h-[620px] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Stethoscope className="w-5 h-5 text-[#22D3EE]" />
            <div>
              <h2 className="font-display text-base font-semibold text-[#F4F7FB]">
                {isAr ? 'الطبيب الذكي — مساعد القرار السريري' : 'AI Doctor — Clinical Consultation'}
              </h2>
              <p className="text-xs text-[#94A3B8]">
                {specialty} · {providerMode === 'auto' ? 'Groq + Z.AI Vision Router' : providerMode === 'grok' ? 'GROQ / xAI' : 'ZAI'}
              </p>
            </div>
          </div>
          {isGuest && (
            <button
              type="button"
              onClick={() => setView('auth')}
              className="btn-3d-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white"
            >
              {t.signInGoogle}
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="rounded-2xl bg-[#040914] border border-white/10 p-6 space-y-3">
              <p className="text-sm font-medium text-[#F4F7FB]">
                {isAr
                  ? 'ابدأ حالة سريرية أو ارفع صورة أشعة أو تحليل مختبر'
                  : 'Present a clinical vignette or attach a radiology/lab image'}
              </p>
              <p className="text-xs text-[#94A3B8] leading-relaxed">{t.medicalDisclaimer}</p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#1D6FEB]/25 border border-[#1D6FEB]/40 text-[#F4F7FB]'
                    : 'bg-[#040914] border border-white/10 text-[#E2E8F0]'
                }`}
              >
                <div className="flex items-center gap-2 text-[11px] font-mono-tabular text-[#94A3B8]">
                  <span>{msg.role === 'user' ? (isAr ? 'الطبيب / المستخدم' : 'Clinician') : 'MAMO MED AI'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{msg.providerUsed}</span>
                  <span aria-hidden="true">·</span>
                  <span>{msg.modelUsed}</span>
                </div>
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Attached medical visual"
                    referrerPolicy="no-referrer"
                    className="max-h-56 rounded-xl border border-white/10 object-contain"
                  />
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {sending && (
            <div className="rounded-2xl bg-[#040914] border border-[#22D3EE]/30 p-4 ai-wave-shimmer">
              <div className="flex items-center gap-2 text-xs text-[#22D3EE] font-medium">
                <Sparkles className="w-4 h-4" />
                <span>
                  {isAr
                    ? 'جاري التحليل الطبي وتقييم المراجع ودرجة عدم اليقين…'
                    : 'Synthesizing clinical reasoning, uncertainty bounds, and references…'}
                </span>
              </div>
            </div>
          )}

          {notice && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-400/30 p-4 text-xs text-amber-200 flex items-center justify-between gap-3 leading-relaxed">
              <span>{notice}</span>
              {!isGuest && user && (
                <button
                  type="button"
                  onClick={() => setActiveModule('wallet')}
                  className="text-amber-300 font-semibold hover:underline shrink-0"
                >
                  {isAr ? 'المحفظة وبرو' : 'Wallet & Pro'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Input Composer */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-[#070E1C] space-y-3">
          {attachedImage && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#040914] border border-[#22D3EE]/30 p-2.5">
              <div className="flex items-center gap-3">
                <img
                  src={attachedImage.dataUrl}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="text-xs">
                  <div className="text-[#F4F7FB] font-medium">{attachedImage.file.name}</div>
                  <div className="text-[#22D3EE]">
                    {isAr ? 'سيتم التحليل عبر Z.AI GLM Vision' : 'Routed to Z.AI GLM Vision'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1.5 text-[#94A3B8] hover:text-rose-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title={isAr ? 'إرفاق صورة طبية' : 'Attach medical image'}
              className="btn-3d-secondary p-3 rounded-xl text-[#94A3B8] hover:text-[#22D3EE] shrink-0"
            >
              <FileImage className="w-4 h-4" />
            </button>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isAr
                  ? 'اكتب الأعراض أو السؤال الطبي أو أرفق صورة أشعة/تحليل…'
                  : 'Enter clinical presentation, question, or attach a medical scan…'
              }
              className="flex-1 rounded-xl bg-[#040914] border border-white/15 px-4 py-2.5 text-sm text-[#F4F7FB] placeholder:text-[#94A3B8]/60 resize-none focus:outline-none focus:border-[#22D3EE]/50"
            />
            <button
              type="submit"
              disabled={sending}
              title={
                gate.cost > 0
                  ? isAr
                    ? `التكلفة: ${gate.cost} نقطة`
                    : `Cost: ${gate.cost} pts`
                  : undefined
              }
              className="btn-3d-primary px-3.5 py-3 rounded-xl text-white shrink-0 disabled:opacity-60 inline-flex items-center gap-1.5 text-xs font-mono-tabular"
            >
              <Send className="w-4 h-4" />
              {gate.cost > 0 && <span>{gate.cost} pts</span>}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
