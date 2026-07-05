"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "../actions/product-actions";
import { ProductFormMui } from "./product-form-mui";
import type { ProductFormValues } from "../types";
import { useTranslations } from "next-intl";

export function ProductEditorMui({
  mode,
  defaultValues,
  productId,
}: {
  mode: "create" | "edit";
  defaultValues: ProductFormValues;
  productId?: string;
}) {
  const router = useRouter();
  const t = useTranslations("products");
  const actions = useTranslations("actions");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = (values: ProductFormValues) => {
    const formData = new FormData();
    if (productId) formData.set("id", productId);
    formData.set("code", values.code);
    formData.set("name", values.name);
    formData.set("searchName", values.searchName ?? "");
    formData.set("type", values.type);
    formData.set("unit", values.unit);
    formData.set("isActive", values.isActive ? "on" : "");

    startTransition(async () => {
      const result = mode === "create" ? await createProductAction({}, formData) : await updateProductAction({}, formData);
      if (result?.success) {
        router.push("/products");
        router.refresh();
      } else if (result?.error) {
        setError(result.error);
      }
    });
  };

  return <ProductFormMui defaultValues={defaultValues} actionLabel={pending ? actions("saving") : mode === "create" ? t("create") : t("update")} onSubmit={submit} error={error} />;
}
