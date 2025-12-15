import { css } from "react-strict-dom";

export const buttonStyles = css.create({
  buttonPrimary: {
    width: "100%",
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 0,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    textAlign: "center",
    backgroundColor: {
      default: "#2563eb",
      ":hover": "#1d4ed8",
      ":active": "#1e40af",
    },
    color: "#fff",
    boxShadow: {
      default: "0 6px 16px rgba(37,99,235,0.25)",
      ":active": "0 4px 12px rgba(30,64,175,0.25)",
    },
    transitionProperty: "background-color, box-shadow",
    transitionDuration: "150ms",
  },

  buttonPrimaryDisabled: {
    width: "100%",
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 0,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "inherit",
    textAlign: "center",
    cursor: "default",
    backgroundColor: { default: "#2563eb" },
    color: "#fff",
    boxShadow: { default: "0 6px 16px rgba(37,99,235,0.18)" },
    opacity: 0.6,
  },
}) as any; // <-- Assert once here
