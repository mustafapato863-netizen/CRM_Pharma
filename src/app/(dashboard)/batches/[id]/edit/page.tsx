import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button, Stack } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { Unauthorized } from "@/components/unauthorized";
import { PageShell } from "@/components/page-shell";
import { AppPageHeader } from "@/shared/ui/app-page-header";
import { BatchEditor } from "@/features/batches/components/batch-editor";
import { calculateBatchQuantity } from "@/features/batches/utils/quantity";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("batches");
  return { title: t("edit"), description: t("editDescription") };
}

export default async function EditBatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!hasPermission(session.user.permissions, "batchEdit"))
    return <Unauthorized />;

  const [t, actions, batch, products] = await Promise.all([
    getTranslations("batches"),
    getTranslations("actions"),
    prisma.batch.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, code: true, name: true } },
        stockMovements: { select: { type: true, quantity: true } },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true },
      orderBy: [{ code: "asc" }],
    }),
  ]);

  if (!batch) return notFound();
  const currentQuantity = calculateBatchQuantity({
    openingQty: batch.openingQty,
    stockMovements: batch.stockMovements,
  });

  return (
    <PageShell>
      <Stack spacing={2.25}>
        <AppPageHeader
          title={t("edit")}
          description={t("editDescription")}
          breadcrumbs={[
            { label: t("title"), href: "/batches" },
            {
              label: batch.batchNumber,
              href: `/batches?productId=${batch.productId}`,
            },
            { label: t("edit") },
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
          mode="edit"
          batchId={batch.id}
          products={products}
          defaultValues={{
            productId: batch.productId,
            batchNumber: batch.batchNumber,
            expiryDate: batch.expiryDate
              ? batch.expiryDate.toISOString().slice(0, 10)
              : "",
            purchaseCost: batch.purchaseCost?.toString() ?? "",
            openingQty: batch.openingQty.toString(),
          }}
        />
        <Button
          component={Link}
          href={`/batches?productId=${batch.productId}`}
          variant="text"
          sx={{ alignSelf: "flex-start" }}
        >
          {t("currentQuantity")}: {currentQuantity.toString()}
        </Button>
      </Stack>
    </PageShell>
  );
}
