"use client";

import {
  CalendarMonthOutlined,
  CloseRounded,
  Inventory2Outlined,
} from "@mui/icons-material";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { CreateBatchDialogProps } from "./stock-ui.types";

export function CreateBatchDialog({
  open,
  onOpenChange,
  batchNumber,
  onBatchNumberChange,
  expiryDate,
  onExpiryDateChange,
}: CreateBatchDialogProps) {
  const t = useTranslations("stock");
  const actions = useTranslations("actions");

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: "action.selected",
                color: "primary.main",
              }}
            >
              <Inventory2Outlined fontSize="small" />
            </Avatar>

            <Stack spacing={0.15}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {t("createNewBatch")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("batch")}
              </Typography>
            </Stack>
          </Stack>

          <IconButton
            aria-label={actions("close")}
            onClick={() => onOpenChange(false)}
            size="small"
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            autoFocus
            label={t("batchNumber")}
            value={batchNumber}
            onChange={(event) => onBatchNumberChange(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Inventory2Outlined fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            type="date"
            label={t("expiryDate")}
            value={expiryDate}
            onChange={(event) => onExpiryDateChange(event.target.value)}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthOutlined fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ pt: 1.5 }}>
        <Button onClick={() => onOpenChange(false)}>{actions("close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
