"use client";

import { useMemo, useState } from "react";
import { RotateLeft, RotateRight, Close, Replay } from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useLocale, useTranslations } from "next-intl";
import { showError, showSuccess } from "@/shared/lib/toast";
import { createReturnAction } from "../actions/return-actions";

type ReturnInvoiceLine = {
  id: string;
  productId: string;
  batchId: string | null;
  productName: string;
  batchNumber: string | null;
  quantity: string;
  unitPrice: string;
};

type ReturnInvoiceRow = {
  id: string;
  invoiceNumber: string;
  partyId: string;
  partyName: string;
  type: "SALES" | "PURCHASE";
  invoiceDate: string;
  lines: ReturnInvoiceLine[];
};

type ReturnKind = "sales" | "purchase";

export function ReturnsCenter({
  salesInvoices,
  purchaseInvoices,
}: {
  salesInvoices: ReturnInvoiceRow[];
  purchaseInvoices: ReturnInvoiceRow[];
}) {
  return (
    <Stack spacing={2.25}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <ReturnPanel
          kind="sales"
          titleKey="salesReturn"
          helperKey="salesHint"
          invoices={salesInvoices}
        />
        <ReturnPanel
          kind="purchase"
          titleKey="purchaseReturn"
          helperKey="purchaseHint"
          invoices={purchaseInvoices}
        />
      </Stack>
    </Stack>
  );
}

function ReturnPanel({
  kind,
  titleKey,
  helperKey,
  invoices,
}: {
  kind: ReturnKind;
  titleKey: "salesReturn" | "purchaseReturn";
  helperKey: "salesHint" | "purchaseHint";
  invoices: ReturnInvoiceRow[];
}) {
  const t = useTranslations("returns");
  const locale = useLocale();
  const [invoiceId, setInvoiceId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lineQuantities, setLineQuantities] = useState<Record<string, string>>(
    {},
  );

  const invoice = useMemo(
    () => invoices.find((row) => row.id === invoiceId) ?? null,
    [invoices, invoiceId],
  );
  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const summary = useMemo(() => {
    if (!invoice) return { total: 0, lines: 0 };
    const total = invoice.lines.reduce(
      (sum, line) =>
        sum + Number(lineQuantities[line.id] ?? 0) * Number(line.unitPrice),
      0,
    );
    const lines = invoice.lines.filter(
      (line) => Number(lineQuantities[line.id] ?? 0) > 0,
    ).length;
    return { total, lines };
  }, [invoice, lineQuantities]);

  async function save() {
    if (!invoice) return;
    const lines = invoice.lines
      .map((line) => ({
        lineId: line.id,
        quantity: lineQuantities[line.id] ?? "0",
      }))
      .filter((line) => Number(line.quantity) > 0);

    const formData = new FormData();
    formData.set("invoiceId", invoiceId);
    formData.set("date", date);
    formData.set("reference", reference);
    formData.set("notes", notes);
    formData.set("lines", JSON.stringify(lines));

    setSaving(true);
    const result = await createReturnAction(
      kind === "sales" ? "SALES_RETURN" : "PURCHASE_RETURN",
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
    setConfirmOpen(false);
    showSuccess(t("returnSaved"));
    setLineQuantities({});
    setReference("");
    setNotes("");
  }

  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        backgroundImage:
          kind === "sales"
            ? "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-info-main) 4%, transparent), color-mix(in srgb, var(--mui-palette-background-paper) 98%, transparent))"
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
                    kind === "sales"
                      ? "color-mix(in srgb, var(--mui-palette-info-main) 12%, transparent)"
                      : "color-mix(in srgb, var(--mui-palette-error-main) 12%, transparent)",
                  color: kind === "sales" ? "info.main" : "error.main",
                }}
              >
                {kind === "sales" ? <RotateLeft /> : <RotateRight />}
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
            <Replay color="disabled" />
          </Stack>

          <Stack spacing={2}>
            <Autocomplete
              options={invoices}
              value={invoice}
              onChange={(_, value) => setInvoiceId(value?.id ?? "")}
              getOptionLabel={(option) =>
                `${option.invoiceNumber} - ${option.partyName}`
              }
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Stack spacing={0.25} sx={{ width: "100%" }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {option.invoiceNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(option.invoiceDate).toLocaleDateString(
                          locale,
                        )}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {option.partyName}
                    </Typography>
                  </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("originalInvoice")}
                  placeholder={t("invoicePlaceholder")}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText={t("noInvoiceMatch")}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                type="date"
                label={t("date")}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
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

          <Stack spacing={1.5}>
            {invoice ? (
              invoice.lines.map((line) => (
                <Card
                  key={line.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    position: "relative",
                    "&:hover": { borderColor: "primary.main" },
                    transition: "border-color 140ms ease",
                  }}
                >
                  <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
                    <Stack spacing={1.5}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                            {line.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {line.batchNumber ?? t("noBatch")}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                          {currency.format(Number(line.unitPrice))} EGP
                        </Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "center" }}
                      >
                        <TextField
                          fullWidth
                          label={t("originalQty")}
                          value={line.quantity}
                          disabled
                          size="small"
                        />
                        <TextField
                          fullWidth
                          type="number"
                          label={t("returnQty")}
                          value={lineQuantities[line.id] ?? ""}
                          onChange={(event) =>
                            setLineQuantities((current) => ({
                              ...current,
                              [line.id]: event.target.value,
                            }))
                          }
                          slotProps={{ htmlInput: { min: "0", step: "0.001" } }}
                          size="small"
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setLineQuantities((current) => ({
                              ...current,
                              [line.id]: line.quantity,
                            }));
                          }}
                          sx={{ height: 40, whiteSpace: "nowrap" }}
                        >
                          All
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert severity="info">{t("selectInvoice")}</Alert>
            )}
          </Stack>

          <Card
            variant="outlined"
            sx={{ borderRadius: 2, bgcolor: "background.default" }}
          >
            <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
              <Stack spacing={1}>
                <SummaryRow
                  label={t("linesSelected")}
                  value={String(summary.lines)}
                />
                <SummaryRow
                  label={t("estimatedTotal")}
                  value={`${currency.format(summary.total)} EGP`}
                />
              </Stack>
            </CardContent>
          </Card>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Button
            variant="contained"
            onClick={() => setConfirmOpen(true)}
            disabled={!invoice || summary.lines === 0 || saving}
            startIcon={kind === "sales" ? <RotateLeft /> : <RotateRight />}
          >
            {t("saveReturn")}
          </Button>
        </Stack>
      </CardContent>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t(titleKey)}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t("confirmDescription")}
            </Typography>
            <Divider />
            <SummaryRow
              label={t("originalInvoice")}
              value={invoice?.invoiceNumber ?? t("optional")}
            />
            <SummaryRow
              label={t("linesSelected")}
              value={String(summary.lines)}
            />
            <SummaryRow
              label={t("estimatedTotal")}
              value={currency.format(summary.total)}
            />
            <SummaryRow
              label={t("reference")}
              value={reference || t("optional")}
            />
            <SummaryRow label={t("notes")} value={notes || t("optional")} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} startIcon={<Close />}>
            {t("cancel")}
          </Button>
          <Button
            onClick={() => void save()}
            variant="contained"
            disabled={saving}
            startIcon={kind === "sales" ? <RotateLeft /> : <RotateRight />}
          >
            {saving ? t("saving") : t("saveReturn")}
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
