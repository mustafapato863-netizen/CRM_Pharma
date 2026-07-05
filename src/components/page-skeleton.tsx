"use client";

import { Box, Card, CardContent, Grid, Skeleton, Stack } from "@mui/material";
import type { GridSize } from "@mui/material/Grid";

// Matches the actual Card treatment used across the app post-redesign
// (elevation, not outlined) so the skeleton's shadow/radius is identical to
// the real content that replaces it — no visual "pop" on load.
const cardVariant = "elevation" as const;

const fadeIn = {
  animation: "pageSkeletonFadeIn 0.25s ease",
  "@keyframes pageSkeletonFadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
};

function HeaderSkeleton() {
  return (
    <Card variant={cardVariant} sx={fadeIn}>
      <CardContent
        sx={{
          p: { xs: 2.5, sm: 3 },
          "&:last-child": { pb: { xs: 2.5, sm: 3 } },
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Skeleton variant="circular" width={44} height={44} />
            <Stack spacing={0.75} sx={{ flex: 1, maxWidth: 320 }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="24%" />
            </Stack>
          </Stack>
          {/* mirrors the h1 page title + body1 description used on every page header */}
          <Skeleton variant="text" width="55%" height={38} />
          <Skeleton variant="text" width="85%" />
          <Skeleton variant="text" width="72%" />
        </Stack>
      </CardContent>
    </Card>
  );
}

function MetricSkeleton() {
  return (
    <Card variant={cardVariant} sx={{ height: "100%", ...fadeIn }}>
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Stack spacing={1} sx={{ flex: 1 }}>
            {/* caption label */}
            <Skeleton variant="text" width="55%" height={16} />
            {/* h2-scale value */}
            <Skeleton variant="text" width="40%" height={32} />
          </Stack>
          {/* circular icon badge, same 44px used by the real stat cards */}
          <Skeleton variant="circular" width={44} height={44} />
        </Stack>
      </CardContent>
    </Card>
  );
}

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  /** Show the search/filter controls row above the table (list pages). Set false for a plain table panel. */
  withToolbar?: boolean;
};

function TableSkeleton({
  rows = 5,
  columns = 5,
  withToolbar = true,
}: TableSkeletonProps) {
  const columnWidth = `${Math.floor(72 / Math.max(columns - 1, 1))}%`;

  return (
    <Card variant={cardVariant} sx={fadeIn}>
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          "&:last-child": { pb: { xs: 2, sm: 2.5 } },
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", flexWrap: "wrap" }}
          >
            <Skeleton variant="text" width={120} height={28} />
            <Box sx={{ flex: 1 }} />
            {withToolbar && (
              <>
                {/* search field — matches the 12px field radius */}
                <Skeleton
                  variant="rounded"
                  width={220}
                  height={40}
                  sx={{ borderRadius: 1.5 }}
                />
                {/* button — matches the 8px button radius */}
                <Skeleton
                  variant="rounded"
                  width={104}
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
              </>
            )}
          </Stack>
          <Stack spacing={1.25}>
            {Array.from({ length: rows }).map((_, row) => (
              <Stack
                key={row}
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <Skeleton
                  variant="rounded"
                  width="32%"
                  height={44}
                  sx={{ borderRadius: 1.5 }}
                />
                {Array.from({ length: Math.max(columns - 1, 0) }).map(
                  (_, col) => (
                    <Skeleton
                      key={col}
                      variant="rounded"
                      width={columnWidth}
                      height={44}
                      sx={{ borderRadius: 1.5 }}
                    />
                  ),
                )}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

type PageSkeletonProps = {
  /** Hide the page-header placeholder for panels that render inside a page that already has one. */
  showHeader?: boolean;
  /** Number of metric/stat cards to preview — set this to match the real page's grid. */
  metricCount?: number;
  /** Responsive column span for each metric card, MUI Grid v2 `size` shorthand. */
  metricColumns?: Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", GridSize>>;
  tableRows?: number;
  tableColumns?: number;
  withTableToolbar?: boolean;
};

export function PageSkeleton({
  showHeader = true,
  metricCount = 3,
  metricColumns = { xs: 12, md: 4 },
  tableRows = 5,
  tableColumns = 5,
  withTableToolbar = true,
}: PageSkeletonProps = {}) {
  return (
    <Stack spacing={2.25}>
      {showHeader && <HeaderSkeleton />}
      {metricCount > 0 && (
        <Grid container spacing={2}>
          {Array.from({ length: metricCount }).map((_, index) => (
            <Grid key={index} size={metricColumns}>
              <MetricSkeleton />
            </Grid>
          ))}
        </Grid>
      )}
      <TableSkeleton
        rows={tableRows}
        columns={tableColumns}
        withToolbar={withTableToolbar}
      />
    </Stack>
  );
}
