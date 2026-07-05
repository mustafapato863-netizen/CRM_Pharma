"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Avatar,
  Box,
  ButtonBase,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AccountCircleOutlined,
  KeyboardArrowDownRounded,
  LogoutRounded,
  MenuRounded,
  SearchRounded,
  SettingsOutlined,
  KeyboardArrowRightRounded,
  KeyboardArrowLeftRounded,
  AppShortcutRounded,
} from "@mui/icons-material";
import { signOut } from "next-auth/react";

import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { useLocale } from "@/shared/hooks/use-locale";

type NavbarProps = {
  userName?: string | null;
  onMenuClick: () => void;
};

export function Navbar({ userName, onMenuClick }: NavbarProps) {
  const { messages } = useLocale();
  const theme = useTheme();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  const isMenuOpen = Boolean(anchorEl);
  const isRtl = theme.direction === "rtl";
  const displayName = userName?.trim() || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  const searchableRoutes = [
    { title: "Dashboard", titleAr: "لوحة التحكم - الإحصائيات", path: "/dashboard", desc: "Main metrics, sales & purchase charts", descAr: "المؤشرات الرئيسية ورسوم البيع والشراء" },
    { title: "Products & Catalog", titleAr: "المنتجات والمستودع", path: "/products", desc: "View catalog, stock levels, add new drug", descAr: "عرض الأصناف، مستويات المخزون، وإضافة دواء" },
    { title: "Expiry Alerts", titleAr: "تنبيهات صلاحية الأدوية", path: "/expiry-alerts", desc: "Check expired & near expiry batches", descAr: "متابعة الأدوية منتهية الصلاحية والقريبة" },
    { title: "Ledger Accounts", titleAr: "دفتر الأستاذ والحسابات", path: "/ledger", desc: "Financial ledger timeline & entries", descAr: "كشف معاملات الصندوق والديون والعملاء" },
    { title: "Payments (Receipts / Spendings)", titleAr: "المدفوعات والمقبوضات المالية", path: "/payments", desc: "Collect customer debt, pay suppliers", descAr: "سندات القبض من العملاء وسندات الصرف للموردين" },
    { title: "Sales Invoices", titleAr: "فواتير المبيعات ونقاط البيع", path: "/sales", desc: "Create sales invoices, customer loyalty", descAr: "تسجيل فواتير المبيعات ونقاط الولاء" },
    { title: "Purchase Invoices", titleAr: "فواتير المشتريات وإدخل مخزن", path: "/purchases", desc: "Create purchase invoices, cost prices", descAr: "تسجيل فواتير المشتريات وتكلفة الباتشات" },
    { title: "Returns (Sales & Purchases)", titleAr: "مرتجع المبيعات والمشتريات", path: "/returns", desc: "Process refunds & return lines", descAr: "تسجيل مرتجع مبيعات أو مشتريات وتحديث الحساب" },
    { title: "Reports Center", titleAr: "مركز التقارير الإحصائية", path: "/reports", desc: "Export stock, low stock, movements reports", descAr: "تصدير تقارير الجرد والمخزن والحركات المالية" },
    { title: "Inventory Movements", titleAr: "حركة حركات المخزون التفصيلية", path: "/inventory/movements", desc: "Audit stock in, out, damaged records", descAr: "سجلات جرد الحركات والمستندات المخزنية" },
    { title: "Parties (Customers & Suppliers)", titleAr: "العملاء والموردين (الشركاء)", path: "/parties", desc: "Manage client details, supplier balance status", descAr: "إدارة جهات الاتصال والحسابات للعملاء والموردين" },
    { title: "Users & Permissions", titleAr: "إدارة المستخدمين والموظفين", path: "/users", desc: "Configure system admin & staff roles", descAr: "إدارة صلاحيات العاملين والمدراء بالصيدلية" },
    { title: "Settings & Backups", titleAr: "الإعدادات والنسخ الاحتياطي", path: "/settings", desc: "Backup database, edit pharmacy info", descAr: "عمل نسخة احتياطية وتغيير الاسم والعملة" },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const cleanArabic = (text: string) => {
    return text
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/[\u064B-\u065F]/g, "") // remove tashkeel
      .toLowerCase();
  };

  const filteredRoutes = searchableRoutes.filter(route => {
    if (!searchQuery) return true;
    const query = cleanArabic(searchQuery.toLowerCase());
    const matchTitleEn = route.title.toLowerCase().includes(query);
    const matchTitleAr = cleanArabic(route.titleAr).includes(query);
    const matchDescEn = route.desc.toLowerCase().includes(query);
    const matchDescAr = cleanArabic(route.descAr).includes(query);
    return matchTitleEn || matchTitleAr || matchDescEn || matchDescAr;
  });

  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        top: 0,
        zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
        color: "text.primary",
        bgcolor: "background.paper",
        backgroundImage: `linear-gradient(
          100deg,
          color-mix(in srgb, var(--mui-palette-primary-main) 5%, transparent) 0%,
          transparent 36%,
          color-mix(in srgb, var(--mui-palette-secondary-main) 4%, transparent) 100%
        )`,
        backdropFilter: "blur(14px) saturate(125%)",
        WebkitBackdropFilter: "blur(14px) saturate(125%)",
        borderRadius: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow:
          "0 8px 24px color-mix(in srgb, var(--mui-palette-text-primary) 5%, transparent)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, md: 64 },
          px: { xs: 1.5, sm: 2, lg: 3 },
          gap: { xs: 0.75, md: 1.25 },
          "&.MuiToolbar-root": {
            minHeight: { xs: 56, md: 64 },
          },
        }}
      >
        <Tooltip title={messages.common.navigation}>
          <IconButton
            aria-label={messages.common.navigation}
            onClick={onMenuClick}
            edge="start"
            size="small"
            sx={{
              display: { lg: "none" },
              width: 36,
              height: 36,
              borderRadius: 1.5,
              color: "text.primary",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <MenuRounded fontSize="small" />
          </IconButton>
        </Tooltip>

        <TextField
          size="small"
          placeholder={messages.navbar.searchPlaceholder}
          onClick={() => setPaletteOpen(true)}
          sx={{
            display: { xs: "none", md: "block" },
            flex: 1,
            maxWidth: { md: 330, lg: 380 },
            minWidth: 240,
            cursor: "pointer",
            "& .MuiOutlinedInput-root": {
              height: 36,
              borderRadius: 1.5,
              bgcolor: "background.default",
              cursor: "pointer",
              transition:
                "background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
              "& fieldset": { borderColor: "divider" },
              "&:hover": {
                bgcolor: "background.paper",
                "& fieldset": { borderColor: "primary.main" },
              },
            },
            "& .MuiInputBase-input": { fontSize: 12, cursor: "pointer" },
          }}
          slotProps={{
            input: {
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded
                    sx={{ fontSize: 17, color: "text.secondary" }}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box
                    component="kbd"
                    dir="ltr"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 31,
                      height: 18,
                      px: 0.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 0.75,
                      bgcolor: "background.paper",
                      color: "text.secondary",
                      fontSize: 9,
                      fontFamily: "inherit",
                      lineHeight: 1,
                    }}
                  >
                    Ctrl /
                  </Box>
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.25, sm: 0.5 },
            minWidth: 0,
            flexShrink: 0,
          }}
        >
                  <IconButton
            onClick={() => setPaletteOpen(true)}
            sx={{ display: { xs: "flex", md: "none" } }}
            title={messages.navbar.searchPlaceholder}
          >
            <SearchRounded />
          </IconButton>
          <ThemeToggle />
          <LanguageSwitcher />

          {showInstallBtn && (
            <Tooltip title={isRtl ? "تحميل التطبيق كبرنامج" : "Install App locally"}>
              <IconButton onClick={handleInstallClick} color="primary">
                <AppShortcutRounded />
              </IconButton>
            </Tooltip>
          )}

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              display: { xs: "none", sm: "block" },
              height: 24,
              alignSelf: "center",
              mx: 0.75,
            }}
          />

          <ButtonBase
            id="account-menu-trigger"
            aria-controls={isMenuOpen ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={isMenuOpen ? "true" : undefined}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={{
              minHeight: 40,
              px: 0.5,
              gap: 0.875,
              borderRadius: 1.5,
              color: "text.primary",
              textAlign: "inherit",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: 13,
                fontWeight: 800,
                color: "primary.contrastText",
                background:
                  "linear-gradient(135deg, var(--mui-palette-primary-main), var(--mui-palette-secondary-main))",
                boxShadow:
                  "0 6px 14px color-mix(in srgb, var(--mui-palette-primary-main) 28%, transparent)",
              }}
            >
              {initial}
            </Avatar>

            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                minWidth: 0,
                maxWidth: 132,
              }}
            >
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 800, lineHeight: 1.2, textAlign: "start" }}
              >
                {displayName}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 0.125,
                  lineHeight: 1.2,
                  textAlign: "start",
                }}
              >
                {messages.common.admin}
              </Typography>
            </Box>

            <KeyboardArrowDownRounded
              sx={{
                display: { xs: "none", sm: "block" },
                color: "text.secondary",
                fontSize: 18,
              }}
            />
          </ButtonBase>
        </Box>
      </Toolbar>

      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
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
              minWidth: 220,
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
        <MenuItem
          component={Link}
          href="/settings"
          onClick={handleCloseMenu}
          sx={{ borderRadius: 1.5 }}
        >
          <ListItemIcon>
            <SettingsOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={messages.navbar.settings} />
        </MenuItem>
        <MenuItem
          component={Link}
          href="/users"
          onClick={handleCloseMenu}
          sx={{ borderRadius: 1.5 }}
        >
          <ListItemIcon>
            <AccountCircleOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={messages.navbar.manageUsers} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          sx={{
            borderRadius: 1.5,
            color: "error.main",
            "& .MuiListItemIcon-root": { color: "error.main" },
          }}
        >
          <ListItemIcon>
            <LogoutRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={messages.navbar.logOut} />
        </MenuItem>
      </Menu>

      {/* Global Navigation Command Palette */}
      <Dialog
        open={paletteOpen}
        onClose={() => {
          setPaletteOpen(false);
          setSearchQuery("");
        }}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3.5,
            bgcolor: "background.paper",
            backgroundImage: "linear-gradient(135deg, color-mix(in srgb, var(--mui-palette-primary-main) 4%, transparent), transparent 60%)",
            backdropFilter: "blur(12px)",
            border: "1px solid",
            borderColor: "divider",
            maxHeight: "calc(100vh - 120px)",
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", bgcolor: "action.hover" }}>
          <TextField
            autoFocus
            fullWidth
            size="medium"
            placeholder={messages.navbar.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded color="primary" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <DialogContent sx={{ p: 0, maxHeight: 400, overflowY: "auto" }}>
          {filteredRoutes.length > 0 ? (
            <List sx={{ py: 1 }}>
              {filteredRoutes.map((route) => (
                <ListItem key={route.path} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setPaletteOpen(false);
                      setSearchQuery("");
                      router.push(route.path);
                    }}
                    sx={{
                      px: 2.5,
                      py: 1.5,
                      borderBottom: "1px solid",
                      borderColor: "action.hover",
                      "&:hover": {
                        bgcolor: "action.hover",
                        "& .nav-arrow": {
                          transform: isRtl ? "translateX(-4px)" : "translateX(4px)",
                          color: "primary.main",
                        },
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {isRtl ? route.titleAr : route.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                          {isRtl ? route.descAr : route.desc}
                        </Typography>
                      }
                    />
                    <Box
                      className="nav-arrow"
                      sx={{
                        color: "text.disabled",
                        transition: "transform 150ms ease, color 150ms ease",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {isRtl ? <KeyboardArrowLeftRounded /> : <KeyboardArrowRightRounded />}
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {isRtl ? "لا توجد نتائج مطابقة لبحثك." : "No matching routes found."}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </AppBar>
  );
}
