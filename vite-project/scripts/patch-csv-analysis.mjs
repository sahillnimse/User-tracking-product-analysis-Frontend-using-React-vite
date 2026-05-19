import fs from "fs";

const path = "src/pages/dashboard/CsvAnalysis.tsx";
let s = fs.readFileSync(path, "utf8");

s = s.replace(
  'from "@/components/CsvAnalysis";',
  'from "@/pages/dashboard/CsvAnalysis";',
);

if (!s.includes("papaparse")) {
  s = s.replace(
    '} from "lucide-react";\n\n//',
    '} from "lucide-react";\nimport Papa from "papaparse";\n\n//',
  );
}

const parseStart = s.indexOf("// ─── CSV Parser");
const parseEnd = s.indexOf("// ─── Constants", parseStart);
if (parseStart === -1 || parseEnd === -1) {
  console.error("parseCSV markers not found");
  process.exit(1);
}

const newParse = `// ─── CSV Parser ───────────────────────────────────────────────────────────────
export function parseCSV(text: string): UserRow[] {
  const stripped = text.replace(/^\\uFEFF/, "");
  const result = Papa.parse<string[]>(stripped, {
    header: false,
    skipEmptyLines: false,
  });
  const data = (result.data ?? []) as string[][];
  if (data.length < 2) return [];
  const headers = data[0].map((h) => String(h ?? "").trim());
  return data.slice(1).map((values) => {
    const row: UserRow = {};
    headers.forEach((h, i) => {
      row[h] = values[i] != null ? String(values[i]) : "";
    });
    return row;
  });
}

`;
s = s.slice(0, parseStart) + newParse + s.slice(parseEnd);

const fakeSeg = `  } else {
    engagementSegments = [
      { name: "Power (18+)", value: Math.round(n * 0.15), color: COLORS[0] },
      { name: "Engaged (10-17)", value: Math.round(n * 0.25), color: COLORS[1] },
      { name: "Casual (3-9)", value: Math.round(n * 0.30), color: COLORS[2] },
      { name: "At risk (1-2)", value: Math.round(n * 0.20), color: COLORS[3] },
      { name: "Zero", value: Math.round(n * 0.10), color: COLORS[4] },
    ];
  }`;
if (s.includes(fakeSeg)) {
  s = s.replace(fakeSeg, "  }");
} else {
  console.warn("fake engagement block not found");
}

s = s.replace("function profileData(", "export function profileData(");

const addFlawOld = `  const lo = (s: string) => s.toLowerCase();
  let totalCounted = 0;

  const addFlaw = (f: DataFlaw) => {
    totalCounted++;
    if (f.column && f.rowIndex >= 0) {
      const key = \`\${f.rowIndex}-\${f.column}\`;
      const arr = flawCellMap.get(key) || [];
      arr.push(f);
      flawCellMap.set(key, arr);
    }
    if (f.rowIndex === -1 || flaws.length < MAX_DISPLAY_FLAWS) flaws.push(f);
  };`;

const addFlawNew = `  const lo = (s: string) => s.toLowerCase();
  let totalCounted = 0;
  const bySeverity = { critical: 0, warning: 0, info: 0 };
  const byType: Record<string, number> = {};

  const addFlaw = (f: DataFlaw) => {
    totalCounted++;
    bySeverity[f.severity]++;
    byType[f.type] = (byType[f.type] || 0) + 1;
    if (f.column && f.rowIndex >= 0) {
      const key = \`\${f.rowIndex}-\${f.column}\`;
      const arr = flawCellMap.get(key) || [];
      arr.push(f);
      flawCellMap.set(key, arr);
    }
    if (f.rowIndex === -1 || flaws.length < MAX_DISPLAY_FLAWS) flaws.push(f);
  };`;

if (!s.includes(addFlawOld)) {
  console.error("addFlaw block not found");
  process.exit(1);
}
s = s.replace(addFlawOld, addFlawNew);

s = s.replace(
  "addFlaw({ id: `ws-${i}-${col}-${profile.whitespaceIssues}`, type: \"whitespace\"",
  "addFlaw({ id: `ws-${i}-${col}`, type: \"whitespace\"",
);

const futureOld = `        const now = new Date();
        now.setHours(23, 59, 59, 999);
        let fShown = 0;
        dates.forEach((d, idx) => {
          if (d > now && fShown < 10) {
            const rowIdx = idx;
            addFlaw({ id: \`fd-${rowIdx}-${col}-${fShown}\`, type: "future_date", severity: "warning", column: col, rowIndex: rowIdx, message: \`Future date in "\${col}"\`, currentValue: d.toISOString().split("T")[0] });
            fShown++;
          }
        });`;

const futureNew = `        const now = new Date();
        now.setHours(23, 59, 59, 999);
        let fShown = 0;
        values.forEach((v, i) => {
          const raw = v.trim();
          if (!raw || NULL_LIKE.has(lo(raw))) return;
          const d = new Date(raw.includes("T") || raw.includes("-") ? raw : raw.replace(/(\\d{2})\\/(\\d{2})\\/(\\d{4})/, "$3-$2-$1"));
          if (!isNaN(d.getTime()) && d > now && fShown < 10) {
            addFlaw({ id: \`fd-${i}-${col}-${fShown}\`, type: "future_date", severity: "warning", column: col, rowIndex: i, message: \`Future date in "\${col}"\`, currentValue: d.toISOString().split("T")[0] });
            fShown++;
          }
        });`;

if (!s.includes(futureOld)) {
  console.error("future_date block not found");
  process.exit(1);
}
s = s.replace(futureOld, futureNew);

s = s.replace(
  'message: `"${col}" looks like ID but has ${profile.total - profile.unique} duplicates',
  'message: `"${col}" looks like ID but has ${nonEmpty.length - uniqueVals.size} duplicates',
);

const severityTailOld = `  const bySeverity = { critical: 0, warning: 0, info: 0 };
  flaws.forEach(f => { bySeverity[f.severity]++; });
  const byType: Record<string, number> = {};
  flaws.forEach(f => { byType[f.type] = (byType[f.type] || 0) + 1; });

  return { flaws, profiles, totalFlaws: totalCounted, bySeverity, byType, duplicateRowIndices, emptyRowIndices, flawCellMap };`;

const severityTailNew =
  "  return { flaws, profiles, totalFlaws: totalCounted, bySeverity, byType, duplicateRowIndices, emptyRowIndices, flawCellMap };";

if (!s.includes(severityTailOld)) {
  console.error("bySeverity tail not found");
  process.exit(1);
}
s = s.replace(severityTailOld, severityTailNew);

s = s.replace(
  'const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "analysis-summary.csv"; a.click();',
  'const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "analysis-summary.csv"; a.click(); URL.revokeObjectURL(url);',
);
s = s.replace(
  'const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "flaws-report.csv"; a.click();',
  'const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "flaws-report.csv"; a.click(); URL.revokeObjectURL(url);',
);

fs.writeFileSync(path, s);
console.log("patched", path, "lines:", s.split("\n").length);
