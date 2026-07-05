import type { KeyboardEvent, ReactNode } from "react";
import type { StockInFormValues, StockInRow } from "../types";
import type { StockOutFormValues, StockOutRow } from "../types/stock-out";

/**
 * Shared UI contracts for the stock feature.
 *
 * Keep database/domain types in ../types and ../types/stock-out.
 * This file owns only the shapes that are passed between stock UI components.
 */

export type StockMovementType =
  "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT_INCREASE" | "ADJUSTMENT_DECREASE";

export type StockMovementMode = "in" | "out";

export type StockProductOption = {
  id: string;
  code: string;
  name: string;
  searchName: string;
  unit?: string;
};

export type StockQuickEntryProductOption = StockProductOption & {
  unit: string;
};

export type StockBatchOption = {
  id: string;
  batchNumber: string;
  expiryDate?: string | null;
  currentQuantity?: string;
};

export type StockAvailableBatchOption = StockBatchOption & {
  currentQuantity: string;
};

export type StockBatchMap = Record<string, StockBatchOption[]>;

export type StockAvailableBatchMap = Record<
  string,
  StockAvailableBatchOption[]
>;

export type StockPartyOption = {
  id: string;
  code: string;
  name: string;
  nameEn?: string | null;
  mobile?: string | null;
  phone?: string | null;
  type: string;
  isActive: boolean;
  openingBalance?: string;
};

export type StockQuickEntryPartyOption = Pick<
  StockPartyOption,
  "id" | "code" | "name" | "nameEn" | "type" | "isActive"
>;

export type StockRecentMovementRow = {
  id: string;
  type: string;
  productLabel: string;
  batchNumber: string;
  quantity: string;
  reference: string;
  movementAt: string;
  userName: string;
};

export type StockQuickEntryRow = {
  id: number;
  lineNo: number;
  movementType: StockMovementType;
  productId: string;
  batchNumber: string;
  batchId: string;
  expiryDate: string;
  quantity: string;
  reason: string;
  notes: string;
  serverError?: string;
};

export type StockQuickEntryValidation = {
  ok: boolean;
  message: string;
};

export type StockQuickEntryCopy = {
  quickTitle: string;
  quickDescription: string;
  defaults: string;
  defaultType: string;
  addRow: string;
  addNewRow: string;
  paste: string;
  saveDraft: string;
  post: string;
  automationTitle: string;
  automationText: string;
  gridTitle: string;
  gridHint: string;
  line: string;
  movementType: string;
  stockIn: string;
  stockOut: string;
  adjustmentIncrease: string;
  adjustmentDecrease: string;
  unit: string;
  available: string;
  reason: string;
  status: string;
  delete: string;
  valid: string;
  empty: string;
  unsupported: string;
  productRequired: string;
  batchRequired: string;
  quantityRequired: string;
  stockExceeded: string;
  noPermission: string;
  rows: string;
  validRows: string;
  errors: string;
  totalQuantity: string;
  posted: string;
  draftSaved: string;
  pasted: string;
  pasteEmpty: string;
  noValidRows: string;
  fixRows: string;
  recent: string;
  recentHint: string;
  activeProducts: string;
  acrossAllProducts: string;
  last7Days: string;
  lowStockItems: string;
  needAttention: string;
  warehouse: string;
  mainWarehouse: string;
  clearEmptyRows: string;
  viewAllMovements: string;
  searchProduct: string;
  selectBatch: string;
  selectReason: string;
  stockCount: string;
  damaged: string;
  expired: string;
  brokenBoxes: string;
  other: string;
};

export type StockQuickEntryProps = {
  products: StockQuickEntryProductOption[];
  batchesByProduct: StockAvailableBatchMap;
  parties: StockQuickEntryPartyOption[];
  rows: StockRecentMovementRow[];
  canCreateIn: boolean;
  canCreateOut: boolean;
  initialMode: StockMovementMode;
  lowStockCount: number;
};

export type StockQuickEntryTableProps = {
  rows: StockQuickEntryRow[];
  products: StockQuickEntryProductOption[];
  batchesByProduct: StockAvailableBatchMap;
  productById: Map<string, StockQuickEntryProductOption>;
  canCreateIn: boolean;
  canCreateOut: boolean;
  copy: StockQuickEntryCopy;
  productLabel: string;
  batchLabel: string;
  expiryLabel: string;
  quantityLabel: string;
  onUpdate: (id: number, patch: Partial<StockQuickEntryRow>) => void;
  onDelete: (id: number) => void;
  onPaste: (text: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
};

export type StockUiMessage = {
  type: "success" | "error" | "info";
  text: string;
};

export type StockMetricTone =
  "primary" | "secondary" | "info" | "success" | "warning";

export type StockMetricCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  tone: StockMetricTone;
};

export type BatchSelectorProps = {
  batches: Array<Pick<StockBatchOption, "id" | "batchNumber">>;
  value: string;
  onChange: (value: string) => void;
};

export type CreateBatchDialogProps = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  batchNumber: string;
  onBatchNumberChange: (value: string) => void;
  expiryDate: string;
  onExpiryDateChange: (value: string) => void;
};

export type ProductSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export type SupplierOption = Pick<StockPartyOption, "id" | "code" | "name">;

export type SupplierSelectorProps = {
  options: SupplierOption[];
  value: string;
  onChange: (value: string) => void;
};

export type StockOutBatchSelectorProps = {
  batches: StockAvailableBatchOption[];
  value: string;
  onChange: (value: string) => void;
};

export type MovementSummaryProps = {
  quantity: string;
  purchasePrice: string;
  productLabel?: string;
  batchLabel?: string;
  supplierLabel?: string;
  batchQuantity?: string;
  productQuantity?: string;
};

export type StockOutSummaryProps = {
  requestedQuantity: string;
  currentQuantity?: string;
  remainingQuantity?: string;
  productLabel?: string;
  batchLabel?: string;
  expiryLabel?: string;
};

export type StockInFormProps = {
  products: StockProductOption[];
  batchesByProduct: StockBatchMap;
  parties: StockPartyOption[];
  defaultValues: StockInFormValues;
  onSubmit: (values: StockInFormValues) => void;
  pending?: boolean;
};

export type StockOutFormProps = {
  products: StockProductOption[];
  batchesByProduct: StockAvailableBatchMap;
  defaultValues: StockOutFormValues;
  onSubmit: (values: StockOutFormValues) => void;
  pending?: boolean;
};

export type RecentStockInTableProps = {
  data: StockInRow[];
};

export type RecentStockOutTableProps = {
  data: StockOutRow[];
};

export type StockInPageClientProps = {
  products: StockProductOption[];
  batchesByProduct: StockBatchMap;
  parties: StockPartyOption[];
  rows: StockInRow[];
  canCreate: boolean;
};

export type StockOutPageClientProps = {
  products: StockProductOption[];
  batchesByProduct: StockAvailableBatchMap;
  rows: StockOutRow[];
  canCreate: boolean;
};

export type InventoryMovementRow = {
  id: string;
  movementId: string;
  dateValue: string;
  type: string;
  movementType: string;
  productId: string;
  batchId: string;
  partyId: string;
  userId: string;
  productCode: string;
  product: string;
  batch: string;
  batchExpiryDate: string;
  partyCode: string;
  party: string;
  quantity: string;
  unitPrice: string;
  total: string;
  reference: string;
  reason: string;
  user: string;
  userEmail: string;
};

export type InventoryMovementFilters = {
  search?: string;
  from?: string;
  to?: string;
  type?: string;
  productId?: string;
  batchId?: string;
  partyId?: string;
  userId?: string;
  sortField?: string;
  sortDir?: "asc" | "desc";
};

export type InventoryMovementsMuiPageProps = {
  rows: InventoryMovementRow[];
  canExport: boolean;
  page: number;
  totalCount: number;
  metrics: {
    count: number;
    totalQuantity: string;
  };
  filters: InventoryMovementFilters;
};
