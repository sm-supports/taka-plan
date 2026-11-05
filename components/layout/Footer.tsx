"use client";
/** Page footer with the short disclaimer and the rates version (with its "may be outdated" tag). */
import { Disclaimer } from "@/components/ui/Disclaimer";
import { RatesVersionBadge } from "./RatesVersionBadge";

export function Footer() {
  return (
    <footer className="mx-auto max-w-md px-4 pb-8 pt-6">
      <Disclaimer variant="footer" />
      <RatesVersionBadge className="mt-2" />
    </footer>
  );
}
