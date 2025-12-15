import * as React from "react";
import { html, css } from "react-strict-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectUser, selectAuthStatus, logoutUser } from "@rsd/state";
import { Header, Sidebar, Dashboard as DashboardUI } from "@rsd/ui";

const tokens = { headerH: 56, sidebarW: 240 };

const styles = css.create({
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    width: "100%",
  },
  content: {
    marginTop: tokens.headerH,
    padding: 0,
    marginLeft: tokens.sidebarW,
  },
  contentFull: {
    marginLeft: 0,
  },
  fullWidth: {
    width: "100%",
    maxWidth: "none",
    marginLeft: 0,
    marginRight: 0,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    boxSizing: "border-box",
  },
});

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const status = useAppSelector(selectAuthStatus);

  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Close sidebar on mobile; open on desktop
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    setSidebarOpen(!mql.matches);

    const handleChange = (ev: MediaQueryListEvent) => {
      setSidebarOpen(!ev.matches);
    };

    mql.addEventListener("change", handleChange);
    return () => {
      mql.removeEventListener("change", handleChange);
    };
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    navigate("/login", { replace: true });
  };

  const menuItems = [
    { key: "users", label: "User Management", route: "/dashboard", icon: "👥" },
    { key: "analytics", label: "Analytics", route: "/analytics", icon: "📊" },
  ];

  const activeKey =
    menuItems.find((m) => m.route === location.pathname)?.key ?? "users";

  const onNavigate = (route: string) => {
    navigate(route);
    if (window.matchMedia("(max-width: 768px)").matches) {
      setSidebarOpen(false);
    }
  };

  if (status === "loading") {
    return <html.div>Loading…</html.div>;
  }

  return (
    <html.div style={styles.page}>
      <Header
        title="Admin Dashboard"
        username={user?.username}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      <Sidebar
        open={sidebarOpen}
        menuItems={menuItems}
        activeKey={activeKey}
        onItemClick={(item) => onNavigate(item.route)}
        onClose={() => setSidebarOpen(false)}
      />

      <html.main
        style={{
          ...styles.content,
          ...(sidebarOpen ? {} : styles.contentFull),
        }}
      >
        <html.div style={styles.fullWidth}>
          <DashboardUI
            username={user?.username ?? "User"}
            onLogout={handleLogout}
          />
        </html.div>
      </html.main>
    </html.div>
  );
}
