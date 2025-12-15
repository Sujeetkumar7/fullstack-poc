import { css } from "react-strict-dom";

export const loginStyles = css.create({
  page: {
    width: "100%",
    minHeight: "100dvh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
    backgroundImage:
      "radial-gradient(1200px 400px at 20% -10%, rgba(99,102,241,0.08), transparent), radial-gradient(1000px 320px at 80% -20%, rgba(59,130,246,0.08), transparent)",
    paddingInline: 12,
    paddingBlock: 24,
  },

  card: {
    width: "100%",
    maxWidth: {
      default: "min(100%, 360px)",
      "@media (min-width: 1024px)": "360px",
    },
    backgroundColor: "#ffffff",
    color: "#111827",
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(17,24,39,0.08)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    padding: { default: 20, "@media (min-width: 640px)": 24 },
    transitionProperty: "transform, box-shadow",
    transitionDuration: "200ms",
    transform: { default: "translateY(0)", ":hover": "translateY(-2px)" },
  },

  title: {
    marginTop: 0,
    marginBottom: 8,
    fontWeight: 800,
    fontSize: { default: 24, "@media (min-width: 480px)": 26 },
    color: "#0f172a",
    textAlign: "center",
  },

  form: { display: "flex", flexDirection: "column", gap: 14 },

  actions: { marginTop: 12 },

  footer: {
    marginTop: 20,
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
});
