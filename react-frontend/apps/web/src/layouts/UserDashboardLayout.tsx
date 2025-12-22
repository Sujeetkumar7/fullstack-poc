
import * as React from "react";
import {
  AppBar, Toolbar, IconButton, Typography, Box, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Divider, Avatar, Menu, MenuItem, Tooltip, useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { selectUser, selectAuthStatus, logoutUser } from "@rsd/state";
import { ColorModeContext } from "../theme/ColorModeProvider";

import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import FolderIcon from "@mui/icons-material/Folder";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShowChartIcon from "@mui/icons-material/ShowChart";

const DRAWER_WIDTH = 260;

const navItems = [
  { label: "User Portfolio", to: "/user/portfolio", icon: <FolderIcon /> },
  { label: "Transactions", to: "/user/transactions", icon: <ReceiptLongIcon /> },
  { label: "Stocks", to: "/user/stocks", icon: <ShowChartIcon /> },
];

export default function UserDashboardLayout() {
  const theme = useTheme();
  const { mode, toggle } = React.useContext(ColorModeContext);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useAppSelector(selectUser);
  const status = useAppSelector(selectAuthStatus);

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = React.useState(!isMobile);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  React.useEffect(() => setOpen(!isMobile), [isMobile]);

  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    navigate("/login", { replace: true });
  };

  const initials = (authUser?.username?.[0] ?? "?").toUpperCase();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* AppBar */}
      <AppBar position="fixed" elevation={1} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setOpen((v) => !v)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            User Dashboard
          </Typography>

          <Tooltip title={`Switch to ${mode === "dark" ? "Light" : "Dark"} mode`}>
            <IconButton color="inherit" onClick={toggle} sx={{ mr: 1 }}>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32 }}>{initials}</Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem disabled>
              <Typography variant="body2">{authUser?.username ?? "User"}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {navItems.map((item) => {
              const selected = location.pathname === item.to;
              return (
                <ListItemButton
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  selected={selected}
                  onClick={() => isMobile && setOpen(false)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
        <Toolbar />
        {/* Loading skeleton while auth status is loading */}
        {status === "loading" ? (
          <SkeletonScaffold />
        ) : (
          <Outlet />
        )}
      </Box>
    </Box>
  );
}

function SkeletonScaffold() {
  return (
    <Box>
      {/* Simulated card skeleton */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box sx={{ width: 220 }}>
            <Box sx={{ bgcolor: "divider", height: 8, borderRadius: 1 }} />
          </Box>
        </Box>
        <Box sx={{ bgcolor: "divider", height: 140, borderRadius: 2 }} />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Box sx={{ bgcolor: "divider", height: 160, borderRadius: 2 }} />
        <Box sx={{ bgcolor: "divider", height: 160, borderRadius: 2 }} />
      </Box>
       </Box>
  );
}