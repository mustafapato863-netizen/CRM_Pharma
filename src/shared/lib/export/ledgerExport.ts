import ExcelJS from "exceljs";
import type { LedgerTimelineRow } from "@/features/ledger/types";

export async function exportLedgerWorkbook(rows: LedgerTimelineRow[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Ledger");

  worksheet.columns = [
    { header: "Date", key: "date", width: 22 },
    { header: "Reference", key: "reference", width: 18 },
    { header: "Movement Type", key: "movementType", width: 20 },
    { header: "Party", key: "party", width: 26 },
    { header: "Product", key: "product", width: 28 },
    { header: "Batch", key: "batch", width: 18 },
    { header: "Quantity", key: "quantity", width: 14 },
    { header: "Unit Price", key: "unitPrice", width: 14 },
    { header: "Total", key: "total", width: 14 },
    { header: "Created By", key: "createdBy", width: 24 },
  ];

  worksheet.addRows(
    rows.map((row) => ({
      date: row.date,
      reference: row.reference,
      movementType: row.movementType,
      party: row.partyName,
      product: row.productName,
      batch: row.batchNumber,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      total: row.total,
      createdBy: row.createdBy,
    }))
  );

  return workbook.xlsx.writeBuffer();
}

export function exportLedgerCsv(rows: LedgerTimelineRow[]) {
  return rows
    .map((row) =>
      [
        row.date,
        row.reference,
        row.movementType,
        row.partyName,
        row.productName,
        row.batchNumber,
        row.quantity,
        row.unitPrice,
        row.total,
        row.createdBy,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
}
