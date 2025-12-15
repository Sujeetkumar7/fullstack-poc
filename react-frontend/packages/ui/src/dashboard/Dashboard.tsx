// packages/ui/src/Dashboard.tsx
import { html } from "react-strict-dom";
import { dashboardStyles as styles } from "./Dashboard.styles";

export type DashboardProps = {
  username?: string;
  onLogout?: () => void;
};

export default function Dashboard({ username, onLogout }: DashboardProps) {
  return (
    <html.div style={styles.wrap}>
      <html.h2 style={styles.title}>Dashboard</html.h2>
      <html.p style={styles.info}>Hello, {username ?? "User"}</html.p>
      <html.button style={styles.button} onClick={onLogout}>
        Logout
      </html.button>
    </html.div>
  );
}
