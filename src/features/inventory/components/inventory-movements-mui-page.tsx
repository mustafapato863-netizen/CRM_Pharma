"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  DownloadRounded,
  FilterAltOutlined,
  PrintOutlined,
  RefreshRounded,
  SwapVertRounded,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import { arSD } from "@mui/x-data-grid/locales";

import { AppDrawer } from "@/shared/ui/app-drawer";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { DateRangeFilter } from "@/shared/ui/date-range-filter";
import { EmptyState } from "@/components/empty-state";
import { StatusChip } from "@/shared/ui/status-chip";
import { MetricCard } from "@/shared/ui/metric-card";
import { SearchField } from "@/shared/ui/search-field";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";
import { ToolbarActionGroup } from "@/shared/ui/toolbar-action-group";
import { formatDateTime, formatExpiry } from "@/shared/lib/date";
import { useLocale } from "@/shared/hooks/use-locale";
import type {
  InventoryMovementRow,
  InventoryMovementsMuiPageProps,
} from "./stock-ui.types";

export type { InventoryMovementRow } from "./stock-ui.types";

export function InventoryMovementsMuiPage({
  rows,
  canExport,
  page,
  totalCount,
  metrics,
  filters,
}: InventoryMovementsMuiPageProps) {
  const { locale, messages } = useLocale();
  const t = messages.movements;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<InventoryMovementRow | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: Math.max(page - 1, 0),
    pageSize: 10,
  });

  const gridHeight = useMemo(
    () => Math.min(650, Math.max(360, rows.length * 48 + 132)),
    [rows.length],
  );

  const columns: GridColDef<InventoryMovementRow>[] = useMemo(
    () => [
      {
        field: "dateValue",
        headerName: t.dateTime,
        flex: 0.9,
        minWidth: 176,
        valueFormatter: (value) => formatDateTime(value, locale),
      },
      {
        field: "type",
        headerName: t.movementType,
        minWidth: 148,
        renderCell: (params) => (
          <StatusChip
            label={params.value}
            tone={
              params.value === "STOCK_IN" || params.value === "RETURN"
                ? "success"
                : params.value === "STOCK_OUT"
                  ? "error"
                  : "warning"
            }
          />
        ),
      },
      {
        field: "product",
        headerName: t.product,
        flex: 1.2,
        minWidth: 230,
        renderCell: (params) => (
          <Stack
            spacing={0.1}
            sx={{ justifyContent: "center", height: "100%" }}
          >
            <Typography variant="body2" noWrap sx={{ fontWeight: 750 }}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.productCode}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "batch",
        headerName: t.batchNumber,
        minWidth: 142,
      },
      {
        field: "party",
        headerName: t.party,
        flex: 0.9,
        minWidth: 175,
      },
      {
        field: "quantity",
        headerName: t.quantity,
        minWidth: 114,
        align: "right",
        headerAlign: "right",
        valueFormatter: (value, row) => {
          const sign = row.type === "STOCK_OUT" ? "-" : "";
          return `${sign}${value}`;
        },
      },
      {
        field: "reference",
        headerName: t.reference,
        flex: 0.85,
        minWidth: 156,
      },
      {
        field: "reason",
        headerName: t.reason,
        flex: 1,
        minWidth: 180,
      },
      {
        field: "user",
        headerName: t.user,
        minWidth: 148,
      },
      {
        field: "actions",
        type: "actions",
        headerName: t.actions,
        getActions: (params) => [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityOutlined fontSize="small" />}
            label={t.view}
            onClick={() => setSelected(params.row)}
          />,
        ],
        minWidth: 78,
      },
    ],
    [locale, t],
  );

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams?.toString());

    if (value) next.set(key, value);
    else next.delete(key);

    next.set("page", "1");
    router.replace(`/inventory/movements?${next.toString()}`);
  }

  function clearFilters() {
    router.replace("/inventory/movements");
  }

  function updatePagination(model: GridPaginationModel) {
    setPaginationModel(model);

    const next = new URLSearchParams(searchParams?.toString());
    next.set("page", String(model.page + 1));
    next.set("pageSize", String(model.pageSize));

    router.replace(`/inventory/movements?${next.toString()}`);
  }

  return (
    <Box
      sx={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        maxWidth: 1440,
        mx: "auto",

        "&::before": {
          content: '""',
          position: "absolute",
          pointerEvents: "none",
          zIndex: -1,
          width: { xs: 280, md: 460 },
          height: { xs: 170, md: 260 },
          top: -100,
          insetInlineEnd: -140,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent), transparent 68%)",
        },
      }}
    >
      <Stack spacing={2.5} dir={locale === "ar" ? "rtl" : "ltr"}>
        <AppPageHeader
          title={t.title}
          description={t.description}
          action={
            <ToolbarActionGroup>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshRounded />}
                onClick={() => router.refresh()}
              >
                {t.refresh}
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrintOutlined />}
                onClick={() => window.print()}
              >
                {t.print}
              </Button>
              {canExport ? (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadRounded />}
                  onClick={() => window.alert(t.exportNotice)}
                >
                  {t.export}
                </Button>
              ) : null}
            </ToolbarActionGroup>
          }
        />

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MetricCard
              label={t.filteredRows}
              value={String(totalCount)}
              icon={<FilterAltOutlined />}
              tone="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MetricCard
              label={t.movementCount}
              value={String(metrics.count)}
              icon={<VisibilityOutlined />}
              tone="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MetricCard
              label={t.totalQuantity}
              value={metrics.totalQuantity}
              icon={<SwapVertRounded />}
              tone="warning"
            />
          </Grid>
        </Grid>

        <FilterToolbar title={t.filters} subtitle={t.filterHint}>
          <Stack spacing={1.5}>
            <SearchField
              value={filters.search ?? ""}
              onChange={(value) => setFilter("search", value)}
              placeholder={t.searchPlaceholder}
            />

            <DateRangeFilter
              from={filters.from ?? ""}
              to={filters.to ?? ""}
              onFromChange={(value) => setFilter("from", value)}
              onToChange={(value) => setFilter("to", value)}
            />

            <Grid container spacing={1.25}>
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                <SearchField
                  value={filters.type ?? ""}
                  onChange={(value) => setFilter("type", value)}
                  placeholder={t.movementType}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                <SearchField
                  value={filters.productId ?? ""}
                  onChange={(value) => setFilter("productId", value)}
                  placeholder={t.product}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                <SearchField
                  value={filters.batchId ?? ""}
                  onChange={(value) => setFilter("batchId", value)}
                  placeholder={t.batch}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                <SearchField
                  value={filters.partyId ?? ""}
                  onChange={(value) => setFilter("partyId", value)}
                  placeholder={t.party}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                <SearchField
                  value={filters.userId ?? ""}
                  onChange={(value) => setFilter("userId", value)}
                  placeholder={t.user}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  setFilter(
                    "sortDir",
                    filters.sortDir === "asc" ? "desc" : "asc",
                  )
                }
              >
                {t.sort}: {filters.sortDir === "asc" ? t.oldest : t.newest}
              </Button>
              <Button size="small" variant="text" onClick={clearFilters}>
                {t.clearFilters}
              </Button>
            </Stack>
          </Stack>
        </FilterToolbar>

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
                "linear-gradient(180deg, color-mix(in srgb, var(--mui-palette-primary-main) 6%, transparent), transparent 100%)",
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {t.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.3 }}
              >
                {t.description}
              </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary">
              {totalCount}
            </Typography>
          </Stack>

          <Divider />

          <Box sx={{ height: gridHeight, overflowX: "auto" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              paginationMode="server"
              rowCount={totalCount}
              paginationModel={paginationModel}
              onPaginationModelChange={updatePagination}
              pageSizeOptions={[10, 20, 50]}
              rowHeight={48}
              columnHeaderHeight={42}
              disableRowSelectionOnClick
              localeText={
                locale === "ar"
                  ? arSD.components.MuiDataGrid.defaultProps.localeText
                  : undefined
              }
              sx={{
                minWidth: 1050,
                border: 0,
                bgcolor: "background.paper",

                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: "action.hover",
                  borderBottomColor: "divider",
                },

                "& .MuiDataGrid-columnHeader": {
                  borderInlineEnd: "1px solid",
                  borderColor: "divider",
                },

                "& .MuiDataGrid-columnHeaderTitle": {
                  color: "text.secondary",
                  fontWeight: 800,
                  fontSize: "0.72rem",
                  letterSpacing: "0.02em",
                },

                "& .MuiDataGrid-cell": {
                  borderBottomColor: "divider",
                  borderInlineEnd: "1px solid",
                  borderInlineEndColor: "divider",
                },

                "& .MuiDataGrid-row:hover": {
                  bgcolor: "action.hover",
                },

                "& .MuiDataGrid-footerContainer": {
                  minHeight: 46,
                  borderTopColor: "divider",
                },
              }}
              slots={{
                noRowsOverlay: () => (
                  <Box
                    sx={{
                      height: "100%",
                      display: "grid",
                      placeItems: "center",
                      p: 2.25,
                    }}
                  >
                    <EmptyState
                      title={t.emptyTitle}
                      description={t.emptyDescription}
                    />
                  </Box>
                ),
              }}
              onRowClick={(params) => setSelected(params.row)}
            />
          </Box>
        </Paper>

        <AppDrawer
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          width={460}
        >
          {selected ? (
            <Stack spacing={1.5}>
              <Typography variant="overline" color="text.secondary">
                {t.details}
              </Typography>

              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {selected.movementId}
              </Typography>

              <Divider />

              <Grid container spacing={1.25}>
                {[
                  [t.movementType, selected.type],
                  [t.dateTime, formatDateTime(selected.dateValue, locale)],
                  [t.product, selected.product],
                  [t.productCode, selected.productCode],
                  [t.batchNumber, selected.batch || "—"],
                  [
                    t.expiryDate,
                    selected.batchExpiryDate
                      ? formatExpiry(selected.batchExpiryDate, locale)
                      : "—",
                  ],
                  [t.party, selected.party || "—"],
                  [t.quantity, selected.quantity],
                  [t.reference, selected.reference || "—"],
                  [t.reason, selected.reason || "—"],
                  [t.user, selected.user],
                  [t.userEmail, selected.userEmail],
                ].map(([label, value]) => (
                  <Grid key={String(label)} size={{ xs: 12, sm: 6 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        height: "100%",
                        p: 1.5,
                        borderRadius: 1.75,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, fontWeight: 700 }}
                      >
                        {value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          ) : null}
        </AppDrawer>
      </Stack>
    </Box>
  );
}
