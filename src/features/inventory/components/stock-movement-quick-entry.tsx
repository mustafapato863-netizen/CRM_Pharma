"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddRounded,
  ContentPasteRounded,
  DeleteOutlineRounded,
  Inventory2Outlined,
  LocalShippingOutlined,
  ReportProblemOutlined,
  SaveOutlined,
  TrendingUpRounded,
  UploadRounded,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { arSD } from "@mui/x-data-grid/locales";
import { useTranslations } from "next-intl";

import { useLocale } from "@/shared/hooks/use-locale";
import { createStockInAction } from "../actions/stock-in-actions";
import { createStockOutAction } from "../actions/stock-out-actions";
import type {
  StockAvailableBatchMap,
  StockAvailableBatchOption,
  StockMetricCardProps,
  StockMovementType,
  StockQuickEntryCopy,
  StockQuickEntryProductOption,
  StockQuickEntryProps,
  StockQuickEntryRow,
  StockQuickEntryTableProps,
  StockQuickEntryValidation,
  StockUiMessage,
} from "./stock-ui.types";

const copyByLocale: Record<"en" | "ar", StockQuickEntryCopy> = {
  en: {
    quickTitle: "Stock movement quick entry",
    quickDescription:
      "Enter many direct stock movements in one editable workspace.",
    defaults: "Session defaults",
    defaultType: "Default type",
    addRow: "Add row",
    addNewRow: "Add new row",
    paste: "Paste from Excel",
    saveDraft: "Save draft",
    post: "Review & post",
    automationTitle: "Automatic movements are preserved",
    automationText:
      "Purchases, sales, and returns already create their own inventory movements. Use this workspace only for standalone manual stock in/out entries.",
    gridTitle: "Editable movement lines",
    gridHint:
      "Use product search, batch resolution, paste tab-separated rows, and press Ctrl+Enter to add a line.",
    line: "#",
    movementType: "Type",
    stockIn: "Stock IN",
    stockOut: "Stock OUT",
    adjustmentIncrease: "Adjustment +",
    adjustmentDecrease: "Adjustment -",
    unit: "Unit",
    available: "Available",
    reason: "Reason",
    status: "Status",
    delete: "Delete",
    valid: "Valid",
    empty: "Empty",
    unsupported: "Adjustment posting is not enabled yet.",
    productRequired: "Product is required.",
    batchRequired: "Batch is required.",
    quantityRequired: "Quantity must be greater than zero.",
    stockExceeded: "Quantity exceeds available stock.",
    noPermission: "You do not have permission to create this movement.",
    rows: "Rows",
    validRows: "Ready",
    errors: "Needs attention",
    totalQuantity: "Total quantity",
    posted: "Movements posted successfully.",
    draftSaved: "Draft saved locally.",
    pasted: "Rows pasted from clipboard.",
    pasteEmpty: "Clipboard did not contain tabular movement rows.",
    noValidRows: "Add at least one valid movement row before posting.",
    fixRows: "Fix rows that need attention before posting.",
    recent: "Recent movements",
    recentHint:
      "Latest activity remains read-only here for operational context.",
    activeProducts: "Active products",
    acrossAllProducts: "Across all products",
    last7Days: "Last 7 days",
    lowStockItems: "Low stock items",
    needAttention: "Need attention",
    warehouse: "Warehouse",
    mainWarehouse: "Main Warehouse",
    clearEmptyRows: "Clear empty rows",
    viewAllMovements: "View all movements",
    searchProduct: "Search product…",
    selectBatch: "Select batch…",
    selectReason: "Select reason…",
    stockCount: "Stock count",
    damaged: "Damaged",
    expired: "Expired",
    brokenBoxes: "Broken boxes",
    other: "Other",
  },
  ar: {
    quickTitle: "إدخال سريع لحركات المخزون",
    quickDescription: "سجّل عدة حركات مخزون مباشرة من مساحة عمل قابلة للتحرير.",
    defaults: "إعدادات الجلسة",
    defaultType: "نوع افتراضي",
    addRow: "إضافة صف",
    addNewRow: "إضافة صف جديد",
    paste: "لصق من Excel",
    saveDraft: "حفظ مسودة",
    post: "مراجعة وترحيل",
    automationTitle: "الحركات التلقائية محفوظة كما هي",
    automationText:
      "فواتير الشراء والبيع والمرتجعات تنشئ حركات المخزون تلقائيًا. استخدم هذه المساحة فقط لحركات الدخول والخروج اليدوية المستقلة.",
    gridTitle: "بنود حركة قابلة للتحرير",
    gridHint:
      "ابحث عن المنتج، اختر الدفعة، الصق صفوفًا مفصولة بعلامات تبويب، واضغط Ctrl+Enter لإضافة صف.",
    line: "#",
    movementType: "النوع",
    stockIn: "دخول مخزون",
    stockOut: "خروج مخزون",
    adjustmentIncrease: "تسوية +",
    adjustmentDecrease: "تسوية -",
    unit: "الوحدة",
    available: "المتاح",
    reason: "السبب",
    status: "الحالة",
    delete: "حذف",
    valid: "جاهز",
    empty: "فارغ",
    unsupported: "ترحيل التسويات غير مفعّل حاليًا.",
    productRequired: "المنتج مطلوب.",
    batchRequired: "الدفعة مطلوبة.",
    quantityRequired: "يجب أن تكون الكمية أكبر من صفر.",
    stockExceeded: "الكمية أكبر من المخزون المتاح.",
    noPermission: "ليست لديك صلاحية إنشاء هذه الحركة.",
    rows: "الصفوف",
    validRows: "جاهزة",
    errors: "تحتاج مراجعة",
    totalQuantity: "إجمالي الكمية",
    posted: "تم ترحيل الحركات بنجاح.",
    draftSaved: "تم حفظ المسودة محليًا.",
    pasted: "تم لصق الصفوف من الحافظة.",
    pasteEmpty: "الحافظة لا تحتوي على صفوف حركة مجدولة.",
    noValidRows: "أضف صف حركة صحيح واحدًا على الأقل قبل الترحيل.",
    fixRows: "أصلح الصفوف التي تحتاج مراجعة قبل الترحيل.",
    recent: "الحركات الأخيرة",
    recentHint: "آخر نشاط يظهر هنا للمتابعة فقط دون تعديل.",
    activeProducts: "المنتجات النشطة",
    acrossAllProducts: "عبر كل المنتجات",
    last7Days: "آخر 7 أيام",
    lowStockItems: "أصناف منخفضة المخزون",
    needAttention: "تحتاج متابعة",
    warehouse: "المخزن",
    mainWarehouse: "المخزن الرئيسي",
    clearEmptyRows: "مسح الصفوف الفارغة",
    viewAllMovements: "عرض كل الحركات",
    searchProduct: "ابحث عن منتج…",
    selectBatch: "اختر الدفعة…",
    selectReason: "اختر السبب…",
    stockCount: "جرد مخزني",
    damaged: "تالف",
    expired: "منتهي الصلاحية",
    brokenBoxes: "عبوات تالفة",
    other: "أخرى",
  },
};

const movementTypeOptions: Array<{
  value: StockMovementType;
  labelKey:
    "stockIn" | "stockOut" | "adjustmentIncrease" | "adjustmentDecrease";
}> = [
  { value: "STOCK_IN", labelKey: "stockIn" },
  { value: "STOCK_OUT", labelKey: "stockOut" },
  { value: "ADJUSTMENT_INCREASE", labelKey: "adjustmentIncrease" },
  { value: "ADJUSTMENT_DECREASE", labelKey: "adjustmentDecrease" },
];

export function StockMovementQuickEntry({
  products,
  batchesByProduct,
  parties,
  rows: recentRows,
  canCreateIn,
  canCreateOut,
  initialMode,
  lowStockCount,
}: StockQuickEntryProps) {
  const t = useTranslations("stock");
  const router = useRouter();
  const { locale } = useLocale();
  const copy = copyByLocale[locale === "ar" ? "ar" : "en"];
  const initialType = initialMode === "out" ? "STOCK_OUT" : "STOCK_IN";

  const [defaultType, setDefaultType] =
    useState<StockMovementType>(initialType);
  const [reference, setReference] = useState("");
  const [movementAt, setMovementAt] = useState(() =>
    new Date().toISOString().slice(0, 16),
  );
  const [partyId, setPartyId] = useState("");
  const [rows, setRows] = useState<StockQuickEntryRow[]>(() => [
    createRow(1, initialType),
  ]);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState<StockUiMessage | null>(null);

  useEffect(() => {
    const nextType = initialMode === "out" ? "STOCK_OUT" : "STOCK_IN";

    setDefaultType(nextType);
    setRows((current) =>
      current.every(isRowEmpty) ? [createRow(1, nextType)] : current,
    );
  }, [initialMode]);

  const suppliers = useMemo(
    () =>
      parties.filter(
        (party) =>
          party.isActive &&
          (party.type === "SUPPLIER" || party.type === "BOTH"),
      ),
    [parties],
  );

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const summary = useMemo(() => {
    const meaningfulRows = rows.filter((row) => !isRowEmpty(row));
    const validations = meaningfulRows.map((row) =>
      validateRow(row, {
        batchesByProduct,
        canCreateIn,
        canCreateOut,
        copy,
      }),
    );

    return {
      rows: meaningfulRows.length,
      valid: validations.filter((result) => result.ok).length,
      errors: validations.filter((result) => !result.ok).length,
      totalQuantity: meaningfulRows.reduce(
        (sum, row) => sum + (Number(row.quantity) || 0),
        0,
      ),
    };
  }, [batchesByProduct, canCreateIn, canCreateOut, copy, rows]);

  const recentGridHeight = useMemo(
    () => Math.min(250, Math.max(168, recentRows.length * 38 + 88)),
    [recentRows.length],
  );

  function addRow(type = defaultType) {
    setRows((current) =>
      renumberRows([...current, createRow(nextRowId(current), type)]),
    );
  }

  function deleteRow(id: number) {
    setRows((current) => {
      const next = current.filter((row) => row.id !== id);
      return next.length ? renumberRows(next) : [createRow(1, defaultType)];
    });
  }

  function clearEmptyRows() {
    setRows((current) => {
      const next = current.filter((row) => !isRowEmpty(row));
      return next.length ? renumberRows(next) : [createRow(1, defaultType)];
    });
  }

  function updateInlineRow(id: number, patch: Partial<StockQuickEntryRow>) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row;

        const productChanged =
          patch.productId !== undefined && patch.productId !== row.productId;

        let next: StockQuickEntryRow = {
          ...row,
          ...patch,
          quantity:
            patch.quantity === undefined
              ? row.quantity
              : String(patch.quantity ?? "").trim(),
          batchNumber:
            patch.batchNumber === undefined
              ? row.batchNumber
              : String(patch.batchNumber ?? "").trim(),
          reason:
            patch.reason === undefined
              ? row.reason
              : String(patch.reason ?? "").trim(),
          serverError: undefined,
        };

        if (productChanged) {
          next = {
            ...next,
            batchId: "",
            batchNumber: "",
            expiryDate: "",
          };
        }

        const batch = resolveBatch(next, batchesByProduct);

        if (batch) {
          next = {
            ...next,
            batchId: batch.id,
            batchNumber: batch.batchNumber,
            expiryDate: next.expiryDate || toDateInputValue(batch.expiryDate),
          };
        }

        return next;
      }),
    );
  }

  function handleInlineKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      addRow();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      event.stopPropagation();
      saveDraft();
      return;
    }

    event.stopPropagation();
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      pasteText(text);
    } catch {
      setMessage({ type: "error", text: copy.pasteEmpty });
    }
  }

  function pasteText(text: string) {
    const parsedRows = parsePastedRows(
      text,
      rows,
      defaultType,
      products,
      batchesByProduct,
    );

    if (!parsedRows.length) {
      setMessage({ type: "error", text: copy.pasteEmpty });
      return;
    }

    setRows((current) =>
      renumberRows([
        ...current.filter((row) => !isRowEmpty(row)),
        ...parsedRows,
      ]),
    );

    setMessage({
      type: "info",
      text: `${copy.pasted} (${parsedRows.length})`,
    });
  }

  function saveDraft() {
    window.localStorage.setItem(
      "pharmacy-crm:stock-quick-entry-draft",
      JSON.stringify({
        defaultType,
        reference,
        movementAt,
        partyId,
        rows,
      }),
    );

    setMessage({ type: "success", text: copy.draftSaved });
  }

  async function postRows() {
    const meaningfulRows = rows.filter((row) => !isRowEmpty(row));

    if (!meaningfulRows.length) {
      setMessage({ type: "error", text: copy.noValidRows });
      return;
    }

    const invalidRows = meaningfulRows.filter(
      (row) =>
        !validateRow(row, {
          batchesByProduct,
          canCreateIn,
          canCreateOut,
          copy,
        }).ok,
    );

    if (invalidRows.length) {
      setMessage({ type: "error", text: copy.fixRows });
      return;
    }

    setPosting(true);
    const failedRows: StockQuickEntryRow[] = [];

    for (const row of meaningfulRows) {
      const result =
        row.movementType === "STOCK_IN"
          ? await postStockInRow(row)
          : await postStockOutRow(row);

      if (
        result &&
        typeof result === "object" &&
        "error" in result &&
        result.error
      ) {
        failedRows.push({ ...row, serverError: result.error });
      }
    }

    setPosting(false);

    if (failedRows.length) {
      setRows(renumberRows(failedRows));
      setMessage({
        type: "error",
        text: failedRows[0]?.serverError ?? copy.fixRows,
      });
      return;
    }

    setRows([createRow(1, defaultType)]);
    setMessage({ type: "success", text: copy.posted });
    router.refresh();
  }

  function postStockInRow(row: StockQuickEntryRow) {
    const formData = new FormData();

    formData.set("productId", row.productId);
    formData.set("batchId", row.batchId);
    formData.set("batchNumber", row.batchNumber);
    formData.set("useNewBatch", row.batchId ? "off" : "on");
    formData.set("quantity", row.quantity);
    formData.set("purchasePrice", "0");
    formData.set("expiryDate", row.expiryDate);
    formData.set("reference", reference);
    formData.set("movementAt", movementAt);
    formData.set("partyId", partyId);
    formData.set("notes", combineReasonAndNotes(row));
    formData.set("confirmSave", "on");

    return createStockInAction({}, formData);
  }

  function postStockOutRow(row: StockQuickEntryRow) {
    const formData = new FormData();

    formData.set("productId", row.productId);
    formData.set("batchId", row.batchId);
    formData.set("quantity", row.quantity);
    formData.set("reference", reference);
    formData.set("movementAt", movementAt);
    formData.set("notes", combineReasonAndNotes(row));
    formData.set("confirmSave", "on");

    return createStockOutAction({}, formData);
  }

  return (
    <Box
      dir={locale === "ar" ? "rtl" : "ltr"}
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
          width: { xs: 260, md: 540 },
          height: { xs: 180, md: 320 },
          top: -110,
          insetInlineEnd: -170,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--mui-palette-primary-main) 13%, transparent), transparent 70%)",
        },
      }}
    >
      <Stack spacing={{ xs: 2, md: 2.5 }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "flex-start", lg: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              component="h1"
              variant="h5"
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              {copy.quickTitle}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.4, maxWidth: 560, fontSize: 13 }}
            >
              {copy.quickDescription}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: "wrap",
              justifyContent: { xs: "flex-start", lg: "flex-end" },
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentPasteRounded />}
              onClick={pasteFromClipboard}
              sx={topActionButtonSx}
            >
              {copy.paste}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SaveOutlined />}
              onClick={saveDraft}
              sx={topActionButtonSx}
            >
              {copy.saveDraft}
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<UploadRounded />}
              disabled={posting}
              onClick={postRows}
              sx={topActionButtonSx}
            >
              {copy.post}
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StockMetricCard
              label={t("productsAvailable")}
              value={String(products.length)}
              hint={copy.activeProducts}
              icon={<Inventory2Outlined />}
              tone="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StockMetricCard
              label={t("availableBatches")}
              value={String(Object.values(batchesByProduct).flat().length)}
              hint={copy.acrossAllProducts}
              icon={<LocalShippingOutlined />}
              tone="secondary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StockMetricCard
              label={t("recentMovements")}
              value={String(recentRows.length)}
              hint={copy.last7Days}
              icon={<TrendingUpRounded />}
              tone="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StockMetricCard
              label={copy.lowStockItems}
              value={String(lowStockCount)}
              hint={copy.needAttention}
              icon={<ReportProblemOutlined />}
              tone="warning"
            />
          </Grid>
        </Grid>

        <Paper
          variant="outlined"
          sx={{
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 2.5 },
              py: 1.75,
              borderBottom: "1px solid",
              borderColor: "divider",
              backgroundImage:
                "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 6%, transparent), transparent 58%)",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 850 }}>
              {copy.defaults}
            </Typography>
          </Box>

          <Stack spacing={1.75} sx={{ p: { xs: 2, md: 2.5 } }}>
            <Grid container spacing={1.25} sx={{ alignItems: "stretch" }}>
              <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                <TextField
                  select
                  size="small"
                  fullWidth
                  label={copy.defaultType}
                  value={defaultType}
                  onChange={(event) =>
                    setDefaultType(event.target.value as StockMovementType)
                  }
                >
                  {movementTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {copy[option.labelKey]}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  label={copy.warehouse}
                  value={copy.mainWarehouse}
                  slotProps={{ input: { readOnly: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 2.5 }}>
                <Autocomplete
                  size="small"
                  options={suppliers}
                  value={
                    suppliers.find((supplier) => supplier.id === partyId) ??
                    null
                  }
                  onChange={(_, supplier) => setPartyId(supplier?.id ?? "")}
                  getOptionLabel={(supplier) =>
                    `${supplier.code} - ${supplier.nameEn || supplier.name}`
                  }
                  renderInput={(params) => (
                    <TextField {...params} label={t("supplier")} />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  label={t("reference")}
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 2.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  type="datetime-local"
                  label={t("movementDate")}
                  value={movementAt}
                  onChange={(event) => setMovementAt(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  startIcon={<AddRounded />}
                  onClick={() => addRow()}
                  sx={{
                    ...topActionButtonSx,
                    minHeight: 38,
                    whiteSpace: "nowrap",
                  }}
                >
                  {copy.addRow}
                </Button>
              </Grid>
            </Grid>

            <Alert
              severity="info"
              variant="outlined"
              sx={{
                borderRadius: 1.75,
                bgcolor:
                  "color-mix(in srgb, var(--mui-palette-primary-main) 4%, var(--mui-palette-background-paper))",
                "& .MuiAlert-message": { width: "100%" },
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {copy.automationTitle}
              </Typography>
              <Typography variant="body2">{copy.automationText}</Typography>
            </Alert>
          </Stack>
        </Paper>

        {canCreateIn || canCreateOut ? null : (
          <Alert severity="warning">{copy.noPermission}</Alert>
        )}

        <Paper
          variant="outlined"
          sx={{
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={1.5}
            sx={{
              alignItems: { xs: "flex-start", lg: "center" },
              justifyContent: "space-between",
              px: { xs: 2, md: 2.5 },
              py: 1.75,
              backgroundImage:
                "linear-gradient(180deg, color-mix(in srgb, var(--mui-palette-primary-main) 6%, transparent), transparent 100%)",
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 850 }}>
                {copy.gridTitle}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25, fontSize: 13 }}
              >
                {copy.gridHint}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentPasteRounded />}
                onClick={pasteFromClipboard}
              >
                {copy.paste}
              </Button>
              <Button variant="outlined" size="small" onClick={clearEmptyRows}>
                {copy.clearEmptyRows}
              </Button>
            </Stack>
          </Stack>

          <Divider />

          <QuickEntryTable
            rows={rows}
            products={products}
            batchesByProduct={batchesByProduct}
            productById={productById}
            canCreateIn={canCreateIn}
            canCreateOut={canCreateOut}
            copy={copy}
            productLabel={t("product")}
            batchLabel={t("batch")}
            expiryLabel={t("expiryDate")}
            quantityLabel={t("quantity")}
            onUpdate={updateInlineRow}
            onDelete={deleteRow}
            onPaste={pasteText}
            onKeyDown={handleInlineKeyDown}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "stretch", md: "center" },
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: 1.25,
              px: { xs: 1.5, md: 2 },
              py: 1.25,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Button
              variant="text"
              size="small"
              startIcon={<AddRounded />}
              onClick={() => addRow()}
              sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
            >
              {copy.addNewRow}
            </Button>

            <Stack
              direction="row"
              spacing={0.75}
              sx={{ flexWrap: "wrap", alignItems: "center" }}
            >
              <Chip
                size="small"
                label={`${copy.rows}: ${summary.rows}`}
                variant="outlined"
              />
              <Chip
                size="small"
                label={`${copy.validRows}: ${summary.valid}`}
                color="success"
                variant="outlined"
              />
              <Chip
                size="small"
                label={`${copy.errors}: ${summary.errors}`}
                color={summary.errors ? "error" : "default"}
                variant="outlined"
              />
              <Chip
                size="small"
                label={`${copy.totalQuantity}: ${summary.totalQuantity}`}
                color="info"
                variant="outlined"
              />
            </Stack>

            <Button
              variant="contained"
              size="small"
              startIcon={<UploadRounded />}
              disabled={posting}
              onClick={postRows}
              sx={{ minHeight: 38 }}
            >
              {copy.post} {summary.valid ? `(${summary.valid})` : ""}
            </Button>
          </Box>
        </Paper>

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
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 850 }}>
                {copy.recent}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25, fontSize: 13 }}
              >
                {copy.recentHint}
              </Typography>
            </Box>

            <Button
              component={Link}
              href="/inventory/movements"
              variant="text"
              size="small"
            >
              {copy.viewAllMovements}
            </Button>
          </Stack>

          <Divider />

          <Box sx={{ height: recentGridHeight, overflow: "hidden" }}>
            <DataGrid
              rows={recentRows}
              columns={[
                {
                  field: "movementAt",
                  headerName: t("movementDate"),
                  minWidth: 166,
                  flex: 0.85,
                },
                {
                  field: "type",
                  headerName: copy.movementType,
                  minWidth: 145,
                  renderCell: (params) => (
                    <MovementTypeChip
                      type={params.value as StockMovementType}
                      copy={copy}
                    />
                  ),
                },
                {
                  field: "productLabel",
                  headerName: t("product"),
                  minWidth: 240,
                  flex: 1.2,
                },
                { field: "batchNumber", headerName: t("batch"), minWidth: 140 },
                {
                  field: "quantity",
                  headerName: t("quantity"),
                  minWidth: 110,
                  align: "right",
                  headerAlign: "right",
                },
                {
                  field: "reference",
                  headerName: t("reference"),
                  minWidth: 145,
                  flex: 0.8,
                },
                {
                  field: "userName",
                  headerName: t("user"),
                  minWidth: 140,
                  flex: 0.75,
                },
              ]}
              density="compact"
              rowHeight={38}
              columnHeaderHeight={36}
              disableRowSelectionOnClick
              pageSizeOptions={[10, 20]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              localeText={
                locale === "ar"
                  ? arSD.components.MuiDataGrid.defaultProps.localeText
                  : undefined
              }
              slots={{
                noRowsOverlay: () => (
                  <Stack
                    spacing={0.75}
                    sx={{
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "text.secondary",
                    }}
                  >
                    <TrendingUpRounded fontSize="small" />
                    <Typography variant="body2">{copy.recentHint}</Typography>
                  </Stack>
                ),
              }}
              sx={{
                border: 0,
                bgcolor: "background.paper",

                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: "action.hover",
                  borderBottomColor: "divider",
                },

                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 800,
                  fontSize: "0.68rem",
                  color: "text.secondary",
                },

                "& .MuiDataGrid-cell": {
                  borderBottomColor: "divider",
                  fontSize: "0.76rem",
                },

                "& .MuiDataGrid-row:hover": {
                  bgcolor: "action.hover",
                },

                "& .MuiDataGrid-footerContainer": {
                  minHeight: 44,
                  borderTopColor: "divider",
                },
              }}
            />
          </Box>
        </Paper>
      </Stack>

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3500}
        onClose={() => setMessage(null)}
      >
        {message ? (
          <Alert severity={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

function QuickEntryTable({
  rows,
  products,
  batchesByProduct,
  productById,
  canCreateIn,
  canCreateOut,
  copy,
  productLabel,
  batchLabel,
  expiryLabel,
  quantityLabel,
  onUpdate,
  onDelete,
  onPaste,
  onKeyDown,
}: StockQuickEntryTableProps) {
  return (
    <TableContainer
      onPaste={(event) => {
        const target = event.target as HTMLElement;

        if (["INPUT", "TEXTAREA"].includes(target.tagName)) {
          return;
        }

        const text = event.clipboardData.getData("text");

        if (!text.includes("\t") && !text.includes("\n")) {
          return;
        }

        event.preventDefault();
        onPaste(text);
      }}
      sx={{
        width: "100%",
        maxHeight: { xs: 440, md: 520 },
        overflowX: "auto",
        overflowY: "auto",
        bgcolor: "background.paper",
      }}
    >
      <Table
        stickyHeader
        size="small"
        aria-label={copy.gridTitle}
        sx={{
          minWidth: 1320,
          tableLayout: "fixed",

          "& .MuiTableCell-root": {
            borderColor: "divider",
          },

          "& .MuiTableHead-root .MuiTableCell-root": {
            py: 1,
            px: 1,
            bgcolor: "action.hover",
            color: "text.secondary",
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          },

          "& .MuiTableBody-root .MuiTableCell-root": {
            px: 0.75,
            py: 0.625,
            verticalAlign: "middle",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: 48 }}>
              {copy.line}
            </TableCell>
            <TableCell sx={{ width: 146 }}>{copy.movementType}</TableCell>
            <TableCell sx={{ width: 250 }}>{productLabel}</TableCell>
            <TableCell sx={{ width: 166 }}>{batchLabel}</TableCell>
            <TableCell sx={{ width: 150 }}>{expiryLabel}</TableCell>
            <TableCell align="right" sx={{ width: 112 }}>
              {quantityLabel}
            </TableCell>
            <TableCell align="center" sx={{ width: 78 }}>
              {copy.unit}
            </TableCell>
            <TableCell align="right" sx={{ width: 108 }}>
              {copy.available}
            </TableCell>
            <TableCell sx={{ width: 156 }}>{copy.reason}</TableCell>
            <TableCell sx={{ width: 140 }}>{copy.status}</TableCell>
            <TableCell
              align="center"
              aria-label={copy.delete}
              sx={{ width: 56 }}
            />
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row) => {
            const batch = resolveBatch(row, batchesByProduct);
            const isAdjustment =
              row.movementType === "ADJUSTMENT_INCREASE" ||
              row.movementType === "ADJUSTMENT_DECREASE";
            const isOutbound =
              row.movementType === "STOCK_OUT" ||
              row.movementType === "ADJUSTMENT_DECREASE";
            const available = batch?.currentQuantity;
            const exceeds =
              Boolean(available) &&
              Number(row.quantity || 0) > Number(available);
            const expiryLocked = Boolean(batch) || isOutbound;

            return (
              <TableRow
                key={row.id}
                hover
                sx={{
                  "&:hover .quick-entry-control": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <TableCell align="center">
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {row.lineNo}
                  </Typography>
                </TableCell>

                <TableCell>
                  <InlineSelectCell
                    value={row.movementType}
                    options={movementTypeOptions.map((option) => ({
                      value: option.value,
                      label: copy[option.labelKey],
                    }))}
                    onChange={(movementType) =>
                      onUpdate(row.id, {
                        movementType: movementType as StockMovementType,
                      })
                    }
                    onKeyDown={onKeyDown}
                    ariaLabel={copy.movementType}
                    tone={
                      row.movementType === "STOCK_OUT" ||
                      row.movementType === "ADJUSTMENT_DECREASE"
                        ? "error"
                        : row.movementType === "ADJUSTMENT_INCREASE"
                          ? "info"
                          : "success"
                    }
                  />
                </TableCell>

                <TableCell>
                  <InlineProductCell
                    row={row}
                    products={products}
                    placeholder={copy.searchProduct}
                    onChange={(productId) => onUpdate(row.id, { productId })}
                    onKeyDown={onKeyDown}
                  />
                </TableCell>

                <TableCell>
                  <InlineBatchCell
                    row={row}
                    batches={batchesByProduct[row.productId] ?? []}
                    placeholder={copy.selectBatch}
                    allowNewBatch={row.movementType === "STOCK_IN"}
                    onChange={(nextBatch) =>
                      onUpdate(row.id, {
                        batchId: nextBatch?.id ?? "",
                        batchNumber: nextBatch?.batchNumber ?? "",
                        expiryDate: nextBatch
                          ? toDateInputValue(nextBatch.expiryDate)
                          : row.expiryDate,
                      })
                    }
                    onTextChange={(batchNumber) =>
                      onUpdate(row.id, {
                        batchId: "",
                        batchNumber,
                      })
                    }
                    onKeyDown={onKeyDown}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    className="quick-entry-control"
                    type="month"
                    size="small"
                    fullWidth
                    disabled={!row.productId || expiryLocked}
                    value={toMonthInputValue(
                      row.expiryDate || batch?.expiryDate,
                    )}
                    onChange={(event) =>
                      onUpdate(row.id, {
                        expiryDate: event.target.value
                          ? `${event.target.value}-01`
                          : "",
                      })
                    }
                    onKeyDown={onKeyDown}
                    slotProps={{
                      htmlInput: {
                        "aria-label": expiryLabel,
                      },
                    }}
                    sx={quickEntryFieldSx}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    className="quick-entry-control"
                    type="number"
                    size="small"
                    fullWidth
                    value={row.quantity}
                    placeholder="0"
                    onChange={(event) =>
                      onUpdate(row.id, { quantity: event.target.value })
                    }
                    onKeyDown={onKeyDown}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        inputMode: "decimal",
                        "aria-label": quantityLabel,
                      },
                    }}
                    sx={quickEntryFieldSx}
                  />
                </TableCell>

                <TableCell align="center">
                  <Typography
                    variant="body2"
                    color={row.productId ? "text.secondary" : "text.disabled"}
                    noWrap
                  >
                    {productById.get(row.productId)?.unit ?? "—"}
                  </Typography>
                </TableCell>

                <TableCell align="right">
                  <Typography
                    variant="body2"
                    color={exceeds ? "error.main" : "text.secondary"}
                    sx={{ fontWeight: exceeds ? 800 : 600 }}
                  >
                    {available ?? "—"}
                  </Typography>
                </TableCell>

                <TableCell>
                  {isAdjustment ? (
                    <InlineSelectCell
                      value={row.reason}
                      placeholder={copy.selectReason}
                      options={adjustmentReasonOptions(copy)}
                      onChange={(reason) => onUpdate(row.id, { reason })}
                      onKeyDown={onKeyDown}
                      ariaLabel={copy.reason}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.disabled"
                      sx={{ display: "block", px: 0.5 }}
                    >
                      —
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <ValidationChip
                    row={row}
                    batchesByProduct={batchesByProduct}
                    canCreateIn={canCreateIn}
                    canCreateOut={canCreateOut}
                    copy={copy}
                  />
                </TableCell>

                <TableCell align="center">
                  <Tooltip title={copy.delete}>
                    <IconButton
                      size="small"
                      aria-label={copy.delete}
                      onClick={() => onDelete(row.id)}
                      sx={{
                        color: "text.secondary",

                        "&:hover": {
                          color: "error.main",
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <DeleteOutlineRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}

        </TableBody>
      </Table>
    </TableContainer>
  );
}

function StockMetricCard({
  label,
  value,
  hint,
  icon,
  tone,
}: StockMetricCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        position: "relative",
        minHeight: 92,
        p: 1.5,
        overflow: "hidden",
        bgcolor: "background.paper",
        backgroundImage: `linear-gradient(
          135deg,
          color-mix(in srgb, var(--mui-palette-${tone}-main) 10%, transparent),
          transparent 64%
        )`,
        transition:
          "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",

        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: `color-mix(in srgb, var(--mui-palette-${tone}-main) 34%, var(--mui-palette-divider))`,
          boxShadow: 2,
        },
      }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: 1.5,
            color: `${tone}.main`,
            backgroundImage: `linear-gradient(
              135deg,
              color-mix(in srgb, var(--mui-palette-${tone}-main) 21%, transparent),
              color-mix(in srgb, var(--mui-palette-${tone}-main) 8%, transparent)
            )`,
            border: `1px solid color-mix(
              in srgb,
              var(--mui-palette-${tone}-main) 20%,
              var(--mui-palette-divider)
            )`,

            "& svg": {
              fontSize: 19,
            },
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{ fontSize: "0.78rem", fontWeight: 800 }}
          >
            {label}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mt: 0.25,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.035em",
            }}
          >
            {value}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.35, fontSize: "0.68rem" }}
          >
            {hint}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

const quickEntryFieldSx = {
  width: "100%",

  "& .MuiOutlinedInput-root": {
    height: 36,
    borderRadius: 1.25,
    bgcolor: "background.paper",
    transition: "border-color 140ms ease, box-shadow 140ms ease",

    "& fieldset": {
      borderColor: "divider",
    },

    "&:hover fieldset": {
      borderColor: "primary.main",
    },

    "&.Mui-focused": {
      boxShadow:
        "0 0 0 3px color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)",

      "& fieldset": {
        borderColor: "primary.main",
        borderWidth: 1,
      },
    },
  },

  "& .MuiOutlinedInput-input": {
    px: 1,
    py: 0.75,
    fontSize: "0.8rem",
  },

  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    minHeight: "unset",
  },
} as const;

const topActionButtonSx = {
  minHeight: 34,
  borderRadius: 1.5,
  px: 1.35,
  fontSize: 13,
  fontWeight: 750,
  "& .MuiButton-startIcon": {
    mr: 0.65,
    "& svg": { fontSize: 17 },
  },
} as const;

function InlineSelectCell({
  value,
  options,
  onChange,
  onKeyDown,
  ariaLabel,
  placeholder,
  tone,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  ariaLabel: string;
  placeholder?: string;
  tone?: "success" | "error" | "info";
}) {
  return (
    <TextField
      select
      size="small"
      fullWidth
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={onKeyDown}
      slotProps={{ htmlInput: { "aria-label": ariaLabel } }}
      sx={{
        ...quickEntryFieldSx,
        "& .MuiOutlinedInput-root": {
          ...quickEntryFieldSx["& .MuiOutlinedInput-root"],
          borderColor: tone ? `${tone}.main` : undefined,
        },
        "& .MuiSelect-select": {
          ...quickEntryFieldSx["& .MuiSelect-select"],
          color: tone ? `${tone}.main` : "text.primary",
          fontWeight: tone ? 700 : 500,
        },
      }}
    >
      {placeholder ? (
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>
      ) : null}
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

function InlineProductCell({
  row,
  products,
  placeholder,
  onChange,
  onKeyDown,
}: {
  row: StockQuickEntryRow;
  products: StockQuickEntryProductOption[];
  placeholder: string;
  onChange: (productId: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}) {
  const value =
    products.find((product) => product.id === row.productId) ?? null;

  return (
    <Autocomplete
      size="small"
      fullWidth
      autoHighlight
      openOnFocus
      options={products}
      value={value}
      onChange={(_, product) => onChange(product?.id ?? "")}
      onKeyDown={onKeyDown}
      filterOptions={(options, state) => {
        const query = state.inputValue.trim().toLowerCase();
        if (!query) return options.slice(0, 80);

        return options
          .filter((product) =>
            `${product.code} ${product.name} ${product.searchName}`
              .toLowerCase()
              .includes(query),
          )
          .slice(0, 80);
      }}
      getOptionLabel={(product) => `${product.name}`}
      renderOption={(props, product) => (
        <Box component="li" {...props} key={product.id}>
          <Stack spacing={0.1}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {product.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {product.code} · {product.unit}
            </Typography>
          </Stack>
        </Box>
      )}
      renderInput={(inputParams) => (
        <TextField
          {...inputParams}
          placeholder={placeholder}
          slotProps={{
            ...inputParams.slotProps,
            htmlInput: {
              ...inputParams.slotProps.htmlInput,
              "aria-label": placeholder,
            },
          }}
          sx={quickEntryFieldSx}
        />
      )}
    />
  );
}

function InlineBatchCell({
  row,
  batches,
  placeholder,
  allowNewBatch,
  onChange,
  onTextChange,
  onKeyDown,
}: {
  row: StockQuickEntryRow;
  batches: StockAvailableBatchOption[];
  placeholder: string;
  allowNewBatch: boolean;
  onChange: (batch: StockAvailableBatchOption | null) => void;
  onTextChange: (batchNumber: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}) {
  const selected =
    batches.find((batch) => batch.id === row.batchId) ??
    batches.find((batch) => batch.batchNumber === row.batchNumber) ??
    null;

  return (
    <Autocomplete
      size="small"
      fullWidth
      autoHighlight
      openOnFocus
      freeSolo={allowNewBatch}
      disabled={!row.productId}
      options={batches}
      value={
        selected ?? (allowNewBatch && row.batchNumber ? row.batchNumber : null)
      }
      onKeyDown={onKeyDown}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.batchNumber
      }
      onChange={(_, next) => {
        if (typeof next === "string") {
          onTextChange(next);
          return;
        }

        onChange(next);
      }}
      onInputChange={(_, value, reason) => {
        if (allowNewBatch && reason === "input") {
          onTextChange(value);
        }
      }}
      renderOption={(props, batch) => (
        <Box component="li" {...props} key={batch.id}>
          <Stack spacing={0.1}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {batch.batchNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {batch.currentQuantity} ·{" "}
              {toMonthInputValue(batch.expiryDate) || "—"}
            </Typography>
          </Stack>
        </Box>
      )}
      renderInput={(inputParams) => (
        <TextField
          {...inputParams}
          placeholder={placeholder}
          slotProps={{
            ...inputParams.slotProps,
            htmlInput: {
              ...inputParams.slotProps.htmlInput,
              "aria-label": placeholder,
            },
          }}
          sx={quickEntryFieldSx}
        />
      )}
    />
  );
}

function adjustmentReasonOptions(copy: StockQuickEntryCopy) {
  return [
    { value: "STOCK_COUNT", label: copy.stockCount },
    { value: "DAMAGED", label: copy.damaged },
    { value: "EXPIRED", label: copy.expired },
    { value: "BROKEN_BOXES", label: copy.brokenBoxes },
    { value: "OTHER", label: copy.other },
  ];
}

function MovementTypeChip({
  type,
  copy,
}: {
  type: StockMovementType;
  copy: StockQuickEntryCopy;
}) {
  const color =
    type === "STOCK_OUT" || type === "ADJUSTMENT_DECREASE"
      ? "error"
      : type === "ADJUSTMENT_INCREASE"
        ? "info"
        : "success";

  return (
    <Chip
      size="small"
      variant="outlined"
      color={color}
      label={movementTypeLabel(type, copy)}
      sx={{ height: 22, fontSize: "0.68rem", fontWeight: 750 }}
    />
  );
}

function ValidationChip({
  row,
  batchesByProduct,
  canCreateIn,
  canCreateOut,
  copy,
}: {
  row: StockQuickEntryRow;
  batchesByProduct: StockAvailableBatchMap;
  canCreateIn: boolean;
  canCreateOut: boolean;
  copy: StockQuickEntryCopy;
}) {
  const validation = validateRow(row, {
    batchesByProduct,
    canCreateIn,
    canCreateOut,
    copy,
  });

  return (
    <Tooltip title={validation.message}>
      <Chip
        size="small"
        color={
          validation.ok ? "success" : isRowEmpty(row) ? "default" : "error"
        }
        variant="outlined"
        label={validation.ok ? copy.valid : validation.message}
      />
    </Tooltip>
  );
}

function createRow(
  id: number,
  movementType: StockMovementType,
): StockQuickEntryRow {
  return {
    id,
    lineNo: id,
    movementType,
    productId: "",
    batchNumber: "",
    batchId: "",
    expiryDate: "",
    quantity: "",
    reason: "",
    notes: "",
  };
}

function nextRowId(rows: StockQuickEntryRow[]) {
  return Math.max(0, ...rows.map((row) => row.id)) + 1;
}

function renumberRows(rows: StockQuickEntryRow[]) {
  return rows.map((row, index) => ({ ...row, lineNo: index + 1 }));
}

function movementTypeLabel(type: StockMovementType, copy: StockQuickEntryCopy) {
  const option = movementTypeOptions.find((item) => item.value === type);
  return option ? copy[option.labelKey] : type;
}

function isRowEmpty(row: StockQuickEntryRow) {
  return (
    !row.productId &&
    !row.batchNumber &&
    !row.quantity &&
    !row.reason &&
    !row.notes
  );
}

function validateRow(
  row: StockQuickEntryRow,
  {
    batchesByProduct,
    canCreateIn,
    canCreateOut,
    copy,
  }: {
    batchesByProduct: StockAvailableBatchMap;
    canCreateIn: boolean;
    canCreateOut: boolean;
    copy: StockQuickEntryCopy;
  },
): StockQuickEntryValidation {
  if (isRowEmpty(row)) return { ok: false, message: copy.empty };

  if (
    row.movementType === "ADJUSTMENT_INCREASE" ||
    row.movementType === "ADJUSTMENT_DECREASE"
  ) {
    return { ok: false, message: copy.unsupported };
  }

  if (row.movementType === "STOCK_IN" && !canCreateIn) {
    return { ok: false, message: copy.noPermission };
  }

  if (row.movementType === "STOCK_OUT" && !canCreateOut) {
    return { ok: false, message: copy.noPermission };
  }

  if (!row.productId) return { ok: false, message: copy.productRequired };
  if (!row.batchNumber) return { ok: false, message: copy.batchRequired };

  if (!Number.isFinite(Number(row.quantity)) || Number(row.quantity) <= 0) {
    return { ok: false, message: copy.quantityRequired };
  }

  if (row.serverError) return { ok: false, message: row.serverError };

  if (row.movementType === "STOCK_OUT") {
    const batch = resolveBatch(row, batchesByProduct);

    if (!batch) return { ok: false, message: copy.batchRequired };

    if (Number(row.quantity) > Number(batch.currentQuantity)) {
      return { ok: false, message: copy.stockExceeded };
    }
  }

  return { ok: true, message: copy.valid };
}

function resolveBatch(
  row: StockQuickEntryRow,
  batchesByProduct: StockAvailableBatchMap,
) {
  const batches = batchesByProduct[row.productId] ?? [];

  return (
    batches.find((batch) => batch.id === row.batchId) ??
    batches.find(
      (batch) =>
        batch.batchNumber.toLowerCase() === row.batchNumber.toLowerCase(),
    )
  );
}

function toDateInputValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function toMonthInputValue(value?: string | null) {
  return value ? value.slice(0, 7) : "";
}

function combineReasonAndNotes(row: StockQuickEntryRow) {
  return [row.reason, row.notes].filter(Boolean).join(" - ");
}

function parsePastedRows(
  text: string,
  existingRows: StockQuickEntryRow[],
  defaultType: StockMovementType,
  products: StockQuickEntryProductOption[],
  batchesByProduct: StockAvailableBatchMap,
) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  let nextId = nextRowId(existingRows);

  return lines.map((line) => {
    const [
      typeValue,
      productValue,
      batchValue,
      expiryValue,
      quantityValue,
      reasonValue,
      notesValue,
    ] = line.split("\t");

    const movementType = parseMovementType(typeValue, defaultType);
    const product = findProduct(productValue, products);
    const batch = product
      ? findBatch(batchValue, batchesByProduct[product.id] ?? [])
      : undefined;

    return {
      ...createRow(nextId++, movementType),
      productId: product?.id ?? "",
      batchId: batch?.id ?? "",
      batchNumber: batch?.batchNumber ?? (batchValue ?? "").trim(),
      expiryDate: toDateInputValue(expiryValue),
      quantity: (quantityValue ?? "").trim(),
      reason: (reasonValue ?? "").trim(),
      notes: (notesValue ?? "").trim(),
    };
  });
}

function parseMovementType(
  value: string | undefined,
  fallback: StockMovementType,
): StockMovementType {
  const normalized = (value ?? "").trim().toUpperCase().replace(/\s+/g, "_");

  if (normalized === "STOCK_IN" || normalized === "IN") return "STOCK_IN";
  if (normalized === "STOCK_OUT" || normalized === "OUT") return "STOCK_OUT";

  if (
    normalized === "ADJUSTMENT_INCREASE" ||
    normalized === "ADJUSTMENT_+" ||
    normalized === "ADJUSTMENT+"
  ) {
    return "ADJUSTMENT_INCREASE";
  }

  if (
    normalized === "ADJUSTMENT_DECREASE" ||
    normalized === "ADJUSTMENT_-" ||
    normalized === "ADJUSTMENT-"
  ) {
    return "ADJUSTMENT_DECREASE";
  }

  return fallback;
}

function findProduct(
  value: string | undefined,
  products: StockQuickEntryProductOption[],
) {
  const query = (value ?? "").trim().toLowerCase();
  if (!query) return undefined;

  return products.find((product) =>
    [product.id, product.code, product.name, product.searchName].some(
      (entry) => entry.toLowerCase() === query,
    ),
  );
}

function findBatch(
  value: string | undefined,
  batches: StockAvailableBatchOption[],
) {
  const query = (value ?? "").trim().toLowerCase();
  if (!query) return undefined;

  return batches.find(
    (batch) =>
      batch.batchNumber.toLowerCase() === query ||
      batch.id.toLowerCase() === query,
  );
}
