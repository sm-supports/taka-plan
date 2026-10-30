"use client";
/** Loads /api/admin/rates once and exposes a reload + local replace for after an edit. */
import { useCallback, useEffect, useState } from "react";
import type { RatesSnapshot } from "@taka/engine";
import { adminApi, errorMessage } from "./api";
import type { AdminRatesResponse } from "./types";

export interface AdminRatesState {
  data: AdminRatesResponse | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  /** After PUT: swap in the returned draft without a round trip (the log is refreshed lazily). */
  setDraft: (draft: RatesSnapshot | null) => void;
}

export function useAdminRates(): AdminRatesState {
  const [data, setData] = useState<AdminRatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminApi.rates());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setDraft = useCallback((draft: RatesSnapshot | null) => {
    setData((d) => (d ? { ...d, draft } : d));
  }, []);

  return { data, loading, error, reload, setDraft };
}
