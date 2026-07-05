"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useLocale, useMessages } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Grid,
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Drawer,
  IconButton,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterAlt as FilterAltIcon,
  Close as CloseIcon,
  Visibility as EyeIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Mail as MailIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

import { EmptyState } from "@/components/empty-state";
import { showError, showSuccess } from "@/shared/lib/toast";
import type { PermissionMap } from "@/lib/auth";
import {
  createUserAction,
  deactivateUserAction,
  updateUserAction,
} from "../actions/user-actions";

type UserRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  permissions: PermissionMap;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  activity: string;
  sessionCount: number;
  roleLabel: string;
};

type UserFormMode = "create" | "edit" | "reset-password";

const allPermissions = [
  "dashboard",
  "products",
  "batchView",
  "batchCreate",
  "batchEdit",
  "batchDelete",
  "parties",
  "partiesExport",
  "stockInView",
  "stockInCreate",
  "stockOutView",
  "stockOutCreate",
  "stock",
  "ledger",
  "reports",
  "expiryAlerts",
  "users",
  "settings",
  "backupExport",
] as const;

function permissionSummary(
  permissions: PermissionMap,
  labels: Record<string, string>,
) {
  const granted = allPermissions.filter((key) => permissions[key]);
  return {
    preview: granted.slice(0, 2).map((key) => labels[key] ?? key),
    more: Math.max(0, granted.length - 2),
    full: granted.map((key) => labels[key] ?? key),
  };
}

export function UsersPageClient({ users }: { users: UserRow[] }) {
  const messages = useMessages() as Record<string, any>;
  const userText = useMemo(
    () => (messages.users ?? {}) as Record<string, string>,
    [messages],
  );
  const commonText = useMemo(
    () => (messages.common ?? {}) as Record<string, string>,
    [messages],
  );
  const format = useCallback(
    (template: string, values?: Record<string, string | number>) => {
      if (!values) return template;
      return Object.entries(values).reduce(
        (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
        template,
      );
    },
    [],
  );
  const t = useCallback(
    (key: string, values?: Record<string, string | number>) =>
      format(userText[key] ?? key, values),
    [format, userText],
  );
  const common = useCallback(
    (key: string, values?: Record<string, string | number>) =>
      format(commonText[key] ?? key, values),
    [commonText, format],
  );
  const currentLocale = useLocale() as "en" | "ar";
  const permissionDisplayNames = useMemo<Record<string, string>>(
    () => ({
      dashboard: t("permissionDashboard"),
      products: t("permissionProducts"),
      batchView: t("permissionBatchView"),
      batchCreate: t("permissionBatchCreate"),
      batchEdit: t("permissionBatchEdit"),
      batchDelete: t("permissionBatchDelete"),
      parties: t("permissionParties"),
      partiesExport: t("permissionPartiesExport"),
      stockInView: t("permissionStockInView"),
      stockInCreate: t("permissionStockInCreate"),
      stockOutView: t("permissionStockOutView"),
      stockOutCreate: t("permissionStockOutCreate"),
      stock: t("permissionStock"),
      ledger: t("permissionLedger"),
      reports: t("permissionReports"),
      expiryAlerts: t("permissionExpiryAlerts"),
      users: t("permissionUsers"),
      settings: t("permissionSettings"),
      backupExport: t("permissionBackupExport"),
    }),
    [t],
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSelected = searchParams.get("selected") ?? "";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [permissionGroup, setPermissionGroup] = useState("");
  const [sortBy, setSortBy] = useState("lastActivity");

  const [selectedUserId, setSelectedUserId] = useState(initialSelected);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [invitePending, setInvitePending] = useState(false);
  const [editPending, setEditPending] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [activeDialogUserId, setActiveDialogUserId] = useState<string | null>(
    null,
  );
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormMode, setUserFormMode] = useState<UserFormMode>("create");

  // Dialog Form fields state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formPermissions, setFormPermissions] = useState<
    Record<string, boolean>
  >({});

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;
  const activeDialogUser =
    users.find((user) => user.id === activeDialogUserId) ?? null;
  const editingUser = users.find((user) => user.id === editingUserId) ?? null;

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      if (status === "active" && !user.isActive) return false;
      if (status === "inactive" && user.isActive) return false;
      if (role && user.roleLabel !== role) return false;
      if (
        permissionGroup &&
        !user.permissions[permissionGroup as keyof PermissionMap]
      )
        return false;
      if (
        query &&
        !`${user.name} ${user.email} ${user.roleLabel} ${user.activity}`
          .toLowerCase()
          .includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [users, search, status, role, permissionGroup]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "createdAt") return b.createdAt.localeCompare(a.createdAt);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [filteredUsers, sortBy]);

  const summary = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((user) => user.isActive).length,
      inactive: users.filter((user) => !user.isActive).length,
      pending: 0,
    };
  }, [users]);

  const setSelected = (id: string) => {
    setSelectedUserId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", id);
    router.replace(`/users?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setRole("");
    setPermissionGroup("");
    setSortBy("lastActivity");
  };

  const getRoleLabel = (roleStr: string) => {
    if (roleStr === "Owner") return t("owner");
    if (roleStr === "Partner") return t("partner");
    if (roleStr === "Staff") return t("staff");
    return t("viewer");
  };

  const handlePermissionChange = (perm: string, checked: boolean) => {
    setFormPermissions((prev) => ({
      ...prev,
      [perm]: checked,
    }));
  };

  const setAllPermissions = (checked: boolean) => {
    const updated: Record<string, boolean> = {};
    allPermissions.forEach((p) => {
      updated[p] = checked;
    });
    setFormPermissions(updated);
  };

  const openInvite = () => {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormIsActive(true);
    setFormPermissions({});
    setUserFormMode("create");
    setInviteOpen(true);
  };

  const openEdit = (user: UserRow, mode: UserFormMode = "edit") => {
    setEditingUserId(user.id);
    setUserFormMode(mode);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormIsActive(user.isActive);

    const perms: Record<string, boolean> = {};
    allPermissions.forEach((p) => {
      perms[p] = Boolean(user.permissions[p]);
    });
    setFormPermissions(perms);
    setEditOpen(true);
  };

  async function handleInviteSubmit(event: FormEvent) {
    event.preventDefault();
    if (invitePending) return;

    const formData = new FormData();
    formData.set("name", formName);
    formData.set("email", formEmail);
    formData.set("password", formPassword);
    if (formIsActive) formData.set("isActive", "on");

    Object.entries(formPermissions).forEach(([p, val]) => {
      if (val) formData.set(p, "on");
    });

    setInvitePending(true);
    try {
      const result = await createUserAction({}, formData);
      if (result?.error) {
        showError(result.error);
        return;
      }
      showSuccess(t("userCreated"));
      setInviteOpen(false);
      router.refresh();
    } finally {
      setInvitePending(false);
    }
  }

  async function handleEditSubmit(event: FormEvent) {
    event.preventDefault();
    if (editPending || !editingUser) return;

    const formData = new FormData();
    formData.set("id", editingUser.id);
    formData.set("name", formName);
    formData.set("email", formEmail);
    if (formPassword) formData.set("password", formPassword);

    if (userFormMode === "reset-password") {
      formData.set("name", editingUser.name);
      formData.set("email", editingUser.email);
    } else {
      if (formIsActive) formData.set("isActive", "on");
      Object.entries(formPermissions).forEach(([p, val]) => {
        if (val) formData.set(p, "on");
      });
    }

    setEditPending(true);
    try {
      const result = await updateUserAction({}, formData);
      if (result?.error) {
        showError(result.error);
        return;
      }
      showSuccess(
        userFormMode === "reset-password"
          ? t("passwordResetMsg")
          : t("userUpdated"),
      );
      setEditOpen(false);
      router.refresh();
    } finally {
      setEditPending(false);
    }
  }

  async function handleDeactivateSubmit() {
    if (!activeDialogUser) return;
    if (savingUserId) return;

    setSavingUserId(activeDialogUser.id);
    try {
      if (activeDialogUser.isActive) {
        const formData = new FormData();
        formData.set("id", activeDialogUser.id);
        const result = await deactivateUserAction(formData);
        if (result?.error) {
          showError(result.error);
          return;
        }
        showSuccess(t("deactivatedMsg"));
        if (selectedUserId === activeDialogUser.id) setSelectedUserId("");
      } else {
        const formData = new FormData();
        formData.set("id", activeDialogUser.id);
        formData.set("name", activeDialogUser.name);
        formData.set("email", activeDialogUser.email);
        formData.set("isActive", "on");
        allPermissions.forEach((p) => {
          if (activeDialogUser.permissions[p]) {
            formData.set(p, "on");
          }
        });
        const result = await updateUserAction({}, formData);
        if (result?.error) {
          showError(result.error);
          return;
        }
        showSuccess(t("reactivatedMsg"));
      }
      setActiveDialogUserId(null);
      router.refresh();
    } finally {
      setSavingUserId(null);
    }
  }

  const getInitials = (nameStr: string) => {
    return (
      nameStr
        .split(" ")
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U"
    );
  };

  return (
    <Stack spacing={2.25}>
      {/* Page Toolbar / Actions */}
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            onClick={openInvite}
            startIcon={<AddIcon />}
          >
            {t("inviteUser")}
          </Button>
          <Button variant="outlined" color="primary">
            {t("exportUsers")}
          </Button>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<FilterAltIcon />}
          onClick={clearFilters}
        >
          {t("clearFilters")}
        </Button>
      </Stack>

      {/* Summary Stat Grid */}
      <Grid container spacing={2}>
        {[
          {
            label: t("totalUsers"),
            value: summary.total,
            icon: <UsersRoundIcon />,
          },
          {
            label: t("activeUsers"),
            value: summary.active,
            icon: <CheckCircleIcon />,
          },
          {
            label: t("pendingInvitations"),
            value: summary.pending,
            icon: <MailIcon />,
          },
          {
            label: t("inactiveUsers"),
            value: summary.inactive,
            icon: <BlockIcon />,
          },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card variant="glass">
              <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {card.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.75 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: "action.selected",
                      color: "primary.main",
                      width: 38,
                      height: 38,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Info notice bar */}
      <Card
        variant="outlined"
        sx={{
          bgcolor: "action.hover",
          borderColor: "divider",
          p: 1.75,
        }}
      >
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            color="info.main"
            sx={{ fontWeight: 500 }}
          >
            {t("noPendingNotice")}
          </Typography>
          <Button size="small" variant="text" color="info">
            {t("viewInvitations")}
          </Button>
        </Stack>
      </Card>

      {/* Filter Card */}
      <Card variant="outlined" sx={{ p: 1.75 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label={t("role")}
            >
              <MenuItem value="">{t("allRoles")}</MenuItem>
              <MenuItem value="Owner">{t("owner")}</MenuItem>
              <MenuItem value="Partner">{t("partner")}</MenuItem>
              <MenuItem value="Staff">{t("staff")}</MenuItem>
              <MenuItem value="Viewer">{t("viewer")}</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label={t("status")}
            >
              <MenuItem value="">{t("allStatuses")}</MenuItem>
              <MenuItem value="active">{t("active")}</MenuItem>
              <MenuItem value="inactive">{t("inactive")}</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              value={permissionGroup}
              onChange={(e) => setPermissionGroup(e.target.value)}
              label={t("permissionGroup")}
            >
              <MenuItem value="">{t("permissionGroup")}</MenuItem>
              {allPermissions.map((permission) => (
                <MenuItem key={permission} value={permission}>
                  {permissionDisplayNames[permission] ?? permission}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label={common("status")}
            >
              <MenuItem value="lastActivity">{t("sortLastActivity")}</MenuItem>
              <MenuItem value="createdAt">{t("sortCreatedAt")}</MenuItem>
              <MenuItem value="name">{t("sortName")}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Users List Data Card */}
      <Card variant="outlined" sx={{ overflow: "hidden" }}>
        {sortedUsers.length ? (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                    {t("avatar")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                    {t("fullName")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                    {t("email")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                    {t("role")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                    {t("status")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                    {t("lastActivity")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                    {t("lastLogin")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                    {t("permissionSummary")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                    {t("sessions")}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, py: 1.5 }}>
                    {t("actions")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedUsers.map((user) => {
                  const summary = permissionSummary(
                    user.permissions,
                    permissionDisplayNames,
                  );
                  return (
                    <TableRow key={user.id} hover>
                      <TableCell sx={{ py: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: 36,
                            height: 36,
                            fontSize: "0.875rem",
                          }}
                        >
                          {getInitials(user.name)}
                        </Avatar>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Button
                          variant="text"
                          color="primary"
                          onClick={() => setSelected(user.id)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            p: 0,
                            minWidth: 0,
                          }}
                        >
                          {user.name}
                        </Button>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>{user.email}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        {getRoleLabel(user.roleLabel)}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          label={user.isActive ? t("active") : t("inactive")}
                          color={user.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>{user.activity}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        {user.lastLogin ?? "-"}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          useFlexGap
                          sx={{ flexWrap: "wrap" }}
                        >
                          {summary.preview.map((item) => (
                            <Chip
                              key={item}
                              label={item}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {summary.more > 0 ? (
                            <Chip
                              label={t("more", { count: summary.more })}
                              size="small"
                              color="info"
                            />
                          ) : null}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        {user.sessionCount}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{ justifyContent: "center" }}
                        >
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setSelected(user.id)}
                          >
                            <EyeIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openEdit(user)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openEdit(user, "reset-password")}
                          >
                            <LockIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => setActiveDialogUserId(user.id)}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 4 }}>
            <EmptyState
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              ctaLabel={t("inviteUser")}
              ctaHref="/users"
            />
          </Box>
        )}
      </Card>

      {/* Footer Info */}
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <Typography variant="body2" color="text.secondary">
          {t("pageInfo", { page: 1, pages: 1 })}
        </Typography>
        <Chip icon={<SecurityIcon />} label={t("premiumCenter")} size="small" />
      </Stack>

      {/* User Details Drawer */}
      <Drawer
        anchor={currentLocale === "ar" ? "left" : "right"}
        open={!!selectedUser}
        onClose={() => setSelectedUserId("")}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
            border: "none",
            boxShadow: 24,
            p: 2.25,
          },
        }}
      >
        {selectedUser ? (
          <Stack spacing={2.25} sx={{ height: "100%" }}>
            {/* Header */}
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("userDrawer")}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedUser.name}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedUserId("")} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>

            <Divider />

            {/* Profile Content */}
            <Stack spacing={2.5} sx={{ flex: 1, overflowY: "auto" }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "primary.main", width: 50, height: 50 }}>
                  {getInitials(selectedUser.name)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {selectedUser.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => openEdit(selectedUser)}
                >
                  {t("editUser")}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => openEdit(selectedUser, "reset-password")}
                >
                  {t("resetPassword")}
                </Button>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={6}>
                  <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 3 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", fontWeight: 600 }}
                    >
                      {t("role")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, mt: 0.5 }}
                    >
                      {getRoleLabel(selectedUser.roleLabel)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={6}>
                  <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 3 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", fontWeight: 600 }}
                    >
                      {t("sessions")}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, mt: 0.5 }}
                    >
                      {selectedUser.sessionCount}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    fontWeight: 600,
                    display: "block",
                    mb: 1,
                  }}
                >
                  {t("permissionsLabel")}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  useFlexGap
                  sx={{ flexWrap: "wrap" }}
                >
                  {permissionSummary(
                    selectedUser.permissions,
                    permissionDisplayNames,
                  ).full.map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  {t("lastActivity")}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {selectedUser.activity}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  {t("security")}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {t("lastLoginLabel", {
                    date: selectedUser.lastLogin ?? t("never"),
                  })}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        ) : null}
      </Drawer>

      {/* Invite Dialog */}
      <Dialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("inviteUser")}</DialogTitle>
        <form onSubmit={handleInviteSubmit}>
          <DialogContent>
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    required
                    label={t("name")}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    required
                    type="email"
                    label={t("email")}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    required
                    type="password"
                    label={t("password")}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                  />
                </Grid>
                <Grid size={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                      />
                    }
                    label={t("canLogin")}
                    sx={{ height: "100%", mt: 1 }}
                  />
                </Grid>
              </Grid>

              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {t("permissionsLabel")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("grantAllHint")}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setAllPermissions(true)}
                  >
                    {t("selectAll")}
                  </Button>
                </Stack>
              </Box>

              <Grid container spacing={1}>
                {allPermissions.map((perm) => (
                  <Grid key={perm} size={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={Boolean(formPermissions[perm])}
                          onChange={(e) =>
                            handlePermissionChange(perm, e.target.checked)
                          }
                        />
                      }
                      label={permissionDisplayNames[perm] ?? perm}
                      sx={{
                        "& .MuiFormControlLabel-label": { fontSize: "0.75rem" },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setInviteOpen(false)} variant="outlined">
              {t("cancel")}
            </Button>
            <Button type="submit" variant="contained" disabled={invitePending}>
              {invitePending ? t("creating") : t("inviteUser")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit / Password Reset Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {userFormMode === "reset-password"
            ? t("resetPassword")
            : t("editUser")}
        </DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            {editingUser ? (
              <Stack spacing={2.5}>
                {userFormMode !== "reset-password" && (
                  <Grid container spacing={2}>
                    <Grid size={6}>
                      <TextField
                        required
                        label={t("name")}
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                      />
                    </Grid>
                    <Grid size={6}>
                      <TextField
                        required
                        type="email"
                        label={t("email")}
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                )}
                <TextField
                  type="password"
                  label={
                    userFormMode === "reset-password"
                      ? t("newPassword")
                      : t("password")
                  }
                  placeholder={
                    userFormMode === "reset-password"
                      ? t("newPasswordPlaceholder")
                      : t("passwordPlaceholder")
                  }
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  fullWidth
                />

                {userFormMode !== "reset-password" && (
                  <>
                    <Box
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                        p: 2,
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {t("permissionsLabel")}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t("updateAccessHint")}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setAllPermissions(true)}
                        >
                          {t("selectAll")}
                        </Button>
                      </Stack>
                    </Box>

                    <Grid container spacing={1}>
                      {allPermissions.map((perm) => (
                        <Grid key={perm} size={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={Boolean(formPermissions[perm])}
                                onChange={(e) =>
                                  handlePermissionChange(perm, e.target.checked)
                                }
                              />
                            }
                            label={permissionDisplayNames[perm] ?? perm}
                            sx={{
                              "& .MuiFormControlLabel-label": {
                                fontSize: "0.75rem",
                              },
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Stack>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditOpen(false)} variant="outlined">
              {t("cancel")}
            </Button>
            <Button type="submit" variant="contained" disabled={editPending}>
              {editPending ? t("saving") : t("saveChanges")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Deactivate/Reactivate Confirmation Dialog */}
      <Dialog
        open={!!activeDialogUserId}
        onClose={() => setActiveDialogUserId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {activeDialogUser?.isActive
            ? t("deactivateTitle")
            : t("reactivateTitle")}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2.5 }}>
            {activeDialogUser?.isActive
              ? t("deactivateDescription")
              : t("reactivateDescription")}
          </Typography>
          {activeDialogUser ? (
            <Grid container spacing={2}>
              <Grid size={6}>
                <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 3 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: "uppercase", fontWeight: 600 }}
                  >
                    {t("user")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {activeDialogUser.name}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 3 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: "uppercase", fontWeight: 600 }}
                  >
                    {t("status")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {activeDialogUser.isActive ? t("active") : t("inactive")}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setActiveDialogUserId(null)}
            variant="outlined"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleDeactivateSubmit}
            color={activeDialogUser?.isActive ? "error" : "primary"}
            variant="contained"
            disabled={!!savingUserId}
          >
            {savingUserId
              ? t("saving")
              : activeDialogUser?.isActive
                ? t("deactivate")
                : t("reactivate")}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

// Simple fallback icon component
function UsersRoundIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
