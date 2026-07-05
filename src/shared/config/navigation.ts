import { routes } from "../constants/routes";

export const navigation = [
  { href: routes.dashboard, label: "Dashboard" },
  { href: routes.stockIn, label: "Stock IN" },
] as const;
