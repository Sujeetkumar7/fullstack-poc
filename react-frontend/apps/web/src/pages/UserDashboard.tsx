import * as React from "react";
import { html, css } from "react-strict-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectUser, selectAuthStatus, logoutUser } from "@rsd/state";
import { Header, Sidebar } from "@rsd/ui";
// import {
//   getUsersList,
//   createUser,
//   updateUser,
//   deleteUser as deleteUserApi,
// } from "@rsd/api";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Stack,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Button,
} from "@mui/material";

const tokens = { headerH: 56, sidebarW: 240 };

const styles = css.create({
  page: { minHeight: "100vh", backgroundColor: "#f8fafc", width: "100%" },
  content: {
    marginTop: tokens.headerH,
    padding: 0,
    marginLeft: tokens.sidebarW,
  },
  contentFull: { marginLeft: 0 },
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
  avatar: { width: 72, height: 72, fontSize: 28 },
});

/** Helper: safely format numbers to currency */
function formatCurrency(v?: number, currency: string = "INR"): string {
  if (typeof v !== "number") return "-";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return String(v);
  }
}

/** Renders a single info row if value is present */
function InfoRow(props: { label: string; value?: React.ReactNode }) {
  if (
    props.value === undefined ||
    props.value === null ||
    props.value === "" ||
    (Array.isArray(props.value) && props.value.length === 0)
  ) {
    return null;
  }
  return (
    <ListItem dense disableGutters>
      <ListItemText
        primary={
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 140, color: "text.secondary" }}>
              {props.label}
            </Typography>
            <Typography variant="body2">{props.value}</Typography>
          </Stack>
        }
      />
    </ListItem>
  );
}

/** Portfolio View (first/default page) */
function UserPortfolio({ user }: { user: any }) {
  if (!user) {
    return (
      <Card elevation={3} sx={{ mt: 3 }}>
        <CardHeader title={<Typography variant="h6">User Portfolio</Typography>} />
        <CardContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are not logged in. Please sign in to view your portfolio.
          </Alert>
          <Button>/loginGo to Login</Button>
        </CardContent>
      </Card>
    );
  }

  const username: string = user?.username ?? "—";
  const initial = username?.[0]?.toUpperCase() ?? "?";

  // Common fields often found on user objects in your app domain
  const userId = user?.userId ?? user?.id;
  const role = user?.userRole ?? user?.role;
  const balance = user?.currentBalance;
  const email = user?.email;
  const phone = user?.phone;
  const lastLogin = user?.lastLogin; // shown only if present
  const accountStatus = user?.status ?? "Active";

  return (
    <Card elevation={3} sx={{ mt: 3 }}>
      <CardHeader
        title={<Typography variant="h6">User Portfolio</Typography>}
        subheader={<Typography variant="body2">Overview of your account details and status</Typography>}
      />
      <CardContent>
        <Grid container spacing={3} alignItems="flex-start">
          {/* Profile Block */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2} alignItems="center">
              <Avatar sx={styles.avatar}>{initial}</Avatar>
              <Stack spacing={1} alignItems="center">
                <Typography variant="h6">{username}</Typography>
                <Chip
                  label={role ?? "USER"}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </Grid>

          {/* Details Block */}
          <Grid item xs={12} md={8}>
            <List dense>
              <InfoRow label="User ID" value={userId} />
              <InfoRow label="Role" value={role} />
              <InfoRow label="Current Balance" value={formatCurrency(balance)} />
              <InfoRow label="Email" value={email} />
              <InfoRow label="Phone" value={phone} />
              <InfoRow label="Last Login" value={lastLogin ? String(lastLogin) : undefined} />
              <InfoRow label="Status" value={accountStatus} />
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This page shows details of the currently authenticated user from your app state
              (<code>selectUser</code>). Extend it with holdings, risk metrics, or goals once
              you connect portfolio APIs.
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

/** Transactions View (placeholder; wire to your API/store) */
function TransactionsView() {
  return (
    <Card elevation={3} sx={{ mt: 3 }}>
      <CardHeader title={<Typography variant="h6">Transactions</Typography>} />
      <CardContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Hook this view to your transactions API (e.g., <code>getUserTransactions(userId)</code>)
          or Redux slice. Show filters, pagination, and export as needed.
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Suggested columns: Date, Type (Buy/Sell/Deposit/Withdrawal), Instrument, Quantity,
          Price, Fees, Settlement, Status.
        </Typography>
      </CardContent>
    </Card>
  );
}

/** Stocks View (placeholder; watchlist/holdings) */
function StocksView() {
  return (
    <Card elevation={3} sx={{ mt: 3 }}>
      <CardHeader title={<Typography variant="h6">Stocks</Typography>} />
      <CardContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Connect this to a watchlist/holdings source and a market data feed.
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Suggested features: Watchlist, real-time quotes, P/L, average price, current price,
          day change, alerts, and quick trade links.
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectUser);
  const status = useAppSelector(selectAuthStatus);

  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    setSidebarOpen(!mql.matches);
    const handleChange = (ev: MediaQueryListEvent) => setSidebarOpen(!ev.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    navigate("/login", { replace: true });
  };

  // Sidebar items for the user dashboard
  const menuItems = [
    { key: "portfolio", label: "User Portfolio", route: "/user/portfolio", icon: "📁" },
    { key: "transactions", label: "Transactions", route: "/user/transactions", icon: "💸" },
    { key: "stocks", label: "Stocks", route: "/user/stocks", icon: "📈" },
  ];

  // Default to portfolio if route is /user
  React.useEffect(() => {
    const p = location.pathname.replace(/\/+$/, "");
    if (p === "/user") {
      navigate("/user/portfolio", { replace: true });
    }
  }, [location.pathname, navigate]);

  const activeKey =
    menuItems.find((m) => m.route === location.pathname)?.key ?? "portfolio";

  const onNavigate = (route: string) => {
    navigate(route);
    if (window.matchMedia("(max-width: 768px)").matches) setSidebarOpen(false);
  };

  if (status === "loading") return <html.div>Loading…</html.div>;

  return (
    <html.div style={styles.page}>
      <Header
        title="User Dashboard"
        username={authUser?.username}
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

      <html.main style={[styles.content, sidebarOpen ? false : styles.contentFull]}>
        <html.div style={styles.fullWidth}>
          {activeKey === "portfolio" ? (
            <UserPortfolio user={authUser} />
          ) : activeKey === "transactions" ? (
            <TransactionsView />
          ) : activeKey === "stocks" ? (
            <StocksView />
          ) : (
            <Card elevation={3} sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="body2">Unknown section.</Typography>
              </CardContent>
            </Card>
          )}
        </html.div>
      </html.main>
    </html.div>
  );
}
