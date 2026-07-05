import { alpha, createTheme } from "@mui/material/styles";
import type {} from "@mui/x-data-grid/themeAugmentation";

import { sapphireClinicalColors } from "@/theme/sapphire-clinical-colors";

declare module "@mui/material/Card" {
  interface CardPropsVariantOverrides {
    glass: true;
  }
}

const colors = sapphireClinicalColors;

/*
 * Compatibility export.
 * Existing Login / Dashboard screens may import this while visual cleanup
 * is still in progress. Keep raw gradient strings centralized in the
 * official color source only.
 */
export const pharmacyGradients = {
  brandFlow: colors.gradients.brand,
  ambientLight: colors.gradients.lightAmbient,
  ambientDark: colors.gradients.darkAmbient,
} as const;

export function createPharmacyTheme(direction: "ltr" | "rtl" = "ltr") {
  const isRtl = direction === "rtl";

  return createTheme({
    cssVariables: {
      colorSchemeSelector: "data-mui-color-scheme",
    },

    colorSchemes: {
      light: {
        palette: {
          primary: {
            main: colors.brand.primary.main,
            light: colors.brand.primary.light,
            dark: colors.brand.primary.hover,
            contrastText: colors.brand.primary.contrastText,
          },

          secondary: {
            main: colors.brand.secondary.main,
            light: colors.brand.secondary.soft,
            dark: colors.brand.secondary.hover,
            contrastText: colors.brand.secondary.contrastText,
          },

          success: {
            main: colors.semantic.success.light,
            light: colors.semantic.success.soft,
            dark: colors.semantic.success.light,
            contrastText: colors.brand.primary.contrastText,
          },

          warning: {
            main: colors.semantic.warning.light,
            light: colors.semantic.warning.soft,
            dark: colors.semantic.warning.light,
            contrastText: colors.brand.primary.contrastText,
          },

          error: {
            main: colors.semantic.error.light,
            light: colors.semantic.error.soft,
            dark: colors.semantic.error.light,
            contrastText: colors.brand.primary.contrastText,
          },

          info: {
            main: colors.semantic.info.light,
            light: colors.semantic.info.soft,
            dark: colors.semantic.info.light,
            contrastText: colors.brand.primary.contrastText,
          },

          background: {
            default: colors.light.background.default,
            paper: colors.light.background.paper,
          },

          text: {
            primary: colors.light.text.primary,
            secondary: colors.light.text.secondary,
          },

          divider: colors.light.divider,

          action: {
            hover: colors.light.action.hover,
            selected: colors.light.action.selected,
          },
        },
      },

      dark: {
        palette: {
          primary: {
            main: colors.brand.primary.light,
            light: colors.brand.primary.light,
            dark: colors.brand.primary.main,
            contrastText: colors.brand.primary.contrastText,
          },

          secondary: {
            main: colors.brand.secondary.main,
            light: colors.brand.secondary.soft,
            dark: colors.brand.secondary.hover,
            contrastText: colors.brand.secondary.contrastText,
          },

          success: {
            main: colors.semantic.success.dark,
            light: colors.semantic.success.dark,
            dark: colors.semantic.success.light,
            contrastText: colors.dark.background.default,
          },

          warning: {
            main: colors.semantic.warning.dark,
            light: colors.semantic.warning.dark,
            dark: colors.semantic.warning.light,
            contrastText: colors.dark.background.default,
          },

          error: {
            main: colors.semantic.error.dark,
            light: colors.semantic.error.dark,
            dark: colors.semantic.error.light,
            contrastText: colors.dark.background.default,
          },

          info: {
            main: colors.semantic.info.dark,
            light: colors.semantic.info.dark,
            dark: colors.semantic.info.light,
            contrastText: colors.dark.background.default,
          },

          background: {
            default: colors.dark.background.default,
            paper: colors.dark.background.paper,
          },

          text: {
            primary: colors.dark.text.primary,
            secondary: colors.dark.text.secondary,
          },

          divider: colors.dark.divider,

          action: {
            hover: colors.dark.action.hover,
            selected: colors.dark.action.selected,
          },
        },
      },
    },

    direction,

    shape: {
      borderRadius: 6,
    },

    spacing: 8,

    typography: {
      fontFamily: isRtl
        ? '"Noto Sans Arabic", "Segoe UI", Tahoma, sans-serif'
        : 'var(--font-sans, "Inter"), "Segoe UI", Arial, sans-serif',

      h1: {
        fontSize: "1.75rem",
        fontWeight: 700,
        lineHeight: 1.285,
      },

      h2: {
        fontSize: "1.375rem",
        fontWeight: 600,
        lineHeight: 1.363,
      },

      h3: {
        fontSize: "1.125rem",
        fontWeight: 600,
        lineHeight: 1.444,
      },

      h4: {
        fontSize: "1.75rem",
        fontWeight: 700,
        lineHeight: 1.285,
      },

      h5: {
        fontSize: "1.375rem",
        fontWeight: 600,
        lineHeight: 1.363,
      },

      h6: {
        fontSize: "1.125rem",
        fontWeight: 600,
        lineHeight: 1.444,
      },

      subtitle1: {
        fontSize: "0.95rem",
        fontWeight: 700,
      },

      subtitle2: {
        fontSize: "0.875rem",
        fontWeight: 700,
      },

      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
      },

      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
      },

      caption: {
        fontSize: "0.75rem",
        lineHeight: 1.4,
      },

      button: {
        textTransform: "none",
        fontWeight: 600,
        fontSize: "0.875rem",
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            minHeight: "100%",
            backgroundColor: "var(--mui-palette-background-default)",
          },

          body: {
            minHeight: "100%",
            backgroundColor: "var(--mui-palette-background-default)",
            color: "var(--mui-palette-text-primary)",
            transition: "background-color 180ms ease, color 180ms ease",
          },

          "#__next": {
            minHeight: "100%",
          },

          "::selection": {
            backgroundColor: alpha(colors.brand.primary.main, 0.22),
          },

          "*:focus-visible": {
            outline: "2px solid var(--mui-palette-primary-main)",
            outlineOffset: 2,
          },
        },
      },

      MuiAppBar: {
        defaultProps: {
          color: "inherit",
          elevation: 0,
        },

        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: 0,
          },
        },
      },

      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: 56,

            "@media (min-width:1200px)": {
              minHeight: 64,
            },
          },
        },
      },

      /*
       * Never apply a global Paper radius.
       * Paper is also used internally by Drawers, Menus, Popovers and Dialogs.
       */
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
        variants: [
          {
            props: {
              variant: "outlined",
            },
            style: {
              borderRadius: 16,
            },
          },
        ],
      },

      MuiCard: {
        defaultProps: {
          variant: "outlined",
        },

        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: "none",
            transition:
              "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
          },
        },

        variants: [
          {
            props: {
              variant: "outlined",
            },

            style: {
              borderColor:
                "color-mix(in srgb, var(--mui-palette-primary-main) 14%, var(--mui-palette-divider))",
              backgroundColor:
                "color-mix(in srgb, var(--mui-palette-background-paper) 92%, transparent)",
              backdropFilter: "blur(12px) saturate(120%)",
              WebkitBackdropFilter: "blur(12px) saturate(120%)",
              boxShadow:
                "0 12px 28px color-mix(in srgb, var(--mui-palette-primary-main) 6%, transparent)",
            },
          },

          {
            props: {
              variant: "elevation",
            },

            style: ({ theme }) => ({
              border: "none",
              boxShadow: theme.shadows[2],
            }),
          },

          /*
           * Brand glass surface for summary cards and page panels.
           * Data tables still use solid outlined cards for readability.
           */
          {
            props: {
              variant: "glass",
            },

            style: {
              position: "relative",
              overflow: "hidden",
              borderRadius: 16,
              border: `1px solid ${alpha(colors.light.divider, 0.9)}`,
              backgroundColor: alpha(colors.light.background.paper, 0.82),
              backgroundImage: `linear-gradient(
                135deg,
                ${alpha(colors.light.background.paper, 0.94)} 0%,
                ${alpha(colors.light.background.subtle, 0.72)} 100%
              )`,
              backdropFilter: "blur(18px) saturate(130%)",
              WebkitBackdropFilter: "blur(18px) saturate(130%)",
              boxShadow: `0 14px 34px ${alpha(colors.brand.primary.main, 0.08)}`,

              "[data-mui-color-scheme='dark'] &": {
                borderColor: alpha(colors.brand.primary.light, 0.2),
                backgroundColor: alpha(colors.dark.background.paper, 0.82),
                backgroundImage: `linear-gradient(
                  135deg,
                  ${alpha(colors.dark.background.elevated, 0.86)} 0%,
                  ${alpha(colors.dark.background.paper, 0.76)} 100%
                )`,
                boxShadow: `0 18px 42px ${alpha(colors.dark.background.default, 0.46)}`,
              },

              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: `linear-gradient(
                  115deg,
                  ${alpha(colors.light.background.paper, 0.38)} 0%,
                  transparent 40%
                )`,
                opacity: 0.7,
              },
            },
          },
        ],
      },

      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 18,

            "&:last-child": {
              paddingBottom: 18,
            },
          },
        },
      },

      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: 20,
            paddingBottom: 0,
          },
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },

        styleOverrides: {
          root: {
            minHeight: 34,
            borderRadius: 10,
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          size: "small",
          fullWidth: true,
          variant: "outlined",
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: "var(--mui-palette-background-paper)",

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--mui-palette-divider)",
            },

            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--mui-palette-text-secondary)",
            },

            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--mui-palette-primary-main)",
              borderWidth: 1,
            },
          },
        },
      },

      MuiAutocomplete: {
        defaultProps: {
          size: "small",
        },
      },

      MuiChip: {
        defaultProps: {
          size: "small",
        },

        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 6,
          },

          outlined: {
            backgroundColor: "var(--mui-palette-background-paper)",
            border: "1px solid var(--mui-palette-divider)",

            "&.MuiChip-colorPrimary": {
              backgroundColor: alpha(colors.brand.primary.main, 0.08),
              color: "var(--mui-palette-primary-main)",
              borderColor: alpha(colors.brand.primary.main, 0.24),
            },

            "&.MuiChip-colorSecondary": {
              backgroundColor: alpha(colors.brand.secondary.main, 0.08),
              color: "var(--mui-palette-secondary-main)",
              borderColor: alpha(colors.brand.secondary.main, 0.24),
            },

            "&.MuiChip-colorSuccess": {
              backgroundColor: alpha(colors.semantic.success.light, 0.1),
              color: "var(--mui-palette-success-main)",
              borderColor: alpha(colors.semantic.success.light, 0.24),

              "[data-mui-color-scheme='dark'] &": {
                backgroundColor: alpha(colors.semantic.success.dark, 0.12),
                borderColor: alpha(colors.semantic.success.dark, 0.26),
              },
            },

            "&.MuiChip-colorWarning": {
              backgroundColor: alpha(colors.semantic.warning.light, 0.1),
              color: "var(--mui-palette-warning-main)",
              borderColor: alpha(colors.semantic.warning.light, 0.24),

              "[data-mui-color-scheme='dark'] &": {
                backgroundColor: alpha(colors.semantic.warning.dark, 0.12),
                borderColor: alpha(colors.semantic.warning.dark, 0.26),
              },
            },

            "&.MuiChip-colorError": {
              backgroundColor: alpha(colors.semantic.error.light, 0.1),
              color: "var(--mui-palette-error-main)",
              borderColor: alpha(colors.semantic.error.light, 0.24),

              "[data-mui-color-scheme='dark'] &": {
                backgroundColor: alpha(colors.semantic.error.dark, 0.12),
                borderColor: alpha(colors.semantic.error.dark, 0.26),
              },
            },

            "&.MuiChip-colorInfo": {
              backgroundColor: alpha(colors.semantic.info.light, 0.1),
              color: "var(--mui-palette-info-main)",
              borderColor: alpha(colors.semantic.info.light, 0.24),

              "[data-mui-color-scheme='dark'] &": {
                backgroundColor: alpha(colors.semantic.info.dark, 0.12),
                borderColor: alpha(colors.semantic.info.dark, 0.26),
              },
            },
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            minHeight: 40,
            borderRadius: 10,
            marginBlock: 2,
            color: "var(--mui-palette-text-secondary)",

            "& .MuiListItemIcon-root": {
              color: "var(--mui-palette-text-secondary)",
            },

            "&:hover": {
              backgroundColor: "var(--mui-palette-action-hover)",
              color: "var(--mui-palette-text-primary)",

              "& .MuiListItemIcon-root": {
                color: "var(--mui-palette-text-primary)",
              },
            },

            "&.Mui-selected": {
              backgroundColor: "var(--mui-palette-action-selected)",
              color: "var(--mui-palette-primary-main)",
              fontWeight: 700,

              "& .MuiListItemIcon-root": {
                color: "var(--mui-palette-primary-main)",
              },

              "&:hover": {
                backgroundColor: "var(--mui-palette-action-selected)",
              },
            },
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            backgroundImage: "none",
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            backgroundImage: "none",
            border: "1px solid var(--mui-palette-divider)",
          },
        },
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            minHeight: 36,
          },
        },
      },

      MuiDialog: {
        defaultProps: {
          fullWidth: true,
          maxWidth: "sm",
        },

        styleOverrides: {
          paper: {
            borderRadius: 16,
            backgroundImage: "none",
          },
        },
      },

      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: "20px 24px 0",
          },
        },
      },

      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: "16px 24px",
          },
        },
      },

      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "0 24px 20px",
          },
        },
      },

      MuiTooltip: {
        defaultProps: {
          arrow: true,
        },
      },

      MuiSkeleton: {
        defaultProps: {
          animation: "wave",
        },
      },

      MuiAlert: {
        defaultProps: {
          variant: "outlined",
        },

        styleOverrides: {
          root: {
            alignItems: "center",
            borderRadius: 12,
          },
        },
      },

      /*
       * Standard MUI Table baseline.
       * Operational pages remain solid, readable and low-decoration.
       */
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottomColor: "var(--mui-palette-divider)",
            padding: "8px 12px",
            fontSize: "0.82rem",
            verticalAlign: "middle",
          },

          head: {
            color: "var(--mui-palette-text-secondary)",
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.04em",
            backgroundColor: "var(--mui-palette-action-hover)",
            whiteSpace: "nowrap",
          },
        },
      },

      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: "var(--mui-palette-background-paper)",
          },
        },
      },

      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: "var(--mui-palette-action-hover)",
          },
        },
      },

      MuiTableBody: {
        styleOverrides: {
          root: {
            "& .MuiTableRow-root:hover": {
              backgroundColor: "var(--mui-palette-action-hover)",
            },
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              backgroundColor: "var(--mui-palette-action-selected)",

              "&:hover": {
                backgroundColor: "var(--mui-palette-action-selected)",
              },
            },

            "&:last-child .MuiTableCell-root": {
              borderBottom: 0,
            },
          },
        },
      },

      MuiTablePagination: {
        styleOverrides: {
          root: {
            borderTop: "1px solid var(--mui-palette-divider)",
            color: "var(--mui-palette-text-secondary)",
          },

          toolbar: {
            minHeight: 48,
          },
        },
      },

      MuiBreadcrumbs: {
        styleOverrides: {
          root: {
            fontSize: "0.875rem",
          },
        },
      },

      /*
       * MUI X DataGrid is a first-class CRM workspace surface.
       * No fake div tables, custom pagination or custom selection system.
       */
      MuiDataGrid: {
        defaultProps: {
          density: "standard",
          disableRowSelectionOnClick: true,
          rowHeight: 44,
          columnHeaderHeight: 42,
        },

        styleOverrides: {
          root: {
            border: 0,
            borderRadius: 12,
            backgroundColor: "var(--mui-palette-background-paper)",
            color: "var(--mui-palette-text-primary)",

            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "var(--mui-palette-action-hover)",
              borderBottomColor: "var(--mui-palette-divider)",
            },

            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "var(--mui-palette-action-hover)",
            },

            "& .MuiDataGrid-columnHeaderTitle": {
              color: "var(--mui-palette-text-secondary)",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.04em",
            },

            "& .MuiDataGrid-columnSeparator": {
              color: "var(--mui-palette-divider)",
            },

            "& .MuiDataGrid-cell": {
              borderBottomColor: "var(--mui-palette-divider)",
            },

            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
              outline: "none",
            },

            "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within":
              {
                outline: "2px solid var(--mui-palette-primary-main)",
                outlineOffset: -2,
              },

            "& .MuiDataGrid-row:hover": {
              backgroundColor: "var(--mui-palette-action-hover)",
            },

            "& .MuiDataGrid-row.Mui-selected": {
              backgroundColor: "var(--mui-palette-action-selected)",

              "&:hover": {
                backgroundColor: "var(--mui-palette-action-selected)",
              },
            },

            "& .MuiDataGrid-footerContainer": {
              borderTopColor: "var(--mui-palette-divider)",
            },

            "& .MuiDataGrid-toolbarContainer": {
              padding: 12,
              borderBottom: "1px solid var(--mui-palette-divider)",
            },
          },
        },
      },
    },
  });
}

declare module "@mui/material" {
  interface PaperPropsVariantOverrides {
    glass: true;
  }
}
