"use server";

import { getLedgerWorkspace } from "../queries/get-ledger-workspace";

export async function getLedgerExportRowsAction(filters: any) {
  const result = await getLedgerWorkspace({ ...filters, noLimit: true });
  return result.rows;
}
