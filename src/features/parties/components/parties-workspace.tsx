"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Add,
  Download,
  Edit,
  FilterAlt,
  MoreVert,
  OpenInNew,
  Print,
  Refresh,
  Visibility,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { AppDataGrid } from "@/shared/ui/app-data-grid";
import { AppDrawer } from "@/shared/ui/app-drawer";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { FilterToolbar } from "@/shared/ui/filter-toolbar";
import { MetricCard } from "@/shared/ui/metric-card";
import { SearchField } from "@/shared/ui/search-field";
import { StatusChip } from "@/shared/ui/status-chip";
import { ToolbarActionGroup } from "@/shared/ui/toolbar-action-group";
import type { PartyRow } from "../types";
import { exportPartiesToWorkbook } from "../utils/export";
import { showSuccess } from "@/shared/lib/toast";
import { useLocale, useTranslations } from "next-intl";

type Row = PartyRow;

export function PartiesWorkspace({
  rows,
  totalCount,
  activeCount,
  page,
  pageSize,
  totalPages,
  canCreate,
  canEdit,
  canExport,
}: {
  rows: Row[];
  totalCount: number;
  activeCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("parties");
  const common = useTranslations("common");
  const actions = useTranslations("actions");
  const locale = useLocale();
  const [selected, setSelected] = useState<Row | null>(null);

  const columns = useMemo(
    () => [
      {
        field: "code",
        headerName: common("code"),
        minWidth: 140,
        flex: 0.8,
      },
      {
        field: "name",
        headerName: t("arabicName"),
        minWidth: 220,
        flex: 1.2,
        renderCell: (params: { row: Row }) => (
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography
              component={Link}
              href={`/parties/${params.row.id}`}
              variant="body2"
              sx={{ fontWeight: 700, textDecoration: "none" }}
              noWrap
            >
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.nameEn || t("noEnglishName")}
            </Typography>
          </Stack>
        ),
      },
      { field: "nameEn", headerName: t("englishName"), minWidth: 180, flex: 1 },
      {
        field: "type",
        headerName: t("type"),
        minWidth: 140,
        renderCell: (params: { row: Row }) => (
          <Chip
            size="small"
            label={
              params.row.type === "CUSTOMER"
                ? t("customer")
                : params.row.type === "SUPPLIER"
                  ? t("supplier")
                  : t("both")
            }
            variant="outlined"
          />
        ),
      },
      { field: "mobile", headerName: t("mobile"), minWidth: 140 },
      {
        field: "currentBalance",
        headerName: t("currentBalance"),
        minWidth: 150,
        align: "right",
        headerAlign: "right" as const,
      },
      { field: "balanceType", headerName: t("balanceType"), minWidth: 140 },
      {
        field: "lastTransactionAt",
        headerName: t("lastTransaction"),
        minWidth: 170,
        valueFormatter: (value: unknown) =>
          value ? new Date(String(value)).toLocaleString(locale) : "-",
      },
      {
        field: "status",
        headerName: common("status"),
        minWidth: 120,
        renderCell: (params: { row: Row }) => (
          <StatusChip
            label={params.row.isActive ? common("active") : common("inactive")}
            tone={params.row.isActive ? "success" : "warning"}
          />
        ),
      },
      {
        field: "updatedAt",
        headerName: t("updated"),
        minWidth: 170,
        valueFormatter: (value: unknown) =>
          new Date(String(value)).toLocaleString(locale),
      },
      {
        field: "actions",
        headerName: common("actions"),
        minWidth: 130,
        sortable: false,
        filterable: false,
        renderCell: (params: { row: Row }) => (
          <PartyActions
            row={params.row}
            canEdit={canEdit}
            onView={() => setSelected(params.row)}
          />
        ),
      },
    ],
    [canEdit, common, locale, t],
  );

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams?.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    router.replace(`/parties?${next.toString()}`);
  }

  function clearFilters() {
    router.replace("/parties");
  }

  async function exportExcel() {
    const buffer = await exportPartiesToWorkbook(rows);
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "parties.xlsx";
    link.click();
    URL.revokeObjectURL(url);
    showSuccess(actions("export"));
  }

  return (
    <Stack spacing={2.25}>
      <AppPageHeader
        title={t("title")}
        description={t("description")}
        action={
          <ToolbarActionGroup>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => router.refresh()}
            >
              {actions("refresh")}
            </Button>
            {canExport ? (
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => void exportExcel()}
              >
                {actions("export")}
              </Button>
            ) : null}
            {canExport ? (
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={() => window.print()}
              >
                {actions("print")}
              </Button>
            ) : null}
            {canCreate ? (
              <Button
                component={Link}
                href="/parties/new"
                variant="contained"
                startIcon={<Add />}
              >
                {t("new")}
              </Button>
            ) : null}
          </ToolbarActionGroup>
        }
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
          gap: 1.5,
        }}
      >
        <MetricCard
          label={t("total")}
          value={String(totalCount)}
          icon={<FilterAlt />}
          tone="info"
        />
        <MetricCard
          label={t("active")}
          value={String(activeCount)}
          icon={<Visibility />}
          tone="success"
        />
        <MetricCard
          label={t("currentPage")}
          value={`${page} / ${totalPages}`}
          icon={<OpenInNew />}
          tone="warning"
        />
      </Box>

      <FilterToolbar title={t("filters")} subtitle={t("filterHint")}>
        <Stack spacing={1.5}>
          <SearchField
            value={searchParams?.get("q") ?? ""}
            onChange={(value) => setFilter("q", value)}
            placeholder={t("search")}
          />
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <SearchField
              value={searchParams?.get("type") ?? ""}
              onChange={(value) => setFilter("type", value)}
              placeholder={t("type")}
            />
            <SearchField
              value={searchParams?.get("status") ?? ""}
              onChange={(value) => setFilter("status", value)}
              placeholder={common("status")}
            />
            <SearchField
              value={searchParams?.get("sortDir") ?? ""}
              onChange={(value) => setFilter("sortDir", value)}
              placeholder={t("currentPage")}
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button variant="text" onClick={clearFilters}>
              {actions("clearFilters")}
            </Button>
          </Stack>
        </Stack>
      </FilterToolbar>

      <Card variant="outlined" sx={{ overflow: "hidden" }}>
        <Box sx={{ height: 680 }}>
          <AppDataGrid
            rows={rows}
            columns={columns as never}
            rowCount={totalCount}
            paginationModel={{ page: page - 1, pageSize }}
            onPaginationModelChange={(model) => {
              const next = new URLSearchParams(searchParams?.toString());
              next.set("page", String(model.page + 1));
              next.set("pageSize", String(model.pageSize));
              router.replace(`/parties?${next.toString()}`);
            }}
          />
        </Box>
      </Card>

      <AppDrawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        width={480}
      >
        {selected ? (
          <Stack spacing={2}>
            <Typography variant="overline" color="text.secondary">
              {t("details")}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {selected.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selected.code}
            </Typography>
            <Divider />
            {[
              [
                t("type"),
                selected.type === "CUSTOMER"
                  ? t("customer")
                  : selected.type === "SUPPLIER"
                    ? t("supplier")
                    : t("both"),
              ],
              [t("mobile"), selected.mobile || "-"],
              [t("phone"), selected.phone || "-"],
              [t("email"), selected.email || "-"],
              [t("currentBalance"), selected.currentBalance],
              [t("balanceType"), selected.balanceType],
              [
                t("lastTransaction"),
                selected.lastTransactionAt
                  ? new Date(selected.lastTransactionAt).toLocaleString(locale)
                  : "-",
              ],
              [
                t("updated"),
                new Date(selected.updatedAt).toLocaleString(locale),
              ],
            ].map(([label, value]) => (
              <Card key={label} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                    {value}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : null}
      </AppDrawer>
    </Stack>
  );
}

function PartyActions({
  row,
  canEdit,
  onView,
}: {
  row: Row;
  canEdit: boolean;
  onView: () => void;
}) {
  const t = useTranslations("parties");
  const actions = useTranslations("actions");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onView();
          }}
        >
          <Visibility fontSize="small" sx={{ me: 1 }} />
          {actions("viewDetails")}
        </MenuItem>
        {canEdit ? (
          <MenuItem
            component={Link}
            href={`/parties/${row.id}/edit`}
            onClick={() => setAnchorEl(null)}
          >
            <Edit fontSize="small" sx={{ me: 1 }} />
            {t("editAction")}
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
}
