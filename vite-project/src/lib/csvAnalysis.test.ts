/**
 * src/lib/csvAnalysis.ts
 *
 * Pure, framework-free CSV utilities used by both CsvAnalysis.tsx and the
 * Vitest test suite. Exported from here, then re-exported as named exports
 * from the page component so `import { parseCSV, profileData } from
 * "@/pages/dashboard/CsvAnalysis"` continues to work.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type CsvRow = Record<string, string>;

export type FlawType =
  | "missing_value"
  | "whitespace_padding"
  | "future_date"
  | "id_duplicate";

export type FlawSeverity = "critical" | "warning" | "info";

export interface DataFlaw {
  type:     FlawType;
  severity: FlawSeverity;
  column:   string;
  rowIndex: number;
  message:  string;
}

export interface DataProfile {
  rowCount:    number;
  colCount:    number;
  flaws:       DataFlaw[];     // capped at MAX_FLAWS for display
  totalFlaws:  number;          // real count before cap
  bySeverity: {
    critical: number;
    warning:  number;
    info:     number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum number of flaw objects kept in the returned array to avoid OOM. */
const MAX_FLAWS = 600;

// ─── parseCSV ─────────────────────────────────────────────────────────────────
/**
 * RFC 4180-compliant CSV parser.
 *
 * Unlike the LawgicHub-specific csvParser.ts, this version:
 *  - Strips UTF-8 BOM
 *  - Handles multiline quoted fields ("line1\nline2")
 *  - Handles escaped double-quotes ("")
 *  - Does NOT filter empty rows (needed for profileData flaw detection)
 */
export function parseCSV(text: string): CsvRow[] {
  // Strip BOM, normalise line endings
  const clean = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const records: string[][] = [];
  let cur    = "";
  let inQ    = false;
  let fields: string[] = [];

  for (let i = 0; i < clean.length; i++) {
    const ch   = clean[i];
    const next = clean[i + 1];

    if (ch === '"') {
      if (inQ && next === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (ch === ',' && !inQ) {
      fields.push(cur);
      cur = "";
    } else if (ch === '\n' && !inQ) {
      fields.push(cur);
      cur = "";
      records.push(fields);
      fields = [];
    } else {
      cur += ch;
    }
  }
  // Flush final row (no trailing newline in some inputs)
  if (cur !== "" || fields.length > 0) {
    fields.push(cur);
    records.push(fields);
  }

  if (records.length < 2) return [];

  const headers = records[0].map(h => h.trim());

  // Keep empty rows — the profiler needs them to detect blank-row flaws
  return records.slice(1).map(values => {
    const row: CsvRow = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });
}

// ─── profileData ─────────────────────────────────────────────────────────────
/**
 * Inspect parsed CSV rows and return a structured quality report.
 *
 * Checks performed per column:
 *  - missing_value  (critical)  — empty / whitespace-only cell
 *  - whitespace_padding (info)  — value has leading or trailing space
 *  - future_date    (warning)   — ISO date string is in the future
 *  - id_duplicate   (critical)  — column named *_id contains duplicate values
 *
 * Flaws are capped at MAX_FLAWS in the returned `flaws` array but
 * `totalFlaws` and `bySeverity` always reflect the real uncapped count.
 */
export function profileData(rows: CsvRow[], columns: string[]): DataProfile {
  const allFlaws: DataFlaw[] = [];
  const now = new Date();

  // Track id-column values for duplicate detection
  const idValueMaps: Record<string, Map<string, number[]>> = {};
  columns.forEach(col => {
    if (col.toLowerCase().endsWith("_id") || col.toLowerCase() === "id") {
      idValueMaps[col] = new Map();
    }
  });

  // ── Per-row, per-column scan ──────────────────────────────────────────────
  rows.forEach((row, rowIndex) => {
    columns.forEach(col => {
      const raw = row[col];
      if (raw === undefined) return;
      const trimmed = raw.trim();

      // missing_value
      if (trimmed === "") {
        allFlaws.push({
          type: "missing_value",
          severity: "critical",
          column: col,
          rowIndex,
          message: `Row ${rowIndex}: column "${col}" is empty`,
        });
        return; // no further checks on empty cell
      }

      // whitespace_padding
      if (raw !== trimmed) {
        allFlaws.push({
          type: "whitespace_padding",
          severity: "info",
          column: col,
          rowIndex,
          message: `Row ${rowIndex}: column "${col}" has leading/trailing whitespace`,
        });
      }

      // future_date — only test columns whose name contains "date", "at", "created", "updated"
      const colLower = col.toLowerCase();
      if (
        colLower.includes("date") ||
        colLower.includes("_at") ||
        colLower.includes("created") ||
        colLower.includes("updated")
      ) {
        const d = new Date(trimmed);
        if (!isNaN(d.getTime()) && d > now) {
          allFlaws.push({
            type: "future_date",
            severity: "warning",
            column: col,
            rowIndex,
            message: `Row ${rowIndex}: column "${col}" contains a future date (${trimmed})`,
          });
        }
      }

      // Accumulate values for id duplicate check
      if (idValueMaps[col]) {
        const existing = idValueMaps[col].get(trimmed);
        if (existing) {
          existing.push(rowIndex);
        } else {
          idValueMaps[col].set(trimmed, [rowIndex]);
        }
      }
    });
  });

  // ── id_duplicate pass (post-scan) ────────────────────────────────────────
  Object.entries(idValueMaps).forEach(([col, valueMap]) => {
    const nonEmpty = [...valueMap.entries()].filter(([v]) => v !== "");
    const dupeCount = nonEmpty.filter(([, idxs]) => idxs.length > 1).length;
    if (dupeCount > 0) {
      // One flaw per id column (summary-level), attached to the first dupe row
      const firstDupeRow = nonEmpty.find(([, idxs]) => idxs.length > 1)![1][0];
      allFlaws.push({
        type: "id_duplicate",
        severity: "critical",
        column: col,
        rowIndex: firstDupeRow,
        message: `Column "${col}" has ${dupeCount} duplicates across ${nonEmpty.length} non-empty values`,
      });
    }
  });

  // ── Aggregate severity counts (from full uncapped list) ───────────────────
  const bySeverity = { critical: 0, warning: 0, info: 0 };
  allFlaws.forEach(f => { bySeverity[f.severity]++; });

  return {
    rowCount:   rows.length,
    colCount:   columns.length,
    flaws:      allFlaws.slice(0, MAX_FLAWS),
    totalFlaws: allFlaws.length,
    bySeverity,
  };
}