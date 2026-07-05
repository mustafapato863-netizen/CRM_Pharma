"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
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
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  AddRounded,
  CloudUploadRounded,
  DeleteOutlineRounded,
  FileDownloadRounded,
  MoreVertRounded,
  PrintRounded,
  QrCodeScannerRounded,
  SaveRounded,
  TrendingUpRounded,
  StarRounded,
  ShoppingCartCheckoutRounded,
  ReceiptLongRounded,
} from "@mui/icons-material";
import { createInvoiceAction, CreateInvoiceInput } from "../actions/invoice-actions";

type InvoiceWorkspaceProps = {
  mode: "purchase" | "sales";
  title: string;
  description: string;
  parties: Array<{
    id: string;
    code: string;
    name: string;
    nameEn: string | null;
    type: string;
    isActive: boolean;
    currentBalance: string;
    balanceType: string;
    lastTransactionAt: string | null;
  }>;
  products: Array<{
    id: string;
    code: string;
    name: string;
    searchName: string;
    unit: string;
    isActive: boolean;
  }>;
  batchesByProduct: Record<
    string,
    Array<{
      id: string;
      productId: string;
      batchNumber: string;
      expiryDate: string | null;
      currentQuantity: string;
      purchaseCost?: string | null;
    }>
  >;
  canCreate: boolean;
};

type InvoiceLineItem = {
  productId: string;
  batchNumber?: string; // for purchase mode
  batchId?: string | null; // for sales mode
  expiryDate?: string | null; // for purchase mode
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number; // default 14%
};

export function InvoiceWorkspace({
  mode,
  title,
  description,
  parties,
  products,
  batchesByProduct,
  canCreate,
}: InvoiceWorkspaceProps) {
  const locale = useLocale();

  // Form State
  const [selectedPartyId, setSelectedPartyId] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toISOString().split("T")[0];
    })()
  );
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>(
    mode === "purchase" ? "Bank Transfer" : "Cash"
  );
  const [warehouseId, setWarehouseId] = useState<string>("Main Warehouse");
  const [currency, setCurrency] = useState<string>("EGP");
  const [salesChannel, setSalesChannel] = useState<string>("Walk-in");
  
  // Financial parameters
  const [shippingCosts, setShippingCosts] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  // Line Items State
  const [lines, setLines] = useState<InvoiceLineItem[]>([
    {
      productId: "",
      unit: "box",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 14,
    },
  ]);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  const [attachments, setAttachments] = useState<Array<{ name: string; size: string }>>([]);

  // Auto-populate default references & mock values on party selection
  const selectedParty = useMemo(() => {
    return parties.find((p) => p.id === selectedPartyId);
  }, [parties, selectedPartyId]);

  useEffect(() => {
    if (selectedParty && mode === "purchase" && !reference) {
      // Mock invoice reference for supplier
      setReference(`INV-${selectedParty.code}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [selectedParty, mode, reference]);

  // Form Reset Helper
  const handleReset = () => {
    setSelectedPartyId("");
    setReference("");
    setNotes("");
    setShippingCosts(0);
    setAmountPaid(0);
    setAttachments([]);
    setLines([
      {
        productId: "",
        unit: "box",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 14,
      },
    ]);
  };

  // Line Calculations
  const calculatedLines = useMemo(() => {
    return lines.map((line) => {
      const subtotal = line.quantity * line.unitPrice;
      const lineTax = (subtotal - line.discount) * (line.taxRate / 100);
      const lineTotal = subtotal - line.discount + lineTax;
      
      // Determine purchase cost for estimated profit calculation (Sales mode)
      let costPrice = 0;
      if (mode === "sales" && line.productId && line.batchId) {
        const batch = batchesByProduct[line.productId]?.find((b) => b.id === line.batchId);
        if (batch?.purchaseCost) {
          costPrice = parseFloat(batch.purchaseCost);
        }
      }

      return {
        ...line,
        subtotal,
        tax: lineTax,
        total: lineTotal,
        cost: costPrice * line.quantity,
      };
    });
  }, [lines, mode, batchesByProduct]);

  // Summary Calculations
  const subtotalSum = useMemo(() => {
    return calculatedLines.reduce((sum, item) => sum + item.subtotal, 0);
  }, [calculatedLines]);

  const discountSum = useMemo(() => {
    return calculatedLines.reduce((sum, item) => sum + item.discount, 0);
  }, [calculatedLines]);

  const taxSum = useMemo(() => {
    return calculatedLines.reduce((sum, item) => sum + item.tax, 0);
  }, [calculatedLines]);

  const grandTotal = useMemo(() => {
    return subtotalSum - discountSum + taxSum + (mode === "purchase" ? shippingCosts : 0);
  }, [subtotalSum, discountSum, taxSum, shippingCosts, mode]);

  const remainingBalance = useMemo(() => {
    return Math.max(0, grandTotal - amountPaid);
  }, [grandTotal, amountPaid]);

  const totalCostSum = useMemo(() => {
    return calculatedLines.reduce((sum, item) => sum + item.cost, 0);
  }, [calculatedLines]);

  const estimatedProfit = useMemo(() => {
    if (mode === "sales") {
      const profitVal = (subtotalSum - discountSum) - totalCostSum;
      const profitPercent = grandTotal > 0 ? (profitVal / (subtotalSum - discountSum)) * 100 : 0;
      return {
        value: profitVal,
        percentage: profitPercent,
      };
    }
    return { value: 0, percentage: 0 };
  }, [subtotalSum, discountSum, totalCostSum, grandTotal, mode]);

  const lineCount = useMemo(() => {
    return lines.filter((l) => l.productId).length;
  }, [lines]);

  // Handlers for Items Grid
  const addLineItem = () => {
    setLines([
      ...lines,
      {
        productId: "",
        unit: "box",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 14,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, idx) => idx !== index));
    } else {
      setLines([
        {
          productId: "",
          unit: "box",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          taxRate: 14,
        },
      ]);
    }
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updated = [...lines];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    // Auto-update price/unit/batches if product changes
    if (field === "productId") {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated[index].unit = prod.unit || "box";
        updated[index].batchId = "";
        updated[index].batchNumber = "";
        updated[index].expiryDate = "";
        
        // Auto-fill price in Sales Mode
        if (mode === "sales") {
          const batches = batchesByProduct[prod.id] || [];
          if (batches.length > 0) {
            // Select first active batch with qty > 0
            const activeBatch = batches.find((b) => parseFloat(b.currentQuantity) > 0) || batches[0];
            updated[index].batchId = activeBatch.id;
            
            // Set unit price (purchaseCost * 1.25 markup)
            if (activeBatch.purchaseCost) {
              const cost = parseFloat(activeBatch.purchaseCost);
              updated[index].unitPrice = Math.round(cost * 1.25 * 100) / 100;
            }
          }
        } else {
          // Purchase Mode: Default batch values
          updated[index].batchNumber = `B-${prod.code}-${Math.floor(100 + Math.random() * 900)}`;
          const exp = new Date();
          exp.setMonth(exp.getMonth() + 18);
          updated[index].expiryDate = exp.toISOString().split("T")[0];
          updated[index].unitPrice = 10.0;
        }
      }
    }

    // Auto-fill price if Batch changes in Sales Mode
    if (field === "batchId" && mode === "sales") {
      const selectedBatchId = value;
      const currentProdId = updated[index].productId;
      if (currentProdId) {
        const batch = batchesByProduct[currentProdId]?.find((b) => b.id === selectedBatchId);
        if (batch && batch.purchaseCost) {
          const cost = parseFloat(batch.purchaseCost);
          updated[index].unitPrice = Math.round(cost * 1.25 * 100) / 100;
        }
      }
    }

    setLines(updated);
  };

  // Attachments handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const list = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)} KB`,
      }));
      setAttachments([...attachments, ...list]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, idx) => idx !== index));
  };

  // Submit invoice
  const handleSubmitInvoice = async () => {
    if (!selectedPartyId) {
      setSnackbarMessage(mode === "purchase" ? "رجاءً اختر المورد أولاً" : "رجاءً اختر العميل أولاً");
      setSnackbarSeverity("error");
      return;
    }

    const validLines = lines.filter((l) => l.productId && l.quantity > 0);
    if (validLines.length === 0) {
      setSnackbarMessage("يجب إضافة منتج واحد على الأقل بكمية صالحة");
      setSnackbarSeverity("error");
      return;
    }

    // Validate batches
    for (const line of validLines) {
      if (mode === "sales" && !line.batchId) {
        setSnackbarMessage("رجاءً اختر رقم التشغيلة للمنتجات المباعة");
        setSnackbarSeverity("error");
        return;
      }
      if (mode === "purchase" && !line.batchNumber) {
        setSnackbarMessage("رجاءً أدخل رقم التشغيلة للمنتجات المشتراة");
        setSnackbarSeverity("error");
        return;
      }
    }

    setIsSubmitting(true);

    const payload: CreateInvoiceInput = {
      type: mode === "purchase" ? "PURCHASE" : "SALES",
      partyId: selectedPartyId,
      invoiceDate: new Date(invoiceDate).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      reference: reference || undefined,
      notes: notes || undefined,
      paymentMethod,
      warehouseId,
      currency,
      paymentStatus:
        amountPaid >= grandTotal
          ? "PAID"
          : amountPaid > 0
          ? "PARTIAL"
          : "UNPAID",
      subtotal: subtotalSum,
      discountTotal: discountSum,
      taxTotal: taxSum,
      grandTotal,
      paidAmount: amountPaid,
      remainingAmount: remainingBalance,
      lines: validLines.map((line) => ({
        productId: line.productId,
        batchNumber: line.batchNumber || undefined,
        batchId: line.batchId || undefined,
        expiryDate: line.expiryDate ? new Date(line.expiryDate).toISOString() : null,
        unit: line.unit,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discount: line.discount,
        tax: (line.quantity * line.unitPrice - line.discount) * (line.taxRate / 100),
        lineTotal: (line.quantity * line.unitPrice - line.discount) * (1 + line.taxRate / 100),
      })),
    };

    const res = await createInvoiceAction(payload);
    setIsSubmitting(false);

    if (res.success) {
      setSnackbarMessage(
        mode === "purchase"
          ? "تم حفظ فاتورة المشتريات وتحديث المخزون بنجاح!"
          : "تمت عملية البيع وحفظ فاتورة المبيعات بنجاح!"
      );
      setSnackbarSeverity("success");
      handleReset();
    } else {
      setSnackbarMessage(res.error || "حدث خطأ أثناء حفظ الفاتورة");
      setSnackbarSeverity("error");
    }
  };

  // Mock handlers for Quick Actions
  const handleQuickAction = (actionName: string) => {
    setSnackbarMessage(`ميزة "${actionName}" تم محاكاتها بنجاح!`);
    setSnackbarSeverity("success");
  };

  return (
    <Stack spacing={2.5}>
      {/* 1. Header with Page Actions */}
      <Paper
        variant="outlined"
        sx={{
          p: 2.25,
          backgroundImage:
            "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 5%, transparent), color-mix(in srgb, var(--mui-palette-secondary-main) 3%, transparent))",
          backdropFilter: "blur(14px) saturate(126%)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", md: "center" } }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 850, letterSpacing: "-0.03em" }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.25} sx={{ alignSelf: { xs: "flex-end", md: "auto" } }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SaveRounded fontSize="small" />}
              onClick={() => handleQuickAction("حفظ كمسودة (Save Draft)")}
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : mode === "purchase" ? (
                  <ShoppingCartCheckoutRounded fontSize="small" />
                ) : (
                  <ReceiptLongRounded fontSize="small" />
                )
              }
              disabled={isSubmitting || !canCreate}
              onClick={handleSubmitInvoice}
            >
              {mode === "purchase" ? "Submit Invoice" : "Complete Sale"}
            </Button>
            <IconButton
              size="small"
              onClick={() => handleQuickAction("طباعة الفاتورة (Print)")}
              sx={{ border: 1, borderColor: "divider", borderRadius: 1.5, px: 1.25, py: 0.75 }}
            >
              <PrintRounded fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="button" sx={{ fontSize: "0.8125rem", fontWeight: 700 }}>
                {mode === "purchase" ? "Print" : "Print Receipt"}
              </Typography>
            </IconButton>
            {mode === "sales" && (
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                onClick={() => handleQuickAction("تعليق الفاتورة (Hold)")}
              >
                Hold
              </Button>
            )}
            <IconButton size="small" sx={{ border: 1, borderColor: "divider", borderRadius: 1.5 }}>
              <MoreVertRounded fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* 2. KPI Cards Row */}
      <Grid container spacing={2}>
        {/* Card 1: Invoice Total */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            variant="glass"
            sx={{
              minHeight: 110,
              transition: "transform 160ms ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    Invoice Total
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 850, mt: 0.5 }}>
                    {currency} {grandTotal.toLocaleString(locale, { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    incl. all taxes
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
                  <TrendingUpRounded />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Paid Amount */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            variant="glass"
            sx={{
              minHeight: 110,
              transition: "transform 160ms ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    Paid Amount
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 850, mt: 0.5 }}>
                    {currency} {amountPaid.toLocaleString(locale, { minimumFractionDigits: 2 })}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {amountPaid >= grandTotal && grandTotal > 0 ? (
                      <Chip label="Paid in full" size="small" color="success" sx={{ height: 20, fontSize: "0.68rem" }} />
                    ) : grandTotal > 0 ? (
                      <Chip
                        label={`${((amountPaid / grandTotal) * 100).toFixed(2)}% of total`}
                        size="small"
                        color="success"
                        sx={{ height: 20, fontSize: "0.68rem" }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No payments yet
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: "success.main", color: "success.contrastText" }}>
                  <SaveRounded />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Due Amount (Purchase) / Balance & Change (Sales) */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            variant="glass"
            sx={{
              minHeight: 110,
              transition: "transform 160ms ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    {mode === "purchase" ? "Due Amount" : "Balance / Change"}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 850, mt: 0.5 }}>
                    {currency}{" "}
                    {mode === "purchase"
                      ? remainingBalance.toLocaleString(locale, { minimumFractionDigits: 2 })
                      : Math.abs(amountPaid - grandTotal).toLocaleString(locale, { minimumFractionDigits: 2 })}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {mode === "purchase" ? (
                      <Chip
                        label={`${((remainingBalance / (grandTotal || 1)) * 100).toFixed(2)}% remaining`}
                        size="small"
                        color="warning"
                        sx={{ height: 20, fontSize: "0.68rem" }}
                      />
                    ) : amountPaid > grandTotal ? (
                      <Chip
                        label="Change to customer"
                        size="small"
                        color="secondary"
                        sx={{ height: 20, fontSize: "0.68rem" }}
                      />
                    ) : (
                      <Chip
                        label="Remaining due"
                        size="small"
                        color="warning"
                        sx={{ height: 20, fontSize: "0.68rem" }}
                      />
                    )}
                  </Box>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: mode === "purchase" ? "warning.main" : "secondary.main",
                    color: "white",
                  }}
                >
                  <SaveRounded />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 4: Total Items */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            variant="glass"
            sx={{
              minHeight: 110,
              transition: "transform 160ms ease",
              "&:hover": { transform: "translateY(-2px)" },
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    {mode === "purchase" ? "Total Items" : "Items Count"}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 850, mt: 0.5 }}>
                    {lineCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    Line items
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "info.main", color: "info.contrastText" }}>
                  <ReceiptLongRounded />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Details Form & Columns */}
      <Grid container spacing={2.5}>
        {/* Left Column: Client / Supplier Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2.25 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                {mode === "purchase" ? "Supplier Information" : "Customer Information"}
              </Typography>

              <Stack spacing={2}>
                <Autocomplete
                  options={parties}
                  getOptionLabel={(option) => `${option.code} - ${option.name}`}
                  value={parties.find((p) => p.id === selectedPartyId) || null}
                  onChange={(_, val) => setSelectedPartyId(val ? val.id : "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={mode === "purchase" ? "Supplier Name" : "Customer Name"}
                      variant="outlined"
                      size="small"
                    />
                  )}
                />

                {mode === "purchase" ? (
                  // Purchase Supplier Stats
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Contact Person"
                        value={selectedPartyId ? "Mr. Ahmed Salah" : ""}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={selectedPartyId ? "+20 100 555 1234" : ""}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={selectedPartyId ? "orders@globalpharma.com" : ""}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Invoice Reference"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        size="small"
                        placeholder="e.g. INV-GPD-2024-0567"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        label="Payment Terms"
                        value={paymentMethod === "Cash" ? "Cash" : "Net 30 Days"}
                        onChange={(e) =>
                          setPaymentMethod(e.target.value === "Cash" ? "Cash" : "Bank Transfer")
                        }
                        size="small"
                      >
                        <MenuItem value="Net 30 Days">Net 30 Days</MenuItem>
                        <MenuItem value="Net 15 Days">Net 15 Days</MenuItem>
                        <MenuItem value="Cash">Cash on Delivery</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                ) : (
                  // Sales Customer Stats
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={selectedPartyId ? "+20 102 345 6789" : ""}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={selectedPartyId ? "sara.ali@email.com" : ""}
                        disabled
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        label="Customer Type"
                        value="Retail"
                        disabled
                        size="small"
                      >
                        <MenuItem value="Retail">Retail</MenuItem>
                        <MenuItem value="Wholesale">Wholesale</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <TextField
                          fullWidth
                          label="Loyalty Points"
                          value={selectedPartyId ? "820 pts" : ""}
                          disabled
                          size="small"
                        />
                        {selectedPartyId && (
                          <Chip
                            icon={<StarRounded fontSize="small" />}
                            label="Loyalty Member"
                            color="success"
                            size="small"
                          />
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Invoice Details Form */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2.25 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                Invoice Details
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label={mode === "purchase" ? "Purchase Date" : "Sale Date"}
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type={mode === "purchase" ? "date" : "text"}
                    label={mode === "purchase" ? "Due Date" : "Cashier / User"}
                    value={mode === "purchase" ? dueDate : "Pharmacist Admin"}
                    onChange={(e) => mode === "purchase" && setDueDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    disabled={mode === "sales"}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Warehouse / Store"
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="Main Warehouse">Main Warehouse</MenuItem>
                    <MenuItem value="Secondary Store">Secondary Store</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={mode === "purchase" ? "Pending" : "Completed"}
                    disabled
                    size="small"
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Draft">Draft</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Payment Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    size="small"
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    <MenuItem value="Card">Card</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  {mode === "purchase" ? (
                    <TextField
                      select
                      fullWidth
                      label="Currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      size="small"
                    >
                      <MenuItem value="EGP">EGP</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                    </TextField>
                  ) : (
                    <TextField
                      select
                      fullWidth
                      label="Sales Channel"
                      value={salesChannel}
                      onChange={(e) => setSalesChannel(e.target.value)}
                      size="small"
                    >
                      <MenuItem value="Walk-in">Walk-in</MenuItem>
                      <MenuItem value="Delivery">Delivery</MenuItem>
                      <MenuItem value="Online">Online</MenuItem>
                    </TextField>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 4. Barcode / Search Box for Sales Mode */}
      {mode === "sales" && (
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              fullWidth
              placeholder="Scan barcode or search product by name..."
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCodeScannerRounded fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  // Simulate scanning first product
                  const prod = products[0];
                  if (prod) {
                    const emptyLineIdx = lines.findIndex((l) => !l.productId);
                    if (emptyLineIdx !== -1) {
                      updateLineItem(emptyLineIdx, "productId", prod.id);
                    } else {
                      setLines([
                        ...lines,
                        {
                          productId: prod.id,
                          unit: prod.unit || "box",
                          quantity: 1,
                          unitPrice: 25.0,
                          discount: 0,
                          taxRate: 14,
                        },
                      ]);
                    }
                    setSnackbarMessage(`تمت محاكاة مسح الباركود لمنتج: ${prod.name}`);
                    setSnackbarSeverity("success");
                  }
                }
              }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickAction("إضافة سريعة (Quick Add)")}
              sx={{ whiteSpace: "nowrap" }}
            >
              Quick Add
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickAction("المنتجات الأخيرة (Recent Items)")}
              sx={{ whiteSpace: "nowrap" }}
            >
              Recent Items
            </Button>
          </Stack>
        </Paper>
      )}

      {/* 5. Items Grid / Table Card */}
      <Card variant="outlined">
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Invoice Items
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddRounded fontSize="small" />}
              onClick={addLineItem}
            >
              Add Item
            </Button>
            {mode === "purchase" && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadRounded fontSize="small" />}
                  onClick={() => handleQuickAction("استيراد عناصر (Import Items)")}
                >
                  Import Items
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<QrCodeScannerRounded fontSize="small" />}
                  onClick={() => handleQuickAction("مسح الباركود (Scan Barcode)")}
                >
                  Scan Barcode
                </Button>
              </>
            )}
          </Stack>
        </Box>

        <TableContainer component={Box} sx={{ maxHeight: 400, overflowY: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width={50}>#</TableCell>
                <TableCell sx={{ minWidth: 220 }}>Product</TableCell>
                {mode === "purchase" ? (
                  <>
                    <TableCell sx={{ minWidth: 140 }}>Batch No.</TableCell>
                    <TableCell sx={{ minWidth: 140 }}>Expiry Date</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell sx={{ minWidth: 140 }}>Barcode</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>Available Stock</TableCell>
                  </>
                )}
                <TableCell width={100}>Qty</TableCell>
                <TableCell width={120}>{mode === "purchase" ? "Unit Cost" : "Unit Price"}</TableCell>
                <TableCell width={110}>Discount</TableCell>
                <TableCell width={100}>Tax (14%)</TableCell>
                <TableCell width={130} align="right">
                  Line Total
                </TableCell>
                <TableCell width={60} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calculatedLines.map((line, index) => {
                const availableBatches = line.productId ? batchesByProduct[line.productId] || [] : [];
                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Autocomplete
                        options={products}
                        getOptionLabel={(option) => `${option.code} - ${option.name}`}
                        value={products.find((p) => p.id === line.productId) || null}
                        onChange={(_, val) => updateLineItem(index, "productId", val ? val.id : "")}
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" size="small" fullWidth />
                        )}
                        size="small"
                      />
                    </TableCell>

                    {/* Conditional Columns for Purchase vs Sales */}
                    {mode === "purchase" ? (
                      <>
                        <TableCell>
                          <TextField
                            value={line.batchNumber || ""}
                            onChange={(e) => updateLineItem(index, "batchNumber", e.target.value)}
                            size="small"
                            fullWidth
                            placeholder="e.g. B-PAN-01"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            value={line.expiryDate || ""}
                            onChange={(e) => updateLineItem(index, "expiryDate", e.target.value)}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <Autocomplete
                            options={availableBatches}
                            getOptionLabel={(option) =>
                              `${option.batchNumber} (Exp: ${
                                option.expiryDate
                                  ? new Date(option.expiryDate).toLocaleDateString(locale)
                                  : "N/A"
                              })`
                            }
                            value={availableBatches.find((b) => b.id === line.batchId) || null}
                            onChange={(_, val) => updateLineItem(index, "batchId", val ? val.id : "")}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="outlined"
                                size="small"
                                placeholder="Select Batch"
                              />
                            )}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {line.batchId
                              ? availableBatches.find((b) => b.id === line.batchId)?.currentQuantity || "0"
                              : "-"}
                          </Typography>
                        </TableCell>
                      </>
                    )}

                    <TableCell>
                      <TextField
                        type="number"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLineItem(index, "quantity", Math.max(0, parseFloat(e.target.value) || 0))
                        }
                        size="small"
                        fullWidth
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={line.unitPrice}
                        onChange={(e) =>
                          updateLineItem(index, "unitPrice", Math.max(0, parseFloat(e.target.value) || 0))
                        }
                        size="small"
                        fullWidth
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={line.discount}
                        onChange={(e) =>
                          updateLineItem(index, "discount", Math.max(0, parseFloat(e.target.value) || 0))
                        }
                        size="small"
                        fullWidth
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {currency} {line.tax.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {currency} {line.total.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => removeLineItem(index)}>
                        <DeleteOutlineRounded fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 6. Footer Sections & Summaries */}
      <Grid container spacing={2.5}>
        {/* Left Footer Panels */}
        <Grid size={{ xs: 12, md: mode === "purchase" ? 7 : 4 }}>
          {mode === "purchase" ? (
            // Purchase Footer: Notes & Attachments
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2.25, display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Notes & Attachments
                </Typography>
                <TextField
                  multiline
                  minRows={3}
                  label="Internal Notes / Remarks"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  fullWidth
                  placeholder="e.g. Delivered on time. All items received in good condition."
                />

                {/* Upload box */}
                <Box
                  sx={{
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2.5,
                    p: 2.5,
                    textAlign: "center",
                    bgcolor: "action.hover",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      cursor: "pointer",
                    }}
                  />
                  <CloudUploadRounded color="primary" sx={{ fontSize: 36, mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Drop files here or click to upload
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                    PDF, JPG, PNG up to 10MB
                  </Typography>
                </Box>

                {/* Attachments List */}
                {attachments.map((file, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{ p: 1.25, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600, maxWidth: "70%" }}>
                      {file.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        {file.size}
                      </Typography>
                      <IconButton size="small" color="error" onClick={() => removeAttachment(idx)}>
                        <DeleteOutlineRounded fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
              </CardContent>
            </Card>
          ) : (
            // Sales Footer: Notes & Recent Customers
            <Stack spacing={2} sx={{ height: "100%" }}>
              <Card variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Notes
                  </Typography>
                  <TextField
                    multiline
                    minRows={3}
                    label="Notes & Remarks"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                    placeholder="Add notes about this sale..."
                    size="small"
                  />
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ flexGrow: 1 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Recent Customers
                  </Typography>
                  <Stack spacing={1}>
                    {[
                      { name: "Sara Ali Mohammed", phone: "+20 102 345 6789", points: 820 },
                      { name: "Ahmed Mostafa", phone: "+20 101 234 5678", points: 510 },
                      { name: "Omnia Hassan", phone: "+20 100 876 5432", points: 300 },
                    ].map((item, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 1,
                          bgcolor: "action.hover",
                          borderRadius: 2,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          const customer = parties.find((p) => p.nameEn?.includes(item.name.split(" ")[0]));
                          if (customer) {
                            setSelectedPartyId(customer.id);
                          } else {
                            // Select customer 2 as fallback
                            const yasmin = parties.find((p) => p.code === "PAR-000002");
                            if (yasmin) setSelectedPartyId(yasmin.id);
                          }
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {idx + 1}. {item.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.phone}
                          </Typography>
                        </Box>
                        <Chip label={`${item.points} pts`} size="small" variant="outlined" sx={{ height: 20 }} />
                      </Box>
                    ))}
                    <Button variant="text" size="small" onClick={() => handleQuickAction("عرض كافة العملاء")}>
                      View All Customers
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          )}
        </Grid>

        {/* Middle Footer Panel (Sales Mode only) */}
        {mode === "sales" && (
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={1.5}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleQuickAction("تطبيق الخصم (Apply Discount)")}
                  >
                    Apply Discount
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleQuickAction("استبدال النقاط (Redeem Points)")}
                  >
                    Redeem Points
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleQuickAction("طباعة عرض السعر (Print Proforma)")}
                  >
                    Print Proforma Invoice
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Right Footer Panel: Financial Calculations Summary */}
        <Grid size={{ xs: 12, md: mode === "purchase" ? 5 : 4 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ p: 2.25, display: "flex", flexDirection: "column", gap: 1.75 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {mode === "purchase" ? "Invoice Summary" : "Sale Summary"}
              </Typography>

              <Stack spacing={1.25}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal (Excl. Tax)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {currency} {subtotalSum.toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Discount
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "error.main" }}>
                    - {currency} {discountSum.toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    VAT (14%)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {currency} {taxSum.toFixed(2)}
                  </Typography>
                </Box>

                {mode === "purchase" && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Shipping / Other Costs
                    </Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={shippingCosts}
                      onChange={(e) => setShippingCosts(Math.max(0, parseFloat(e.target.value) || 0))}
                      sx={{ width: 100 }}
                      slotProps={{ htmlInput: { style: { textAlign: "right" } } }}
                    />
                  </Box>
                )}
              </Stack>

              <Divider />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 850 }}>
                  Grand Total
                </Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 900 }}>
                  {currency} {grandTotal.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  {mode === "purchase" ? "Paid Amount" : "Amount Received"}
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Math.max(0, parseFloat(e.target.value) || 0))}
                  sx={{ width: 120 }}
                  slotProps={{ htmlInput: { style: { textAlign: "right", color: "green", fontWeight: 700 } } }}
                />
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor:
                    mode === "purchase"
                      ? remainingBalance > 0
                        ? "color-mix(in srgb, var(--mui-palette-error-main) 10%, var(--mui-palette-background-paper))"
                        : "color-mix(in srgb, var(--mui-palette-success-main) 10%, var(--mui-palette-background-paper))"
                      : amountPaid >= grandTotal
                      ? "color-mix(in srgb, var(--mui-palette-success-main) 10%, var(--mui-palette-background-paper))"
                      : "color-mix(in srgb, var(--mui-palette-warning-main) 10%, var(--mui-palette-background-paper))",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {mode === "purchase"
                    ? "Remaining Balance"
                    : amountPaid >= grandTotal
                    ? "Change Due"
                    : "Remaining Due"}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 900,
                    color:
                      mode === "purchase"
                        ? remainingBalance > 0
                          ? "error.main"
                          : "success.main"
                        : amountPaid >= grandTotal
                        ? "success.main"
                        : "warning.main",
                  }}
                >
                  {currency} {Math.abs(amountPaid - grandTotal).toFixed(2)}
                </Typography>
              </Paper>

              {/* Profit metrics for Sales Mode */}
              {mode === "sales" && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: "color-mix(in srgb, var(--mui-palette-success-main) 8%, var(--mui-palette-background-paper))",
                    borderColor: "success.main",
                    borderStyle: "dashed",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <TrendingUpRounded color="success" />
                  <Box>
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 800, display: "block" }}>
                      Estimated Profit
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      EGP {estimatedProfit.value.toFixed(2)} ({estimatedProfit.percentage.toFixed(2)}%)
                    </Typography>
                  </Box>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Status Snackbar */}
      <Snackbar
        open={Boolean(snackbarMessage)}
        onClose={() => setSnackbarMessage(null)}
        autoHideDuration={4000}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarMessage(null)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
