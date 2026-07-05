export interface DashboardRecentMovement {
  id: string;
  type: "STOCK_IN" | "STOCK_OUT" | "RETURN" | "DAMAGED" | "ADJUSTMENT";
  reference: string;
  productCode: string;
  productName: string;
  partyName: string;
  quantity: string;
  movementAt: string;
  userName: string;
}

export interface DashboardExpiringSoonItem {
  id: string;
  productCode: string;
  productName: string;
  batchNumber: string;
  expiryDate: string;
  daysLeft: number;
}

export interface DashboardStats {
  /** Inventory KPIs */
  totalProducts: number;
  totalBatches: number;
  lowStockCount: number;
  outOfStockCount: number;

  /** Alert KPIs */
  expiringSoonCount: number;
  expiredCount: number;

  /** Finance KPIs */
  customersOweTotal: number;
  suppliersWeOweTotal: number;
  duePaymentsCount: number;
  overdueCount: number;

  /** Meta */
  lastUpdatedAt: string;
  recentMovements: DashboardRecentMovement[];
  expiringSoonItems: DashboardExpiringSoonItem[];
}
