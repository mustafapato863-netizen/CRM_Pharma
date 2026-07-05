"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CalendarMonthOutlined,
  ChevronRight as ChevronRightIcon,
  FilterAlt as FilterAltIcon,
  Inventory2Outlined,
  Launch as LaunchIcon,
  Search as SearchIcon,
  WarningAmberOutlined,
  QrCodeOutlined,
  PersonOutlineOutlined,
} from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import type {
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import { AppDataGrid } from "@/shared/ui/app-data-grid";
import { AppDrawer } from "@/shared/ui/app-drawer";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";
import { StatusChip } from "@/shared/ui/status-chip";
import { EmptyState } from "@/components/empty-state";
import { formatDateTime } from "@/shared/lib/date";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface BatchAlertRow {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  batchNumber: string;
  expiryDate: string;
  expiryDays: number | null;
  currentQuantity: number;
  isExpired: boolean;
  isSoon: boolean;
  supplierName: string;
  supplierId: string;
  purchaseRef: string;
  progress: number;
}

function StatCard({
  label,
  value,
  active,
  tone,
  onClick,
}: {
  label: string;
  value: string;
  active: boolean;
  tone: "info" | "success" | "warning" | "error";
  onClick: () => void;
}) {
  return (
    <Card
      variant="glass"
      onClick={onClick}
      sx={{
        borderRadius: 3,
        cursor: "pointer",
        borderColor: active ? `${tone}.main` : "divider",
        bgcolor: active ? "action.selected" : "background.paper",
        transition: "transform 150ms ease, border-color 150ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: `${tone}.main`,
        },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 36,
              height: 36,
              borderRadius: 1.75,
              bgcolor: `color-mix(in srgb, var(--mui-palette-${tone}-main) 13%, transparent)`,
              color: `${tone}.main`,
              flexShrink: 0,
            }}
          >
            {tone === "error" ? (
              <WarningAmberOutlined fontSize="small" />
            ) : tone === "warning" ? (
              <CalendarMonthOutlined fontSize="small" />
            ) : (
              <Inventory2Outlined fontSize="small" />
            )}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 750 }}
              noWrap
            >
              {label}
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.25, fontWeight: 900 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function ExpiryAlertsCenter({
  products,
  rows,
  totalCount,
  summaries,
  initialFilters,
}: {
  products: Array<{ id: string; name: string; code: string }>;
  rows: BatchAlertRow[];
  totalCount: number;
  summaries: Array<{ title: string; value: string; type: string }>;
  initialFilters: {
    search: string;
    window: "expired" | "within-7-days" | "within-30-days" | "at-risk" | "all";
    stock: "available" | "all";
    productId: string;
    sortField: string;
    sortDirection: string;
    page: number;
    pageSize: number;
  };
}) {
  const t = useTranslations("expiryAlerts");
  const actions = useTranslations("actions");
  const locale = useLocale() as "en" | "ar";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<BatchAlertRow | null>(null);

  const [search, setSearch] = useState(initialFilters.search);
  const [windowFilter, setWindowFilter] = useState(initialFilters.window);
  const [stock, setStock] = useState(initialFilters.stock);
  const [productId, setProductId] = useState(initialFilters.productId);

  const debouncedSearch = useDebounce(search, 250);

  const updateFilters = (newFilters: Partial<typeof initialFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    const merged = {
      search,
      window: windowFilter,
      stock,
      productId,
      sortField: initialFilters.sortField,
      sortDirection: initialFilters.sortDirection,
      page: initialFilters.page,
      pageSize: initialFilters.pageSize,
      ...newFilters,
    };

    Object.entries(merged).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    if (!newFilters.page && newFilters.page !== 1) params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  useEffect(() => {
    updateFilters({ search: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    setSearch(initialFilters.search);
    setWindowFilter(initialFilters.window);
    setStock(initialFilters.stock);
    setProductId(initialFilters.productId);
  }, [initialFilters]);

  const translateStatTitle = (title: string) => {
    if (title === "Expired") return t("expired");
    if (title === "Expiring within 7 Days") return t("expiring7Days");
    if (title === "Expiring within 30 Days") return t("expiring30Days");
    return t("totalAtRisk");
  };

  const handleStatCardClick = (type: string) => {
    const targetWindow =
      type === "expired"
        ? "expired"
        : type === "7days"
          ? "within-7-days"
          : type === "30days"
            ? "within-30-days"
            : type === "total"
              ? "all"
              : "at-risk";

    setWindowFilter(targetWindow as typeof initialFilters.window);
    updateFilters({
      window: targetWindow as typeof initialFilters.window,
      page: 1,
    });
  };

  const formatDaysRemaining = (days: number | null) => {
    if (days === null) return t("noExpiryDate");
    if (days < 0) return t("daysExpired", { days: Math.abs(days) });
    return t("daysLeft", { days });
  };

  const getStatusTone = (
    row: BatchAlertRow,
  ): "default" | "success" | "warning" | "error" => {
    if (row.isExpired) return "error";
    if (row.expiryDays !== null && row.expiryDays <= 7) return "warning";
    return "default";
  };

  const getStatusLabel = (row: BatchAlertRow) => {
    if (row.isExpired) return t("expired");
    if (row.expiryDays !== null && row.expiryDays <= 7)
      return t("statusUrgent");
    return t("statusAtRisk");
  };

  const columns: GridColDef<BatchAlertRow>[] = [
    {
      field: "productName",
      headerName: t("product"),
      minWidth: 240,
      flex: 1.2,
      renderCell: ({ row }) => (
        <Stack spacing={0.15} sx={{ minWidth: 0, py: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
            {row.productName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.productCode}
          </Typography>
        </Stack>
      ),
    },
    { field: "batchNumber", headerName: t("batchNumber"), minWidth: 145 },
    {
      field: "expiryDate",
      headerName: t("expiryDate"),
      minWidth: 170,
      valueFormatter: (value) =>
        value ? formatDateTime(String(value), locale) : "-",
    },
    {
      field: "expiryDays",
      headerName: t("daysRemainingLabel"),
      minWidth: 150,
      align: "right",
      headerAlign: "right",
      renderCell: ({ row }) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 800,
            color: row.isExpired
              ? "error.main"
              : row.expiryDays !== null && row.expiryDays <= 7
                ? "warning.main"
                : "text.primary",
          }}
        >
          {formatDaysRemaining(row.expiryDays)}
        </Typography>
      ),
    },
    {
      field: "currentQuantity",
      headerName: t("currentQuantity"),
      minWidth: 130,
      align: "right",
      headerAlign: "right",
    },
    { field: "supplierName", headerName: t("supplier"), minWidth: 160 },
    {
      field: "status",
      headerName: t("status"),
      minWidth: 125,
      sortable: false,
      renderCell: ({ row }) => (
        <StatusChip label={getStatusLabel(row)} tone={getStatusTone(row)} />
      ),
    },
    {
      field: "actions",
      headerName: t("actions"),
      minWidth: 92,
      sortable: false,
      filterable: false,
      align: "right",
      headerAlign: "right",
      renderCell: () => (
        <IconButton size="small" color="primary" aria-label={t("detailsTitle")}>
          <ChevronRightIcon
            sx={{ transform: locale === "ar" ? "rotate(180deg)" : "none" }}
          />
        </IconButton>
      ),
    },
  ];

  const sortModel = useMemo<GridSortModel>(
    () => [
      {
        field: initialFilters.sortField || "expiryDate",
        sort: initialFilters.sortDirection === "desc" ? "desc" : "asc",
      },
    ],
    [initialFilters.sortDirection, initialFilters.sortField],
  );

  const paginationModel: GridPaginationModel = {
    page: initialFilters.page - 1,
    pageSize: initialFilters.pageSize,
  };

  return (
    <Stack spacing={2.25}>
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
        {summaries.map((stat) => {
          const isActive =
            (stat.type === "expired" && windowFilter === "expired") ||
            (stat.type === "7days" && windowFilter === "within-7-days") ||
            (stat.type === "30days" && windowFilter === "within-30-days") ||
            (stat.type === "total" && windowFilter === "all");
          const tone =
            stat.type === "expired"
              ? "error"
              : stat.type === "7days" || stat.type === "30days"
                ? "warning"
                : "info";

          return (
            <StatCard
              key={stat.title}
              label={translateStatTitle(stat.title)}
              value={stat.value}
              active={isActive}
              tone={tone}
              onClick={() => handleStatCardClick(stat.type)}
            />
          );
        })}
      </Box>

      <FilterToolbar title={t("title")} subtitle={t("searchPlaceholder")}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(240px, 1.35fr) minmax(180px, 0.85fr) minmax(160px, 0.75fr) auto",
            },
            gap: 1.5,
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            size="small"
            value={productId}
            onChange={(event) => {
              setProductId(event.target.value);
              updateFilters({ productId: event.target.value });
            }}
            label={t("product")}
          >
            <MenuItem value="">{t("allAlerts")}</MenuItem>
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.code} - {product.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            value={stock}
            onChange={(event) => {
              setStock(event.target.value as "available" | "all");
              updateFilters({
                stock: event.target.value as "available" | "all",
              });
            }}
            label={t("currentQuantity")}
          >
            <MenuItem value="all">{t("allAlerts")}</MenuItem>
            <MenuItem value="available">{t("statusAtRisk")}</MenuItem>
          </TextField>
          <Button
            variant="text"
            startIcon={<FilterAltIcon />}
            onClick={() => {
              setSearch("");
              setWindowFilter("at-risk");
              setStock("all");
              setProductId("");
              updateFilters({
                search: "",
                window: "at-risk",
                stock: "all",
                productId: "",
                page: 1,
              });
            }}
          >
            {actions("clearFilters")}
          </Button>
        </Box>
      </FilterToolbar>

      <Card
        variant="outlined"
        sx={{ borderRadius: 3.5, overflow: "hidden", position: "relative" }}
      >
        {isPending ? (
          <LinearProgress
            sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 2 }}
          />
        ) : null}
        <Box sx={{ height: 650 }}>
          <AppDataGrid
            rows={rows}
            columns={columns}
            rowCount={totalCount}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={(model) => {
              updateFilters({ page: model.page + 1, pageSize: model.pageSize });
            }}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={(model) => {
              const next = model[0];
              updateFilters({
                sortField: next?.field || "expiryDate",
                sortDirection: next?.sort || "asc",
                page: 1,
              });
            }}
            onRowClick={(params) => setSelected(params.row as BatchAlertRow)}
            noRowsOverlay={() => (
              <EmptyState title={t("title")} description={t("description")} />
            )}
          />
        </Box>
      </Card>

      <AppDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        width={440}
      >
        {selected ? (
          <Stack spacing={2.5} sx={{ py: 0.5 }}>
            {/* Themed Gradient Header Banner based on Expiry Status Tone */}
            {(() => {
              const tone = getStatusTone(selected);
              let gradient = "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-info-main) 12%, transparent), color-mix(in srgb, var(--mui-palette-secondary-main) 4%, transparent))";
              let avatarBg = "info.main";
              let HeaderIcon = Inventory2Outlined;

              if (tone === "error") {
                gradient = "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-error-main) 12%, transparent), color-mix(in srgb, var(--mui-palette-background-paper) 95%, transparent))";
                avatarBg = "error.main";
                HeaderIcon = WarningAmberOutlined;
              } else if (tone === "warning") {
                gradient = "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-warning-main) 12%, transparent), color-mix(in srgb, var(--mui-palette-background-paper) 95%, transparent))";
                avatarBg = "warning.main";
                HeaderIcon = CalendarMonthOutlined;
              } else if (tone === "success") {
                gradient = "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-success-main) 12%, transparent), color-mix(in srgb, var(--mui-palette-background-paper) 95%, transparent))";
                avatarBg = "success.main";
              }

              return (
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    backgroundImage: gradient,
                    border: "1px solid",
                    borderColor: "divider",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: avatarBg,
                        color: "white",
                        width: 48,
                        height: 48,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    >
                      <HeaderIcon />
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}
                      >
                        {t("detailsTitle")}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 850, mt: 0.25, lineHeight: 1.2 }}>
                        {selected.productName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontFamily: "monospace" }}>
                        {selected.productCode} • {selected.batchNumber}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })()}

            {/* Status Chip */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <StatusChip
                label={getStatusLabel(selected)}
                tone={getStatusTone(selected)}
              />
            </Stack>

            {/* Shelf Life Countdown Progress Card */}
            {selected.expiryDays !== null && (
              <Card variant="glass">
                <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                        {t("daysRemainingLabel")}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        {formatDaysRemaining(selected.expiryDays)}
                      </Typography>
                    </Stack>

                    <Box>
                      <LinearProgress
                        variant="determinate"
                        value={selected.isExpired ? 0 : Math.min(100, (selected.expiryDays / 365) * 100)}
                        color={getStatusTone(selected) === "error" ? "error" : getStatusTone(selected) === "warning" ? "warning" : "success"}
                        sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover" }}
                      />
                      <Typography
                        variant="caption"
                        color={getStatusTone(selected) === "error" ? "error.main" : getStatusTone(selected) === "warning" ? "warning.main" : "success.main"}
                        sx={{ fontWeight: 800, display: "block", mt: 0.75 }}
                      >
                        • {selected.isExpired ? "Batch has expired" : `Expires in ${selected.expiryDays} days`}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Grid of detail fields */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 1.5,
              }}
            >
              {[
                {
                  label: t("expiryDate"),
                  value: selected.expiryDate ? formatDateTime(selected.expiryDate, locale) : "-",
                  icon: <CalendarMonthOutlined fontSize="small" sx={{ color: "primary.main" }} />,
                },
                {
                  label: t("currentQuantity"),
                  value: String(selected.currentQuantity),
                  icon: <Inventory2Outlined fontSize="small" sx={{ color: "primary.main" }} />,
                },
                {
                  label: t("supplier"),
                  value: selected.supplierName || t("noSupplier"),
                  icon: <PersonOutlineOutlined fontSize="small" sx={{ color: "primary.main" }} />,
                  fullWidth: true,
                },
                {
                  label: t("purchaseReference"),
                  value: selected.purchaseRef || t("noPurchase"),
                  icon: <QrCodeOutlined fontSize="small" sx={{ color: "primary.main" }} />,
                  fullWidth: true,
                },
              ].map((field) => (
                <Box
                  key={field.label}
                  sx={{
                    gridColumn: field.fullWidth ? "span 2" : "span 1",
                  }}
                >
                  <Card
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
                </Box>
              ))}
            </Box>

            <Divider />

            {/* Actions Stack */}
            <Stack spacing={1.25}>
              <Button
                variant="contained"
                startIcon={<LaunchIcon />}
                onClick={() => {
                  setSelected(null);
                  router.push(`/products?q=${encodeURIComponent(selected.productCode)}`);
                }}
                fullWidth
              >
                {t("linkToProduct")}
              </Button>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  startIcon={<LaunchIcon />}
                  onClick={() => {
                    setSelected(null);
                    router.push(`/batches?productId=${encodeURIComponent(selected.productId)}`);
                  }}
                  fullWidth
                >
                  {t("linkToBatch")}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LaunchIcon />}
                  onClick={() => {
                    setSelected(null);
                    router.push(`/inventory/movements?search=${encodeURIComponent(selected.batchNumber)}`);
                  }}
                  fullWidth
                >
                  {t("linkToMovements")}
                </Button>
              </Stack>
              <Button variant="text" color="inherit" onClick={() => setSelected(null)} fullWidth>
                {actions("close")}
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </AppDrawer>
    </Stack>
  );
}
