"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Grid,
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Divider,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Backup as BackupIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

import { showSuccess } from "@/shared/lib/toast";

type SettingsField = {
  label: string;
  value: string;
};

function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 2.25,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          </Box>
          {action ? <Box>{action}</Box> : null}
        </Stack>
        <Divider sx={{ mb: 2.25 }} />
        {children}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
}) {
  return <TextField defaultValue={value} type={type} label={label} fullWidth />;
}

export function SettingsCenter({
  userName,
  userEmail,
  appVersion,
}: {
  userName?: string | null;
  userEmail?: string | null;
  appVersion: string;
}) {
  const t = useTranslations("settings");
  const language = useTranslations("language");
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const saveSection = async (label: string) => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    showSuccess(t("saved", { section: label }));
    setSaving(false);
  };

  const versionInfo: SettingsField[] = [
    { label: t("version"), value: appVersion },
    { label: t("environment"), value: process.env.NODE_ENV ?? "development" },
    { label: t("theme"), value: t("lightTheme") },
  ];

  return (
    <Stack spacing={2.25}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 6 }}>
          <SectionCard
            title={t("pharmacyInformation")}
            description={t("businessDescription")}
            action={
              <Button
                variant="contained"
                onClick={() => void saveSection(t("pharmacyInformation"))}
                disabled={saving}
                startIcon={<SaveIcon />}
              >
                {t("save")}
              </Button>
            }
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  label={t("pharmacyName")}
                  value={t("defaultPharmacyName")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  label={t("phoneNumber")}
                  value={t("defaultPhoneNumber")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label={t("city")} value={t("defaultCity")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label={t("currency")} value={t("defaultCurrency")} />
              </Grid>
              <Grid size={12}>
                <TextField
                  defaultValue={t("defaultAddress")}
                  label={t("address")}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, xl: 6 }}>
          <SectionCard
            title={t("applicationSettings")}
            description={t("preferencesDescription")}
            action={
              <Button
                variant="outlined"
                onClick={() => void saveSection(t("applicationSettings"))}
                disabled={saving}
                startIcon={<RefreshIcon />}
              >
                {t("reset")}
              </Button>
            }
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label={t("timezone")} value={t("defaultTimezone")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label={t("dateFormat")} value={t("defaultDateFormat")} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  label={t("lowStockThreshold")}
                  value={t("defaultLowStockThreshold")}
                  type="number"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field label={t("defaultLanguage")} value={language("en")} />
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 8 }}>
          <SectionCard
            title={t("userProfile")}
            description={t("profileDescription")}
            action={
              <Button
                variant="outlined"
                startIcon={<BackupIcon />}
                onClick={() => router.push("/backup")}
              >
                {t("backup")}
              </Button>
            }
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  label={t("displayName")}
                  value={userName ?? t("defaultDisplayName")}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Field
                  label={t("usernameEmail")}
                  value={userEmail ?? t("defaultUsernameEmail")}
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                mt: 2.25,
                p: 1.75,
                bgcolor: "action.hover",
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2.5,
              }}
            >
              <Typography variant="body2" color="info.main">
                {t("activeUserHint")}
              </Typography>
            </Box>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, xl: 4 }}>
          <SectionCard
            title={t("versionInformation")}
            description={t("versionDescription")}
            action={
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => router.push("/backup")}
              >
                {t("backup")}
              </Button>
            }
          >
            <Stack spacing={2}>
              {versionInfo.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1.75,
                    bgcolor: "action.hover",
                    borderRadius: 2.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
