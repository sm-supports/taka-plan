import type { ReactNode } from "react";
import { AdminProviders } from "@/components/admin/AdminShell";
import { AdminGate } from "@/components/admin/AdminGate";
import { getDictionary } from "@/lib/i18n/server";

export const metadata = { title: "Rates admin · Taka Plan", robots: { index: false, follow: false } };

/** Static shell; the session check happens in the browser against /api/admin/session (a Pages Function). */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const dict = await getDictionary("en");
  return (
    <AdminProviders dict={dict}>
      <AdminGate>{children}</AdminGate>
    </AdminProviders>
  );
}
