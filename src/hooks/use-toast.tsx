import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  id?: number;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
  toasts: ToastOptions[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);
  const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const toast = useCallback((options: ToastOptions) => {
    // Generate a more unique ID by combining timestamp with random number
    const newToast = { ...options, id: Date.now() + Math.random() };

    setToasts((prev) => [...prev, newToast]);

    // Clear any existing timeout for this toast
    const existingTimeout = timeoutsRef.current.get(newToast.id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Auto remove after 5 seconds
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      timeoutsRef.current.delete(newToast.id);
    }, 5000);

    timeoutsRef.current.set(newToast.id, timeout);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const Toaster: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
};

const Toast: React.FC<ToastOptions> = ({
  title,
  description,
  variant = "default",
}) => {
  const baseClasses =
    "p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300";
  const variantClasses = {
    default: "bg-white border border-gray-200 text-gray-900",
    destructive: "bg-red-50 border border-red-200 text-red-900",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className="font-medium">{title}</div>
      {description && <div className="text-sm mt-1">{description}</div>}
    </div>
  );
};
