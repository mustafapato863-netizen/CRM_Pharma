"use client";

import { LogoutRounded } from "@mui/icons-material";
import { Button } from "@mui/material";
import { signOut } from "next-auth/react";
import { useLocale } from "@/shared/hooks/use-locale";

export function LogoutButton() {
  const { messages } = useLocale();

  return (
    <Button
      color="error"
      size="small"
      startIcon={<LogoutRounded fontSize="small" />}
      onClick={() => signOut({ callbackUrl: "/login" })}
      sx={{
        borderRadius: 1.5,
        fontWeight: 700,
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      {messages.navbar.logOut}
    </Button>
  );
}
