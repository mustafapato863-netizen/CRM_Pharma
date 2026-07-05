"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Grid,
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Backup as BackupIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

import { showError, showSuccess } from "@/shared/lib/toast";

type BackupPayload = {
  exportedAt: string;
  appName: string;
  version: string;
  source: "settings-center";
};

export function BackupCenter({ version }: { version: string }) {
  const t = useTranslations("backup");
  const common = useTranslations("common");
  const [restoreFileName, setRestoreFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState<"export" | "restore" | null>(null);
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  const payload = useMemo<BackupPayload>(
    () => ({
      exportedAt: new Date().toISOString(),
      appName: common("appName"),
      version,
      source: "settings-center",
    }),
    [common, version],
  );

  const startProgress = async (
    type: "export" | "restore",
    doneMessage: string,
  ) => {
    setBusy(type);
    setProgress(18);
    await new Promise((resolve) => setTimeout(resolve, 180));
    setProgress(48);
    await new Promise((resolve) => setTimeout(resolve, 180));
    setProgress(82);
    await new Promise((resolve) => setTimeout(resolve, 180));
    setProgress(100);
    await new Promise((resolve) => setTimeout(resolve, 120));
    showSuccess(doneMessage);
    setBusy(null);
    setTimeout(() => setProgress(0), 500);
  };

  const exportBackup = async () => {
    setExportConfirmOpen(false);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${common("appName").toLowerCase().replace(/\s+/g, "-")}-backup-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    await startProgress("export", t("exportSuccess"));
  };

  const restoreBackup = async () => {
    setRestoreConfirmOpen(false);
    if (!restoreFileName) {
      showError(t("selectFileError"));
      return;
    }

    await startProgress(
      "restore",
      t("restoreSuccess", { file: restoreFileName }),
    );
  };

  return (
    <Stack spacing={2.25}>
      <Grid container spacing={2}>
        {/* Backup Export */}
        <Grid size={{ xs: 12, xl: 7 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <AvatarIcon
                    sx={{ bgcolor: "action.selected", color: "primary.main" }}
                  >
                    <BackupIcon />
                  </AvatarIcon>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {t("exportTitle")}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {t("exportDesc")}
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  disabled={busy !== null}
                  onClick={() => setExportConfirmOpen(true)}
                >
                  {busy === "export" ? t("exporting") : t("exportBtn")}
                </Button>
              </Stack>

              <Box
                sx={{
                  mt: 2.25,
                  p: 1.75,
                  bgcolor: "action.hover",
                  borderRadius: 2.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {t("noticeText")}
                </Typography>
              </Box>

              <Box sx={{ mt: 2.25 }}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t("progress")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {progress}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ borderRadius: 2, height: 8 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Backup Restore */}
        <Grid size={{ xs: 12, xl: 5 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center", mb: 2.25 }}
              >
                <AvatarIcon
                  sx={{ bgcolor: "action.hover", color: "success.main" }}
                >
                  <CloudUploadIcon />
                </AvatarIcon>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {t("restoreTitle")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {t("restoreDesc")}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, fontWeight: 500 }}
                  >
                    {t("fileLabel")}
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    {t("fileLabel")}
                    <input
                      type="file"
                      accept="application/json"
                      hidden
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        setRestoreFileName(file?.name ?? null);
                      }}
                    />
                  </Button>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 2,
                    bgcolor: "action.hover",
                    borderRadius: 3,
                  }}
                >
                  <CheckCircleIcon
                    sx={{
                      color: restoreFileName
                        ? "success.main"
                        : "text.secondary",
                    }}
                  />
                  <Typography
                    variant="body2"
                    color={restoreFileName ? "success.main" : "text.secondary"}
                    sx={{ fontWeight: 500 }}
                  >
                    {restoreFileName
                      ? `${t("selectedFile")}: ${restoreFileName}`
                      : t("noFile")}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  onClick={() => setRestoreConfirmOpen(true)}
                  disabled={!restoreFileName || busy !== null}
                  startIcon={<RefreshIcon />}
                  fullWidth
                >
                  {busy === "restore" ? t("restoring") : t("restoreBtn")}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Export Confirmation Dialog */}
      <Dialog
        open={exportConfirmOpen}
        onClose={() => setExportConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("exportConfirmTitle")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{t("exportConfirmDesc")}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setExportConfirmOpen(false)}
            variant="outlined"
          >
            {t("cancel")}
          </Button>
          <Button onClick={exportBackup} variant="contained">
            {t("exportBtn")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog
        open={restoreConfirmOpen}
        onClose={() => setRestoreConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("restoreConfirmTitle")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2.5 }}>
            {t("restoreConfirmDesc")}
          </Typography>
          <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 3 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", fontWeight: 600 }}
            >
              {t("selectedFile")}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
              {restoreFileName ?? t("noFile")}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setRestoreConfirmOpen(false)}
            variant="outlined"
          >
            {t("cancel")}
          </Button>
          <Button onClick={restoreBackup} color="warning" variant="contained">
            {t("restoreBtn")}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function AvatarIcon({ children, sx }: { children: React.ReactNode; sx?: any }) {
  return (
    <Box
      sx={{
        display: "grid",
        placeItems: "center",
        width: 40,
        height: 40,
        borderRadius: 2.5,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
