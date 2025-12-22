
import * as React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

type Mode = "light" | "dark";

export const ColorModeContext = React.createContext<{ mode: Mode; toggle: () => void }>({
  mode: "light",
  toggle: () => {},
});

export default function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = React.useState<Mode>(() => {
    const saved = localStorage.getItem("ui:colorMode") as Mode | null;
    return saved ?? (prefersDark ? "dark" : "light");
  });

  const toggle = React.useCallback(() => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("ui:colorMode", next);
      return next;
    });
  }, []);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: { mode },
        shape: { borderRadius: 10 },
        components: {
          MuiCard: { styleOverrides: { root: { border: mode === "dark" ? "1px solid #333" : "1px solid #eee" } } },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggle }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
       </ColorModeContext.Provider>
  );
}