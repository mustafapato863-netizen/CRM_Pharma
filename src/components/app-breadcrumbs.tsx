"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumbs,
  Link as MuiLink,
  Typography,
} from "@mui/material";
import NavigateNextRounded from "@mui/icons-material/NavigateNextRounded";
import { useLocale } from "@/shared/hooks/use-locale";

const labels: Record<string, string> = {
  dashboard: "sidebar.dashboard",
  products: "sidebar.products",
  batches: "sidebar.batches",
  parties: "sidebar.parties",
  stock: "sidebar.stock",
  inventory: "sidebar.inventory",
  movements: "sidebar.movements",
  purchases: "sidebar.purchases",
  sales: "sidebar.sales",
  payments: "sidebar.payments",
  returns: "sidebar.returns",
  ledger: "sidebar.ledger",
  reports: "sidebar.reports",
  users: "sidebar.users",
  settings: "sidebar.settings",
  backup: "sidebar.backup",
  maintenance: "sidebar.maintenance",
  "expiry-alerts": "sidebar.expiryAlerts",
  new: "products.create",
  edit: "actions.edit",
};

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const { messages } = useLocale();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1 && segments[0] === "dashboard") return null;

  const crumbs = [
    { label: messages.sidebar.dashboard, href: "/dashboard" },
    ...segments
      .filter((segment) => segment !== "dashboard")
      .map((segment, index, visibleSegments) => {
        const href = `/${visibleSegments.slice(0, index + 1).join("/")}`;
        return {
          label: labelFor(segment, messages),
          href: canLink(segment) ? href : undefined,
        };
      }),
  ];

  return (
    <Breadcrumbs
      aria-label={messages.common.navigation}
      separator={<NavigateNextRounded fontSize="small" />}
      sx={{ color: "text.secondary", fontSize: 13 }}
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return isLast ? (
          <Typography key={`${crumb.label}-${index}`} variant="body2" color="text.primary" sx={{ fontWeight: 700 }}>
            {crumb.label}
          </Typography>
        ) : crumb.href ? (
          <MuiLink
            key={crumb.href}
            component={Link}
            href={crumb.href}
            underline="hover"
            color="inherit"
            sx={{ fontSize: 13, fontWeight: 600 }}
          >
            {crumb.label}
          </MuiLink>
        ) : (
          <Typography key={`${crumb.label}-${index}`} variant="body2" color="text.secondary">
            {crumb.label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}

function canLink(segment: string) {
  return segment !== "inventory" && !/^[0-9a-f-]{8,}$/i.test(segment);
}

function labelFor(segment: string, messages: Record<string, any>) {
  const key = labels[segment];

  if (key) {
    return key.split(".").reduce((value, part) => value?.[part], messages) ?? segment;
  }

  if (/^[0-9a-f-]{8,}$/i.test(segment)) {
    return messages.actions.viewDetails;
  }

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
