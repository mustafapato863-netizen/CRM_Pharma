import { Card, Skeleton, Stack } from "@mui/material";
import { PageShell } from "@/components/page-shell";

export default function Loading() {
  return (
    <PageShell>
      <Stack spacing={2.25}>
        <Card variant="outlined" sx={{ borderRadius: 3, p: 2.25 }}>
          <Stack spacing={1.5}>
            <Skeleton variant="text" width={180} height={24} />
            <Skeleton variant="text" width="45%" height={44} />
            <Skeleton variant="text" width="70%" height={24} />
          </Stack>
        </Card>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {[0, 1, 2].map((item) => (
            <Card
              key={item}
              variant="outlined"
              sx={{ flex: 1, borderRadius: 3, p: 2.25 }}
            >
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="35%" height={40} />
            </Card>
          ))}
        </Stack>
        <Card variant="outlined" sx={{ borderRadius: 3, p: 1.75 }}>
          <Skeleton variant="rounded" height={520} />
        </Card>
      </Stack>
    </PageShell>
  );
}
