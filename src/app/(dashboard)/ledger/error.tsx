"use client";

import { ErrorState } from "@/components/error-state";
import { PageShell } from "@/components/page-shell";

export default function LedgerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell>
      <ErrorState
        title="Unable to load ledger"
        description={error.message || "Please try again in a moment."}
        onRetry={reset}
      />
    </PageShell>
  );
}
