import { html, css } from "react-strict-dom";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { routes } from "./routes/route";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const shell = css.create({
  root: {
    minHeight: "100dvh",
    display: "flex",
    backgroundColor: "#eef2f7",
  },
});

function RouterView() {
  return useRoutes(routes);
}

const theme = createTheme();

export default function App() {
  return (
    <html.div style={shell.root}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <RouterView />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </html.div>
  );
}
