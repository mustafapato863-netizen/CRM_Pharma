import { ProductType } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Stack } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Unauthorized } from "@/components/unauthorized";
import { PageShell } from "@/components/page-shell";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { nextProductCode } from "@/features/products/utils/code";
import { ProductEditorMui } from "@/features/products/components/product-editor-mui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products");
  return { title: t("create"), description: t("newDescription") };
}

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "productsCreate"))
    return <Unauthorized />;

  const [t, actions, latest] = await Promise.all([
    getTranslations("products"),
    getTranslations("actions"),
    prisma.product.findFirst({
      orderBy: { code: "desc" },
      select: { code: true },
    }),
  ]);

  return (
    <PageShell>
      <Stack spacing={2.25}>
        <AppPageHeader
          title={t("add")}
          description={t("newDescription")}
          breadcrumbs={[
            { label: t("title"), href: "/products" },
            { label: t("add") },
          ]}
          action={
            <Button
              component={Link}
              href="/products"
              variant="outlined"
              startIcon={<ArrowBack />}
            >
              {actions("goBack")}
            </Button>
          }
        />
        <ProductEditorMui
          mode="create"
          defaultValues={{
            code: nextProductCode(latest?.code),
            name: "",
            searchName: "",
            type: ProductType.MEDICINE,
            unit: "",
            isActive: true,
          }}
        />
      </Stack>
    </PageShell>
  );
}
