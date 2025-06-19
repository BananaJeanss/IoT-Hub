'use client';

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';

import './toast.css';

type ToastType = 'info' | 'success' | 'error';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number; // ms, if omitted it stays until dismissed
}

interface ToastContextValue {
  showToast: (opts: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

let nextId = 1;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<(ToastOptions & { id: number })[]>([]);

  const showToast = useCallback((opts: ToastOptions) => {
    const id = nextId++;
    setToasts((cur) => [...cur, { id, type: 'info', duration: 5000, ...opts }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  // auto-dismiss
  useEffect(() => {
    toasts.forEach((t) => {
      if (t.duration != null) {
        debugger; // pause execution here if DevTools are open (temporary for style debugging and allat)
        const timer = setTimeout(() => remove(t.id), t.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, remove]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div className="toast-message">
              <span>{t.message}</span>
              <button onClick={() => remove(t.id)}>×</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
