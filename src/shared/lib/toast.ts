"use client";

export type ToastSeverity = "success" | "error" | "warning" | "info";

type ToastDetail = {
  severity: ToastSeverity;
  message: string;
};

const toastEventName = "pharmacy-crm:toast";

function emitToast(severity: ToastSeverity, message: string) {
  window.dispatchEvent(new CustomEvent<ToastDetail>(toastEventName, { detail: { severity, message } }));
}

export const showSuccess = (message: string) => emitToast("success", message);
export const showError = (message: string) => emitToast("error", message);
export const showWarning = (message: string) => emitToast("warning", message);
export const showInfo = (message: string) => emitToast("info", message);

export function toastEventHandler(listener: (detail: ToastDetail) => void) {
  const handler = (event: Event) => listener((event as CustomEvent<ToastDetail>).detail);
  window.addEventListener(toastEventName, handler);
  return () => window.removeEventListener(toastEventName, handler);
}
