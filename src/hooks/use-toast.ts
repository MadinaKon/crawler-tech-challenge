import { useState } from "react";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  id?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    const newToast = { ...options, id: Date.now() };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 3000);
  };

  return { toast, toasts };
};
