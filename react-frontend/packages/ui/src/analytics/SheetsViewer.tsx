import * as React from "react";
import { html, css } from "react-strict-dom";

export type Sheet = {
  name: string;
  headers: string[];
  rows: (string | number)[][];
};

export type SheetsViewerProps = { sheets: Sheet[] };

const styles = css.create({
  sheet: { marginBottom: 16 },
  title: { fontWeight: "600", marginBottom: 8 },
  table: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "auto",
  },
  headerRow: {
    display: "flex",
    backgroundColor: "#f3f4f6",
    fontWeight: "600",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#e5e7eb",
  },
  dataRow: {
    display: "flex",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#e5e7eb",
  },
  cell: {
    padding: 8,
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 120,
    boxSizing: "border-box",
  },
});

export default function SheetsViewer({ sheets }: SheetsViewerProps) {
  if (!sheets?.length) return null;

  return (
    <html.div>
      {sheets.map((sheet, si) => (
        <html.div key={si} style={styles.sheet}>
          <html.div style={styles.title}>{sheet.name}</html.div>

          <html.div style={styles.table}>
            {/* Header */}
            <html.div style={styles.headerRow}>
              {sheet.headers.map((h, hi) => (
                <html.div key={hi} style={styles.cell}>
                  {String(h)}
                </html.div>
              ))}
            </html.div>

            {/* Rows */}
            {sheet.rows.map((row, ri) => (
              <html.div key={ri} style={styles.dataRow}>
                {row.map((col, ci) => (
                  <html.div key={ci} style={styles.cell}>
                    {String(col)}
                  </html.div>
                ))}
              </html.div>
            ))}
          </html.div>
        </html.div>
      ))}
    </html.div>
  );
}
