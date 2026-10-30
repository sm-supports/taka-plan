import { M5Calculator } from "@/components/calculators/m5/M5Calculator";

/** M5 Goal planner. `?demo=1` renders a fixture while the engine slice is unwired. */
export default async function M5Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <M5Calculator demo={sp.demo === "1"} />;
}
