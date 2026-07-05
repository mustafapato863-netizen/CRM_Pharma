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
  Chip,
  Divider,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AccountBalanceWalletOutlined,
  Download as DownloadIcon,
  FilterAlt as FilterAltIcon,
  Inventory2Outlined,
  Print as PrintIcon,
  Search as SearchIcon,
  TrendingDownOutlined,
  TrendingUpOutlined,
  PersonOutlineOutlined,
  QrCodeOutlined,
  AccountCircleOutlined,
} from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { AppDataGrid } from "@/shared/ui/app-data-grid";
import { AppDrawer } from "@/shared/ui/app-drawer";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";
import { MetricCard } from "@/shared/ui/metric-card";
import { StatusChip } from "@/shared/ui/status-chip";
import { EmptyState } from "@/components/empty-state";
import { formatDateTime } from "@/shared/lib/date";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { exportLedgerWorkbook } from "@/shared/lib/export/ledgerExport";
import { getLedgerExportRowsAction } from "../actions/ledger-actions";
import type { LedgerPartyRow, LedgerTimelineRow } from "../types";

function formatMoneyLocalized(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getMovementLabel(type: string, t: ReturnType<typeof useTranslations>) {
  switch (type) {
    case "STOCK_IN":
      return t("stockIn");
    case "STOCK_OUT":
      return t("stockOut");
    case "CUSTOMER_BALANCE":
      return t("customerBalance");
    case "SUPPLIER_BALANCE":
      return t("supplierBalance");
    case "DUE_PAYMENT":
      return t("duePayment");
    default:
      return type.replaceAll("_", " ");
  }
}

function getMovementTone(
  type: string,
): "default" | "success" | "warning" | "error" | "info" {
  if (type === "STOCK_IN" || type === "CUSTOMER_BALANCE") return "success";
  if (type === "STOCK_OUT" || type === "SUPPLIER_BALANCE") return "error";
  if (type === "DUE_PAYMENT") return "warning";
  return "info";
}

function translateBalanceType(
  type: string,
  t: ReturnType<typeof useTranslations>,
) {
  if (type === "Receivable") return t("receivable");
  if (type === "Payable") return t("payable");
  return t("settled");
}

export function LedgerPageClient({
  parties,
  rows,
  totalCount,
  totals,
  initialFilters,
  canExport,
}: {
  parties: LedgerPartyRow[];
  rows: LedgerTimelineRow[];
  totalCount: number;
  totals: {
    stockInValue: number;
    stockOutValue: number;
    movementCount: number;
    lastMovementDate: string;
  };
  initialFilters: {
    partyId: string;
    partyType: string;
    movementType: string;
    status: string;
    reference: string;
    search: string;
    from: string;
    to: string;
    page: number;
    pageSize: number;
  };
  canExport: boolean;
}) {
  const t = useTranslations("ledger");
  const common = useTranslations("common");
  const actions = useTranslations("actions");
  const locale = useLocale() as "en" | "ar";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<LedgerTimelineRow | null>(null);

  const [partyId, setPartyId] = useState(initialFilters.partyId);
  const [partyType, setPartyType] = useState(initialFilters.partyType);
  const [movementType, setMovementType] = useState(initialFilters.movementType);
  const [status, setStatus] = useState(initialFilters.status);
  const [reference, setReference] = useState(initialFilters.reference);
  const [search, setSearch] = useState(initialFilters.search);
  const [from, setFrom] = useState(initialFilters.from);
  const [to, setTo] = useState(initialFilters.to);

  const debouncedSearch = useDebounce(search, 250);
  const debouncedReference = useDebounce(reference, 250);

  const selectedParty = useMemo(
    () => parties.find((party) => party.id === partyId) ?? null,
    [parties, partyId],
  );

  const updateFilters = (newFilters: Partial<typeof initialFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    const merged = {
      partyId,
      partyType,
      movementType,
      status,
      reference,
      search,
      from,
      to,
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
    updateFilters({ reference: debouncedReference });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedReference]);

  useEffect(() => {
    setPartyId(initialFilters.partyId);
    setPartyType(initialFilters.partyType);
    setMovementType(initialFilters.movementType);
    setStatus(initialFilters.status);
    setReference(initialFilters.reference);
    setSearch(initialFilters.search);
    setFrom(initialFilters.from);
    setTo(initialFilters.to);
  }, [initialFilters]);

  async function handleExport() {
    const exportRows = await getLedgerExportRowsAction({
      partyId,
      partyType,
      movementType,
      status,
      reference,
      search,
      from,
      to,
    });
    const buffer = await exportLedgerWorkbook(exportRows);
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ledger.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  }

  const columns = useMemo<GridColDef<LedgerTimelineRow>[]>(
    () => [
      {
        field: "date",
        headerName: t("date"),
        minWidth: 170,
        valueFormatter: (value) => formatDateTime(String(value), locale),
      },
      {
        field: "reference",
        headerName: t("reference"),
        minWidth: 150,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
            {row.reference || "-"}
          </Typography>
        ),
      },
      {
        field: "movementType",
        headerName: t("movementType"),
        minWidth: 150,
        renderCell: ({ row }) => (
          <StatusChip
            label={getMovementLabel(row.movementType, t)}
            tone={getMovementTone(row.movementType)}
          />
        ),
      },
      { field: "partyName", headerName: t("party"), minWidth: 180, flex: 1 },
      {
        field: "productName",
        headerName: t("product"),
        minWidth: 230,
        flex: 1.2,
        renderCell: ({ row }) => (
          <Typography variant="body2" noWrap>
            {row.productName || "-"}
          </Typography>
        ),
      },
      { field: "batchNumber", headerName: t("batch"), minWidth: 135 },
      {
        field: "quantity",
        headerName: t("quantity"),
        minWidth: 110,
        align: "right",
        headerAlign: "right",
      },
      {
        field: "unitPrice",
        headerName: t("unitPrice"),
        minWidth: 120,
        align: "right",
        headerAlign: "right",
      },
      {
        field: "total",
        headerName: t("total"),
        minWidth: 130,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{
              color: row.signedTotal < 0 ? "error.main" : "success.main",
              fontWeight: 850,
            }}
          >
            {row.total}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: common("status"),
        minWidth: 110,
        renderCell: ({ row }) => (
          <Chip size="small" variant="outlined" label={row.status} />
        ),
      },
      { field: "createdBy", headerName: t("createdBy"), minWidth: 150 },
    ],
    [common, locale, t],
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
            xl: "repeat(5, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        <MetricCard
          label={t("currentBalance")}
          value={selectedParty?.currentBalance ?? "-"}
          detail={
            selectedParty
              ? translateBalanceType(selectedParty.balanceType, t)
              : t("allParties")
          }
          icon={<AccountBalanceWalletOutlined fontSize="small" />}
          tone="info"
        />
        <MetricCard
          label={t("totalStockIn")}
          value={formatMoneyLocalized(totals.stockInValue, locale)}
          icon={<TrendingUpOutlined fontSize="small" />}
          tone="success"
        />
        <MetricCard
          label={t("totalStockOut")}
          value={formatMoneyLocalized(totals.stockOutValue, locale)}
          icon={<TrendingDownOutlined fontSize="small" />}
          tone="error"
        />
        <MetricCard
          label={t("movementCount")}
          value={String(totals.movementCount)}
          icon={<Inventory2Outlined fontSize="small" />}
          tone="warning"
        />
        <MetricCard
          label={t("lastMovementDate")}
          value={
            totals.lastMovementDate
              ? formatDateTime(totals.lastMovementDate, locale)
              : "-"
          }
          detail={t("derivedHint")}
          icon={<SearchIcon fontSize="small" />}
          tone="info"
        />
      </Box>

      <FilterToolbar title={t("title")} subtitle={t("searchPlaceholder")}>
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(240px, 1.3fr) repeat(4, minmax(150px, 0.75fr))",
              },
              gap: 1.5,
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
              value={partyId}
              onChange={(event) => {
                setPartyId(event.target.value);
                updateFilters({ partyId: event.target.value });
              }}
              label={t("party")}
            >
              <MenuItem value="">{t("allParties")}</MenuItem>
              {parties.map((party) => (
                <MenuItem key={party.id} value={party.id}>
                  {party.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              value={movementType}
              onChange={(event) => {
                setMovementType(event.target.value);
                updateFilters({ movementType: event.target.value });
              }}
              label={t("movementType")}
            >
              <MenuItem value="">{t("allMovements")}</MenuItem>
              {[
                "STOCK_IN",
                "STOCK_OUT",
                "CUSTOMER_BALANCE",
                "SUPPLIER_BALANCE",
                "DUE_PAYMENT",
              ].map((type) => (
                <MenuItem key={type} value={type}>
                  {getMovementLabel(type, t)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              size="small"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                updateFilters({ from: event.target.value });
              }}
              label={common("from")}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              type="date"
              size="small"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                updateFilters({ to: event.target.value });
              }}
              label={common("to")}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}
          >
            <TextField
              size="small"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              label={t("reference")}
              sx={{ minWidth: 180 }}
            />
            {canExport ? (
              <Button
                variant="outlined"
                onClick={handleExport}
                startIcon={<DownloadIcon />}
              >
                {t("exportExcel")}
              </Button>
            ) : null}
            <Button
              variant="outlined"
              onClick={() => window.print()}
              startIcon={<PrintIcon />}
            >
              {t("print")}
            </Button>
            <Button
              variant="text"
              startIcon={<FilterAltIcon />}
              onClick={() => {
                setPartyId("");
                setPartyType("");
                setMovementType("");
                setStatus("");
                setReference("");
                setSearch("");
                setFrom("");
                setTo("");
                updateFilters({
                  partyId: "",
                  partyType: "",
                  movementType: "",
                  status: "",
                  reference: "",
                  search: "",
                  from: "",
                  to: "",
                  page: 1,
                });
              }}
            >
              {actions("clearFilters")}
            </Button>
          </Stack>
        </Stack>
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
            onRowClick={(params) =>
              setSelected(params.row as LedgerTimelineRow)
            }
            noRowsOverlay={() => (
              <EmptyState
                title={t("emptyTitle")}
                description={t("emptyDescription")}
              />
            )}
          />
        </Box>
      </Card>

      <AppDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        width={460}
      >
        {selected ? (
          <Stack spacing={2.5} sx={{ py: 0.5 }}>
            {/* Themed Gradient Header Banner based on Movement Tone */}
            {(() => {
              const tone = getMovementTone(selected.movementType);
              let gradient = "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-info-main) 12%, transparent), color-mix(in srgb, var(--mui-palette-secondary-main) 4%, transparent))";
              let avatarBg = "info.main";
              let HeaderIcon = AccountBalanceWalletOutlined;

              if (tone === "success") {
                gradient = "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-success-main) 12%, transparent), color-mix(in srgb, var(--mui-palette-background-paper) 95%, transparent))";
                avatarBg = "success.main";
                HeaderIcon = TrendingUpOutlined;
              } else if (tone === "error") {
                gradient = "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-error-main) 12%, transparent), color-mix(in srgb, var(--mui-palette-background-paper) 95%, transparent))";
                avatarBg = "error.main";
                HeaderIcon = TrendingDownOutlined;
              } else if (tone === "warning") {
                gradient = "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-warning-main) 12%, transparent), color-mix(in srgb, var(--mui-palette-background-paper) 95%, transparent))";
                avatarBg = "warning.main";
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
                        {t("movementType")}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 850, mt: 0.25, lineHeight: 1.2 }}>
                        {getMovementLabel(selected.movementType, t)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {formatDateTime(selected.date, locale)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })()}

            {/* Status Chip */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <StatusChip
                label={selected.status}
                tone={selected.status === "POSTED" ? "success" : "warning"}
              />
            </Stack>

            {/* Financial Summary Card */}
            <Card variant="glass">
              <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
                <Stack spacing={1.5}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    Financial Summary
                  </Typography>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                    <Typography variant="body2" color="text.secondary">
                      Quantity × Unit Price
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {selected.quantity} × {selected.unitPrice}
                    </Typography>
                  </Stack>
                  <Divider sx={{ borderStyle: "dashed" }} />
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Total Amount
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 900,
                        color:
                          getMovementTone(selected.movementType) === "success"
                            ? "success.main"
                            : getMovementTone(selected.movementType) === "error"
                            ? "error.main"
                            : "text.primary",
                      }}
                    >
                      {selected.total}
                    </Typography>
                  </Stack>
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
              {[
                {
                  label: t("reference"),
                  value: selected.reference || "-",
                  icon: <QrCodeOutlined fontSize="small" sx={{ color: "primary.main" }} />,
                },
                {
                  label: t("party"),
                  value: selected.partyName,
                  icon: <PersonOutlineOutlined fontSize="small" sx={{ color: "primary.main" }} />,
                },
                {
                  label: t("product"),
                  value: selected.productName || "-",
                  icon: <Inventory2Outlined fontSize="small" sx={{ color: "primary.main" }} />,
                  fullWidth: true,
                },
                {
                  label: t("batch"),
                  value: selected.batchNumber || "-",
                  icon: <Inventory2Outlined fontSize="small" sx={{ color: "primary.main" }} />,
                },
                {
                  label: t("createdBy"),
                  value: selected.createdBy,
                  icon: <AccountCircleOutlined fontSize="small" sx={{ color: "primary.main" }} />,
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

            {/* Actions / Close */}
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => window.print()}
                startIcon={<PrintIcon />}
              >
                {t("print")}
              </Button>
              <Button variant="outlined" color="inherit" fullWidth onClick={() => setSelected(null)}>
                {actions("close")}
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </AppDrawer>
    </Stack>
  );
}
