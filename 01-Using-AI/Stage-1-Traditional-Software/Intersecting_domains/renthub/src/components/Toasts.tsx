import { CheckCircle2, Info, X, AlertCircle } from 'lucide-react';
import { useStore } from '../store';

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 rounded-xl glass px-4 py-3 shadow-card-hover animate-fade-up"
        >
          {t.type === 'success' && <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-primary" />}
          {t.type === 'info' && <Info size={20} className="mt-0.5 shrink-0 text-accent" />}
          {t.type === 'error' && <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-500" />}
          <p className="flex-1 text-sm font-medium text-app">{t.message}</p>
          <X size={16} className="mt-0.5 text-app-faint" />
        </div>
      ))}
    </div>
  );
}
