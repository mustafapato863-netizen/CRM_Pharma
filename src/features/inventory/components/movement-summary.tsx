"use client";

import type { ReactNode } from "react";
import type { MovementSummaryProps } from "./stock-ui.types";
import {
  Inventory2Outlined,
  LocalShippingOutlined,
  PaidOutlined,
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

export function MovementSummary({
  quantity,
  purchasePrice,
  productLabel,
  batchLabel,
  supplierLabel,
  batchQuantity,
  productQuantity,
}: MovementSummaryProps) {
  const t = useTranslations("stock");
  const total = Number(quantity || 0) * Number(purchasePrice || 0);

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
            "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 8%, transparent), transparent 58%)",
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
              color: "primary.main",
            }}
          >
            <Inventory2Outlined fontSize="small" />
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {t("summary")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("stockInTitle")}
            </Typography>
          </Box>

          <Chip
            label={t("summary")}
            size="small"
            color="info"
            variant="outlined"
          />
        </Stack>
      </Box>

      <Stack spacing={1.5} sx={{ p: 2 }}>
        <SummaryRow label={t("product")} value={productLabel ?? "-"} />
        <SummaryRow label={t("batch")} value={batchLabel ?? "-"} />
        <SummaryRow
          label={t("supplier")}
          value={supplierLabel ?? "-"}
          icon={<LocalShippingOutlined fontSize="small" />}
        />
        <Divider />
        <SummaryRow label={t("quantity")} value={quantity || "0"} />

        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundImage:
              "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 11%, transparent), color-mix(in srgb, var(--mui-palette-secondary-main) 7%, transparent))",
          }}
        >
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <PaidOutlined fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary">
                {t("totalCost")}
              </Typography>
            </Stack>

            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {total.toFixed(2)}
            </Typography>
          </Stack>
        </Box>

        <Divider />
        <SummaryRow
          label={t("availableQuantity")}
          value={batchQuantity ?? "-"}
        />
        <SummaryRow
          label={t("currentQuantity")}
          value={productQuantity ?? "-"}
        />
      </Stack>
    </Paper>
  );
}

function SummaryRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ alignItems: "center", minWidth: 0 }}
      >
        {icon ? (
          <Box sx={{ color: "text.secondary", display: "grid" }}>{icon}</Box>
        ) : null}
        <Typography variant="body2" color="text.secondary" noWrap>
          {label}
        </Typography>
      </Stack>

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
