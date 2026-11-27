import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'primary';
  className?: string;
  iconOnlyOnNarrow?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
  iconOnlyOnNarrow = false
}) => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handlePress = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuideModal(true);
      }
      return;
    }
    setShowGuideModal(true);
  };

  const installLabel = isAr
    ? variant === 'primary'
      ? 'تثبيت التطبيق على الجوال'
      : 'تثبيت التطبيق'
    : variant === 'primary'
      ? 'Install Mobile App'
      : 'Install App';

  const buttonStyles =
    variant === 'primary'
      ? 'btn-3d-secondary min-h-[44px] px-5 py-3 rounded-xl text-sm font-semibold text-[#22D3EE] border border-[#22D3EE]/40 inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0'
      : 'min-h-[40px] px-3 py-1.5 rounded-lg border border-[#22D3EE]/35 bg-[#22D3EE]/10 hover:bg-[#22D3EE]/20 text-xs font-semibold text-[#22D3EE] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors';

  return (
    <>
      <button
        type="button"
        aria-label={installLabel}
        onClick={handlePress}
        className={`${buttonStyles} ${className}`}
      >
        {isIOS ? <Share className="w-3.5 h-3.5 shrink-0" /> : <Download className="w-3.5 h-3.5 shrink-0" />}
        <span className={iconOnlyOnNarrow ? 'max-[400px]:sr-only' : undefined}>{installLabel}</span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? 'دليل تثبيت التطبيق على الهاتف' : 'Install App Guide'}
        >
          <div className="w-full max-w-md rounded-2xl bg-[#071022] border border-[#22D3EE]/35 p-6 shadow-2xl space-y-4 text-start">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/15 border border-[#22D3EE]/35 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-[#22D3EE]" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[#F4F7FB]">
                    {isAr ? 'تثبيت MAMO MED AI كتطبيق جوال' : 'Install MAMO MED AI App'}
                  </h3>
                  <p className="text-xs text-[#94A3B8]">
                    {isIOS
                      ? isAr
                        ? 'هواتف iPhone / iPad (Safari)'
                        : 'iOS Safari Instructions'
                      : isAr
                        ? 'أجهزة أندرويد (WebAPK عبر Chrome)'
                        : 'Android / Chrome Native WebAPK'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowGuideModal(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-2.5 text-xs sm:text-sm text-[#CBD5E1] list-decimal ps-5 leading-relaxed">
                <li>
                  {isAr
                    ? 'افتح التطبيق في متصفح Safari مباشرة (وليس داخل إطار أو متصفح داخلي).'
                    : 'Open the live site directly in Safari on your iPhone or iPad.'}
                </li>
                <li>
                  {isAr
                    ? 'اضغط على أيقونة المشاركة (Share) في شريط المتصفح بالأسفل.'
                    : 'Tap the Share button in the Safari toolbar.'}
                </li>
                <li>
                  {isAr
                    ? 'اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen) ثم اضغط إضافة.'
                    : 'Scroll down and tap "Add to Home Screen", then tap Add.'}
                </li>
              </ol>
            ) : (
              <ol className="space-y-2.5 text-xs sm:text-sm text-[#CBD5E1] list-decimal ps-5 leading-relaxed">
                <li>
                  {isAr
                    ? 'افتح رابط التطبيق المباشر في متصفح Google Chrome على هاتفك الأندرويد.'
                    : 'Open the live HTTPS URL directly in Google Chrome on Android (outside preview iframes).'}
                </li>
                <li>
                  {isAr
                    ? 'اضغط على قائمة المتصفح (⋮) بالأعلى ثم اختر "تثبيت التطبيق" (Install app) أو "الإضافة إلى الشاشة الرئيسية".'
                    : 'Tap Chrome menu (⋮) and choose "Install app" or "Add to Home screen".'}
                </li>
                <li>
                  {isAr
                    ? 'سيثبّت أندرويد التطبيق بأيقونة خاصة؛ وعند فتحه سيعمل في نافذة مستقلة بلا شريط عنوان Chrome.'
                    : 'Android installs an app icon that opens in its own standalone window without Chrome’s address bar.'}
                </li>
              </ol>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="btn-3d-primary min-h-[44px] w-full rounded-xl text-xs font-semibold text-white"
            >
              {isAr ? 'حسناً، فهمت' : 'Got It'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
