export function nextProductCode(latestCode?: string | null) {
  const match = latestCode?.match(/PRD-(\d{6})$/);
  const next = match ? Number(match[1]) + 1 : 1;
  return `PRD-${String(next).padStart(6, "0")}`;
}

