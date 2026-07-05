import { Card, CardContent, Skeleton, Stack } from "@mui/material";
import { PageShell } from "@/components/page-shell";

export default function Loading() {
  return (
    <PageShell>
      <Stack spacing={2.25}>
        <Skeleton variant="rounded" height={140} />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Skeleton variant="rounded" height={112} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={112} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={112} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" height={112} sx={{ flex: 1 }} />
        </Stack>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={52} />
              <Skeleton variant="rounded" height={52} />
              <Skeleton variant="rounded" height={360} />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </PageShell>
  );
}
