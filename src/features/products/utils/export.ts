import ExcelJS from "exceljs";
import type { ProductRow } from "../types";

export function exportProductsCsv(rows: ProductRow[]) {
  const csvRows = [
    ["Code", "Name", "Search Name", "Type", "Unit", "Status"],
    ...rows.map((row) => [
      row.code,
      row.name,
      row.searchName,
      row.type,
      row.unit,
      row.isActive ? "Active" : "Inactive",
    ]),
  ];

  return csvRows
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
}

export async function exportProductsExcel(rows: ProductRow[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Products");

  worksheet.columns = [
    { header: "Code", key: "code", width: 18 },
    { header: "Name", key: "name", width: 28 },
    { header: "Search Name", key: "searchName", width: 28 },
    { header: "Type", key: "type", width: 18 },
    { header: "Unit", key: "unit", width: 14 },
    { header: "Status", key: "status", width: 14 },
  ];

  worksheet.addRows(
    rows.map((row) => ({
      code: row.code,
      name: row.name,
      searchName: row.searchName,
      type: row.type,
      unit: row.unit,
      status: row.isActive ? "Active" : "Inactive",
    }))
  );

  return workbook.xlsx.writeBuffer();
}
