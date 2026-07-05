"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  CategoryOutlined,
  Inventory2Outlined,
  SearchOutlined,
} from "@mui/icons-material";
import { ProductType } from "@prisma/client";
import { productSchema } from "../schemas/product.schema";
import type { ProductFormValues } from "../types";
import { useTranslations } from "next-intl";

export function ProductFormMui({
  defaultValues,
  actionLabel,
  onSubmit,
  error,
}: {
  defaultValues: ProductFormValues;
  actionLabel: string;
  onSubmit: (values: ProductFormValues) => void;
  error?: string | null;
}) {
  const t = useTranslations("products");
  const common = useTranslations("common");
  const actions = useTranslations("actions");
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const name = useWatch({ control, name: "name" });
  const searchName = useWatch({ control, name: "searchName" });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (name && !searchName) {
      setValue("searchName", name, { shouldDirty: true, shouldValidate: true });
    }
  }, [name, searchName, setValue]);

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
          <FormPanel
            title={t("identitySection")}
            description={t("identitySectionHint")}
            icon={<Inventory2Outlined fontSize="small" />}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "minmax(180px, 0.72fr) minmax(220px, 1.28fr)",
                },
                gap: 1.5,
              }}
            >
              <TextField
                label={common("code")}
                helperText={errors.code?.message ?? t("codeHint")}
                {...register("code")}
                error={Boolean(errors.code)}
                required
              />
              <TextField
                label={common("name")}
                helperText={errors.name?.message}
                {...register("name")}
                error={Boolean(errors.name)}
                required
                autoFocus
              />
            </Box>
          </FormPanel>

          <FormPanel
            title={t("classificationSection")}
            description={t("classificationSectionHint")}
            icon={<CategoryOutlined fontSize="small" />}
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
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label={t("type")}
                    error={Boolean(errors.type)}
                    helperText={errors.type?.message ?? t("typeHint")}
                    required
                  >
                    <MenuItem value={ProductType.MEDICINE}>
                      {t("medicine")}
                    </MenuItem>
                    <MenuItem value={ProductType.FARM_SUPPLY}>
                      {t("farmSupply")}
                    </MenuItem>
                  </TextField>
                )}
              />
              <TextField
                label={t("unit")}
                helperText={errors.unit?.message ?? t("unitHint")}
                {...register("unit")}
                error={Boolean(errors.unit)}
                required
                slotProps={{ htmlInput: { list: "common-product-units" } }}
              />
              <datalist id="common-product-units">
                <option value="Box" />
                <option value="Bottle" />
                <option value="Strip" />
                <option value="Piece" />
                <option value="Pack" />
              </datalist>
            </Box>
          </FormPanel>
        </Stack>

        <Stack spacing={2}>
          <FormPanel
            title={t("lookupSection")}
            description={t("lookupSectionHint")}
            icon={<SearchOutlined fontSize="small" />}
          >
            <TextField
              fullWidth
              label={t("searchName")}
              helperText={errors.searchName?.message ?? t("searchHint")}
              {...register("searchName")}
              error={Boolean(errors.searchName)}
            />
          </FormPanel>

          <FormPanel
            title={t("availabilitySection")}
            description={t("availabilitySectionHint")}
            icon={<Inventory2Outlined fontSize="small" />}
          >
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Box
                  sx={(theme) => ({
                    border: 1,
                    borderColor: "divider",
                    bgcolor: field.value
                      ? "background.default"
                      : "action.hover",
                    borderRadius: 2.5,
                    px: 1.5,
                    py: 1.15,
                    transition: theme.transitions.create([
                      "background-color",
                      "border-color",
                    ]),
                  })}
                >
                  <FormControlLabel
                    sx={{
                      m: 0,
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                    labelPlacement="start"
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(_, checked) => field.onChange(checked)}
                      />
                    }
                    label={
                      <Stack spacing={0.25}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {common("active")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("activeHint")}
                        </Typography>
                      </Stack>
                    }
                  />
                </Box>
              )}
            />
          </FormPanel>

          <Card variant="outlined" sx={{ boxShadow: "none" }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Stack spacing={1}>
                <Chip
                  size="small"
                  label={t("dataRuleLabel")}
                  color="info"
                  variant="outlined"
                  sx={{ alignSelf: "flex-start" }}
                />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {t("dataRuleTitle")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("dataRuleHint")}
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
              {t("saveProductHint")}
            </Typography>
            <Stack direction="row" spacing={1.25}>
              <Button href="/products" variant="text">
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

function FormPanel({
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
    <Card variant="outlined" sx={{ boxShadow: "none" }}>
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
