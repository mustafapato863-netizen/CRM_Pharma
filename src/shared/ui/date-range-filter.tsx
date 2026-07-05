"use client";

import { Grid, TextField } from "@mui/material";
import { useLocale } from "@/shared/hooks/use-locale";

export function DateRangeFilter({ from, to, onFromChange, onToChange }: { from: string; to: string; onFromChange: (value: string) => void; onToChange: (value: string) => void; }) {
  const { messages } = useLocale();
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField fullWidth type="date" label={messages.common.from} slotProps={{ inputLabel: { shrink: true } }} value={from} onChange={(e) => onFromChange(e.target.value)} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField fullWidth type="date" label={messages.common.to} slotProps={{ inputLabel: { shrink: true } }} value={to} onChange={(e) => onToChange(e.target.value)} />
      </Grid>
    </Grid>
  );
}
