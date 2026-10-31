"use client";
/** Dotted-underline jargon button (FDR, DPS, …) that opens a TermSheet with the plain-words explanation. */
import { useState, type ReactNode } from "react";
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
  const { t } = useT();
  return (
    <Sheet open={open} onClose={onClose} title={t(`terms.${k}.title`)}>
      <p className="whitespace-pre-line text-start leading-relaxed">{t(`terms.${k}.body`)}</p>
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
        className="inline cursor-help rounded-sm border-b border-dotted border-current py-1 font-medium text-brand-700 hover:bg-brand-50"
      >
        {children}
      </button>
      <TermSheet k={k} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
