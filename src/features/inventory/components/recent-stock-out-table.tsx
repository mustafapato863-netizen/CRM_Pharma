"use client";

import { useMemo, useState } from "react";
import { TrendingDownRounded } from "@mui/icons-material";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { useTranslations } from "next-intl";
import type { RecentStockOutTableProps } from "./stock-ui.types";
import { AppDataGrid } from "@/shared/ui/app-data-grid";

export function RecentStockOutTable({ data }: RecentStockOutTableProps) {
  const t = useTranslations("stock");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const rows = data.map((row) => ({
    id: row.id,
    movementAt: row.movementAt,
    reference: row.reference ?? "—",
    product: `${row.product.code} - ${row.product.name}`,
    batch: row.batch?.batchNumber ?? "—",
    quantity: row.quantity.toString(),
    user: row.user.name ?? row.user.email,
  }));

  const pageRows = rows.slice(
    paginationModel.page * paginationModel.pageSize,
    (paginationModel.page + 1) * paginationModel.pageSize,
  );

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "movementAt",
        headerName: t("movementDate"),
        minWidth: 180,
        valueFormatter: (value) => new Date(String(value)).toLocaleString(),
      },
      { field: "reference", headerName: t("reference"), minWidth: 140 },
      { field: "product", headerName: t("product"), flex: 1, minWidth: 220 },
      { field: "batch", headerName: t("batch"), minWidth: 140 },
      {
        field: "quantity",
        headerName: t("quantity"),
        minWidth: 120,
        align: "right",
        headerAlign: "right",
      },
      { field: "user", headerName: t("user"), minWidth: 160 },
    ],
    [t],
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          px: { xs: 2, md: 2.5 },
          py: 1.75,
          backgroundImage:
            "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-error-main) 6%, transparent), transparent 52%)",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <TrendingDownRounded fontSize="small" color="error" />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {t("recentMovements")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("stockOutTitle")}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Divider />

      <Box
        sx={{
          height: { xs: 420, md: 480 },
          "& .MuiDataGrid-root": {
            border: 0,
          },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "action.hover",
          },
        }}
      >
        <AppDataGrid
          rows={pageRows}
          columns={columns}
          rowCount={rows.length}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Box>
    </Paper>
  );
}
