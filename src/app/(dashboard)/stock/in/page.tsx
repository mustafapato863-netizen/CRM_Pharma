import { redirect } from "next/navigation";

export default function StockInPage() {
  redirect("/stock?mode=in");
}
