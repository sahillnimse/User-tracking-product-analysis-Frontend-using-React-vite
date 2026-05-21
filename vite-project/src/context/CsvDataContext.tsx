// src/context/CsvDataContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { ParsedStats } from "@/types";
import { parseCSV, analyzeData }                          from "@/lib/csvParser";
import { saveRawCSV, saveStats, loadRawCSV, clearCSVStorage } from "@/lib/storage";

interface CsvDataContextValue {
  stats:    ParsedStats | null;
  fileName: string | null;
  loading:  boolean;
  oversized:boolean;
  uploadCSV:(text: string, name: string) => void;
  clearCSV: () => void;
}

const CsvDataContext = createContext<CsvDataContextValue | null>(null);

export function useCsvData(): CsvDataContextValue {
  const ctx = useContext(CsvDataContext);
  if (!ctx) throw new Error("useCsvData must be used inside <CsvDataProvider>");
  return ctx;
}

export function CsvDataProvider({ children }: { children: ReactNode }) {
  const [stats,     setStats]     = useState<ParsedStats | null>(null);
  const [fileName,  setFileName]  = useState<string | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [oversized, setOversized] = useState(false);

  // Restore CSV from localStorage on mount
  useEffect(() => {
    const saved = loadRawCSV();
    if (saved) {
      const rows = parseCSV(saved.text);
      const cols = rows.length > 0 ? Object.keys(rows[0]) : [];
      setStats(analyzeData(rows, cols, saved.name));
      setFileName(saved.name);
    }
    setLoading(false);
  }, []);

  // Sync to localStorage whenever stats change
  useEffect(() => {
    if (!loading) saveStats(stats);
  }, [stats, loading]);

  const uploadCSV = useCallback((text: string, name: string) => {
    const persisted = saveRawCSV(text, name);
    setOversized(!persisted);
    const rows = parseCSV(text);
    const cols = rows.length > 0 ? Object.keys(rows[0]) : [];
    setStats(analyzeData(rows, cols, name));
    setFileName(name);
  }, []);

  const clearCSV = useCallback(() => {
    clearCSVStorage();
    setStats(null);
    setFileName(null);
    setOversized(false);
  }, []);

  return (
    <CsvDataContext.Provider value={{ stats, fileName, loading, oversized, uploadCSV, clearCSV }}>
      {children}
    </CsvDataContext.Provider>
  );
}