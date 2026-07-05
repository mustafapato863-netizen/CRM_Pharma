"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BatchForm } from "./batch-form";
import { createBatchAction, updateBatchAction } from "../actions/batch-actions";
import type { BatchFormValues } from "../types";

export function BatchEditor({
  mode,
  defaultValues,
  products,
  batchId,
}: {
  mode: "create" | "edit";
  defaultValues: BatchFormValues;
  products: Array<{ id: string; code: string; name: string }>;
  batchId?: string;
}) {
  const router = useRouter();
  const t = useTranslations("batches");
  const actions = useTranslations("actions");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <BatchForm
      defaultValues={defaultValues}
      products={products}
      actionLabel={pending ? actions("saving") : mode === "create" ? t("create") : t("saveChanges")}
      error={error}
      onSubmit={(values) => {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => formData.set(key, value));
        if (batchId) formData.set("id", batchId);

        startTransition(async () => {
          const result =
            mode === "create"
              ? await createBatchAction({}, formData)
              : await updateBatchAction({}, formData);

          if (result?.success) {
            router.push("/batches");
            router.refresh();
          } else if (result?.error) {
            setError(result.error);
          }
        });
      }}
    />
  );
}
