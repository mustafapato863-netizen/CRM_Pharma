"use client";

import {
  AddRounded,
  Inventory2Outlined,
  KeyboardArrowDownRounded,
} from "@mui/icons-material";
import {
  InputAdornment,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { BatchSelectorProps } from "./stock-ui.types";

export function BatchSelector({
  batches,
  value,
  onChange,
}: BatchSelectorProps) {
  const t = useTranslations("stock");

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
      sx={{
        "& .MuiSelect-select": {
          display: "flex",
          alignItems: "center",
        },
      }}
    >
      <MenuItem value="">
        <ListItemIcon sx={{ minWidth: 32, color: "primary.main" }}>
          <AddRounded fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
              {t("newBatch")}
            </Typography>
          }
        />
      </MenuItem>

      {batches.map((batch) => (
        <MenuItem key={batch.id} value={batch.id}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Inventory2Outlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={batch.batchNumber} />
        </MenuItem>
      ))}
    </TextField>
  );
}
