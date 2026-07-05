import { PageSkeleton } from "@/components/page-skeleton";
import { PageShell } from "@/components/page-shell";

export default function Loading() {
  return (
    <PageShell>
      <PageSkeleton />
    </PageShell>
  );
}
