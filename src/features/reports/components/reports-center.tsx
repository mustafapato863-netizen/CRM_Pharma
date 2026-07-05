"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
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
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import {
  AccountBalanceWalletOutlined,
  AddRounded,
  AssessmentOutlined,
  Download as DownloadIcon,
  EventBusyOutlined,
  Inventory2Outlined,
  MoreHorizRounded,
  PointOfSaleOutlined,
  Print as PrintIcon,
  ReceiptLongOutlined,
  ReportProblemOutlined,
  ScheduleOutlined,
  TrendingUpRounded,
} from "@mui/icons-material";
import { EmptyState } from "@/components/empty-state";
import { showSuccess } from "@/shared/lib/toast";
import {
  exportReportCsv,
  exportReportWorkbook,
} from "@/shared/lib/export/reportsExport";
import { getReportExportRowsAction } from "../actions/report-actions";
import type { ReportKind, ReportRow, ReportSummary } from "../types";

const tabsList: Array<{ key: ReportKind; labelKey: string; icon: ReactNode }> =
  [
    { key: "stock", labelKey: "tabStock", icon: <Inventory2Outlined /> },
    {
      key: "inventory",
      labelKey: "tabInventory",
      icon: <AssessmentOutlined />,
    },
    {
      key: "low-stock",
      labelKey: "tabLowStock",
      icon: <ReportProblemOutlined />,
    },
    {
      key: "near-expiry",
      labelKey: "tabNearExpiry",
      icon: <ScheduleOutlined />,
    },
    { key: "expired", labelKey: "tabExpired", icon: <EventBusyOutlined /> },
    { key: "movements", labelKey: "tabMovements", icon: <TrendingUpRounded /> },
    { key: "parties", labelKey: "tabParties", icon: <ReceiptLongOutlined /> },
    {
      key: "ledger",
      labelKey: "tabLedger",
      icon: <AccountBalanceWalletOutlined />,
    },
  ];

type Tone = "info" | "success" | "warning" | "error" | "secondary";

function getSummaryInfo(
  title: string,
  helper: string,
  t: ReturnType<typeof useTranslations>,
) {
  switch (title) {
    case "Total Sales":
      return {
        title: t("totalSales"),
        helper: t("salesHelper"),
        tone: "info" as const,
      };
    case "Total Purchases":
      return {
        title: t("totalPurchases"),
        helper: t("purchasesHelper"),
        tone: "secondary" as const,
      };
    case "Gross Profit":
      return {
        title: t("grossProfit"),
        helper: t("profitHelper"),
        tone: "success" as const,
      };
    case "Products":
      return {
        title: t("products"),
        helper: t("summaryActiveProducts"),
        tone: "info" as const,
      };
    case "Low Stock":
      return {
        title: t("lowStock"),
        helper: t("summaryLowStock"),
        tone: "warning" as const,
      };
    case "Expired Items":
      return {
        title: t("expiredItems"),
        helper: t("expiredHelper"),
        tone: "error" as const,
      };
    default:
      return { title, helper, tone: "info" as const };
  }
}

function isMoneyMetric(title: string) {
  return (
    title === "Total Sales" ||
    title === "Total Purchases" ||
    title === "Gross Profit"
  );
}

function formatMetricValue(title: string, value: string, locale: "en" | "ar") {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;

  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    ...(isMoneyMetric(title)
      ? {
          style: "currency" as const,
          currency: "EGP",
          maximumFractionDigits: 0,
        }
      : { maximumFractionDigits: 0 }),
  }).format(numeric);
}

function formatReportDate(dateStr: string, locale: "en" | "ar") {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium",
  }).format(date);
}

function compactNumber(value: number, locale: "en" | "ar") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function amountOf(row: ReportRow) {
  const amount = Number(row.amount);
  if (!Number.isNaN(amount) && amount > 0) return amount;
  const quantity = Number(row.quantity);
  return Number.isNaN(quantity) ? 1 : Math.max(quantity, 1);
}

function groupRows(rows: ReportRow[], field: "category" | "status") {
  const grouped = rows.reduce<Array<{ label: string; value: number }>>(
    (acc, row) => {
      const label = row[field] || "-";
      const current = acc.find((item) => item.label === label);
      if (current) current.value += amountOf(row);
      else acc.push({ label, value: amountOf(row) });
      return acc;
    },
    [],
  );

  return grouped.sort((a, b) => b.value - a.value).slice(0, 5);
}

function buildTrend(rows: ReportRow[]) {
  const grouped = rows.reduce<
    Array<{ label: string; value: number; time: number }>
  >((acc, row) => {
    const date = new Date(row.date);
    if (Number.isNaN(date.getTime())) return acc;
    const label = date.toLocaleDateString("en-US", { month: "short" });
    const current = acc.find((item) => item.label === label);
    if (current) current.value += amountOf(row);
    else acc.push({ label, value: amountOf(row), time: date.getTime() });
    return acc;
  }, []);

  return grouped.sort((a, b) => a.time - b.time).slice(-6);
}

function ReportsMetricCard({
  item,
  icon,
}: {
  item: ReportSummary;
  icon: ReactNode;
}) {
  const t = useTranslations("reports");
  const locale = useLocale() as "en" | "ar";
  const info = getSummaryInfo(item.title, item.helper, t);

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{ justifyContent: "space-between" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 750 }}
            >
              {info.title}
            </Typography>
            <Typography
              variant="h6"
              sx={{ mt: 0.4, fontWeight: 900, letterSpacing: "-0.035em" }}
            >
              {formatMetricValue(item.title, item.value, locale)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.35 }}
            >
              {info.helper}
            </Typography>
          </Box>
          <Avatar
            variant="rounded"
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: `color-mix(in srgb, var(--mui-palette-${info.tone}-main) 12%, transparent)`,
              color: `${info.tone}.main`,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PanelCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
              {title}
            </Typography>
            {action}
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function TrendPanel({ rows }: { rows: ReportRow[] }) {
  const t = useTranslations("reports");
  const locale = useLocale() as "en" | "ar";
  const trend = buildTrend(rows);
  const max = Math.max(...trend.map((item) => item.value), 0);

  return (
    <PanelCard
      title={t("activityTrend")}
      action={<Chip size="small" label={t("currentView")} variant="outlined" />}
    >
      {trend.length ? (
        <Box
          sx={{
            height: 164,
            display: "grid",
            gridTemplateColumns: `repeat(${trend.length}, minmax(0, 1fr))`,
            gap: 1.25,
            alignItems: "end",
            borderBottom: 1,
            borderColor: "divider",
            pb: 1,
          }}
        >
          {trend.map((item) => (
            <Stack
              key={item.label}
              spacing={0.75}
              sx={{ alignItems: "center", justifyContent: "flex-end" }}
            >
              <Typography variant="caption" color="text.secondary">
                {compactNumber(item.value, locale)}
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 34,
                  height: `${Math.max(12, (item.value / max) * 112)}px`,
                  borderRadius: 1.25,
                  bgcolor: "primary.main",
                  boxShadow:
                    "0 10px 24px color-mix(in srgb, var(--mui-palette-primary-main) 24%, transparent)",
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Stack>
          ))}
        </Box>
      ) : (
        <EmptyState title={t("noRowsTitle")} description={t("noChartData")} />
      )}
    </PanelCard>
  );
}

function DonutPanel({
  title,
  rows,
  field,
}: {
  title: string;
  rows: ReportRow[];
  field: "category" | "status";
}) {
  const t = useTranslations("reports");
  const locale = useLocale() as "en" | "ar";
  const grouped = groupRows(rows, field);
  const total = grouped.reduce((sum, item) => sum + item.value, 0);
  const tones: Tone[] = ["info", "success", "warning", "error", "secondary"];

  // Generate dynamic conic-gradient background
  let backgroundGradient = "background.default";
  if (grouped.length > 0) {
    let currentPct = 0;
    const slices = grouped.map((item, index) => {
      const pct = total > 0 ? (item.value / total) * 100 : 0;
      const tone = tones[index % tones.length];
      const start = currentPct.toFixed(1);
      currentPct += pct;
      const end = currentPct.toFixed(1);
      return `var(--mui-palette-${tone}-main) ${start}% ${end}%`;
    });
    backgroundGradient = `conic-gradient(${slices.join(", ")})`;
  }

  return (
    <PanelCard title={title}>
      {grouped.length ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: "center" }}
        >
          <Box
            sx={{
              width: 126,
              height: 126,
              borderRadius: "50%",
              flexShrink: 0,
              background: backgroundGradient,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                bgcolor: "background.paper",
              }}
            />
          </Box>
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
            {grouped.map((item, index) => (
              <Stack
                key={item.label}
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", justifyContent: "space-between" }}
              >
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: "center", minWidth: 0 }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: `${tones[index]}.main`,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="caption" noWrap>
                    {item.label}
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 800 }}
                >
                  {compactNumber(item.value, locale)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      ) : (
        <EmptyState title={t("noRowsTitle")} description={t("noChartData")} />
      )}
      {total ? (
        <Typography variant="caption" color="text.secondary">
          {t("basedOnRows", { count: rows.length })}
        </Typography>
      ) : null}
    </PanelCard>
  );
}

export function ReportsCenter({
  summaries,
  rows,
  totalCount,
  initialFilters,
}: {
  summaries: ReportSummary[];
  rows: ReportRow[];
  totalCount: number;
  initialFilters: {
    tab: string;
    search: string;
    from: string;
    to: string;
    page: number;
    pageSize: number;
  };
}) {
  const t = useTranslations("reports");
  const locale = useLocale() as "en" | "ar";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState<ReportKind>(
    initialFilters.tab as ReportKind,
  );

  useEffect(() => {
    setActive(initialFilters.tab as ReportKind);
  }, [initialFilters.tab]);

  const updateFilters = (newFilters: Partial<typeof initialFilters>) => {
    const params = new URLSearchParams(searchParams.toString());
    const merged = {
      ...initialFilters,
      tab: active,
      ...newFilters,
    };

    Object.entries(merged).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        params.set(key, String(value));
      else params.delete(key);
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const exportCurrent = async (kind: "csv" | "xlsx") => {
    const exportRows = await getReportExportRowsAction({
      category: active,
      search: initialFilters.search,
      from: initialFilters.from,
      to: initialFilters.to,
    });
    const fileBase = active.replaceAll(" ", "-");
    if (kind === "csv") {
      const blob = new Blob([exportReportCsv(exportRows)], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileBase}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showSuccess(t("csvExported"));
      return;
    }

    const blob = new Blob([await exportReportWorkbook(exportRows, fileBase)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileBase}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess(t("excelExported"));
  };

  const metricIcons = [
    <PointOfSaleOutlined key="sales" fontSize="small" />,
    <ReceiptLongOutlined key="purchases" fontSize="small" />,
    <AccountBalanceWalletOutlined key="profit" fontSize="small" />,
    <Inventory2Outlined key="products" fontSize="small" />,
    <ReportProblemOutlined key="low" fontSize="small" />,
    <EventBusyOutlined key="expired" fontSize="small" />,
  ];

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1.5}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "stretch", lg: "flex-start" },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}
          >
            {t("title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            {t("description")}
          </Typography>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: { xs: "stretch", lg: "flex-end" } }}
        >
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => void exportCurrent("xlsx")}
          >
            {t("exportDashboard")}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => window.print()}
          >
            {t("customReport")}
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
            xl: "repeat(6, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {summaries.map((item, index) => (
          <ReportsMetricCard
            key={item.title}
            item={item}
            icon={metricIcons[index] ?? metricIcons[0]}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "220px minmax(0, 1fr) 280px" },
          gap: 1.5,
        }}
      >
        <PanelCard title={t("reportCategories")}>
          <Stack spacing={0.5}>
            {tabsList.map((tab) => {
              const selected = active === tab.key;
              return (
                <Button
                  key={tab.key}
                  fullWidth
                  startIcon={tab.icon}
                  onClick={() => {
                    setActive(tab.key);
                    updateFilters({ tab: tab.key, page: 1 });
                  }}
                  sx={{
                    justifyContent: "flex-start",
                    minHeight: 38,
                    px: 1.25,
                    color: selected ? "primary.main" : "text.secondary",
                    bgcolor: selected ? "action.selected" : "transparent",
                    borderRadius: 1.5,
                    fontWeight: selected ? 850 : 700,
                  }}
                >
                  {t(tab.labelKey)}
                </Button>
              );
            })}
          </Stack>
        </PanelCard>

        <Stack spacing={1.5} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            <TrendPanel rows={rows} />
            <DonutPanel
              title={t("topCategories")}
              rows={rows}
              field="category"
            />
            <DonutPanel title={t("stockStatus")} rows={rows} field="status" />
          </Box>

          <Card
            variant="outlined"
            sx={{ overflow: "hidden", position: "relative" }}
          >
            {isPending ? (
              <LinearProgress
                sx={{ position: "absolute", insetInline: 0, top: 0, zIndex: 2 }}
              />
            ) : null}
            <Box
              sx={{
                px: 1.75,
                py: 1.4,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                {t("recentReports")}
              </Typography>
            </Box>
            {rows.length ? (
              <>
                <TableContainer>
                  <Table size="small" sx={{ minWidth: 760 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("rowTitle")}</TableCell>
                        <TableCell>{t("category")}</TableCell>
                        <TableCell>{t("date")}</TableCell>
                        <TableCell>{t("party")}</TableCell>
                        <TableCell align="right">{t("amount")}</TableCell>
                        <TableCell>{t("status")}</TableCell>
                        <TableCell align="center">{t("actions")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 800 }}
                              noWrap
                            >
                              {row.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {row.reference || row.product}
                            </Typography>
                          </TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>
                            {formatReportDate(row.date, locale)}
                          </TableCell>
                          <TableCell>{row.party || "-"}</TableCell>
                          <TableCell align="right">
                            {row.amount || "-"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={row.status || "-"}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" aria-label={t("actions")}>
                              <MoreHorizRounded fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={totalCount}
                  page={initialFilters.page - 1}
                  rowsPerPage={initialFilters.pageSize}
                  rowsPerPageOptions={[10, 20, 50]}
                  onPageChange={(_, page) => updateFilters({ page: page + 1 })}
                  onRowsPerPageChange={(event) =>
                    updateFilters({
                      page: 1,
                      pageSize: Number(event.target.value),
                    })
                  }
                />
              </>
            ) : (
              <Box sx={{ py: 5 }}>
                <EmptyState
                  title={t("noRowsTitle")}
                  description={t("noRowsDescription")}
                />
              </Box>
            )}
          </Card>
        </Stack>

        <Stack spacing={1.5}>
          <PanelCard title={t("frequentlyUsedReports")}>
            <Stack spacing={1}>
              {tabsList.slice(0, 5).map((tab) => (
                <Button
                  key={tab.key}
                  startIcon={tab.icon}
                  onClick={() => {
                    setActive(tab.key);
                    updateFilters({ tab: tab.key, page: 1 });
                  }}
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "start",
                    color: "text.primary",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 850 }} noWrap>
                      {t(tab.labelKey)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {t("currentView")}
                    </Typography>
                  </Box>
                </Button>
              ))}
              <Divider />
              <Button
                variant="outlined"
                onClick={() => updateFilters({ tab: "stock", page: 1 })}
              >
                {t("viewAllReports")}
              </Button>
            </Stack>
          </PanelCard>

          <PanelCard title={t("quickActions")}>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                startIcon={<ScheduleOutlined />}
                onClick={() => window.print()}
              >
                {t("scheduleReport")}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
              >
                {t("print")}
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => void exportCurrent("csv")}
              >
                {t("exportCsv")}
              </Button>
            </Stack>
          </PanelCard>
        </Stack>
      </Box>
    </Stack>
  );
}
