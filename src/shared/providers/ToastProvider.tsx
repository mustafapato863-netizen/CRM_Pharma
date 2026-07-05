"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Alert, Slide, type SlideProps, Snackbar } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { toastEventHandler, type ToastSeverity } from "@/shared/lib/toast";

function SlideTransition(props: SlideProps) {
  const theme = useTheme();

  return <Slide {...props} direction={theme.direction === "rtl" ? "right" : "left"} />;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<ToastSeverity>("info");

  useEffect(() => toastEventHandler((detail) => {
    setSeverity(detail.severity);
    setMessage(detail.message);
    setOpen(true);
  }), []);

  return (
    <>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3500}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: theme.direction === "rtl" ? "left" : "right" }}
        {...({ TransitionComponent: SlideTransition } as any)}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={severity}
          variant="filled"
          sx={{ width: "100%", minWidth: 320 }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
