"use client";

import { SearchRounded } from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";
import { useTranslations } from "next-intl";
import type { ProductSearchProps } from "./stock-ui.types";

export function ProductSearch({
  value,
  onChange,
}: ProductSearchProps) {
  const t = useTranslations("products");

  return (
    <TextField
      fullWidth
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={t("search")}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRounded fontSize="small" color="action" />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          bgcolor: "background.paper",
        },
      }}
    />
  );
}
