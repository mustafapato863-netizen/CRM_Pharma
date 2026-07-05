import * as React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

interface SectionCardProps extends React.ComponentProps<typeof Paper> {
  children: React.ReactNode;
}

export function SectionCard({ children, sx, ...props }: SectionCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.75, sm: 2.25 },
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}

export function SectionCardHeader({
  children,
  sx,
  ...props
}: React.ComponentProps<typeof Stack>) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        ...sx,
      }}
      {...props}
    >
      {children}
    </Stack>
  );
}

export function SectionCardTitle({
  children,
  sx,
  ...props
}: React.ComponentProps<typeof Typography>) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 700, ...sx }} {...props}>
      {children}
    </Typography>
  );
}

export function SectionCardDescription({
  children,
  sx,
  ...props
}: React.ComponentProps<typeof Typography>) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ ...sx }}
      {...props}
    >
      {children}
    </Typography>
  );
}

export function SectionCardContent({
  children,
  sx,
  ...props
}: React.ComponentProps<typeof Box>) {
  return (
    <Box sx={{ ...sx }} {...props}>
      {children}
    </Box>
  );
}
