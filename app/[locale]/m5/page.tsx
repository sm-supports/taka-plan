import { M5Calculator } from "@/components/calculators/m5/M5Calculator";

/** M5 Goal planner. `?demo=1` renders sample goals instead of the store. */
export default async function M5Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <M5Calculator demo={sp.demo === "1"} />;
}
