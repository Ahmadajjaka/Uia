import React from 'react';
import { WifiOff } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useApp();
  const isAr = language === 'ar';

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 lg:bottom-5 start-4 z-[70] flex items-center gap-2 rounded-xl bg-amber-500/95 px-3.5 py-2 text-xs font-semibold text-black shadow-xl border border-amber-300"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        {isAr
          ? 'وضع عدم الاتصال — يتم تشغيل البيانات والملفات المخزنة محلياً'
          : 'Offline Mode — Cached clinical modules remain active'}
      </span>
    </div>
  );
};
