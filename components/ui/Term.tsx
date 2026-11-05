"use client";
/** Dotted-underline jargon button that opens a TermSheet with the plain-words explanation. */
import { useState, type ReactNode } from "react";
import { useCountry } from "@/lib/country/useCountry";
import { bangladeshEn } from "@/lib/i18n/dictionaries/en/bangladesh";
import { useT } from "@/lib/i18n/useT";
import { Sheet } from "./Sheet";

export interface TermProps {
  k: string;
  children: ReactNode;
}

export interface TermSheetProps {
  k: string;
  open: boolean;
  onClose: () => void;
}

export function TermSheet({ k, open, onClose }: TermSheetProps) {
  const { t, locale } = useT();
  const { code } = useCountry();
  // Bangladesh in English keeps its own names (FDR, DPS, CIB…); everywhere else reads the dictionary.
  const local = code === "BD" && locale === "en" ? (bangladeshEn.terms as Record<string, { title: string; body: string }>)[k] : undefined;
  return (
    <Sheet open={open} onClose={onClose} title={local?.title ?? t(`terms.${k}.title`)}>
      <p dir="auto" className="whitespace-pre-line text-start leading-relaxed">
        {local?.body ?? t(`terms.${k}.body`)}
      </p>
    </Sheet>
  );
}

export function Term({ k, children }: TermProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        // Inline, so it flows with the sentence; the vertical padding (which does not move the line) and a
        // little horizontal padding (cancelled by the negative margin) give a tap target of at least 48 px.
        className="-mx-1.5 inline cursor-help rounded-md px-2.5 py-3.5 font-medium text-brand-700 underline decoration-dotted underline-offset-4 hover:decoration-solid"
      >
        {children}
      </button>
      <TermSheet k={k} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
