import { createContext, useContext, useMemo, useState } from "react";
import { createId } from "../lib/utils";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = ({ title, description, tone = "info" }) => {
    const id = createId("toast");
    const toast = { id, title, description, tone };

    setToasts((current) => [...current, toast]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  };

  const removeToast = (id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  };

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      removeToast,
    }),
    [toasts],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
