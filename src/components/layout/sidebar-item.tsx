"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";

type SidebarItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  collapsed?: boolean;
};

export function SidebarItem({
  href,
  label,
  icon,
  active = false,
  collapsed = false,
}: SidebarItemProps) {
  const theme = useTheme();

  return (
    <Tooltip
      title={label}
      placement={theme.direction === "rtl" ? "left" : "right"}
      disableHoverListener={!collapsed}
      disableFocusListener={!collapsed}
      disableTouchListener={!collapsed}
    >
      <ListItemButton
        component={Link}
        href={href}
        selected={active}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? label : undefined}
        sx={{
          minHeight: 38,
          mx: 1,
          mb: 0.25,
          px: collapsed ? 1 : 1.25,
          borderRadius: 1.25,
          justifyContent: collapsed ? "center" : "flex-start",
          color: active ? "primary.main" : "text.secondary",
          "& .MuiListItemIcon-root": { color: "inherit" },
          "&:hover": {
            bgcolor: "action.hover",
            color: "text.primary",
            "& .MuiListItemIcon-root": { color: "primary.main" },
          },
          "&.Mui-selected": {
            bgcolor: "action.selected",
            color: "primary.main",
            "&:hover": { bgcolor: "action.selected" },
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 0 : 34,
            color: "inherit",
            justifyContent: "center",
          }}
        >
          {icon}
        </ListItemIcon>
        {!collapsed ? (
          <ListItemText
            primary={
              <Typography
                noWrap
                sx={{ fontSize: 13, fontWeight: active ? 750 : 550 }}
              >
                {label}
              </Typography>
            }
          />
        ) : null}
      </ListItemButton>
    </Tooltip>
  );
}
