import { css } from "react-strict-dom";

export const textboxStyles = css.create({
  field: { display: "block" },
  label: { display: "block", fontSize: 14, marginBottom: 6, color: "#374151" },

  input: {
    display: "block",
    width: "100%",
    minHeight: 46,
    boxSizing: "border-box",
    paddingInline: 12,
    paddingBlock: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "solid",
    fontSize: 14,
    fontFamily: "inherit",
    backgroundColor: "#ffffff",
    color: "#111827",
    borderColor: { default: "#cbd5e1", ":focus": "#6366f1" },
    boxShadow: { default: "none", ":focus": "0 0 0 3px rgba(99,102,241,0.18)" },
    outlineWidth: 0,
    transitionProperty: "border-color, box-shadow",
    transitionDuration: "150ms",
  },

  helpText: { marginTop: 6, fontSize: 12, color: "#9ca3af" },
  error: { color: "#dc2626", fontSize: 13, marginTop: 6 },
});
