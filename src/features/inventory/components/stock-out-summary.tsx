"use client";

import {
  Inventory2Outlined,
  TrendingDownRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { StockOutSummaryProps } from "./stock-ui.types";

export function StockOutSummary({
  requestedQuantity,
  currentQuantity,
  remainingQuantity,
  productLabel,
  batchLabel,
  expiryLabel,
}: StockOutSummaryProps) {
  const t = useTranslations("stock");
  const hasRisk =
    remainingQuantity !== undefined &&
    remainingQuantity !== "-" &&
    Number(remainingQuantity) < 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundImage:
            "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-error-main) 9%, transparent), transparent 60%)",
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: "action.selected",
              color: "error.main",
            }}
          >
            <TrendingDownRounded fontSize="small" />
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {t("summary")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("stockOutTitle")}
            </Typography>
          </Box>

          <Chip
            label={t("summary")}
            size="small"
            color="error"
            variant="outlined"
          />
        </Stack>
      </Box>

      <Stack spacing={1.5} sx={{ p: 2 }}>
        <SummaryRow label={t("product")} value={productLabel ?? t("none")} />
        <SummaryRow label={t("batch")} value={batchLabel ?? "-"} />
        <SummaryRow label={t("expiryDate")} value={expiryLabel ?? "-"} />
        <SummaryRow
          label={t("currentQuantity")}
          value={currentQuantity ?? "0"}
        />

        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: hasRisk ? "error.main" : "divider",
            bgcolor: hasRisk ? "error.light" : "action.hover",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Inventory2Outlined
                fontSize="small"
                color={hasRisk ? "error" : "primary"}
              />
              <Typography variant="body2" color="text.secondary">
                {t("quantity")}
              </Typography>
            </Stack>

            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {requestedQuantity || "0"}
            </Typography>
          </Stack>
        </Box>

        <Divider />

        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t("remainingAfterOut")}
          </Typography>

          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
            {hasRisk ? (
              <WarningAmberRounded fontSize="small" color="error" />
            ) : null}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 800,
                color: hasRisk ? "error.main" : "text.primary",
              }}
            >
              {remainingQuantity ?? "-"}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="body2" color="text.secondary" noWrap>
        {label}
      </Typography>
      <Typography
        variant="body2"
        noWrap
        sx={{ maxWidth: "62%", fontWeight: 800, textAlign: "end" }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
