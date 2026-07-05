"use client";

import { useEffect, useState, useTransition } from "react";
import { Alert, Box, Paper, Snackbar, Stack, Typography } from "@mui/material";
import {
  Inventory2Outlined,
  LocalShippingOutlined,
  ReceiptLongOutlined,
  TrendingDownRounded,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { createStockOutAction } from "../actions/stock-out-actions";
import type { StockOutFormValues } from "../types/stock-out";
import { StockOutForm } from "./stock-out-form";
import { RecentStockOutTable } from "./recent-stock-out-table";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { MetricCard } from "@/shared/ui/metric-card";
import type { StockOutPageClientProps } from "./stock-ui.types";

export function StockOutPageClient({
  products,
  batchesByProduct,
  rows,
  canCreate,
}: StockOutPageClientProps) {
  const t = useTranslations("stock");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const firstProductId = products[0]?.id ?? "";
  const defaultValues: StockOutFormValues = {
    productId: firstProductId,
    batchId: batchesByProduct[firstProductId]?.[0]?.id ?? "",
    quantity: "1",
    reference: "",
    movementAt: new Date().toISOString().slice(0, 16),
    notes: "",
    confirmSave: false,
  };

  function submit(values: StockOutFormValues) {
    const formData = toFormData(values);

    startTransition(async () => {
      const result = await createStockOutAction({}, formData);

      if (
        result &&
        typeof result === "object" &&
        "error" in result &&
        result.error
      ) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setMessage({ type: "success", text: t("stockOutSaved") });
    });
  }

  return (
    <Box
      sx={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        maxWidth: 1440,
        mx: "auto",
        "&::before": {
          content: '""',
          position: "absolute",
          pointerEvents: "none",
          zIndex: -1,
          width: 420,
          height: 260,
          top: -90,
          insetInlineEnd: -120,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--mui-palette-error-main) 12%, transparent), transparent 68%)",
        },
      }}
    >
      <Stack spacing={2.5}>
        <AppPageHeader
          title={t("stockOutTitle")}
          description={t("stockOutDescription")}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{ alignItems: "stretch" }}
        >
          <MetricCard
            label={t("recentMovements")}
            value={String(rows.length)}
            icon={<ReceiptLongOutlined />}
            tone="info"
          />
          <MetricCard
            label={t("productsAvailable")}
            value={String(products.length)}
            icon={<Inventory2Outlined />}
            tone="success"
          />
          <MetricCard
            label={t("availableBatches")}
            value={String(Object.values(batchesByProduct).flat().length)}
            icon={<LocalShippingOutlined />}
            tone="warning"
          />
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.5, md: 2 },
            bgcolor: "background.paper",
            backgroundImage:
              "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-error-main) 6%, transparent), transparent 54%)",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <TrendingDownRounded fontSize="small" color="error" />
            <Typography variant="body2" color="text.secondary">
              {t("stockOutDescription")}
            </Typography>
          </Stack>
        </Paper>

        {canCreate ? (
          <StockOutForm
            products={products}
            batchesByProduct={batchesByProduct}
            defaultValues={defaultValues}
            pending={pending}
            onSubmit={submit}
          />
        ) : (
          <Alert severity="warning">{t("readOnlyStockOut")}</Alert>
        )}

        {rows.length ? (
          <RecentStockOutTable data={rows} />
        ) : (
          <EmptyState
            title={t("noRecentStockOut")}
            description={t("noRecentStockOutDescription")}
          />
        )}

        <Snackbar
          open={Boolean(message)}
          onClose={() => setMessage(null)}
          autoHideDuration={3000}
        >
          {message ? (
            <Alert severity={message.type} variant="outlined">
              {message.text}
            </Alert>
          ) : undefined}
        </Snackbar>
      </Stack>
    </Box>
  );
}

function toFormData(values: StockOutFormValues) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) =>
    formData.set(key, value === true ? "on" : String(value ?? "")),
  );

  return formData;
}
