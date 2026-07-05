import ExcelJS from "exceljs";
import type { ReportRow } from "@/features/reports/types";

export async function exportReportWorkbook(rows: ReportRow[], sheetName: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = [
    { header: "Date", key: "date", width: 22 },
    { header: "Reference", key: "reference", width: 18 },
    { header: "Title", key: "title", width: 24 },
    { header: "Category", key: "category", width: 18 },
    { header: "Party", key: "party", width: 24 },
    { header: "Product", key: "product", width: 28 },
    { header: "Batch", key: "batch", width: 18 },
    { header: "Quantity", key: "quantity", width: 12 },
    { header: "Amount", key: "amount", width: 14 },
    { header: "Balance", key: "balance", width: 14 },
    { header: "Status", key: "status", width: 14 },
  ];

  worksheet.addRows(
    rows.map((row) => ({
      date: row.date,
      reference: row.reference,
      title: row.title,
      category: row.category,
      party: row.party,
      product: row.product,
      batch: row.batch,
      quantity: row.quantity,
      amount: row.amount,
      balance: row.balance,
      status: row.status,
    }))
  );

  return workbook.xlsx.writeBuffer();
}

export function exportReportCsv(rows: ReportRow[]) {
  return rows
    .map((row) =>
      [row.date, row.reference, row.title, row.category, row.party, row.product, row.batch, row.quantity, row.amount, row.balance, row.status]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
}
