import ExcelJS from "exceljs";

export type InventoryMovementExportRow = {
  movementId: string;
  date: string;
  type: string;
  product: string;
  batch: string;
  party: string;
  quantity: string;
  unitPrice: string;
  total: string;
  reference: string;
  createdBy: string;
  notes: string;
};

export async function exportInventoryMovementsWorkbook(rows: InventoryMovementExportRow[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Inventory Movements");

  worksheet.columns = [
    { header: "Movement ID", key: "movementId", width: 24 },
    { header: "Date", key: "date", width: 22 },
    { header: "Type", key: "type", width: 16 },
    { header: "Product", key: "product", width: 28 },
    { header: "Batch", key: "batch", width: 18 },
    { header: "Party", key: "party", width: 24 },
    { header: "Quantity", key: "quantity", width: 12 },
    { header: "Unit Price", key: "unitPrice", width: 14 },
    { header: "Total", key: "total", width: 14 },
    { header: "Reference", key: "reference", width: 18 },
    { header: "Created By", key: "createdBy", width: 20 },
    { header: "Notes", key: "notes", width: 28 },
  ];

  worksheet.addRows(rows);

  return workbook.xlsx.writeBuffer();
}
