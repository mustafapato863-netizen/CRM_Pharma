"use client";

import { useState } from "react";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CheckRounded,
  DarkModeRounded,
  DesktopWindowsRounded,
  LightModeRounded,
} from "@mui/icons-material";
import { useColorScheme, useTheme } from "@mui/material/styles";
import { useLocale } from "@/shared/hooks/use-locale";

type AppearanceMode = "light" | "dark" | "system";

export function ThemeToggle() {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();
  const { messages } = useLocale();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const activeMode = (mode ?? "system") as AppearanceMode;
  const isRtl = theme.direction === "rtl";
  const ActiveIcon =
    activeMode === "dark"
      ? DarkModeRounded
      : activeMode === "light"
        ? LightModeRounded
        : DesktopWindowsRounded;

  const options: Array<{
    value: AppearanceMode;
    label: string;
    icon: typeof LightModeRounded;
  }> = [
    {
      value: "light",
      label: messages.appearance.light,
      icon: LightModeRounded,
    },
    { value: "dark", label: messages.appearance.dark, icon: DarkModeRounded },
    {
      value: "system",
      label: messages.appearance.system,
      icon: DesktopWindowsRounded,
    },
  ];

  return (
    <>
      <Tooltip title={messages.appearance.label}>
        <IconButton
          aria-label={messages.appearance.label}
          aria-controls={open ? "appearance-menu" : undefined}
          aria-haspopup="menu"
          aria-expanded={open ? "true" : undefined}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          size="small"
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            color: "primary.main",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <ActiveIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>

      <Menu
        id="appearance-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isRtl ? "left" : "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: isRtl ? "left" : "right",
        }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              minWidth: 184,
              mt: 1,
              p: 0.5,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
              backgroundImage: `linear-gradient(
                135deg,
                color-mix(in srgb, var(--mui-palette-primary-main) 7%, transparent),
                transparent 48%
              )`,
              boxShadow:
                "0 16px 38px color-mix(in srgb, var(--mui-palette-text-primary) 13%, transparent)",
            },
          },
        }}
      >
        {options.map((option) => {
          const selected = option.value === activeMode;
          const OptionIcon = option.icon;

          return (
            <MenuItem
              key={option.value}
              selected={selected}
              onClick={() => {
                if (option.value !== activeMode) setMode(option.value);
                setAnchorEl(null);
              }}
              sx={{
                minHeight: 42,
                borderRadius: 1.5,
                px: 1.25,
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                  color: "primary.main",
                  "&:hover": { bgcolor: "action.selected" },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 32,
                  color: selected ? "primary.main" : "text.secondary",
                }}
              >
                <OptionIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: selected ? 700 : 500 }}
                  >
                    {option.label}
                  </Typography>
                }
              />
              <Box
                sx={{
                  width: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                }}
              >
                {selected ? <CheckRounded fontSize="small" /> : null}
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
