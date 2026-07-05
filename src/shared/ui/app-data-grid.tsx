"use client";

import { Box } from "@mui/material";
import {
  DataGrid,
  type DataGridProps,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import { arSD } from "@mui/x-data-grid/locales";
import { useLocale } from "@/shared/hooks/use-locale";

type AppDataGridProps = {
  rows: readonly any[];
  columns: GridColDef[];
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  paginationMode?: "client" | "server";
  loading?: boolean;
  noRowsOverlay?: React.ComponentType;
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  sortingMode?: "client" | "server";
  onRowClick?: DataGridProps["onRowClick"];
};

/**
 * Shared MUI DataGrid surface used by operational workspaces.
 *
 * It intentionally keeps native DataGrid pagination, keyboard navigation,
 * column resizing, sorting and responsive horizontal scrolling intact.
 */
export function AppDataGrid({
  rows,
  columns,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  paginationMode = "server",
  loading = false,
  noRowsOverlay,
  sortModel,
  onSortModelChange,
  sortingMode = "client",
  onRowClick,
}: AppDataGridProps) {
  const { locale } = useLocale();

  return (
    <Box
      dir={locale === "ar" ? "rtl" : "ltr"}
      sx={{
        width: "100%",
        minHeight: 420,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={rowCount}
        paginationMode={paginationMode}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        sortingMode={sortingMode}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        onRowClick={onRowClick}
        disableRowSelectionOnClick
        disableColumnMenu
        pageSizeOptions={[10, 20, 50]}
        getRowHeight={() => 56}
        localeText={
          locale === "ar"
            ? arSD.components.MuiDataGrid.defaultProps.localeText
            : undefined
        }
        slots={noRowsOverlay ? { noRowsOverlay } : undefined}
        sx={(theme) => ({
          border: 0,
          borderRadius: 0,
          color: "text.primary",
          "& .MuiDataGrid-main": {
            minWidth: 0,
          },
          "& .MuiDataGrid-columnHeaders": {
            minHeight: "40px !important",
            maxHeight: "40px !important",
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: "action.hover",
          },
          "& .MuiDataGrid-columnHeader": {
            minHeight: "40px !important",
            maxHeight: "40px !important",
            px: 1.25,
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: "0.035em",
            textTransform: "uppercase",
            color: theme.palette.text.secondary,
          },
          "& .MuiDataGrid-cell": {
            borderBottom: `1px solid ${theme.palette.divider}`,
            px: 1.25,
            display: "flex",
            alignItems: "center",
            fontSize: "0.82rem",
          },
          "& .MuiDataGrid-row:hover": {
            bgcolor: "action.hover",
          },
          "& .MuiDataGrid-row.Mui-hovered": {
            bgcolor: "action.hover",
          },
          "& .MuiDataGrid-footerContainer": {
            minHeight: 46,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
          },
          "& .MuiDataGrid-overlay": {
            bgcolor: "background.paper",
          },
          "& .MuiDataGrid-virtualScroller": {
            overflowX: "auto",
          },
        })}
      />
    </Box>
  );
}
