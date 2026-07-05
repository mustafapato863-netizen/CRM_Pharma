"use client";

import {
  Inventory2Outlined,
  KeyboardArrowDownRounded,
} from "@mui/icons-material";
import {
  Chip,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { StockOutBatchSelectorProps } from "./stock-ui.types";

export function StockOutBatchSelector({
  batches,
  value,
  onChange,
}: StockOutBatchSelectorProps) {
  const t = useTranslations("stock");
  const expiryAlerts = useTranslations("expiryAlerts");

  return (
    <TextField
      select
      fullWidth
      value={value}
      onChange={(event) => onChange(event.target.value)}
      label={t("batch")}
      slotProps={{
        select: {
          IconComponent: KeyboardArrowDownRounded,
        },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Inventory2Outlined fontSize="small" color="action" />
            </InputAdornment>
          ),
        },
      }}
    >
      <MenuItem value="">{t("selectBatch")}</MenuItem>

      {batches.map((batch) => (
        <MenuItem key={batch.id} value={batch.id} sx={{ py: 1 }}>
          <Stack spacing={0.35} sx={{ width: "100%" }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {batch.batchNumber}
              </Typography>

              <Chip
                label={`${t("quantity")} ${batch.currentQuantity}`}
                size="small"
                variant="outlined"
                color="info"
              />
            </Stack>

            <Typography variant="caption" color="text.secondary">
              {batch.expiryDate
                ? batch.expiryDate.slice(0, 10)
                : expiryAlerts("noExpiryDate")}
            </Typography>
          </Stack>
        </MenuItem>
      ))}
    </TextField>
  );
}
