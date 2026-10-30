"use client";
// Reads the active rates snapshot; must be rendered under <RatesProvider>.
import { useContext } from "react";
import { RatesContext, type RatesContextValue } from "./context";

export function useRates(): RatesContextValue {
  const ctx = useContext(RatesContext);
  if (!ctx) throw new Error("useRates() must be used inside <RatesProvider>");
  return ctx;
}
