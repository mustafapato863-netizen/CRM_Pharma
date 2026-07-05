import type { PartyType } from "@prisma/client";

export type LedgerPartyRow = {
  id: string;
  name: string;
  searchName: string;
  type: PartyType;
  isActive: boolean;
  openingBalance: string;
  currentBalance: string;
  balanceType: "Receivable" | "Payable" | "Settled";
  lastTransactionAt: string | null;
};

export type LedgerTimelineRow = {
  id: string;
  source: "stock" | "ledger";
  date: string;
  reference: string;
  movementType: string;
  status: string;
  partyId: string | null;
  partyName: string;
  partyType: PartyType | "UNKNOWN";
  productName: string;
  batchNumber: string;
  quantity: string;
  unitPrice: string;
  total: string;
  runningBalance: string;
  createdBy: string;
  notes: string;
  signedTotal: number;
  searchText: string;
};
