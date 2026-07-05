"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { SearchOff } from "@mui/icons-material";
import { PageShell } from "@/components/page-shell";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const router = useRouter();
  const states = useTranslations("states");
  const actions = useTranslations("actions");
  return (
    <PageShell>
      <Stack
        sx={{
          minHeight: "70vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            width: "100%",
            maxWidth: 520,
            p: { xs: 2.5, md: 3.5 },
            textAlign: "center",
          }}
        >
          <Stack spacing={2.25} sx={{ alignItems: "center" }}>
            <SearchOff color="primary" sx={{ fontSize: 44 }} />
            <Stack spacing={1}>
              <Typography variant="h5" sx={{ fontWeight: 850 }}>
                {states("notFound")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {states("notFoundDescription")}
              </Typography>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button component={Link} href="/dashboard" variant="contained">
                {actions("goDashboard")}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => router.back()}
              >
                {actions("goBack")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </PageShell>
  );
}
