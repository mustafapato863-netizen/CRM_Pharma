"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  CheckCircleOutlined,
  Download,
  EditOutlined,
  Inventory2Outlined,
  LayersOutlined,
  OpenInNew,
  Refresh,
  VisibilityOutlined,
  WarningAmberOutlined,
  CategoryOutlined,
  QrCodeOutlined,
  ScaleOutlined,
} from "@mui/icons-material";
import type { GridColDef, GridSortModel } from "@mui/x-data-grid";
import { AppDataGrid } from "@/shared/ui/app-data-grid";
import { AppDrawer } from "@/shared/ui/app-drawer";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";
import { MetricCard } from "@/shared/ui/metric-card";
import { SearchField } from "@/shared/ui/search-field";
import { StatusChip } from "@/shared/ui/status-chip";
import { ToolbarActionGroup } from "@/shared/ui/toolbar-action-group";
import { exportProductsExcel } from "../utils/export";
import type { ProductRow, ProductStockState } from "../types";
import { useLocale, useTranslations } from "next-intl";

type ProductWorkspaceRow = ProductRow & {
  currentStock: string;
  stockState: ProductStockState;
};

export function ProductsWorkspace({
  rows,
  totalCount,
  catalogTotalCount,
  activeCount,
  inactiveCount,
  withoutBatchCount,
  page,
  pageSize,
  canCreate,
  canEdit,
}: {
  rows: ProductWorkspaceRow[];
  totalCount: number;
  catalogTotalCount: number;
  activeCount: number;
  inactiveCount: number;
  withoutBatchCount: number;
  page: number;
  pageSize: number;
  canCreate: boolean;
  canEdit: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("products");
  const common = useTranslations("common");
  const actions = useTranslations("actions");
  const locale = useLocale();
  const [selected, setSelected] = useState<ProductWorkspaceRow | null>(null);

  const sortModel = useMemo<GridSortModel>(() => {
    const field = searchParams?.get("sortField") || "updatedAt";
    const sort = searchParams?.get("sortDir") === "asc" ? "asc" : "desc";
    return [{ field, sort }];
  }, [searchParams]);

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "name",
        headerName: t("productName"),
        flex: 1.55,
        minWidth: 250,
        renderCell: (params) => (
          <Stack spacing={0.25} sx={{ minWidth: 0, py: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.searchName || params.row.code}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "code",
        headerName: t("productCode"),
        minWidth: 135,
        renderCell: (params) => (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: "text.secondary",
              letterSpacing: "0.03em",
            }}
          >
            {params.value}
          </Typography>
        ),
      },
      {
        field: "type",
        headerName: t("category"),
        minWidth: 145,
        renderCell: (params) => (
          <Chip
            size="small"
            label={
              params.row.type === "MEDICINE" ? t("medicine") : t("farmSupply")
            }
            variant="outlined"
            sx={{
              borderRadius: 1.75,
              fontWeight: 700,
              bgcolor: "background.paper",
            }}
          />
        ),
      },
      { field: "unit", headerName: t("unit"), minWidth: 105 },
      {
        field: "batchCount",
        headerName: t("batchCount"),
        minWidth: 120,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: "currentStock",
        headerName: t("currentStock"),
        minWidth: 142,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <Stack spacing={0.1} sx={{ alignItems: "flex-end" }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>
              {params.row.currentStock}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.unit}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "stockState",
        headerName: t("stockState"),
        minWidth: 135,
        sortable: false,
        renderCell: (params) => (
          <StatusChip
            label={
              params.row.stockState === "OUT_OF_STOCK"
                ? t("outOfStock")
                : t("inStock")
            }
            tone={
              params.row.stockState === "OUT_OF_STOCK" ? "error" : "success"
            }
          />
        ),
      },
      {
        field: "isActive",
        headerName: common("status"),
        minWidth: 116,
        renderCell: (params) => (
          <StatusChip
            label={params.row.isActive ? common("active") : common("inactive")}
            tone={params.row.isActive ? "success" : "warning"}
          />
        ),
      },
      {
        field: "updatedAt",
        headerName: t("lastUpdated"),
        minWidth: 162,
        valueFormatter: (value) =>
          new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
            new Date(String(value)),
          ),
      },
      {
        field: "actions",
        headerName: common("actions"),
        minWidth: 145,
        sortable: false,
        filterable: false,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <ProductActions
            row={params.row as ProductWorkspaceRow}
            canEdit={canEdit}
            onView={() => setSelected(params.row as ProductWorkspaceRow)}
          />
        ),
      },
    ],
    [canEdit, common, locale, t],
  );

  function replaceFilters(mutator: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams?.toString());
    mutator(next);
    next.set("page", "1");
    router.replace(`/products?${next.toString()}`);
  }

  function setFilter(key: string, value: string) {
    replaceFilters((next) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
  }

  function clearFilters() {
    router.replace("/products");
  }

  function handleSort(model: GridSortModel) {
    const nextSort = model[0];
    replaceFilters((next) => {
      next.set("sortField", nextSort?.field || "updatedAt");
      next.set("sortDir", nextSort?.sort === "asc" ? "asc" : "desc");
    });
  }

  return (
    <Stack spacing={2.25}>
      <AppPageHeader
        title={t("title")}
        description={t("description")}
        action={
          <ToolbarActionGroup>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => router.refresh()}
            >
              {actions("refresh")}
            </Button>
            <ProductExportButton rows={rows} label={actions("export")} />
            {canCreate ? (
              <Button
                component={Link}
                href="/products/new"
                variant="contained"
                startIcon={<Add />}
              >
                {t("add")}
              </Button>
            ) : null}
          </ToolbarActionGroup>
        }
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        <MetricCard
          label={t("total")}
          value={catalogTotalCount.toLocaleString(locale)}
          detail={t("catalogMetricDetail")}
          icon={<Inventory2Outlined fontSize="small" />}
          tone="info"
        />
        <MetricCard
          label={t("active")}
          value={activeCount.toLocaleString(locale)}
          detail={t("activeMetricDetail")}
          icon={<CheckCircleOutlined fontSize="small" />}
          tone="success"
        />
        <MetricCard
          label={t("withoutBatches")}
          value={withoutBatchCount.toLocaleString(locale)}
          detail={t("withoutBatchesDetail")}
          icon={<LayersOutlined fontSize="small" />}
          tone="warning"
        />
        <MetricCard
          label={t("inactiveCatalog")}
          value={inactiveCount.toLocaleString(locale)}
          detail={t("inactiveMetricDetail")}
          icon={<WarningAmberOutlined fontSize="small" />}
          tone="error"
        />
      </Box>

      <FilterToolbar title={t("filters")} subtitle={t("filterHint")}>
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(260px, 1.5fr) minmax(160px, 0.65fr) minmax(160px, 0.65fr) auto",
              },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <SearchField
              value={searchParams?.get("q") ?? ""}
              onChange={(value) => setFilter("q", value)}
              placeholder={t("search")}
            />
            <TextField
              select
              size="small"
              label={t("category")}
              value={searchParams?.get("type") ?? "all"}
              onChange={(event) => setFilter("type", event.target.value)}
            >
              <MenuItem value="all">{t("allCategories")}</MenuItem>
              <MenuItem value="MEDICINE">{t("medicine")}</MenuItem>
              <MenuItem value="FARM_SUPPLY">{t("farmSupply")}</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label={common("status")}
              value={searchParams?.get("status") ?? "all"}
              onChange={(event) => setFilter("status", event.target.value)}
            >
              <MenuItem value="all">{t("allStatuses")}</MenuItem>
              <MenuItem value="active">{common("active")}</MenuItem>
              <MenuItem value="inactive">{common("inactive")}</MenuItem>
            </TextField>
            <Button
              variant="text"
              onClick={clearFilters}
              sx={{ whiteSpace: "nowrap" }}
            >
              {actions("clearFilters")}
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {t("matchingProducts", { count: totalCount })}
          </Typography>
        </Stack>
      </FilterToolbar>

      <Card variant="outlined" sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 1.75,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0.5}
            sx={{
              alignItems: { sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {t("catalogTable")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("sortHint")}
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ height: 650 }}>
          <AppDataGrid
            rows={rows}
            columns={columns}
            rowCount={totalCount}
            paginationMode="server"
            paginationModel={{ page: page - 1, pageSize }}
            onPaginationModelChange={(model) => {
              const next = new URLSearchParams(searchParams?.toString());
              next.set("page", String(model.page + 1));
              next.set("pageSize", String(model.pageSize));
              router.replace(`/products?${next.toString()}`);
            }}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={handleSort}
          />
        </Box>
      </Card>

      <AppDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        width={460}
      >
        {selected ? (
          <ProductDetailsDrawer
            row={selected}
            canEdit={canEdit}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </AppDrawer>
    </Stack>
  );
}

function ProductExportButton({
  rows,
  label,
}: {
  rows: ProductRow[];
  label: string;
}) {
  async function downloadCurrentRows() {
    const buffer = await exportProductsExcel(rows);
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "products.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outlined"
      startIcon={<Download />}
      onClick={downloadCurrentRows}
    >
      {label}
    </Button>
  );
}

function ProductActions({
  row,
  canEdit,
  onView,
}: {
  row: ProductWorkspaceRow;
  canEdit: boolean;
  onView: () => void;
}) {
  const t = useTranslations("products");
  const actions = useTranslations("actions");

  return (
    <Stack direction="row" spacing={0.25} sx={{ justifyContent: "flex-end" }}>
      <Tooltip title={actions("viewDetails")}>
        <IconButton
          size="small"
          onClick={onView}
          aria-label={actions("viewDetails")}
        >
          <VisibilityOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("openBatches")}>
        <IconButton
          component={Link}
          href={`/batches?productId=${row.id}`}
          size="small"
          aria-label={t("openBatches")}
        >
          <Inventory2Outlined fontSize="small" />
        </IconButton>
      </Tooltip>
      {canEdit ? (
        <Tooltip title={t("editAction")}>
          <IconButton
            component={Link}
            href={`/products/${row.id}/edit`}
            size="small"
            aria-label={t("editAction")}
          >
            <EditOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );
}

function ProductDetailsDrawer({
  row,
  canEdit,
  onClose,
}: {
  row: ProductWorkspaceRow;
  canEdit: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("products");
  const common = useTranslations("common");
  const actions = useTranslations("actions");

  // Determine stock level details
  const stockQty = parseFloat(row.currentStock) || 0;
  const isOutOfStock = stockQty <= 0;
  const isLowStock = stockQty > 0 && stockQty < 20;

  let stockProgressColor: "success" | "warning" | "error" = "success";
  let stockHealthText = "Healthy Stock Level";
  if (isOutOfStock) {
    stockProgressColor = "error";
    stockHealthText = "Out of Stock - Restock Needed";
  } else if (isLowStock) {
    stockProgressColor = "warning";
    stockHealthText = "Low Stock - Reorder Soon";
  }

  // Visual progress value (cap at 100)
  const stockProgressValue = isOutOfStock ? 0 : Math.min(100, (stockQty / 120) * 100);

  const detailFields = [
    {
      label: t("productCode"),
      value: row.code,
      icon: <QrCodeOutlined fontSize="small" sx={{ color: "primary.main" }} />,
    },
    {
      label: t("category"),
      value: row.type === "MEDICINE" ? t("medicine") : t("farmSupply"),
      icon: <CategoryOutlined fontSize="small" sx={{ color: "primary.main" }} />,
    },
    {
      label: t("unit"),
      value: row.unit,
      icon: <ScaleOutlined fontSize="small" sx={{ color: "primary.main" }} />,
    },
    {
      label: t("batchCount"),
      value: String(row.batchCount),
      icon: <LayersOutlined fontSize="small" sx={{ color: "primary.main" }} />,
    },
  ];

  return (
    <Stack spacing={2.5} sx={{ py: 0.5 }}>
      {/* Premium Gradient Header Banner */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          backgroundImage:
            "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent), color-mix(in srgb, var(--mui-palette-secondary-main) 4%, transparent))",
          border: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(8px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              width: 48,
              height: 48,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Inventory2Outlined />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Product Details
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 850, mt: 0.25, lineHeight: 1.2 }}>
              {row.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontFamily: "monospace" }}>
              {row.searchName || row.code}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Status Badges */}
      <Stack direction="row" spacing={1.25}>
        <Chip
          label={row.isActive ? common("active") : common("inactive")}
          color={row.isActive ? "success" : "warning"}
          variant="outlined"
          size="small"
          sx={{ fontWeight: 700, borderRadius: 1.5 }}
        />
        <Chip
          label={row.stockState === "IN_STOCK" ? t("inStock") : t("outOfStock")}
          color={row.stockState === "IN_STOCK" ? "success" : "error"}
          variant="outlined"
          size="small"
          sx={{ fontWeight: 700, borderRadius: 1.5 }}
        />
      </Stack>

      {/* Full-width Stock Health & Progress Indicator */}
      <Card
        variant="glass"
        sx={{
          backgroundImage:
            "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-background-paper) 80%, transparent), color-mix(in srgb, var(--mui-palette-background-paper) 95%, transparent))",
        }}
      >
        <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
          <Stack spacing={1.5}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                Stock Level
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {row.currentStock} <Typography component="span" variant="body2" color="text.secondary">{row.unit}</Typography>
              </Typography>
            </Stack>

            <Box>
              <LinearProgress
                variant="determinate"
                value={stockProgressValue}
                color={stockProgressColor}
                sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover" }}
              />
              <Typography variant="caption" color={`${stockProgressColor}.main`} sx={{ fontWeight: 800, display: "block", mt: 0.75 }}>
                • {stockHealthText}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Grid of detail fields */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 1.5,
        }}
      >
        {detailFields.map((field) => (
          <Card
            key={field.label}
            variant="outlined"
            sx={{
              borderRadius: 2.5,
              transition: "transform 140ms ease",
              "&:hover": { transform: "translateY(-1px)" },
            }}
          >
            <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                {field.icon}
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {field.label}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ fontWeight: 850 }} noWrap>
                {field.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Movement Metrics Card */}
      <Card variant="outlined">
        <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 }, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block" }}>
              Total Stock Movements
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 850, mt: 0.25 }}>
              {row.movementCount} transactions
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: "action.hover", color: "text.secondary" }}>
            <LayersOutlined />
          </Avatar>
        </CardContent>
      </Card>

      <Divider />

      {/* Actions Stack */}
      <Stack spacing={1.25}>
        <Button
          component={Link}
          href={`/batches?productId=${row.id}`}
          variant="contained"
          startIcon={<OpenInNew />}
          onClick={onClose}
          fullWidth
        >
          {t("openBatches")}
        </Button>
        {canEdit && (
          <Button
            component={Link}
            href={`/products/${row.id}/edit`}
            variant="outlined"
            startIcon={<EditOutlined />}
            onClick={onClose}
            fullWidth
          >
            {t("editAction")}
          </Button>
        )}
        <Button variant="text" color="inherit" onClick={onClose} fullWidth>
          {actions("close")}
        </Button>
      </Stack>
    </Stack>
  );
}
