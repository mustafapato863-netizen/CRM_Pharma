"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarMonthOutlined,
  Inventory2Outlined,
  NotesOutlined,
  RemoveRounded,
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
import { useTranslations } from "next-intl";
import { stockOutSchema } from "../schemas/stock-out.schema";
import type { StockOutFormValues } from "../types/stock-out";
import { StockOutSummary } from "./stock-out-summary";
import type { StockOutFormProps } from "./stock-ui.types";

export function StockOutForm({
  products,
  batchesByProduct,
  defaultValues,
  onSubmit,
  pending,
}: StockOutFormProps) {
  const t = useTranslations("stock");
  const actions = useTranslations("actions");

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StockOutFormValues>({
    resolver: zodResolver(stockOutSchema),
    defaultValues,
  });

  useEffect(() => reset(defaultValues), [defaultValues, reset]);

  const productId = useWatch({ control, name: "productId" });
  const batchId = useWatch({ control, name: "batchId" });
  const quantity = useWatch({ control, name: "quantity" });
  const batches = batchesByProduct[productId] ?? [];
  const selectedProduct = products.find((product) => product.id === productId);
  const selectedBatch = batches.find((batch) => batch.id === batchId);
  const remaining = selectedBatch
    ? Number(selectedBatch.currentQuantity) - Number(quantity || 0)
    : null;

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
              "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-error-main) 8%, transparent), transparent 58%)",
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
                color: "error.main",
              }}
            >
              <RemoveRounded fontSize="small" />
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {t("stockOutTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("stockOutDescription")}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack spacing={2.25} sx={{ p: { xs: 2, md: 2.5 } }}>
          <TextField
            select
            label={t("product")}
            value={productId}
            error={Boolean(errors.productId)}
            helperText={errors.productId?.message}
            {...register("productId")}
            onChange={(event) => {
              const nextProductId = event.target.value;
              const firstBatch = batchesByProduct[nextProductId]?.[0];

              setValue("productId", nextProductId, {
                shouldValidate: true,
              });
              setValue("batchId", firstBatch?.id ?? "", {
                shouldValidate: true,
              });
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
            label={t("batch")}
            value={batchId ?? ""}
            error={Boolean(errors.batchId)}
            helperText={errors.batchId?.message}
            {...register("batchId")}
            onChange={(event) =>
              setValue("batchId", event.target.value, {
                shouldValidate: true,
              })
            }
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
                {batch.batchNumber} · {batch.currentQuantity}
              </MenuItem>
            ))}
          </TextField>

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
                {t("confirmStockOut")}
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
            color="error"
            size="large"
            disabled={pending}
            startIcon={<SaveRounded fontSize="small" />}
            sx={{
              minHeight: 46,
              alignSelf: { xs: "stretch", sm: "flex-start" },
            }}
          >
            {pending ? actions("saving") : t("saveStockOut")}
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
        <StockOutSummary
          requestedQuantity={String(quantity ?? "")}
          currentQuantity={selectedBatch?.currentQuantity}
          remainingQuantity={remaining === null ? "-" : remaining.toFixed(3)}
          productLabel={
            selectedProduct
              ? `${selectedProduct.code} - ${selectedProduct.name}`
              : "-"
          }
          batchLabel={selectedBatch?.batchNumber}
          expiryLabel={selectedBatch?.expiryDate?.slice(0, 10)}
        />
      </Box>
    </Stack>
  );
}
