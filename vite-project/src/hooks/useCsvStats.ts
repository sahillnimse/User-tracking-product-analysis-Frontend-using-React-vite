// src/hooks/useCsvStats.ts
// FIX: was importing from "@/context/CsvDataContext" (the old stale file that
// will be deleted). Now imports from the unified "@/context/AppContext".

import { useCsvData } from "@/context/AppContext";
import type { ParsedStats } from "@/types";

export interface UseCsvStatsResult {
  stats:    ParsedStats | null;
  hasData:  boolean;
  fileName: string | null;
  loading:  boolean;
}

/**
 * Read-only access to uploaded CSV stats from any dashboard page.
 *
 * @example
 * const { stats, hasData } = useCsvStats();
 * const total = hasData ? stats!.totalUsers : staticData.totalUsers;
 */
export function useCsvStats(): UseCsvStatsResult {
  const { stats, fileName, loading } = useCsvData();
  return { stats, hasData: stats !== null, fileName, loading };
}