import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Stack } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { PageShell } from "@/components/page-shell";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { BatchEditor } from "@/features/batches/components/batch-editor";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("batches");
  return { title: t("new"), description: t("newDescription") };
}

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function NewBatchPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "batchCreate"))
    return <Unauthorized />;

  const [t, actions, products, resolvedSearchParams] = await Promise.all([
    getTranslations("batches"),
    getTranslations("actions"),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true },
      orderBy: [{ code: "asc" }],
    }),
    searchParams ?? Promise.resolve({}),
  ]);

  const requestedProductId = getParam(resolvedSearchParams, "productId");
  const initialProductId = products.some(
    (product) => product.id === requestedProductId,
  )
    ? requestedProductId
    : (products[0]?.id ?? "");

  return (
    <PageShell>
      <Stack spacing={2.25}>
        <AppPageHeader
          title={t("new")}
          description={t("newDescription")}
          breadcrumbs={[
            { label: t("title"), href: "/batches" },
            { label: t("new") },
          ]}
          action={
            <Button
              component={Link}
              href="/batches"
              variant="outlined"
              startIcon={<ArrowBack />}
            >
              {actions("goBack")}
            </Button>
          }
        />
        <BatchEditor
          mode="create"
          products={products}
          defaultValues={{
            productId: initialProductId,
            batchNumber: "",
            expiryDate: "",
            purchaseCost: "",
            openingQty: "0",
          }}
        />
      </Stack>
    </PageShell>
  );
}
