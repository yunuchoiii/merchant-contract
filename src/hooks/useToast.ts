import { useCallback, useEffect, useState } from 'react';

const DEFAULT_DELAY_MS = 3000;

export type ToastState = { isOpen: boolean; message: string };

type UseToastOptions = {
  /** 자동으로 닫히기까지 시간(ms). 기본 3000 */
  delayMs?: number;
  /** Toast type. 기본 'warn' */
  type?: 'warn' | 'success';
};

/**
 * 토스트 열기/닫기 상태와 자동 닫기(delay)를 처리
 */
export function useToast(options: UseToastOptions = {}) {
  const { delayMs = DEFAULT_DELAY_MS, type = 'warn' } = options;
  const [toast, setToast] = useState<ToastState>({ isOpen: false, message: '' });

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openToast = useCallback((message: string) => {
    setToast({ isOpen: true, message });
  }, []);

  useEffect(() => {
    if (!toast.isOpen) return;
    const timer = window.setTimeout(closeToast, delayMs);
    return () => window.clearTimeout(timer);
  }, [toast.isOpen, delayMs, closeToast]);

  const toastProps = {
    isOpen: toast.isOpen,
    close: closeToast,
    message: toast.message,
    type,
    delay: delayMs,
  } as const;

  return { toast, openToast, closeToast, toastProps };
}
