
import * as React from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import {
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const drawerWidth = 240;
const collapsedWidth = 64; // mini width (fits icons)

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: 'hidden'
});

const closedMixin = (theme: Theme): CSSObject => ({
  width: collapsedWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: 'hidden'
});

// AppBar adjusts its left margin and width based on drawer open state
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  }),
  ...(!open && {
    marginLeft: collapsedWidth,
    width: `calc(100% - ${collapsedWidth}px)`
  })
}));

// Drawer styled to handle mini-variant behavior
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  width: open ? drawerWidth : collapsedWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme)
  })
}));

// Toolbar spacer (same height as AppBar Toolbar)
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  height: theme.spacing(8),
  padding: theme.spacing(0, 1)
}));

type NavItem = {
  label: string;
  icon: React.ReactNode;
  to?: string; // optional route
  onClick?: () => void;
};

export default function CollapsibleSidebar({
  children,
  userDisplayName = 'Sujeet-1002',
  balance = 9643,
  onTransferMoney
}: {
  children: React.ReactNode;
  userDisplayName?: string;
  balance?: number;
  onTransferMoney?: () => void;
}) {
  const [open, setOpen] = React.useState(true);

  const handleToggle = () => setOpen((prev) => !prev);

  const navItems: NavItem[] = [
    { label: 'Transactions', icon: <ReceiptLongIcon /> },
    { label: 'Stocks', icon: <ShowChartIcon /> }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: (theme) => theme.palette.background.default }}>
      <CssBaseline />

      {/* Header */}
      <AppBar position="fixed" open={open} color="primary">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
              onClick={handleToggle}
              edge="start"
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              User Dashboard
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceWalletIcon />
            <Typography variant="body1">{userDisplayName}</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer variant="permanent" open={open}>
        <DrawerHeader />
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  justifyContent: open ? 'initial' : 'center'
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {/* Show label only when open */}
                {open && <ListItemText primary={item.label} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          // When closed, leave space for collapsed drawer
          ml: open ? `${drawerWidth}px` : `${collapsedWidth}px`
        }}
      >
        <Toolbar /> {/* push content below AppBar */}
        {/* Account Balance Card */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            p: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="subtitle1" color="text.secondary">
              Account Balance
            </Typography>
            <Typography variant="h4">
              Balance: <strong>{balance}</strong>
            </Typography>
          </Box>
          <Button variant="contained" onClick={onTransferMoney}>
            Transfer Money
          </Button>
        </Box>

        {/* Children area (Transaction History, etc.) */}
        {children}
      </Box>
    </Box>
  );
}
