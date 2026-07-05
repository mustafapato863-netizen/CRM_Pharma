"use server";

import { getReportCategory } from "../queries/get-report-category";

export async function getReportExportRowsAction(filters: any) {
  const result = await getReportCategory({ ...filters, noLimit: true });
  return result.rows;
}
