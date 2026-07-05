"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CalendarMonthOutlined,
  EditOutlined,
  Inventory2Outlined,
  OpenInNew,
  VisibilityOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { useLocale, useTranslations } from "next-intl";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import type { BatchRow } from "../types";
import { BatchDeleteButton } from "./batch-delete-button";
import { AppDataGrid } from "@/shared/ui/app-data-grid";
import { AppDrawer } from "@/shared/ui/app-drawer";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";
import { MetricCard } from "@/shared/ui/metric-card";
import { SearchField } from "@/shared/ui/search-field";
import { StatusChip } from "@/shared/ui/status-chip";

const DAYS_30 = 30 * 24 * 60 * 60 * 1000;
const DAYS_90 = 90 * 24 * 60 * 60 * 1000;

type BatchStatusFilter = "all" | "Active" | "Expired" | "Empty";
type ExpiryFilter = "all" | "expired" | "next30" | "next90" | "none";

export function BatchesTable({
  data,
  canEdit,
  canDelete,
  initialProductId,
}: {
  data: BatchRow[];
  canEdit: boolean;
  canDelete: boolean;
  initialProductId?: string;
}) {
  const t = useTranslations("batches");
  const actions = useTranslations("actions");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState(
    initialProductId && data.some((row) => row.productId === initialProductId)
      ? initialProductId
      : "all",
  );
  const [statusFilter, setStatusFilter] = useState<BatchStatusFilter>("all");
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>("all");
  const [selected, setSelected] = useState<BatchRow | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const products = useMemo(
    () =>
      Array.from(
        new Map(data.map((row) => [row.product.id, row.product])).values(),
      ).sort((a, b) => a.name.localeCompare(b.name)),
    [data],
  );

  useEffect(() => {
    if (
      initialProductId &&
      data.some((row) => row.productId === initialProductId)
    )
      setProductFilter(initialProductId);
  }, [data, initialProductId]);

  useEffect(() => {
    setPaginationModel((current) => ({ ...current, page: 0 }));
  }, [expiryFilter, productFilter, search, statusFilter]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = Date.now();

    return data.filter((row) => {
      const matchesProduct =
        productFilter === "all" || row.product.id === productFilter;
      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;
      const expiryTime = row.expiryDate
        ? new Date(row.expiryDate).getTime()
        : null;
      const matchesExpiry =
        expiryFilter === "all" ||
        (expiryFilter === "none" && !expiryTime) ||
        (expiryFilter === "expired" &&
          Boolean(expiryTime && expiryTime < now)) ||
        (expiryFilter === "next30" &&
          Boolean(
            expiryTime && expiryTime >= now && expiryTime <= now + DAYS_30,
          )) ||
        (expiryFilter === "next90" &&
          Boolean(
            expiryTime && expiryTime >= now && expiryTime <= now + DAYS_90,
          ));
      const matchesQuery =
        !query ||
        row.batchNumber.toLowerCase().includes(query) ||
        row.product.code.toLowerCase().includes(query) ||
        row.product.name.toLowerCase().includes(query) ||
        Boolean(row.expiryDate?.toLowerCase().includes(query));

      return matchesProduct && matchesStatus && matchesExpiry && matchesQuery;
    });
  }, [data, expiryFilter, productFilter, search, statusFilter]);

  const metrics = useMemo(() => {
    const now = Date.now();
    const active = data.filter((row) => row.status === "Active").length;
    const empty = data.filter((row) => row.status === "Empty").length;
    const expiringSoon = data.filter((row) => {
      if (!row.expiryDate || row.status === "Expired") return false;
      const expiry = new Date(row.expiryDate).getTime();
      return expiry >= now && expiry <= now + DAYS_90;
    }).length;
    return { active, empty, expiringSoon };
  }, [data]);

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "batchNumber",
        headerName: t("batchNumber"),
        minWidth: 150,
        flex: 0.8,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {row.batchNumber}
          </Typography>
        ),
      },
      {
        field: "product",
        headerName: t("product"),
        minWidth: 230,
        flex: 1.35,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack spacing={0.2} sx={{ minWidth: 0, py: 0.75 }}>
            <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
              {row.product.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.product.code}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "expiryDate",
        headerName: t("expiry"),
        minWidth: 152,
        renderCell: ({ row }) => (
          <ExpiryCell value={row.expiryDate} locale={locale} />
        ),
      },
      {
        field: "purchaseCost",
        headerName: t("purchaseCost"),
        minWidth: 132,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {row.purchaseCost ?? "—"}
          </Typography>
        ),
      },
      {
        field: "openingQty",
        headerName: t("openingQty"),
        minWidth: 128,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {row.openingQty}
          </Typography>
        ),
      },
      {
        field: "currentQuantity",
        headerName: t("availableQty"),
        minWidth: 145,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {row.currentQuantity}
          </Typography>
        ),
      },
      {
        field: "status",
        headerName: t("status"),
        minWidth: 120,
        renderCell: ({ row }) => (
          <StatusChip
            label={t(`status${row.status}`)}
            tone={
              row.status === "Active"
                ? "success"
                : row.status === "Expired"
                  ? "warning"
                  : "error"
            }
          />
        ),
      },
      {
        field: "actions",
        headerName: t("actions"),
        minWidth: 132,
        sortable: false,
        filterable: false,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) => (
          <BatchActions
            row={row as BatchRow}
            canEdit={canEdit}
            canDelete={canDelete}
            onView={() => setSelected(row as BatchRow)}
          />
        ),
      },
    ],
    [canDelete, canEdit, locale, t],
  );

  return (
    <Stack spacing={2.25}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        <MetricCard
          label={t("totalBatches")}
          value={data.length.toLocaleString(locale)}
          detail={t("allBatchesDetail")}
          icon={<Inventory2Outlined fontSize="small" />}
          tone="info"
        />
        <MetricCard
          label={t("availableBatches")}
          value={metrics.active.toLocaleString(locale)}
          detail={t("availableBatchesDetail")}
          icon={<OpenInNew fontSize="small" />}
          tone="success"
        />
        <MetricCard
          label={t("expiringSoon")}
          value={metrics.expiringSoon.toLocaleString(locale)}
          detail={t("expiringSoonDetail")}
          icon={<CalendarMonthOutlined fontSize="small" />}
          tone="warning"
        />
        <MetricCard
          label={t("emptyBatches")}
          value={metrics.empty.toLocaleString(locale)}
          detail={t("emptyBatchesDetail")}
          icon={<WarningAmberOutlined fontSize="small" />}
          tone="error"
        />
      </Box>

      <FilterToolbar title={t("filters")} subtitle={t("filterHint")}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(260px, 1.45fr) minmax(180px, 0.85fr) minmax(150px, 0.65fr) minmax(150px, 0.65fr) auto",
            },
            gap: 1.5,
            alignItems: "center",
          }}
        >
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder={t("search")}
          />
          <TextField
            select
            size="small"
            label={t("product")}
            value={productFilter}
            onChange={(event) => setProductFilter(event.target.value)}
          >
            <MenuItem value="all">{t("allProducts")}</MenuItem>
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.code} — {product.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label={t("status")}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as BatchStatusFilter)
            }
          >
            <MenuItem value="all">{t("allStatuses")}</MenuItem>
            <MenuItem value="Active">{t("statusActive")}</MenuItem>
            <MenuItem value="Expired">{t("statusExpired")}</MenuItem>
            <MenuItem value="Empty">{t("statusEmpty")}</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label={t("expiryWindow")}
            value={expiryFilter}
            onChange={(event) =>
              setExpiryFilter(event.target.value as ExpiryFilter)
            }
          >
            <MenuItem value="all">{t("allExpiry")}</MenuItem>
            <MenuItem value="expired">{t("expiredOnly")}</MenuItem>
            <MenuItem value="next30">{t("next30Days")}</MenuItem>
            <MenuItem value="next90">{t("next90Days")}</MenuItem>
            <MenuItem value="none">{t("noExpiryDate")}</MenuItem>
          </TextField>
          <Button
            variant="text"
            onClick={() => {
              setSearch("");
              setProductFilter("all");
              setStatusFilter("all");
              setExpiryFilter("all");
            }}
            sx={{ whiteSpace: "nowrap" }}
          >
            {actions("clearFilters")}
          </Button>
        </Box>
      </FilterToolbar>

      <Card variant="outlined" sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 1.75,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0.5}
            sx={{
              alignItems: { sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {t("batchTable")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t("matchingBatches", { count: rows.length })}
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ height: 650 }}>
          <AppDataGrid
            rows={rows}
            columns={columns}
            rowCount={rows.length}
            paginationMode="client"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
          />
        </Box>
      </Card>

      <AppDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        width={460}
      >
        {selected ? (
          <BatchDetailsDrawer
            row={selected}
            canEdit={canEdit}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </AppDrawer>
    </Stack>
  );
}

function ExpiryCell({
  value,
  locale,
}: {
  value: string | null;
  locale: string;
}) {
  const t = useTranslations("batches");
  if (!value)
    return (
      <Typography variant="body2" color="text.secondary">
        {t("noExpiryDate")}
      </Typography>
    );
  const date = new Date(value);
  const now = Date.now();
  const delta = date.getTime() - now;
  const tone = delta < 0 ? "error" : delta <= DAYS_90 ? "warning" : "default";
  return (
    <Stack spacing={0.25}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date)}
      </Typography>
      {tone !== "default" ? (
        <StatusChip
          label={delta < 0 ? t("expiredOnly") : t("expiresSoon")}
          tone={tone}
        />
      ) : null}
    </Stack>
  );
}

function BatchActions({
  row,
  canEdit,
  canDelete,
  onView,
}: {
  row: BatchRow;
  canEdit: boolean;
  canDelete: boolean;
  onView: () => void;
}) {
  const actions = useTranslations("actions");
  const t = useTranslations("batches");

  return (
    <Stack direction="row" spacing={0.25} sx={{ justifyContent: "flex-end" }}>
      <Tooltip title={actions("viewDetails")}>
        <IconButton
          size="small"
          onClick={onView}
          aria-label={actions("viewDetails")}
        >
          <VisibilityOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
      {canEdit ? (
        <Tooltip title={actions("edit")}>
          <IconButton
            component={Link}
            href={`/batches/${row.id}/edit`}
            size="small"
            aria-label={actions("edit")}
          >
            <EditOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}
      {canDelete ? (
        <Tooltip title={t("deactivate")}>
          <Box component="span" sx={{ display: "inline-flex" }}>
            <BatchDeleteButton batchId={row.id} />
          </Box>
        </Tooltip>
      ) : null}
    </Stack>
  );
}

function BatchDetailsDrawer({
  row,
  canEdit,
  onClose,
}: {
  row: BatchRow;
  canEdit: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("batches");
  const actions = useTranslations("actions");
  const locale = useLocale();

  const fields: Array<[string, string]> = [
    [t("product"), row.product.name],
    [t("productCode"), row.product.code],
    [
      t("expiry"),
      row.expiryDate
        ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
            new Date(row.expiryDate),
          )
        : t("noExpiryDate"),
    ],
    [t("purchaseCost"), row.purchaseCost ?? "—"],
    [t("openingQty"), row.openingQty],
    [t("availableQty"), row.currentQuantity],
    [t("movementCount"), String(row.movementCount)],
  ];

  return (
    <Stack spacing={2.25}>
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 800, letterSpacing: "0.08em" }}
        >
          {t("batchDetails")}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
          {row.batchNumber}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {row.product.code} · {row.product.name}
        </Typography>
      </Box>
      <StatusChip
        label={t(`status${row.status}`)}
        tone={
          row.status === "Active"
            ? "success"
            : row.status === "Expired"
              ? "warning"
              : "error"
        }
      />
      <Divider />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 1.25,
        }}
      >
        {fields.map(([label, value]) => (
          <Card
            key={label}
            variant="outlined"
            sx={{ borderRadius: 2.5, boxShadow: "none" }}
          >
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 0.35, fontWeight: 800 }}
                noWrap
              >
                {value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
        <Button
          component={Link}
          href={`/batches?productId=${row.productId}`}
          variant="contained"
          startIcon={<OpenInNew />}
          onClick={onClose}
          fullWidth
        >
          {t("viewProductBatches")}
        </Button>
        {canEdit ? (
          <Button
            component={Link}
            href={`/batches/${row.id}/edit`}
            variant="outlined"
            startIcon={<EditOutlined />}
            onClick={onClose}
            fullWidth
          >
            {actions("edit")}
          </Button>
        ) : null}
      </Stack>
      <Button variant="text" onClick={onClose}>
        {actions("close")}
      </Button>
    </Stack>
  );
}
