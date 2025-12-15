import { html, css } from "react-strict-dom";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { routes } from "./routes/route";

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

export default function App() {
  return (
    <html.div style={shell.root}>
      <Provider store={store}>
        <BrowserRouter>
          <RouterView />
        </BrowserRouter>
      </Provider>
    </html.div>
  );
}
