import ExcelJS from "exceljs";
import type { BatchRow } from "../types";

export async function exportBatchesToXlsx(rows: BatchRow[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Batches");

  worksheet.columns = [
    { header: "Batch Number", key: "batchNumber", width: 20 },
    { header: "Product", key: "product", width: 30 },
    { header: "Expiry", key: "expiry", width: 16 },
    { header: "Current Quantity", key: "currentQuantity", width: 18 },
    { header: "Status", key: "status", width: 14 },
  ];

  worksheet.addRows(
    rows.map((row) => ({
      batchNumber: row.batchNumber,
      product: `${row.product.code} - ${row.product.name}`,
      expiry: row.expiryDate ?? "",
      currentQuantity: row.currentQuantity,
      status: row.status,
    }))
  );

  return workbook.xlsx.writeBuffer();
}

export function exportBatchesToCsv(rows: BatchRow[]) {
  const data = rows.map((row) => ({
    batchNumber: row.batchNumber,
    product: `${row.product.code} - ${row.product.name}`,
    expiryDate: row.expiryDate ?? "",
    currentQuantity: row.currentQuantity,
    status: row.status,
  }));

  return data
    .map((row) => Object.values(row).map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
