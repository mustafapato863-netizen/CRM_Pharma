import ExcelJS from "exceljs";
import type { PartyRow } from "../types";

export async function exportPartiesToWorkbook(rows: PartyRow[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Parties");

  worksheet.columns = [
    { header: "Code", key: "code", width: 14 },
    { header: "Arabic Name", key: "name", width: 28 },
    { header: "English Name", key: "nameEn", width: 24 },
    { header: "Type", key: "type", width: 16 },
    { header: "Mobile", key: "mobile", width: 18 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Email", key: "email", width: 24 },
    { header: "City", key: "city", width: 18 },
    { header: "Opening Balance", key: "openingBalance", width: 18 },
    { header: "Current Balance", key: "currentBalance", width: 18 },
    { header: "Balance Type", key: "balanceType", width: 16 },
    { header: "Last Transaction", key: "lastTransactionAt", width: 22 },
    { header: "Status", key: "status", width: 14 },
  ];

  worksheet.addRows(
    rows.map((row) => ({
      code: row.code,
      name: row.name,
      nameEn: row.nameEn ?? "",
      type: row.type,
      mobile: row.mobile ?? "",
      phone: row.phone ?? "",
      email: row.email ?? "",
      city: row.city ?? "",
      openingBalance: row.openingBalance.toString(),
      currentBalance: row.currentBalance,
      balanceType: row.balanceType,
      lastTransactionAt: row.lastTransactionAt ? new Date(row.lastTransactionAt).toLocaleString("en-US") : "",
      status: row.status,
    }))
  );

  return workbook.xlsx.writeBuffer();
}

export function exportPartiesToCsv(rows: PartyRow[]) {
  const data = rows.map((row) => ({
    code: row.code,
    name: row.name,
    nameEn: row.nameEn ?? "",
    type: row.type,
    mobile: row.mobile ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    city: row.city ?? "",
    openingBalance: row.openingBalance.toString(),
    currentBalance: row.currentBalance,
    balanceType: row.balanceType,
    lastTransactionAt: row.lastTransactionAt ? new Date(row.lastTransactionAt).toLocaleString("en-US") : "",
    status: row.status,
  }));

  return data
    .map((row) => Object.values(row).map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
