import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AdminProviders, AdminShell } from "@/components/admin/AdminShell";
import { LoginForm } from "@/components/admin/LoginForm";
import { getDictionary } from "@/lib/i18n/server";
import { isAdmin } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = { title: "Rates admin · Taka Plan", robots: { index: false, follow: false } };

/** Server gate: a valid tp_admin cookie shows the admin, anything else the sign-in form. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [admin, dict] = await Promise.all([isAdmin(await cookies()), getDictionary("en")]);
  return <AdminProviders dict={dict}>{admin ? <AdminShell>{children}</AdminShell> : <LoginForm />}</AdminProviders>;
}
