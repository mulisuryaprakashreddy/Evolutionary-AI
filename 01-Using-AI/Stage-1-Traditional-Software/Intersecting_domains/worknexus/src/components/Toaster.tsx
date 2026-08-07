import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

function emit() {
  toastListeners.forEach((l) => l(currentToasts));
}

export function toast(type: ToastType, message: string) {
  const id = crypto.randomUUID();
  currentToasts = [...currentToasts, { id, type, message }];
  emit();
  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    emit();
  }, 4000);
}

export const toastSuccess = (m: string) => toast('success', m);
export const toastError = (m: string) => toast('error', m);
export const toastInfo = (m: string) => toast('info', m);
export const toastWarning = (m: string) => toast('warning', m);

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles: Record<ToastType, string> = {
  success: 'border-success-200 bg-success-50 text-success-800 dark:border-success-800 dark:bg-success-950 dark:text-success-200',
  error: 'border-error-200 bg-error-50 text-error-800 dark:border-error-800 dark:bg-error-950 dark:text-error-200',
  info: 'border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-200',
  warning: 'border-warning-200 bg-warning-50 text-warning-800 dark:border-warning-800 dark:bg-warning-950 dark:text-warning-200',
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    emit();
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-slide-up',
              styles[t.type]
            )}
          >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
