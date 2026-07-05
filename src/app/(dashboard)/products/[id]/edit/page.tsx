import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button, Stack } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Unauthorized } from "@/components/unauthorized";
import { PageShell } from "@/components/page-shell";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { ProductEditorMui } from "@/features/products/components/product-editor-mui";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products");
  return { title: t("edit"), description: t("editDescription") };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "productsEdit"))
    return <Unauthorized />;

  const [t, actions, product] = await Promise.all([
    getTranslations("products"),
    getTranslations("actions"),
    prisma.product.findUnique({ where: { id } }),
  ]);
  if (!product) return notFound();

  return (
    <PageShell>
      <Stack spacing={2.25}>
        <AppPageHeader
          title={t("edit")}
          description={t("editDescription")}
          breadcrumbs={[
            { label: t("title"), href: "/products" },
            { label: product.name, href: `/batches?productId=${product.id}` },
            { label: t("edit") },
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
          mode="edit"
          productId={product.id}
          defaultValues={{
            code: product.code,
            name: product.name,
            searchName: product.searchName,
            type: product.type,
            unit: product.unit,
            isActive: product.isActive,
          }}
        />
      </Stack>
    </PageShell>
  );
}
