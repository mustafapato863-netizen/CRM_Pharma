import type { Party } from "@prisma/client";
import { partySchema } from "../schemas/party.schema";

export type PartyFormValues = import("zod").input<typeof partySchema>;

export type PartyBalanceType = "Receivable" | "Payable" | "Settled";

export type PartyFinancialSummary = {
  currentBalance: string;
  balanceType: PartyBalanceType;
  lastTransactionAt: string | null;
  ledgerEntryCount: number;
};

export type PartyRow = Omit<Party, "openingBalance" | "createdAt" | "updatedAt"> & {
  openingBalance: string;
  createdAt: string;
  updatedAt: string;
  status: "Active" | "Inactive";
  stockMovementCount: number;
  ledgerEntryCount: number;
  currentBalance: string;
  balanceType: PartyBalanceType;
  lastTransactionAt: string | null;
};
