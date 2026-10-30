import { M3Calculator } from "@/components/calculators/m3/M3Calculator";

/** M3 Debt health check. `?demo=1` renders sample numbers instead of the store. */
export default async function M3Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <M3Calculator demo={sp.demo === "1"} />;
}
