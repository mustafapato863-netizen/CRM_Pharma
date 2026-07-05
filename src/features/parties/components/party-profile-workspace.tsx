"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AccountBalance,
  Edit,
  EventNote,
  Money,
  OpenInNew,
  ReceiptLong,
  Timeline,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { MetricCard } from "@/shared/ui/metric-card";
import { StatusChip } from "@/shared/ui/status-chip";
import { useLocale, useTranslations } from "next-intl";

type PartyProfile = Awaited<
  ReturnType<typeof import("../queries/get-party-profile").getPartyProfile>
>;

export function PartyProfileWorkspace({
  profile,
  canEdit,
  canViewLedger,
}: {
  profile: NonNullable<PartyProfile>;
  canEdit: boolean;
  canViewLedger: boolean;
}) {
  const t = useTranslations("parties");
  const common = useTranslations("common");
  const navigation = useTranslations("sidebar");
  const ledgerT = useTranslations("ledger");
  const invoicesT = useTranslations("invoices");
  const locale = useLocale();
  const [tab, setTab] = useState<
    "overview" | "invoices" | "payments" | "ledger"
  >("overview");

  return (
    <Stack spacing={2.25}>
      <AppPageHeader
        title={profile.party.name}
        description={t("profileDescription")}
        action={
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            {canEdit ? (
              <Button
                component={Link}
                href={`/parties/${profile.party.id}/edit`}
                variant="outlined"
                startIcon={<Edit />}
              >
                {t("edit")}
              </Button>
            ) : null}
            {canViewLedger ? (
              <Button
                component={Link}
                href={`/ledger?partyId=${profile.party.id}`}
                variant="outlined"
                startIcon={<AccountBalance />}
              >
                {t("openLedger")}
              </Button>
            ) : null}
          </Stack>
        }
      />

      <Card variant="outlined">
        <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ justifyContent: "space-between" }}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  <Chip
                    label={
                      profile.party.type === "CUSTOMER"
                        ? t("customer")
                        : profile.party.type === "SUPPLIER"
                          ? t("supplier")
                          : t("both")
                    }
                    color="primary"
                    variant="outlined"
                  />
                  <StatusChip
                    label={
                      profile.party.isActive
                        ? common("active")
                        : common("inactive")
                    }
                    tone={profile.party.isActive ? "success" : "warning"}
                  />
                  <Chip label={profile.party.code} variant="outlined" />
                </Stack>
                <Typography variant="h5" sx={{ fontWeight: 850 }}>
                  {profile.party.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile.party.nameEn || t("noEnglishName")} ·{" "}
                  {profile.party.mobile || profile.party.phone || t("noPhone")}
                </Typography>
              </Stack>

              <Stack spacing={0.5} sx={{ minWidth: { xs: "100%", md: 280 } }}>
                <Typography variant="overline" color="text.secondary">
                  {t("currentBalance")}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 850 }}>
                  {profile.summary.currentBalance}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile.summary.balanceType}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <MetricCard
                label={t("currentBalance")}
                value={profile.summary.currentBalance}
                icon={<Money />}
                tone="info"
              />
              <MetricCard
                label={t("ledgerEntries")}
                value={String(profile.summary.ledgerEntryCount)}
                icon={<Timeline />}
                tone="success"
              />
              <MetricCard
                label={t("recentInvoices")}
                value={String(profile.invoices.length)}
                icon={<ReceiptLong />}
                tone="warning"
              />
              <MetricCard
                label={t("lastActivity")}
                value={
                  profile.summary.lastTransactionAt
                    ? new Date(
                        profile.summary.lastTransactionAt,
                      ).toLocaleString(locale)
                    : "-"
                }
                icon={<EventNote />}
                tone="info"
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
          <Stack spacing={2}>
            <Tabs
              value={tab}
              onChange={(_, value) => setTab(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab value="overview" label={t("overview")} />
              <Tab value="invoices" label={t("invoices")} />
              <Tab value="payments" label={t("payments")} />
              <Tab value="ledger" label={t("ledger")} />
            </Tabs>

            {tab === "overview" ? (
              <Stack spacing={2.25}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  sx={{ flexWrap: "wrap" }}
                >
                  {[
                    [t("partyCode"), profile.party.code],
                    [
                      t("type"),
                      profile.party.type === "CUSTOMER"
                        ? t("customer")
                        : profile.party.type === "SUPPLIER"
                          ? t("supplier")
                          : t("both"),
                    ],
                    [t("mobile"), profile.party.mobile || "-"],
                    [t("phone"), profile.party.phone || "-"],
                    [t("email"), profile.party.email || "-"],
                    [t("city"), profile.party.city || "-"],
                    [t("address"), profile.party.address || "-"],
                    [t("taxNumber"), profile.party.taxNumber || "-"],
                    [
                      t("commercialRegister"),
                      profile.party.commercialRegister || "-",
                    ],
                  ].map(([label, value]) => (
                    <Card
                      key={label}
                      variant="outlined"
                      sx={{ minWidth: 220, flex: "1 1 220px" }}
                    >
                      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Typography variant="caption" color="text.secondary">
                          {label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ mt: 0.5, fontWeight: 600 }}
                        >
                          {value}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>

                <Stack spacing={1.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {t("recentActivity")}
                  </Typography>
                  {recentActivity(
                    profile,
                    navigation("purchases"),
                    navigation("sales"),
                    ledgerT,
                  ).length ? (
                    recentActivity(
                      profile,
                      navigation("purchases"),
                      navigation("sales"),
                      ledgerT,
                    ).map((item) => (
                      <Card
                        key={item.id}
                        variant="outlined"
                      >
                        <CardContent
                          sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}
                        >
                          <Stack
                            direction="row"
                            sx={{
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Stack spacing={0.5}>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700 }}
                              >
                                {item.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(item.date).toLocaleString(locale)}
                              </Typography>
                            </Stack>
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ alignItems: "center" }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700 }}
                              >
                                {item.value}
                              </Typography>
                              <Button
                                component={Link}
                                href={item.href}
                                size="small"
                                startIcon={<OpenInNew />}
                              >
                                {t("open")}
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Alert severity="info">{t("noActivity")}</Alert>
                  )}
                </Stack>
              </Stack>
            ) : null}

            {tab === "invoices" ? (
              <ProfileTable
                columns={[
                  t("invoice"),
                  t("date"),
                  t("type"),
                  t("totalAmount"),
                  t("paid"),
                  t("remaining"),
                  common("status"),
                ]}
                rows={profile.invoices.map((invoice) => [
                  invoice.invoiceNumber,
                  new Date(invoice.invoiceDate).toLocaleString(locale),
                  invoice.type === "PURCHASE"
                    ? invoicesT("purchaseTitle")
                    : invoicesT("salesTitle"),
                  invoice.grandTotal,
                  invoice.paidAmount,
                  invoice.remainingAmount,
                  invoice.paymentStatus,
                ])}
                emptyText={t("noInvoices")}
              />
            ) : null}

            {tab === "payments" ? (
              profile.payments.length ? (
                <ProfileTable
                  columns={[
                    t("date"),
                    t("type"),
                    t("amount"),
                    common("status"),
                    t("user"),
                  ]}
                  rows={profile.payments.map((entry) => [
                    new Date(entry.createdAt).toLocaleString(locale),
                    getMovementLabel(entry.type, ledgerT),
                    entry.amount,
                    entry.status,
                    entry.user,
                  ])}
                  emptyText={t("noPayments")}
                />
              ) : (
                <Alert severity="info">{t("noPayments")}</Alert>
              )
            ) : null}

            {tab === "ledger" ? (
              canViewLedger ? (
                <ProfileTable
                  columns={[
                    t("date"),
                    t("type"),
                    t("amount"),
                    common("status"),
                    t("user"),
                  ]}
                  rows={profile.ledger.map((entry) => [
                    new Date(entry.createdAt).toLocaleString(locale),
                    getMovementLabel(entry.type, ledgerT),
                    entry.amount,
                    entry.status,
                    entry.user,
                  ])}
                  emptyText={t("noLedger")}
                />
              ) : (
                <Alert severity="warning">{t("ledgerDenied")}</Alert>
              )
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function ProfileTable({
  columns,
  rows,
  emptyText,
}: {
  columns: string[];
  rows: string[][];
  emptyText: string;
}) {
  if (!rows.length) return <Alert severity="info">{emptyText}</Alert>;

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column}>{column}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <TableCell key={cellIndex}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getMovementLabel(type: string, t: any) {
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

function recentActivity(
  profile: NonNullable<PartyProfile>,
  purchaseLabel: string,
  salesLabel: string,
  ledgerT: any,
) {
  return [
    ...profile.invoices.slice(0, 3).map((invoice) => ({
      id: `invoice-${invoice.id}`,
      title: `${invoice.type === "PURCHASE" ? purchaseLabel : salesLabel} ${invoice.invoiceNumber}`,
      value: invoice.grandTotal,
      date: invoice.invoiceDate,
      href: `/ledger?partyId=${profile.party.id}`,
    })),
    ...profile.ledger.slice(0, 3).map((entry) => ({
      id: `ledger-${entry.id}`,
      title: getMovementLabel(entry.type, ledgerT),
      value: entry.amount,
      date: entry.createdAt,
      href: `/ledger?partyId=${profile.party.id}`,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
}
