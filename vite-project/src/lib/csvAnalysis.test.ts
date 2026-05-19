import { describe, it, expect } from "vitest";
import { parseCSV, profileData } from "@/pages/dashboard/CsvAnalysis";

describe("parseCSV", () => {
  it("handles quoted commas and multiline fields", () => {
    const csv = 'id,name\n1,"a,b"\n2,"line1\nline2"';
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe("a,b");
    expect(rows[1].name).toBe("line1\nline2");
  });

  it("strips BOM and keeps empty rows for profiling", () => {
    const csv = "\uFEFFid,val\n1,a\n,\n3,c";
    const rows = parseCSV(csv);
    expect(rows).toHaveLength(3);
    expect(rows[1].val).toBe("");
  });
});

describe("profileData", () => {
  it("future_date flaw uses actual row index", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 2);
    const futureStr = future.toISOString().split("T")[0];
    const rows = parseCSV(`created_at\n2020-01-01\n${futureStr}\n2020-06-01`);
    const report = profileData(rows, ["created_at"]);
    const futureFlaws = report.flaws.filter((f) => f.type === "future_date");
    expect(futureFlaws.some((f) => f.rowIndex === 1)).toBe(true);
    expect(futureFlaws.every((f) => f.rowIndex !== 0)).toBe(true);
  });

  it("id_duplicate message uses nonEmpty.length - unique count", () => {
    const rows = parseCSV("user_id\n1\n1\n2");
    const report = profileData(rows, ["user_id"]);
    const idFlaw = report.flaws.find((f) => f.type === "id_duplicate");
    expect(idFlaw?.message).toMatch(/has 1 duplicates/);
  });

  it("bySeverity reflects full flaw counts beyond display cap", () => {
    const rows = Array.from({ length: 650 }, (_, i) => ({ note: ` ${i} ` }));
    const report = profileData(rows, ["note"]);
    const severitySum =
      report.bySeverity.critical +
      report.bySeverity.warning +
      report.bySeverity.info;
    expect(severitySum).toBe(report.totalFlaws);
    expect(report.totalFlaws).toBeGreaterThan(600);
    expect(report.flaws.length).toBe(600);
  });
});
