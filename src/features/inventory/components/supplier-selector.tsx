"use client";

import { LocalShippingOutlined, SearchRounded } from "@mui/icons-material";
import {
  Autocomplete,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { SupplierSelectorProps } from "./stock-ui.types";

export function SupplierSelector({
  options,
  value,
  onChange,
}: SupplierSelectorProps) {
  const t = useTranslations("stock");
  const selected = options.find((option) => option.id === value) ?? null;

  return (
    <Autocomplete
      fullWidth
      size="small"
      options={options}
      value={selected}
      onChange={(_, next) => onChange(next?.id ?? "")}
      getOptionLabel={(option) => `${option.code} - ${option.name}`}
      isOptionEqualToValue={(option, current) => option.id === current.id}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Stack spacing={0.15}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.code}
            </Typography>
          </Stack>
        </li>
      )}
      renderInput={(params: any) => (
        <TextField
          {...params}
          label={t("supplier")}
          placeholder={t("searchSupplier")}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <LocalShippingOutlined fontSize="small" color="action" />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  <InputAdornment position="end">
                    <SearchRounded fontSize="small" color="disabled" />
                  </InputAdornment>
                </>
              ),
            },
          }}
        />
      )}
      noOptionsText={t("noSupplierSelected")}
    />
  );
}
