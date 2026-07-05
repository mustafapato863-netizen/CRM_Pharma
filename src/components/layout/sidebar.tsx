"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  AssessmentOutlined,
  ArchiveOutlined,
  BackupOutlined,
  CloseRounded,
  DashboardOutlined,
  GroupOutlined,
  Inventory2Outlined,
  LocalShippingOutlined,
  PaymentsOutlined,
  ReceiptLongOutlined,
  SettingsOutlined,
  ShoppingCartOutlined,
  SupervisorAccountOutlined,
  SwapHorizOutlined,
  WarehouseOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { PermissionMap } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { useLocale } from "@/shared/hooks/use-locale";

type SidebarItemKey =
  | "dashboard"
  | "products"
  | "batches"
  | "parties"
  | "stock"
  | "movements"
  | "purchases"
  | "sales"
  | "payments"
  | "returns"
  | "ledger"
  | "expiryAlerts"
  | "reports"
  | "users"
  | "settings"
  | "backup";

type NavigationItem = {
  href: string;
  key: SidebarItemKey;
  permission: string;
  icon: typeof DashboardOutlined;
};

type NavigationSection = {
  id: "main" | "masterData" | "operations" | "analysis" | "administration";
  items: NavigationItem[];
};

const navigationSections: NavigationSection[] = [
  {
    id: "main",
    items: [
      {
        href: "/dashboard",
        key: "dashboard",
        permission: "dashboard",
        icon: DashboardOutlined,
      },
    ],
  },
  {
    id: "masterData",
    items: [
      {
        href: "/products",
        key: "products",
        permission: "products",
        icon: Inventory2Outlined,
      },
      {
        href: "/batches",
        key: "batches",
        permission: "batchView",
        icon: ArchiveOutlined,
      },
      {
        href: "/parties",
        key: "parties",
        permission: "parties",
        icon: GroupOutlined,
      },
    ],
  },
  {
    id: "operations",
    items: [
      {
        href: "/stock",
        key: "stock",
        permission: "stock",
        icon: WarehouseOutlined,
      },
      {
        href: "/purchases",
        key: "purchases",
        permission: "stockInView",
        icon: LocalShippingOutlined,
      },
      {
        href: "/sales",
        key: "sales",
        permission: "stockOutView",
        icon: ShoppingCartOutlined,
      },
      {
        href: "/payments",
        key: "payments",
        permission: "ledger",
        icon: PaymentsOutlined,
      },
      {
        href: "/returns",
        key: "returns",
        permission: "ledger",
        icon: SwapHorizOutlined,
      },
    ],
  },
  {
    id: "analysis",
    items: [
      {
        href: "/inventory/movements",
        key: "movements",
        permission: "reports",
        icon: ReceiptLongOutlined,
      },
      {
        href: "/ledger",
        key: "ledger",
        permission: "ledger",
        icon: ReceiptLongOutlined,
      },
      {
        href: "/expiry-alerts",
        key: "expiryAlerts",
        permission: "expiryAlerts",
        icon: ArchiveOutlined,
      },
      {
        href: "/reports",
        key: "reports",
        permission: "reports",
        icon: AssessmentOutlined,
      },
    ],
  },
  {
    id: "administration",
    items: [
      {
        href: "/users",
        key: "users",
        permission: "users",
        icon: SupervisorAccountOutlined,
      },
      {
        href: "/settings",
        key: "settings",
        permission: "settings",
        icon: SettingsOutlined,
      },
      {
        href: "/backup",
        key: "backup",
        permission: "backupExport",
        icon: BackupOutlined,
      },
    ],
  },
];

type SidebarProps = {
  permissions: PermissionMap;
  mobileOpen: boolean;
  onMobileClose: () => void;
  width: number;
};

function matchesRoute(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  permissions,
  mobileOpen,
  onMobileClose,
  width,
}: SidebarProps) {
  const pathname = usePathname();
  const { locale, messages } = useLocale();
  const anchor = locale === "ar" ? "right" : "left";

  const visibleSections = useMemo(
    () =>
      navigationSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            hasPermission(permissions, item.permission as never),
          ),
        }))
        .filter((section) => section.items.length > 0),
    [permissions],
  );

  const activeHref = useMemo(
    () =>
      visibleSections
        .flatMap((section) => section.items)
        .filter((item) => matchesRoute(pathname, item.href))
        .sort((left, right) => right.href.length - left.href.length)[0]?.href,
    [pathname, visibleSections],
  );

  const content = (
    <Stack
      sx={{
        height: "100%",
        minHeight: 0,
        bgcolor: "background.paper",
        backgroundImage: "none",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: { xs: 56, md: 64 },
          px: 2,
          gap: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundImage: `radial-gradient(
            circle at 8% 0%,
            color-mix(in srgb, var(--mui-palette-primary-main) 16%, transparent) 0%,
            transparent 60%
          )`,
        }}
      >
        <Box
          component={Link}
          href="/dashboard"
          onClick={onMobileClose}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            minWidth: 0,
            color: "text.primary",
            textDecoration: "none",
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: 1.5,
              color: "primary.contrastText",
              fontSize: 14,
              fontWeight: 900,
              background:
                "linear-gradient(135deg, var(--mui-palette-primary-main), var(--mui-palette-secondary-main))",
              boxShadow:
                "0 8px 18px color-mix(in srgb, var(--mui-palette-primary-main) 28%, transparent)",
            }}
          >
            P
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ fontWeight: 800, lineHeight: 1.2 }}
            >
              {messages.common.appName}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              color="text.secondary"
              sx={{ display: "block", mt: 0.125, lineHeight: 1.2 }}
            >
              {messages.common.version}
            </Typography>
          </Box>
        </Box>

        <Tooltip title={messages.common.navigation}>
          <IconButton
            aria-label={messages.common.navigation}
            onClick={onMobileClose}
            size="small"
            sx={{
              display: { lg: "none" },
              width: 34,
              height: 34,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1.25, py: 1.25 }}
      >
        {visibleSections.map((section, sectionIndex) => (
          <Box key={section.id}>
            {sectionIndex > 0 ? <Divider sx={{ my: 1.1 }} /> : null}

            {section.id === "administration" ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", px: 1.25, pb: 0.75, fontWeight: 700 }}
              >
                {messages.sidebar.admin}
              </Typography>
            ) : null}

            <List disablePadding dense>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = activeHref === item.href;

                return (
                  <ListItemButton
                    key={item.href}
                    component={Link}
                    href={item.href}
                    selected={active}
                    onClick={onMobileClose}
                    aria-current={active ? "page" : undefined}
                    sx={(theme) => ({
                      minHeight: 38,
                      mb: 0.25,
                      px: 1.25,
                      borderRadius: 1.25,
                      color: active ? "primary.main" : "text.secondary",
                      transition: theme.transitions.create(
                        ["background-color", "color"],
                        { duration: theme.transitions.duration.shorter },
                      ),
                      "& .MuiListItemIcon-root": {
                        minWidth: 34,
                        color: "inherit",
                      },
                      "&:hover": {
                        bgcolor: "action.hover",
                        color: "text.primary",
                        "& .MuiListItemIcon-root": { color: "primary.main" },
                      },
                      "&.Mui-selected": {
                        bgcolor: "action.selected",
                        color: "primary.main",
                        "& .MuiListItemIcon-root": { color: "primary.main" },
                        "&:hover": { bgcolor: "action.selected" },
                      },
                    })}
                  >
                    <ListItemIcon>
                      <Icon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={messages.sidebar[item.key]}
                      slotProps={{
                        primary: {
                          noWrap: true,
                          sx: {
                            fontSize: 13,
                            fontWeight: active ? 750 : 550,
                            lineHeight: 1.2,
                          },
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Box
        sx={{ px: 2, py: 1.25, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="caption" color="text.secondary">
          {messages.common.version}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <>
      <Drawer
        anchor={anchor}
        variant="permanent"
        open
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            borderRadius: 0,
            borderInlineEnd: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            backgroundImage: "none",
          },
        }}
      >
        {content}
      </Drawer>

      <Drawer
        anchor={anchor}
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { lg: "none" },
          "& .MuiDrawer-paper": {
            width: "min(84vw, 300px)",
            boxSizing: "border-box",
            borderRadius: 0,
            bgcolor: "background.paper",
            backgroundImage: "none",
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}
