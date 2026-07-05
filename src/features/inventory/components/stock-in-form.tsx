"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddRounded,
  CalendarMonthOutlined,
  Inventory2Outlined,
  LocalShippingOutlined,
  NotesOutlined,
  PaidOutlined,
  SaveRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PartyType } from "@prisma/client";
import { useTranslations } from "next-intl";
import { stockInSchema } from "../schemas/stock-in.schema";
import type { StockInFormValues } from "../types";
import { MovementSummary } from "./movement-summary";
import type { StockInFormProps } from "./stock-ui.types";

export function StockInForm({
  products,
  batchesByProduct,
  parties,
  defaultValues,
  onSubmit,
  pending,
}: StockInFormProps) {
  const t = useTranslations("stock");
  const actions = useTranslations("actions");

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StockInFormValues>({
    resolver: zodResolver(stockInSchema),
    defaultValues,
  });

  useEffect(() => reset(defaultValues), [defaultValues, reset]);

  const productId = useWatch({ control, name: "productId" });
  const batchId = useWatch({ control, name: "batchId" });
  const useNewBatch = useWatch({ control, name: "useNewBatch" });
  const quantity = useWatch({ control, name: "quantity" });
  const purchasePrice = useWatch({ control, name: "purchasePrice" });
  const supplierId = useWatch({ control, name: "partyId" });

  const batches = batchesByProduct[productId] ?? [];
  const suppliers = parties.filter(
    (party) =>
      party.isActive &&
      (party.type === PartyType.SUPPLIER || party.type === PartyType.BOTH),
  );
  const selectedProduct = products.find((product) => product.id === productId);
  const selectedBatch = batches.find((batch) => batch.id === batchId);
  const selectedSupplier = suppliers.find(
    (supplier) => supplier.id === supplierId,
  );

  return (
    <Stack
      direction={{ xs: "column", xl: "row" }}
      spacing={2.5}
      sx={{ alignItems: "flex-start" }}
    >
      <Paper
        component="form"
        variant="outlined"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          flex: 1,
          width: "100%",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 2.5 },
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundImage:
              "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 8%, transparent), transparent 58%)",
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                display: "grid",
                placeItems: "center",
                borderRadius: 1.5,
                bgcolor: "action.selected",
                color: "primary.main",
              }}
            >
              <AddRounded fontSize="small" />
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {t("stockInTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("stockInDescription")}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack spacing={2.25} sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField
              select
              label={t("product")}
              value={productId}
              error={Boolean(errors.productId)}
              helperText={errors.productId?.message}
              {...register("productId")}
              onChange={(event) => {
                setValue("productId", event.target.value, {
                  shouldValidate: true,
                });
                setValue("batchId", "");
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory2Outlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.code} - {product.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label={t("supplier")}
              defaultValue=""
              {...register("partyId")}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalShippingOutlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="">{t("none")}</MenuItem>
              {suppliers.map((party) => (
                <MenuItem key={party.id} value={party.id}>
                  {party.code} - {party.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Checkbox
                  {...register("useNewBatch")}
                  defaultChecked={Boolean(defaultValues.useNewBatch)}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {t("createNewBatch")}
                </Typography>
              }
            />
          </Paper>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField
              select
              disabled={Boolean(useNewBatch)}
              label={t("batch")}
              value={batchId ?? ""}
              {...register("batchId")}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory2Outlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="">{t("selectBatch")}</MenuItem>
              {batches.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  {batch.batchNumber} · {batch.currentQuantity ?? "0"}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              disabled={!useNewBatch}
              label={t("batchNumber")}
              {...register("batchNumber")}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory2Outlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField
              type="number"
              label={t("quantity")}
              slotProps={{
                htmlInput: { step: "0.001", min: "0" },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory2Outlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              error={Boolean(errors.quantity)}
              helperText={errors.quantity?.message}
              {...register("quantity")}
            />

            <TextField
              type="number"
              label={t("purchasePrice")}
              slotProps={{
                htmlInput: { step: "0.01", min: "0" },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaidOutlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              error={Boolean(errors.purchasePrice)}
              helperText={errors.purchasePrice?.message}
              {...register("purchasePrice")}
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField
              type="date"
              label={t("expiryDate")}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthOutlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              {...register("expiryDate")}
            />

            <TextField
              type="datetime-local"
              label={t("movementDate")}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthOutlined fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              error={Boolean(errors.movementAt)}
              helperText={errors.movementAt?.message}
              {...register("movementAt")}
            />
          </Stack>

          <TextField label={t("reference")} {...register("reference")} />

          <TextField
            multiline
            minRows={3}
            label={t("notes")}
            {...register("notes")}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment
                    position="start"
                    sx={{ alignSelf: "flex-start", mt: 1.25 }}
                  >
                    <NotesOutlined fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControlLabel
            sx={{ m: 0, alignSelf: "flex-start" }}
            control={<Checkbox {...register("confirmSave")} size="small" />}
            label={
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {t("confirmStockIn")}
              </Typography>
            }
          />

          {errors.confirmSave ? (
            <Alert severity="error">{errors.confirmSave.message}</Alert>
          ) : null}

          <Divider />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={pending}
            startIcon={<SaveRounded fontSize="small" />}
            sx={{
              minHeight: 46,
              alignSelf: { xs: "stretch", sm: "flex-start" },
            }}
          >
            {pending ? actions("saving") : t("saveStockIn")}
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          position: { xl: "sticky" },
          top: 88,
          width: { xs: "100%", xl: 360 },
          flexShrink: 0,
        }}
      >
        <MovementSummary
          quantity={String(quantity ?? "")}
          purchasePrice={String(purchasePrice ?? "")}
          productLabel={
            selectedProduct
              ? `${selectedProduct.code} - ${selectedProduct.name}`
              : "-"
          }
          batchLabel={
            selectedBatch?.batchNumber ?? (useNewBatch ? t("newBatch") : "-")
          }
          supplierLabel={
            selectedSupplier
              ? `${selectedSupplier.code} - ${selectedSupplier.name}`
              : "-"
          }
          batchQuantity={selectedBatch?.currentQuantity}
        />
      </Box>
    </Stack>
  );
}
