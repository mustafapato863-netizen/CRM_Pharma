"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { InvoicePaymentStatus, InvoiceType, PartyType } from "@prisma/client";
import {
  AccountBalanceWallet,
  Close,
  CreditCard,
  PaymentsOutlined,
  ReceiptLong,
} from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { showError, showSuccess } from "@/shared/lib/toast";
import { useLocale, useTranslations } from "next-intl";
import { recordPartyTransactionAction } from "../actions/party-transaction-actions";

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  partyId: string;
  partyName: string;
  type: InvoiceType;
  remainingAmount: string;
  paymentStatus: InvoicePaymentStatus;
};

type PartyRow = {
  id: string;
  code: string;
  name: string;
  nameEn?: string | null;
  type: PartyType;
  isActive: boolean;
  currentBalance: string;
  balanceType: "Receivable" | "Payable" | "Settled";
  lastTransactionAt: string | null;
};

type PaymentKind = "receipt" | "payment";
type PaymentMethod = "CASH" | "BANK" | "WALLET" | "OTHER";

function translateBalanceType(type: string, locale: string) {
  const isAr = locale === "ar";
  if (type === "Receivable") return isAr ? "مدين (مستحق القبض)" : "Receivable";
  if (type === "Payable") return isAr ? "دائن (مستحق الدفع)" : "Payable";
  return isAr ? "مسوى" : "Settled";
}

export function PaymentsCenter({
  parties,
  customerInvoices,
  supplierInvoices,
}: {
  parties: PartyRow[];
  customerInvoices: InvoiceRow[];
  supplierInvoices: InvoiceRow[];
}) {
  return (
    <Stack spacing={2.25}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <PaymentPanel
          kind="receipt"
          icon={<ReceiptLong />}
          titleKey="customerReceipt"
          helperKey="customerHint"
          partyLabelKey="customer"
          buttonKey="saveReceipt"
          emptyDescriptionKey="customerHint"
          parties={parties.filter(
            (party) => party.type === "CUSTOMER" || party.type === "BOTH",
          )}
          invoices={customerInvoices}
        />
        <PaymentPanel
          kind="payment"
          icon={<AccountBalanceWallet />}
          titleKey="supplierPayment"
          helperKey="supplierHint"
          partyLabelKey="supplier"
          buttonKey="savePayment"
          emptyDescriptionKey="supplierHint"
          parties={parties.filter(
            (party) => party.type === "SUPPLIER" || party.type === "BOTH",
          )}
          invoices={supplierInvoices}
        />
      </Stack>
    </Stack>
  );
}

function PaymentPanel({
  kind,
  icon,
  titleKey,
  helperKey,
  partyLabelKey,
  buttonKey,
  emptyDescriptionKey,
  parties,
  invoices,
}: {
  kind: PaymentKind;
  icon: ReactNode;
  titleKey: "customerReceipt" | "supplierPayment";
  helperKey: "customerHint" | "supplierHint";
  partyLabelKey: "customer" | "supplier";
  buttonKey: "saveReceipt" | "savePayment";
  emptyDescriptionKey: "customerHint" | "supplierHint";
  parties: PartyRow[];
  invoices: InvoiceRow[];
}) {
  const t = useTranslations("payments");
  const locale = useLocale();
  const [partyId, setPartyId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const party = useMemo(
    () => parties.find((item) => item.id === partyId) ?? null,
    [parties, partyId],
  );
  const invoiceOptions = useMemo(
    () => invoices.filter((invoice) => !partyId || invoice.partyId === partyId),
    [invoices, partyId],
  );
  const invoice = useMemo(
    () => invoiceOptions.find((item) => item.id === invoiceId) ?? null,
    [invoiceId, invoiceOptions],
  );
  const methodOptions = useMemo(
    () => [
      { value: "CASH" as const, label: t("cash") },
      { value: "BANK" as const, label: t("bank") },
      { value: "WALLET" as const, label: t("wallet") },
      { value: "OTHER" as const, label: t("other") },
    ],
    [t],
  );
  const methodLabel =
    methodOptions.find((option) => option.value === method)?.label ?? method;
  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  async function submit() {
    const formData = new FormData();
    formData.set("partyId", partyId);
    formData.set("invoiceId", invoiceId);
    formData.set("amount", amount);
    formData.set("date", date);
    formData.set("method", method);
    formData.set("reference", reference);
    formData.set("notes", notes);

    setSaving(true);
    const result = await recordPartyTransactionAction(
      kind === "receipt" ? "RECEIPT" : "PAYMENT",
      {},
      formData,
    );
    setSaving(false);

    if (
      result &&
      typeof result === "object" &&
      "error" in result &&
      result.error
    ) {
      setError(result.error);
      showError(result.error);
      return;
    }

    setError(null);
    setDialogOpen(false);
    setNotice(kind === "receipt" ? t("receiptSaved") : t("paymentSaved"));
    showSuccess(kind === "receipt" ? t("receiptSaved") : t("paymentSaved"));
    setInvoiceId("");
    setAmount("");
    setReference("");
    setNotes("");
  }

  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        backgroundImage:
          kind === "receipt"
            ? "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-success-main) 4%, transparent), color-mix(in srgb, var(--mui-palette-background-paper) 98%, transparent))"
            : "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-error-main) 4%, transparent), color-mix(in srgb, var(--mui-palette-background-paper) 98%, transparent))",
      }}
    >
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Stack spacing={2.25}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
          >
            <Stack direction="row" spacing={2} sx={{ minWidth: 0 }}>
              <Card
                variant="outlined"
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.25,
                  display: "grid",
                  placeItems: "center",
                  bgcolor:
                    kind === "receipt"
                      ? "color-mix(in srgb, var(--mui-palette-success-main) 12%, transparent)"
                      : "color-mix(in srgb, var(--mui-palette-error-main) 12%, transparent)",
                  color: kind === "receipt" ? "success.main" : "error.main",
                }}
              >
                {icon}
              </Card>
              <Stack spacing={0.5}>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
                  {t(titleKey)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t(helperKey)}
                </Typography>
              </Stack>
            </Stack>
            <PaymentsOutlined color="disabled" />
          </Stack>

          <Stack spacing={2}>
            <Autocomplete
              options={parties}
              value={party}
              onChange={(_, value) => {
                setPartyId(value?.id ?? "");
                setInvoiceId("");
              }}
              getOptionLabel={(option) => `${option.code} - ${option.name}`}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Stack spacing={0.25}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.code}
                    </Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t(partyLabelKey)}
                  placeholder={
                    kind === "receipt"
                      ? t("searchCustomer")
                      : t("searchSupplier")
                  }
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={t("noPartyMatch")}
            />

            {/* Partner Balance indicator */}
            {party && (
              <Box
                sx={{
                  px: 1.5,
                  py: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  border: "1.5px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Current Balance:
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 900,
                    color:
                      party.balanceType === "Receivable"
                        ? "success.main"
                        : party.balanceType === "Payable"
                        ? "error.main"
                        : "text.secondary",
                  }}
                >
                  {currency.format(Number(party.currentBalance))} EGP ({translateBalanceType(party.balanceType, locale)})
                </Typography>
              </Box>
            )}

            <Autocomplete
              options={invoiceOptions}
              value={invoice}
              onChange={(_, value) => {
                setInvoiceId(value?.id ?? "");
                if (value) {
                  setAmount(value.remainingAmount);
                }
              }}
              getOptionLabel={(option) =>
                `${option.invoiceNumber} - ${currency.format(Number(option.remainingAmount))}`
              }
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <Stack spacing={0.25}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {option.invoiceNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.partyName}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {currency.format(Number(option.remainingAmount))}
                    </Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("relatedInvoice")}
                  placeholder={t("invoicePlaceholder")}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={t("noInvoiceMatch")}
            />

            {/* Quick suggestions amount chips */}
            {invoice && (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, fontWeight: 700 }}>
                  Quick Fill:
                </Typography>
                <Chip
                  label="Pay Full"
                  size="small"
                  variant="outlined"
                  onClick={() => setAmount(invoice.remainingAmount)}
                  sx={{ cursor: "pointer", fontWeight: 700 }}
                />
                <Chip
                  label="Pay 50%"
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const half = (parseFloat(invoice.remainingAmount) / 2).toFixed(2);
                    setAmount(half);
                  }}
                  sx={{ cursor: "pointer", fontWeight: 700 }}
                />
              </Stack>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                type="number"
                slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
                label={t("amount")}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
              <TextField
                fullWidth
                type="date"
                label={t("date")}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                label={t("method")}
                value={method}
                onChange={(event) =>
                  setMethod(event.target.value as PaymentMethod)
                }
              >
                {methodOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label={t("reference")}
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
            </Stack>

            <TextField
              multiline
              minRows={3}
              label={t("notes")}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Stack>

          <Card
            variant="outlined"
            sx={{ borderRadius: 2, bgcolor: "background.default" }}
          >
            <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
              {invoice ? (
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    {t("invoiceRemaining")}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ justifyContent: "space-between" }}
                  >
                    <Typography variant="body2">
                      {invoice.invoiceNumber}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {currency.format(Number(invoice.remainingAmount))}
                    </Typography>
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="info">
                  <Stack spacing={0.5}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {t(
                        kind === "receipt"
                          ? "noCustomerSelected"
                          : "noSupplierSelected",
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t(emptyDescriptionKey)}
                    </Typography>
                  </Stack>
                </Alert>
              )}
            </CardContent>
          </Card>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {notice ? <Alert severity="success">{notice}</Alert> : null}

          <Button
            variant="contained"
            onClick={() => setDialogOpen(true)}
            disabled={!partyId || !amount || saving}
            startIcon={<CreditCard />}
          >
            {t(buttonKey)}
          </Button>
        </Stack>
      </CardContent>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {t(kind === "receipt" ? "customerReceipt" : "supplierPayment")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t("confirmDescription")}
            </Typography>
            <Divider />
            <SummaryRow
              label={t(partyLabelKey)}
              value={
                party ? `${party.code} - ${party.name}` : t("noneSelected")
              }
            />
            <SummaryRow label={t("amount")} value={amount || "0.00"} />
            <SummaryRow label={t("method")} value={methodLabel} />
            <SummaryRow
              label={t("relatedInvoice")}
              value={invoice?.invoiceNumber ?? t("optional")}
            />
            <SummaryRow
              label={t("reference")}
              value={reference || t("optional")}
            />
            <SummaryRow label={t("notes")} value={notes || t("optional")} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} startIcon={<Close />}>
            {t("cancel")}
          </Button>
          <Button
            onClick={() => void submit()}
            variant="contained"
            disabled={saving}
            startIcon={<CreditCard />}
          >
            {saving ? t("saving") : t(buttonKey)}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ justifyContent: "space-between", alignItems: "center" }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: "end" }}>
        {value}
      </Typography>
    </Stack>
  );
}
