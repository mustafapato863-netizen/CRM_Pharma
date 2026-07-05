"use client";

import { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { Download } from "@mui/icons-material";
import { useLocale } from "@/shared/hooks/use-locale";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton() {
  const { messages } = useLocale();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setPromptEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (installed || !promptEvent) return null;

  return (
    <Button
      variant="contained"
      startIcon={<Download />}
      onClick={async () => {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") {
          setPromptEvent(null);
        }
      }}
      aria-label={messages.common.installApp}
    >
      <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>{messages.common.installApp}</Box>
    </Button>
  );
}
