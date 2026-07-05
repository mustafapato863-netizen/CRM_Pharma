"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  ButtonBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {
  CheckRounded,
  KeyboardArrowDownRounded,
  LanguageRounded,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useLocale } from "@/shared/hooks/use-locale";

const languageOptions = [
  { code: "en" as const, label: "English", shortLabel: "EN" },
  { code: "ar" as const, label: "العربية", shortLabel: "ع" },
];

export function LanguageSwitcher() {
  const theme = useTheme();
  const { locale, setLocale, messages } = useLocale();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const isRtl = theme.direction === "rtl";
  const activeLanguage =
    languageOptions.find((language) => language.code === locale) ??
    languageOptions[0];

  return (
    <>
      <ButtonBase
        aria-label={messages.language.switchTo}
        aria-controls={open ? "language-menu" : undefined}
        aria-haspopup="menu"
        aria-expanded={open ? "true" : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          height: 34,
          minWidth: 34,
          borderRadius: 1.5,
          px: { xs: 0.5, sm: 0.75 },
          gap: 0.375,
          color: "text.primary",
          whiteSpace: "nowrap",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <LanguageRounded sx={{ fontSize: 18, color: "primary.main" }} />
        <Typography
          variant="body2"
          sx={{
            display: { xs: "none", sm: "block" },
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: "0.05em",
            lineHeight: 1,
          }}
        >
          {activeLanguage.shortLabel}
        </Typography>
        <KeyboardArrowDownRounded
          sx={{
            display: { xs: "none", sm: "block" },
            fontSize: 16,
            color: "text.secondary",
          }}
        />
      </ButtonBase>

      <Menu
        id="language-menu"
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
              minWidth: 172,
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
        {languageOptions.map((language) => {
          const selected = language.code === locale;
          return (
            <MenuItem
              key={language.code}
              selected={selected}
              onClick={() => {
                if (language.code !== locale) {
                  setLocale(language.code);
                  router.refresh();
                }
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
                <LanguageRounded fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: selected ? 700 : 500 }}
                  >
                    {language.label}
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
