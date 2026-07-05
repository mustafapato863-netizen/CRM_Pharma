export type ReportKind =
  | "stock"
  | "inventory"
  | "low-stock"
  | "near-expiry"
  | "expired"
  | "movements"
  | "parties"
  | "ledger";

export type ReportRange = {
  from: string;
  to: string;
};

export type ReportRow = {
  id: string;
  date: string;
  reference: string;
  title: string;
  category: string;
  party: string;
  product: string;
  batch: string;
  quantity: string;
  amount: string;
  balance: string;
  status: string;
  searchText: string;
};

export type ReportSummary = {
  title: string;
  value: string;
  helper: string;
};

export type ReportsPayload = {
  summaries: ReportSummary[];
  stock: ReportRow[];
  inventory: ReportRow[];
  lowStock: ReportRow[];
  nearExpiry: ReportRow[];
  expired: ReportRow[];
  movements: ReportRow[];
  parties: ReportRow[];
  ledger: ReportRow[];
};
