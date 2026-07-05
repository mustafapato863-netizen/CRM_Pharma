"use client";

import { useState, useTransition } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useTranslations } from "next-intl";
import { deactivateBatchAction } from "../actions/batch-actions";

export function BatchDeleteButton({ batchId }: { batchId: string }) {
  const t = useTranslations("batches");
  const actions = useTranslations("actions");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    const formData = new FormData();
    formData.set("id", batchId);
    startTransition(async () => {
      await deactivateBatchAction(formData);
      setOpen(false);
    });
  }

  return (
    <>
      <Button size="small" variant="outlined" color="warning" onClick={() => setOpen(true)}>
        {t("deactivate")}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{t("deactivateTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("deactivateDescription")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{actions("cancel")}</Button>
          <Button color="warning" variant="contained" onClick={confirm} disabled={pending}>
            {pending ? actions("saving") : t("deactivate")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
