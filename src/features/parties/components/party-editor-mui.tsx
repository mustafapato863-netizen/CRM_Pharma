"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { createPartyAction, updatePartyAction } from "../actions/party-actions";
import type { PartyFormValues } from "../types";
import { PartyFormMUI } from "./party-form-mui";
import { useTranslations } from "next-intl";

export function PartyEditorMUI({
  mode,
  defaultValues,
  partyId,
}: {
  mode: "create" | "edit";
  defaultValues: PartyFormValues;
  partyId?: string;
}) {
  const router = useRouter();
  const t = useTranslations("parties");
  const actions = useTranslations("actions");
  const common = useTranslations("common");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [warningOpen, setWarningOpen] = useState(false);
  const [duplicatePayload, setDuplicatePayload] = useState<{ values: PartyFormValues; warning: string } | null>(null);

  function submit(values: PartyFormValues, allowPotentialDuplicate = false) {
    const formData = new FormData();
    if (partyId) formData.set("id", partyId);
    formData.set("code", values.code ?? "");
    formData.set("name", values.name);
    formData.set("nameEn", values.nameEn ?? "");
    formData.set("type", values.type);
    formData.set("mobile", values.mobile ?? "");
    formData.set("phone", values.phone ?? "");
    formData.set("email", values.email ?? "");
    formData.set("address", values.address ?? "");
    formData.set("city", values.city ?? "");
    formData.set("taxNumber", values.taxNumber ?? "");
    formData.set("commercialRegister", values.commercialRegister ?? "");
    formData.set("notes", values.notes ?? "");
    formData.set("openingBalance", String(values.openingBalance ?? "0"));
    formData.set("isActive", values.isActive ? "on" : "");
    if (allowPotentialDuplicate) formData.set("allowPotentialDuplicate", "on");

    startTransition(async () => {
      const result = mode === "create" ? await createPartyAction({}, formData) : await updatePartyAction({}, formData);
      if (result?.warning) {
        setDuplicatePayload({ values, warning: result.warning });
        setWarningOpen(true);
        return;
      }

      if (result?.success) {
        router.push("/parties");
        router.refresh();
      } else if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <PartyFormMUI
        defaultValues={defaultValues}
        actionLabel={pending ? actions("saving") : mode === "create" ? t("create") : t("update")}
        error={error}
        onSubmit={(values) => submit(values)}
      />

      <Dialog open={warningOpen} onClose={() => setWarningOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("duplicateCheck")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="warning">{duplicatePayload?.warning ?? t("duplicateReview")}</Alert>
            {duplicatePayload ? (
              <Stack spacing={1}>
                {[
                  [common("name"), duplicatePayload.values.name],
                  [t("mobile"), duplicatePayload.values.mobile || "-"],
                  [t("taxNumber"), duplicatePayload.values.taxNumber || "-"],
                ].map(([label, value]) => (
                  <Stack key={label} direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarningOpen(false)}>{actions("cancel")}</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!duplicatePayload) return;
              submit(duplicatePayload.values, true);
              setWarningOpen(false);
              setDuplicatePayload(null);
            }}
          >
            {t("saveAnyway")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
