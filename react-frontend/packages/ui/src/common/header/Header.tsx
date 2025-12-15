import * as React from "react";
import { html, css } from "react-strict-dom";

export type HeaderProps = {
  title: string;
  username?: string;
  onLogout: () => void;
  onToggleSidebar?: () => void;
};

const tokens = { headerH: 56 };

const styles = css.create({
  root: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: tokens.headerH,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: "#0b5fff",
    color: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    zIndex: 1000,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brand: {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: 0.25,
  },
  iconBtn: {
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 36,
    width: 36,
    borderRadius: 8,
    backgroundColor: "transparent",
    color: "#ffffff",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.25)",
  },
  profileWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.25)",
    userSelect: "none",
  },
  chevron: { marginLeft: 8 },
  popup: {
    position: "absolute",
    top: 44,
    right: 0,
    backgroundColor: "#ffffff",
    color: "#111827",
    borderRadius: 12,
    boxShadow: "0 12px 24px rgba(16,24,40,0.12)",
    minWidth: 180,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    padding: 8,
    zIndex: 1001,
  },
  dropdownItem: {
    width: "100%",
    textAlign: "left",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 8,
    cursor: "pointer",
    backgroundColor: "transparent",
    borderWidth: 0,
    borderStyle: "solid",
    color: "#111827",
  },
  mobileOnly: {
    "@media (max-width: 768px)": { display: "inline-flex" },
  },
  desktopOnly: {
    "@media (max-width: 768px)": { display: "none" },
  },
  dropdownItemHover: {
    backgroundColor: "#f3f4f6",
  },
});

export default function Header({
  title,
  username,
  onLogout,
  onToggleSidebar,
}: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const [logoutHover, setLogoutHover] = React.useState(false);

  const toggleMenu = React.useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const handleLogout = React.useCallback(() => {
    setOpen(false);
    onLogout();
  }, [onLogout]);

  const onKeyDown = (
    e: Readonly<{ key: string; type: string | null | undefined }>
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      toggleMenu();
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <html.header style={styles.root}>
      <html.div style={styles.left}>
        <html.button
          aria-label="Toggle sidebar"
          style={{ ...styles.iconBtn, ...styles.mobileOnly }}
          onClick={() => onToggleSidebar?.()}
        >
          ☰
        </html.button>

        <html.span style={styles.brand}>{title}</html.span>
      </html.div>

      <html.div>
        <html.div
          role="button"
          tabIndex={0}
          aria-haspopup="menu"
          aria-expanded={open}
          style={styles.profileWrap}
          onClick={toggleMenu}
          onKeyDown={onKeyDown}
        >
          <html.span>👤</html.span>
          <html.span>{username ?? "User"}</html.span>
          <html.span style={styles.chevron}>▾</html.span>
        </html.div>

        {open && (
          <html.div style={styles.popup}>
            <html.button
              style={{
                ...styles.dropdownItem,
                ...(logoutHover ? styles.dropdownItemHover : {}),
              }}
              onMouseEnter={() => setLogoutHover(true)}
              onMouseLeave={() => setLogoutHover(false)}
              onClick={handleLogout}
            >
              ⎋ Logout
            </html.button>
          </html.div>
        )}
      </html.div>
    </html.header>
  );
}
