import ExcelJS from "exceljs";
import type { StockInRow } from "../types";

export async function exportStockInWorkbook(rows: StockInRow[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Stock IN");

  worksheet.columns = [
    { header: "Date", key: "date", width: 22 },
    { header: "Reference", key: "reference", width: 18 },
    { header: "Product", key: "product", width: 30 },
    { header: "Batch", key: "batch", width: 18 },
    { header: "Supplier", key: "supplier", width: 24 },
    { header: "Quantity", key: "quantity", width: 14 },
    { header: "Purchase Price", key: "purchasePrice", width: 16 },
    { header: "Created By", key: "createdBy", width: 24 },
  ];

  worksheet.addRows(
    rows.map((row) => ({
      date: row.movementAt.toISOString(),
      reference: row.reference ?? "",
      product: `${row.product.code} - ${row.product.name}`,
      batch: row.batch?.batchNumber ?? "",
      supplier: row.party?.name ?? "",
      quantity: row.quantity.toString(),
      purchasePrice: row.batch?.purchaseCost?.toString() ?? "",
      createdBy: row.user.name ?? row.user.email,
    }))
  );

  return workbook.xlsx.writeBuffer();
}

export function exportStockInCsv(rows: StockInRow[]) {
  const data = rows.map((row) => ({
    date: row.movementAt.toISOString(),
    reference: row.reference ?? "",
    product: `${row.product.code} - ${row.product.name}`,
    batch: row.batch?.batchNumber ?? "",
    supplier: row.party?.name ?? "",
    quantity: row.quantity.toString(),
    createdBy: row.user.name ?? row.user.email,
  }));

  return data
    .map((row) => Object.values(row).map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
