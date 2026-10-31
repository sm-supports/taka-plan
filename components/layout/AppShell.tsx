/** Header + country data notice + narrow centred main column + footer disclaimer. */
import type { ReactNode } from "react";
import { CountryNotice } from "./CountryNotice";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <CountryNotice />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-4">{children}</main>
      <Footer />
    </div>
  );
}
