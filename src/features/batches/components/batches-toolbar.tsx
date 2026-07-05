"use client";

import Link from "next/link";
import { Button } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import type { BatchRow } from "../types";
import { exportBatchesToXlsx } from "../utils/export";
import { ToolbarActionGroup } from "@/shared/ui/toolbar-action-group";

export function BatchesToolbar({ batches, canCreate }: { batches: BatchRow[]; canCreate: boolean }) {
  const t = useTranslations("batches");
  const actions = useTranslations("actions");

  async function downloadXlsx() {
    const buffer = await exportBatchesToXlsx(batches);
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "batches.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolbarActionGroup>
      <Button variant="outlined" startIcon={<Download />} onClick={downloadXlsx}>{actions("export")}</Button>
      {canCreate ? <Button component={Link} href="/batches/new" variant="contained" startIcon={<Add />}>{t("new")}</Button> : null}
    </ToolbarActionGroup>
  );
}
