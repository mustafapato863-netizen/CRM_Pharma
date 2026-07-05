"use client";

import { useEffect, useState, useTransition } from "react";
import { Alert, Box, Paper, Snackbar, Stack, Typography } from "@mui/material";
import {
  AutoGraphRounded,
  Inventory2Outlined,
  LocalShippingOutlined,
  ReceiptLongOutlined,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { createStockInAction } from "../actions/stock-in-actions";
import type { StockInFormValues } from "../types";
import { StockInForm } from "./stock-in-form";
import { RecentStockInTable } from "./recent-stock-in-table";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { MetricCard } from "@/shared/ui/metric-card";
import type { StockInPageClientProps } from "./stock-ui.types";

export function StockInPageClient({
  products,
  batchesByProduct,
  parties,
  rows,
  canCreate,
}: StockInPageClientProps) {
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

  const defaultValues: StockInFormValues = {
    productId: products[0]?.id ?? "",
    batchId: "",
    batchNumber: "",
    useNewBatch: true,
    quantity: "1",
    purchasePrice: "0",
    expiryDate: "",
    reference: "",
    movementAt: new Date().toISOString().slice(0, 16),
    partyId: "",
    notes: "",
    confirmSave: false,
  };

  function submit(values: StockInFormValues) {
    const formData = toFormData(values);

    startTransition(async () => {
      const result = await createStockInAction({}, formData);

      if (
        result &&
        typeof result === "object" &&
        "error" in result &&
        result.error
      ) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      setMessage({ type: "success", text: t("stockInSaved") });
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
            "radial-gradient(circle, color-mix(in srgb, var(--mui-palette-primary-main) 13%, transparent), transparent 68%)",
        },
      }}
    >
      <Stack spacing={2.5}>
        <AppPageHeader
          title={t("stockInTitle")}
          description={t("stockInDescription")}
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
            label={t("activeSuppliers")}
            value={String(parties.length)}
            icon={<LocalShippingOutlined />}
            tone="success"
          />
          <MetricCard
            label={t("productsAvailable")}
            value={String(products.length)}
            icon={<Inventory2Outlined />}
            tone="warning"
          />
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.5, md: 2 },
            bgcolor: "background.paper",
            backgroundImage:
              "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 6%, transparent), transparent 54%)",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AutoGraphRounded fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              {t("stockInDescription")}
            </Typography>
          </Stack>
        </Paper>

        {canCreate ? (
          <StockInForm
            products={products}
            batchesByProduct={batchesByProduct}
            parties={parties}
            defaultValues={defaultValues}
            pending={pending}
            onSubmit={submit}
          />
        ) : (
          <Alert severity="warning">{t("readOnlyStockIn")}</Alert>
        )}

        {rows.length ? (
          <RecentStockInTable data={rows} />
        ) : (
          <EmptyState
            title={t("noRecentStockIn")}
            description={t("noRecentStockInDescription")}
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

function toFormData(values: StockInFormValues) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) =>
    formData.set(key, value === true ? "on" : String(value ?? "")),
  );

  return formData;
}
