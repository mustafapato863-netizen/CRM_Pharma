import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import {
  ArrowForwardRounded,
  CalendarMonthRounded,
  Inventory2Rounded,
  LayersRounded,
  LocalPharmacyRounded,
  PaymentsRounded,
  PointOfSaleRounded,
  PrintOutlined,
  ReceiptLongRounded,
  ReportProblemRounded,
  SwapHorizRounded,
  WarningAmberRounded,
  WarehouseRounded,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { PageShell } from "@/components/page-shell";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/shared/ui/empty-state";
import { getDashboardStats } from "@/features/dashboard/services/dashboard.service";
import { translations, type Locale } from "@/shared/config/translations";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale =
    cookieStore.get("pharmacy-crm:locale")?.value === "ar" ? "ar" : "en";
  const t = translations[locale].dashboard;

  return { title: t.title, description: t.description };
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function movementQuantityLabel(type: string, quantity: string, locale: Locale) {
  const numeric = Number(quantity);
  if (type === "ADJUSTMENT") return formatNumber(numeric, locale);
  return `${type === "STOCK_OUT" || type === "DAMAGED" ? "-" : "+"}${formatNumber(numeric, locale)}`;
}

function movementChipColor(type: string) {
  if (type === "STOCK_OUT" || type === "DAMAGED") return "error" as const;
  if (type === "ADJUSTMENT") return "default" as const;
  return "success" as const;
}

function movementQuantityColor(type: string) {
  if (type === "STOCK_OUT" || type === "DAMAGED") return "error.main";
  if (type === "ADJUSTMENT") return "text.secondary";
  return "success.main";
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const locale =
    cookieStore.get("pharmacy-crm:locale")?.value === "ar" ? "ar" : "en";
  const t = translations[locale].dashboard;

  let stats;
  try {
    stats = await getDashboardStats();
  } catch {
    return (
      <PageShell>
        <ErrorState title={t.loadError} description={t.loadErrorHint} />
      </PageShell>
    );
  }

  const metrics = [
    {
      label: t.totalProducts,
      value: stats.totalProducts,
      description: t.activeProducts,
      icon: Inventory2Rounded,
      tone: "primary.main",
      toneVar: "--mui-palette-primary-main",
    },
    {
      label: t.totalBatches,
      value: stats.totalBatches,
      description: t.allProducts,
      icon: LayersRounded,
      tone: "secondary.main",
      toneVar: "--mui-palette-secondary-main",
    },
    {
      label: t.expiringSoonTitle,
      value: stats.expiringSoonCount,
      description: t.expiringSoonDescription,
      icon: WarningAmberRounded,
      tone: "warning.main",
      toneVar: "--mui-palette-warning-main",
    },
    {
      label: t.lowStock,
      value: stats.lowStockCount,
      description: t.belowMinimum,
      icon: WarehouseRounded,
      tone: "error.main",
      toneVar: "--mui-palette-error-main",
    },
  ] as const;

  const actions = [
    [t.recordSale, "/sales", PointOfSaleRounded],
    [t.customerReceipt, "/payments", PaymentsRounded],
    [t.addBatch, "/batches", LocalPharmacyRounded],
    [t.salesReturn, "/returns", SwapHorizRounded],
    [t.expiryReview, "/expiry-alerts", ReportProblemRounded],
    [t.printReport, "/reports", PrintOutlined],
  ] as const;

  const actionArrow = (
    <ArrowForwardRounded
      sx={{
        fontSize: 16,
        transform: locale === "ar" ? "scaleX(-1)" : undefined,
      }}
    />
  );

  return (
    <PageShell>
      <Box
        sx={{
          position: "relative",
          isolation: "isolate",
          width: "100%",
          maxWidth: 1180,
          mx: "auto",
          "&::before": {
            content: '\"\"',
            position: "absolute",
            zIndex: -1,
            pointerEvents: "none",
            width: { xs: 320, md: 540 },
            height: { xs: 240, md: 380 },
            top: { xs: -80, md: -170 },
            insetInlineEnd: { xs: -170, md: -220 },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--mui-palette-primary-main) 16%, transparent) 0%, transparent 70%)",
          },
          "&::after": {
            content: '\"\"',
            position: "absolute",
            zIndex: -1,
            pointerEvents: "none",
            width: { xs: 260, md: 420 },
            height: { xs: 180, md: 300 },
            bottom: { xs: 120, md: 30 },
            insetInlineStart: { xs: -160, md: -220 },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--mui-palette-secondary-main) 10%, transparent) 0%, transparent 70%)",
          },
        }}
      >
        <Stack spacing={{ xs: 2, md: 2.5 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Stack spacing={0.5}>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontSize: { xs: "1.75rem", md: "2rem" },
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: "-0.035em",
                }}
              >
                {t.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t.description}
              </Typography>
            </Stack>

            <Chip
              icon={<CalendarMonthRounded fontSize="small" />}
              label={`${t.lastUpdated}: ${formatDate(stats.lastUpdatedAt, locale)}`}
              variant="outlined"
              sx={{
                height: 32,
                fontWeight: 700,
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow:
                  "0 4px 14px color-mix(in srgb, var(--mui-palette-text-primary) 4%, transparent)",
                "& .MuiChip-icon": { color: "primary.main" },
              }}
            />
          </Stack>

          <Grid container spacing={{ xs: 1.5, md: 2 }}>
            {metrics.map((metric) => {
              const MetricIcon = metric.icon;
              return (
                <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Card
                    variant="glass"
                    sx={{
                      height: "100%",
                      minHeight: 160,
                      transition:
                        "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        borderColor: `color-mix(in srgb, var(${metric.toneVar}) 38%, var(--mui-palette-divider))`,
                        boxShadow: `0 18px 36px color-mix(in srgb, var(${metric.toneVar}) 14%, transparent)`,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        p: 2.25,
                        "&:last-child": { pb: 2.25 },
                      }}
                    >
                      <Stack
                        spacing={2.5}
                        sx={{ minHeight: 112, justifyContent: "space-between" }}
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                fontWeight: 800,
                                letterSpacing: "0.075em",
                                textTransform: "uppercase",
                              }}
                            >
                              {metric.label}
                            </Typography>
                            <Typography
                              variant="h4"
                              sx={{
                                mt: 0.875,
                                fontWeight: 800,
                                lineHeight: 1,
                                letterSpacing: "-0.04em",
                              }}
                            >
                              {formatNumber(metric.value, locale)}
                            </Typography>
                          </Box>
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: 1.75,
                              color: metric.tone,
                              background: `linear-gradient(135deg, color-mix(in srgb, var(${metric.toneVar}) 26%, transparent), color-mix(in srgb, var(${metric.toneVar}) 10%, transparent))`,
                              border: `1px solid color-mix(in srgb, var(${metric.toneVar}) 26%, transparent)`,
                              boxShadow: `0 10px 20px color-mix(in srgb, var(${metric.toneVar}) 16%, transparent)`,
                            }}
                          >
                            <MetricIcon sx={{ fontSize: 21 }} />
                          </Avatar>
                        </Stack>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ lineHeight: 1.55 }}
                        >
                          {metric.description}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}

            <Grid size={{ xs: 12, lg: 7 }}>
              <Card variant="glass" sx={{ height: "100%" }}>
                <CardContent
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    p: { xs: 2, md: 2.5 },
                    "&:last-child": { pb: { xs: 2, md: 2.5 } },
                  }}
                >
                  <Stack spacing={2.25}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                      }}
                    >
                      <Stack spacing={0.4}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 800 }}
                        >
                          {t.expiringSoonTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t.expiringSoonDescription}
                        </Typography>
                      </Stack>
                      <Button
                        component={Link}
                        href="/expiry-alerts"
                        size="small"
                        variant="text"
                        endIcon={actionArrow}
                        sx={{ fontWeight: 800 }}
                      >
                        {t.viewAll}
                      </Button>
                    </Stack>

                    {stats.expiringSoonItems.length > 0 ? (
                      <Stack spacing={0.875}>
                        {stats.expiringSoonItems.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              display: "flex",
                              flexDirection: { xs: "column", sm: "row" },
                              alignItems: { xs: "flex-start", sm: "center" },
                              justifyContent: "space-between",
                              gap: 1,
                              px: 1.25,
                              py: 1,
                              borderRadius: 1.5,
                              border: "1px solid",
                              borderColor: "divider",
                              bgcolor: "background.paper",
                              boxShadow:
                                "inset 0 1px 0 color-mix(in srgb, var(--mui-palette-warning-main) 7%, transparent)",
                              "&:hover": {
                                borderColor: "warning.main",
                                bgcolor: "action.hover",
                              },
                            }}
                          >
                            <Stack spacing={0.2} sx={{ minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{ fontWeight: 800 }}
                              >
                                {item.productCode} · {item.productName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {item.batchNumber}
                              </Typography>
                            </Stack>
                            <Stack
                              direction={{ xs: "row", sm: "column" }}
                              spacing={{ xs: 0.875, sm: 0.2 }}
                              sx={{
                                alignItems: { xs: "center", sm: "flex-end" },
                                flexShrink: 0,
                              }}
                            >
                              <Chip
                                label={`${item.daysLeft} ${t.daysUnit}`}
                                color="warning"
                                variant="outlined"
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(item.expiryDate, locale)}
                              </Typography>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Box
                        sx={{
                          minHeight: 148,
                          display: "grid",
                          placeItems: "center",
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 1.75,
                          bgcolor: "background.paper",
                        }}
                      >
                        <EmptyState
                          title={t.noExpiringSoon}
                          description={t.expiringSoonDescription}
                          icon={<ReportProblemRounded color="disabled" />}
                        />
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Card variant="glass" sx={{ height: "100%" }}>
                <CardContent
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    p: { xs: 2, md: 2.5 },
                    "&:last-child": { pb: { xs: 2, md: 2.5 } },
                  }}
                >
                  <Stack spacing={2.25}>
                    <Stack spacing={0.4}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {t.quickActions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t.description}
                      </Typography>
                    </Stack>
                    <Grid container spacing={1}>
                      {actions.map(([label, href, ActionIcon]) => (
                        <Grid key={href} size={{ xs: 12, sm: 6 }}>
                          <Button
                            component={Link}
                            href={href}
                            fullWidth
                            variant="outlined"
                            startIcon={<ActionIcon sx={{ fontSize: 17 }} />}
                            sx={{
                              minHeight: 42,
                              justifyContent: "flex-start",
                              px: 1.25,
                              borderRadius: 1.5,
                              color: "text.primary",
                              borderColor: "divider",
                              bgcolor: "background.paper",
                              boxShadow:
                                "inset 0 1px 0 color-mix(in srgb, var(--mui-palette-primary-main) 7%, transparent)",
                              "& .MuiButton-startIcon": {
                                color: "primary.main",
                              },
                              "&:hover": {
                                color: "primary.main",
                                bgcolor: "action.hover",
                                borderColor: "primary.main",
                                boxShadow:
                                  "0 8px 18px color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)",
                              },
                            }}
                          >
                            {label}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2.25,
                  bgcolor: "background.paper",
                  boxShadow:
                    "0 12px 30px color-mix(in srgb, var(--mui-palette-text-primary) 4%, transparent)",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    "&:last-child": { pb: { xs: 2, md: 2.5 } },
                  }}
                >
                  <Stack spacing={2.25}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      sx={{
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                      }}
                    >
                      <Stack spacing={0.4}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 800 }}
                        >
                          {t.recentMovements}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t.recentMovementsDescription}
                        </Typography>
                      </Stack>
                      <Button
                        component={Link}
                        href="/inventory/movements"
                        size="small"
                        variant="text"
                        endIcon={actionArrow}
                        sx={{ fontWeight: 800 }}
                      >
                        {t.viewAllMovements}
                      </Button>
                    </Stack>

                    {stats.recentMovements.length > 0 ? (
                      <TableContainer
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1.75,
                          overflowX: "auto",
                        }}
                      >
                        <Table
                          size="small"
                          sx={{ minWidth: 900, whiteSpace: "nowrap" }}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell>{t.movementType}</TableCell>
                              <TableCell>{t.movementReference}</TableCell>
                              <TableCell>{t.movementParty}</TableCell>
                              <TableCell>
                                {translations[locale].movements.product}
                              </TableCell>
                              <TableCell sx={{ textAlign: "end" }}>
                                {t.movementQuantity}
                              </TableCell>
                              <TableCell>{t.movementDate}</TableCell>
                              <TableCell>{t.movementUser}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {stats.recentMovements.map((movement) => (
                              <TableRow key={movement.id} hover>
                                <TableCell>
                                  <Chip
                                    label={
                                      (
                                        t.movementTypes as Record<
                                          string,
                                          string
                                        >
                                      )[movement.type] ?? movement.type
                                    }
                                    color={movementChipColor(movement.type)}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Stack spacing={0.2}>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 800 }}
                                    >
                                      {movement.reference}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {movement.productCode} ·{" "}
                                      {movement.productName}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell>{movement.partyName}</TableCell>
                                <TableCell>{movement.productCode}</TableCell>
                                <TableCell
                                  sx={{
                                    textAlign: "end",
                                    color: movementQuantityColor(movement.type),
                                    fontWeight: 800,
                                  }}
                                >
                                  {movementQuantityLabel(
                                    movement.type,
                                    movement.quantity,
                                    locale,
                                  )}
                                </TableCell>
                                <TableCell>
                                  {formatDate(movement.movementAt, locale)}
                                </TableCell>
                                <TableCell>{movement.userName}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box
                        sx={{
                          minHeight: 210,
                          display: "grid",
                          placeItems: "center",
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 1.75,
                          bgcolor: "background.default",
                          px: 2,
                        }}
                      >
                        <Stack
                          spacing={1}
                          sx={{
                            alignItems: "center",
                            textAlign: "center",
                          }}
                        >
                          <Avatar
                            variant="rounded"
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1.5,
                              bgcolor: "action.hover",
                              color: "text.secondary",
                            }}
                          >
                            <ReceiptLongRounded fontSize="small" />
                          </Avatar>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 800 }}
                          >
                            {t.recentMovements}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t.recentMovementsDescription}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </PageShell>
  );
}
