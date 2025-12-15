import * as React from "react";
import { html, css } from "react-strict-dom";

export type MenuItem = {
  key: string;
  label: string;
  route: string;
  icon?: string;
};

export type SidebarProps = {
  open: boolean;
  menuItems: MenuItem[];
  activeKey?: string;
  onItemClick: (item: MenuItem) => void;
  onClose?: () => void;
};

const tokens = {
  headerH: 56,
  sidebarW: 240,
};

const styles = css.create({
  root: {
    position: "fixed",
    top: tokens.headerH,
    left: 0,
    bottom: 0,
    width: tokens.sidebarW,
    backgroundColor: "#f8f9fa",
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: "#dee2e6",
    overflowY: "auto",
    transform: "translateX(0)",
    transitionProperty: "transform",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease",
    zIndex: 900,
  },
  closed: {
    transform: "translateX(-100%)",
  },

  body: {
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 12,
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingLeft: 0,
    paddingRight: 0,
    marginTop: 0,
    marginBottom: 0,
  },

  li: {
    fontSize: 14,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
  },

  navLink: {
    display: "block",
    cursor: "pointer",
    color: "#495057",
    borderRadius: 8,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
  },

  navLinkHover: {
    backgroundColor: "#e9ecef",
  },

  navLinkActive: {
    backgroundColor: "#e7f1ff",
    color: "#0d6efd",
    fontWeight: 600,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#b6d4fe",
  },

  icon: { marginRight: 8 },
});

export default function Sidebar({
  open,
  menuItems,
  activeKey,
  onItemClick,
  onClose,
}: SidebarProps) {
  const [hoverKey, setHoverKey] = React.useState<string | null>(null);

  const onKeyDown = (
    e: Readonly<{ key: string; type: string | null | undefined }>
  ) => {
    if (e.key === "Escape") onClose?.();
  };

  return (
    <html.aside
      aria-label="Primary navigation"
      style={{ ...styles.root, ...(open ? {} : styles.closed) }}
      onKeyDown={onKeyDown}
    >
      <html.div style={styles.body}>
        <html.ul role="list" style={styles.list}>
          {menuItems.map((item) => {
            const isActive = item.key === activeKey;
            const isHover = hoverKey === item.key;

            return (
              <html.li key={item.key} style={styles.li}>
                <html.div
                  role="link"
                  tabIndex={0}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                    ...(isHover && !isActive ? styles.navLinkHover : {}),
                  }}
                  onClick={() => onItemClick(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onItemClick(item);
                  }}
                  onMouseEnter={() => setHoverKey(item.key)}
                  onMouseLeave={() =>
                    setHoverKey((k) => (k === item.key ? null : k))
                  }
                >
                  {item.icon ? (
                    <html.span style={styles.icon}>{item.icon}</html.span>
                  ) : null}
                  <html.span>{item.label}</html.span>
                </html.div>
              </html.li>
            );
          })}
        </html.ul>
      </html.div>
    </html.aside>
  );
}
