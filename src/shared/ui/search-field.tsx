"use client";

import { InputAdornment, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";
import { useLocale } from "@/shared/hooks/use-locale";

export function SearchField(props: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const { messages } = useLocale();
  return (
    <TextField
      fullWidth
      size="small"
      value={props.value}
      onChange={(event) => props.onChange(event.target.value)}
      placeholder={props.placeholder ?? messages.common.search}
      slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
    />
  );
}
