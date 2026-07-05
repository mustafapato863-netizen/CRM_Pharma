"use client";

import { Button } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useTranslations } from "next-intl";

export function MaintenanceRefreshButton() {
  const t = useTranslations("actions");

  return (
    <Button fullWidth variant="outlined" onClick={() => window.location.reload()} startIcon={<RefreshIcon />}>
      {t("refresh")}
    </Button>
  );
}
