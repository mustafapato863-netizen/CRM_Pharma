import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  Card,
  CardContent,
  Stack,
  Box,
  Typography,
  Button,
} from "@mui/material";
import {
  Build as BuildIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { PageShell } from "@/components/page-shell";
import { createPageMetadata } from "@/shared/config/metadata";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { translations } from "@/shared/config/translations";
import { MaintenanceRefreshButton } from "./refresh-button";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale =
    cookieStore.get("pharmacy-crm:locale")?.value === "ar" ? "ar" : "en";
  const t = translations[locale];
  return createPageMetadata(
    t.sidebar.maintenance,
    t.states.comingSoonDescription,
  );
}

export default async function MaintenancePage() {
  const cookieStore = await cookies();
  const locale =
    cookieStore.get("pharmacy-crm:locale")?.value === "ar" ? "ar" : "en";
  const t = translations[locale];

  return (
    <PageShell>
      <AppPageHeader
        title={t.states.comingSoon}
        description={t.states.comingSoonDescription}
      />
      <Card
        variant="outlined"
        sx={{ textAlign: "center", py: 3.5, px: 2.25 }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2.25,
          }}
        >
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: "action.hover",
              color: "warning.main",
            }}
          >
            <BuildIcon fontSize="small" />
          </Box>

          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {t.states.comingSoon}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t.states.comingSoonDescription}
            </Typography>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            sx={{ justifyContent: "center", mt: 1.25, width: "100%" }}
          >
            <Button
              variant="contained"
              component={Link}
              href="/dashboard"
              startIcon={<DashboardIcon />}
              fullWidth
            >
              {t.actions.goDashboard}
            </Button>
            <MaintenanceRefreshButton />
          </Stack>
        </CardContent>
      </Card>
    </PageShell>
  );
}
