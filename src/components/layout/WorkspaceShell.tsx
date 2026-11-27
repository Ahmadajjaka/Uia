import React, { useState } from 'react';
import {
  Activity,
  BookOpen,
  Brain,
  Building2,
  Check,
  Coins,
  Copy,
  Crown,
  FlaskConical,
  Globe,
  HeartPulse,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Microscope,
  Palette,
  Pill,
  Scan,
  Shield,
  SlidersHorizontal,
  Stethoscope,
  UserPlus,
  Wallet,
  X
} from 'lucide-react';
import { useApp, type MedicalModuleId } from '../../contexts/AppContext';
import { THEME_3D_LIST, type Theme3dId } from '../../lib/themes3d';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface NavEntry {
  id: MedicalModuleId;
  icon: typeof LayoutDashboard;
}

const BASE_NAV: NavEntry[] = [
  { id: 'ai-doctor', icon: Stethoscope },
  { id: 'diagnosis', icon: Brain },
  { id: 'lab-analyzer', icon: FlaskConical },
  { id: 'radiology', icon: Scan },
  { id: 'echo-training', icon: Activity },
  { id: 'medical-images', icon: Images },
  { id: 'pharma', icon: Pill },
  { id: 'med-school', icon: BookOpen },
  { id: 'clinic', icon: Building2 },
  { id: 'health', icon: HeartPulse },
  { id: 'clinical', icon: Microscope },
  { id: 'referrals', icon: UserPlus },
  { id: 'wallet', icon: Wallet }
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const {
    language,
    toggleLanguage,
    t,
    reducedMotion,
    setReducedMotion,
    theme3d,
    selectTheme3d,
    activeModule,
    setActiveModule,
    user,
    userProfile,
    walletId,
    planTier,
    pointsBalance,
    isGuest,
    isFounder,
    setView,
    signOutUser
  } = useApp();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [themeNotice, setThemeNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const isAr = language === 'ar';

  const navItems: NavEntry[] = isFounder
    ? [{ id: 'dashboard', icon: LayoutDashboard }, ...BASE_NAV, { id: 'admin', icon: Shield }]
    : BASE_NAV;

  const mobileBottomIds: MedicalModuleId[] = isFounder
    ? ['dashboard', 'ai-doctor', 'echo-training', 'medical-images', 'wallet']
    : ['ai-doctor', 'echo-training', 'medical-images', 'referrals', 'wallet'];

  const selectModule = (id: MedicalModuleId) => {
    setActiveModule(id);
    setMobileDrawerOpen(false);
  };

  const handleThemeChange = (nextId: Theme3dId) => {
    const res = selectTheme3d(nextId);
    if (!res.ok && res.message) {
      setThemeNotice(res.message);
    } else {
      setThemeNotice(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-midnight)] text-[var(--pearl-white)] flex flex-col lg:flex-row">
      {/* Desktop Sidebar (260px) */}
      <aside className="hidden lg:flex lg:w-[260px] lg:shrink-0 lg:flex-col border-e border-white/10 bg-[var(--bg-abyss)]">
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
          <button
            type="button"
            onClick={() => setView(user ? 'app' : 'landing')}
            className="font-display text-base font-bold tracking-tight text-[var(--pearl-white)] whitespace-nowrap"
          >
            MAMO MED AI
          </button>
          {planTier === 'pro' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono-tabular font-bold text-amber-300">
              <Crown className="w-3 h-3" />
              <span>PRO</span>
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeModule === item.id;
            const label = t.workspaceModules[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectModule(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-white/10 text-[var(--pearl-white)] border border-[var(--border-cyan)]'
                    : 'text-[var(--titanium-silver)] hover:text-[var(--pearl-white)] hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[var(--electric-cyan)]' : ''}`} />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3 text-xs">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-[var(--pearl-white)] truncate">
                  {userProfile?.displayName || user.displayName || user.email}
                </div>
                <button
                  type="button"
                  onClick={() => selectModule('wallet')}
                  className="font-mono-tabular text-[11px] font-semibold text-[var(--electric-cyan)] hover:underline shrink-0"
                >
                  {isFounder ? '∞ pts' : `${pointsBalance} pts`}
                </button>
              </div>
              <div className="text-[var(--titanium-silver)] truncate">
                {isFounder
                  ? isAr
                    ? 'المؤسس · Super Admin'
                    : 'Founder · Super Admin'
                  : `${planTier === 'pro' ? 'PRO · ' : ''}${user.email}`}
              </div>
              {walletId && (
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(walletId).then(() => {
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 1600);
                    });
                  }}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-black/25 border border-white/10 font-mono-tabular text-[11px] text-[var(--titanium-silver)] hover:text-[var(--pearl-white)]"
                >
                  <span className="truncate">ID: {walletId}</span>
                  {copiedId ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-3 h-3 shrink-0" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={signOutUser}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--titanium-silver)] hover:text-[var(--pearl-white)] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.signOut}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[var(--titanium-silver)]">{t.guestModeTitle}</div>
              <button
                type="button"
                onClick={() => setView('auth')}
                className="btn-3d-primary w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-white"
              >
                {t.signInGoogle}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Workspace Header */}
        <header className="h-16 px-4 sm:px-6 border-b border-white/10 bg-[var(--bg-abyss)]/90 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-white/10 text-[var(--titanium-silver)] hover:text-[var(--pearl-white)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-[var(--titanium-silver)] hidden sm:inline whitespace-nowrap">MAMO MED AI</span>
              <span className="text-[var(--titanium-silver)] hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-display font-semibold text-[var(--pearl-white)] truncate">
                {t.workspaceModules[activeModule]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {user && (
              <button
                type="button"
                onClick={() => selectModule('wallet')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono-tabular font-semibold text-[var(--electric-cyan)] hover:bg-white/5 whitespace-nowrap"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>{isFounder ? '∞' : `${pointsBalance} ${isAr ? 'نقطة' : 'pts'}`}</span>
                {planTier === 'pro' && <Crown className="w-3 h-3 text-amber-300" />}
              </button>
            )}

            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 text-xs">
              <Palette className="w-3.5 h-3.5 text-[var(--electric-cyan)]" />
              <select
                aria-label="Select 3D Theme"
                value={theme3d}
                onChange={(e) => handleThemeChange(e.target.value as Theme3dId)}
                className="bg-transparent text-xs text-[var(--pearl-white)] focus:outline-none cursor-pointer"
              >
                {THEME_3D_LIST.map((thm) => (
                  <option key={thm.id} value={thm.id} className="bg-[#081122] text-white">
                    {isAr ? thm.nameAr : thm.nameEn}
                    {thm.premium ? ' (PRO)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setReducedMotion(!reducedMotion)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-[var(--titanium-silver)] hover:text-[var(--pearl-white)] whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{reducedMotion ? t.reduceMotionOn : t.reduceMotionOff}</span>
            </button>

            <PWAInstallButton variant="compact" />

            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-[var(--electric-cyan)] hover:bg-white/5 whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.languageLabel}</span>
            </button>

            {isGuest && (
              <button
                type="button"
                onClick={() => setView('auth')}
                className="btn-3d-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap"
              >
                {t.signInGoogle}
              </button>
            )}
          </div>
        </header>

        {themeNotice && (
          <div className="bg-amber-500/10 border-b border-amber-400/30 px-4 sm:px-6 py-2 text-xs text-amber-200 flex items-center justify-between gap-2">
            <span>{themeNotice}</span>
            <button
              type="button"
              onClick={() => {
                setThemeNotice(null);
                selectModule('wallet');
              }}
              className="text-amber-300 font-semibold hover:underline whitespace-nowrap"
            >
              {isAr ? 'فتح المحفظة وبرو' : 'Open Wallet & Pro'}
            </button>
          </div>
        )}

        {/* Guest Mode notice bar */}
        {isGuest && (
          <div className="bg-[var(--surface-solid)] border-b border-[var(--border-cyan)] px-4 sm:px-6 py-2.5 text-xs text-[#CBD5E1] flex flex-wrap items-center justify-between gap-2">
            <span>{t.guestModeBanner}</span>
            <button
              type="button"
              onClick={() => setView('auth')}
              className="text-[var(--electric-cyan)] font-semibold hover:underline whitespace-nowrap"
            >
              {t.signInGoogle}
            </button>
          </div>
        )}

        {/* Active Module Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-10 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Clinical Disclaimer Footer */}
        <footer className="hidden lg:block border-t border-white/8 px-8 py-4 text-xs text-[var(--titanium-silver)]">
          {t.medicalDisclaimer}
        </footer>
      </div>

      {/* Mobile Bottom Thumb Bar (compact <= 15% height, >= 44px touch targets) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 pb-[env(safe-area-inset-bottom)] bg-[var(--bg-abyss)]/95 border-t border-white/10 flex items-center justify-around px-1.5">
        {mobileBottomIds.map((id) => {
          const item = navItems.find((n) => n.id === id) || BASE_NAV[0];
          const Icon = item.icon;
          const active = activeModule === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => selectModule(id)}
              className={`min-h-[44px] min-w-[44px] flex-1 flex flex-col items-center justify-center gap-0.5 px-1 py-1 rounded-xl text-[11px] ${
                active ? 'text-[var(--electric-cyan)] bg-white/5' : 'text-[var(--titanium-silver)]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-[68px]">{t.workspaceModules[id]}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Full Module Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 flex">
          <div className="w-72 max-w-[85vw] bg-[#070E1C] h-full border-e border-white/10 p-4 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="font-display font-bold">MAMO MED AI</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 text-[#94A3B8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectModule(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                      active ? 'bg-[#1D6FEB]/25 text-white' : 'text-[#94A3B8]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.workspaceModules[item.id]}</span>
                  </button>
                );
              })}
            </div>
            <div className="pt-3 border-t border-white/10 space-y-2">
              <PWAInstallButton variant="compact" className="w-full justify-center" />
              {user ? (
                <button
                  type="button"
                  onClick={signOutUser}
                  className="w-full py-2.5 rounded-xl bg-white/5 text-xs text-[#F4F7FB]"
                >
                  {t.signOut}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    setView('auth');
                  }}
                  className="btn-3d-primary w-full py-2.5 rounded-xl text-xs font-semibold text-white"
                >
                  {t.signInGoogle}
                </button>
              )}
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}
    </div>
  );
}
