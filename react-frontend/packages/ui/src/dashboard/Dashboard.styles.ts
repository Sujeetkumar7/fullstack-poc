import { css } from "react-strict-dom";

export const dashboardStyles = css.create({
  wrap: {
    padding: 24,
    width: "100%",
    maxWidth: "min(100%, 800px)",
    marginInline: "auto",
  },
  card: {
    backgroundColor: "#fff",
    color: "#111827",
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(17,24,39,0.08)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.12)",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    marginTop: 0,
    marginBottom: 6,
    color: "#0f172a",
  },
  info: { marginTop: 8, marginBottom: 0, color: "#374151", fontSize: 14 },
  row: { marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" },
  button: {
    paddingBlock: 10,
    paddingInline: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#d1d5db",
    backgroundColor: { default: "#f9fafb", ":hover": "#f3f4f6" },
    color: "#111827",
    cursor: "pointer",
  },
});
