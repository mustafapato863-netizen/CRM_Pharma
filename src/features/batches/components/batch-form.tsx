"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CalendarMonthOutlined,
  Inventory2Outlined,
  LocalOfferOutlined,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { batchSchema } from "../schemas/batch.schema";
import type { BatchFormValues } from "../types";

export function BatchForm({
  defaultValues,
  products,
  actionLabel,
  onSubmit,
  error,
}: {
  defaultValues: BatchFormValues;
  products: Array<{ id: string; code: string; name: string }>;
  actionLabel: string;
  onSubmit: (values: BatchFormValues) => void;
  error?: string | null;
}) {
  const t = useTranslations("batches");
  const actions = useTranslations("actions");
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <Stack component="form" spacing={2.25} onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.35fr) minmax(300px, 0.65fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Stack spacing={2}>
          <BatchFormPanel
            title={t("batchIdentity")}
            description={t("batchIdentityHint")}
            icon={<LocalOfferOutlined fontSize="small" />}
          >
            <Stack spacing={1.5}>
              <Controller
                control={control}
                name="productId"
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label={t("product")}
                    error={Boolean(errors.productId)}
                    helperText={
                      errors.productId?.message ?? t("productSelectHint")
                    }
                    required
                  >
                    <MenuItem value="">{t("selectProduct")}</MenuItem>
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.code} — {product.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <TextField
                fullWidth
                label={t("batchNumber")}
                placeholder={t("batchNumberPlaceholder")}
                helperText={errors.batchNumber?.message ?? t("batchNumberHint")}
                {...register("batchNumber")}
                error={Boolean(errors.batchNumber)}
                required
              />
            </Stack>
          </BatchFormPanel>

          <BatchFormPanel
            title={t("stockOpening")}
            description={t("stockOpeningHint")}
            icon={<Inventory2Outlined fontSize="small" />}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              <TextField
                type="number"
                label={t("openingQty")}
                helperText={errors.openingQty?.message ?? t("openingQtyHint")}
                slotProps={{ htmlInput: { step: "0.001", min: 0 } }}
                {...register("openingQty")}
                error={Boolean(errors.openingQty)}
                required
              />
              <TextField
                type="number"
                label={t("purchaseCost")}
                helperText={
                  errors.purchaseCost?.message ?? t("purchaseCostHint")
                }
                slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                {...register("purchaseCost")}
                error={Boolean(errors.purchaseCost)}
              />
            </Box>
          </BatchFormPanel>
        </Stack>

        <Stack spacing={2}>
          <BatchFormPanel
            title={t("expirySection")}
            description={t("expirySectionHint")}
            icon={<CalendarMonthOutlined fontSize="small" />}
          >
            <TextField
              fullWidth
              type="date"
              label={t("expiry")}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText={errors.expiryDate?.message ?? t("expiryHint")}
              {...register("expiryDate")}
              error={Boolean(errors.expiryDate)}
            />
          </BatchFormPanel>

          <Card
            variant="outlined"
            sx={{ borderRadius: 3.25, boxShadow: "none" }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Stack spacing={1}>
                <Chip
                  size="small"
                  label={t("inventoryRuleLabel")}
                  color="info"
                  variant="outlined"
                  sx={{ alignSelf: "flex-start" }}
                />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {t("inventoryRuleTitle")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("inventoryRuleHint")}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {error ? (
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      ) : null}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3.25,
          position: "sticky",
          bottom: 16,
          zIndex: 1,
          boxShadow: 4,
        }}
      >
        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={1.25}
            sx={{
              alignItems: { sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t("saveBatchHint")}
            </Typography>
            <Stack direction="row" spacing={1.25}>
              <Button component={Link} href="/batches" variant="text">
                {actions("cancel")}
              </Button>
              <Button type="submit" variant="contained">
                {actionLabel}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function BatchFormPanel({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3.25, boxShadow: "none" }}>
      <CardContent
        sx={{
          p: { xs: 1.75, sm: 2.25 },
          "&:last-child": { pb: { xs: 1.75, sm: 2.25 } },
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1.25}
            sx={{ alignItems: "flex-start" }}
          >
            <Box
              sx={(theme) => ({
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: theme.palette.action.selected,
                color: "primary.main",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              })}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25 }}
              >
                {description}
              </Typography>
            </Box>
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}
