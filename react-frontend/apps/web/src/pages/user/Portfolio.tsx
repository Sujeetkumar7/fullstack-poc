
// src/pages/user/Portfolio.tsx
import * as React from "react";
import { html } from "react-strict-dom";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Stack,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  Box,
  TextField,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAppSelector } from "../../store/hooks";
import { selectUser, selectAuthStatus } from "@rsd/state";
import { useNavigate } from "react-router-dom";
import type { PortfolioStockDto, UserPortfolioResponse } from "../../types/users";
import { useUserPortfolio } from "../../hooks/useUserPortfolio";
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import TransferMoneyDialog from "./TransferMoneyDialog";

/* -------------------- Safe formatters -------------------- */
function formatCurrencySafe(
  v?: number | string | null,
  currency: string = "INR"
): string {
  const n = typeof v === "number" ? v : v != null ? Number(v) : NaN;
  if (!Number.isFinite(n)) return "-";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return String(n);
  }
}

function formatDateSafe(d?: string | number | Date): string {
  if (d == null || d === "") return "-";
  let date: Date | null = null;

  if (d instanceof Date) {
    date = d;
  } else if (typeof d === "number") {
    const ms = d < 1e12 ? d * 1000 : d; // seconds vs ms guard
    date = new Date(ms);
  } else if (typeof d === "string") {
    let s = d.trim();
    // "YYYY-MM-DD HH:mm:ss" → "YYYY-MM-DDTHH:mm:ss"
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(s)) s = s.replace(" ", "T");
    // "DD/MM/YYYY" → "YYYY-MM-DD"
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
      const [dd, mm, yyyy] = s.split("/");
      s = `${yyyy}-${mm}-${dd}`;
    }
    const tryDate = new Date(s);
    if (!Number.isNaN(tryDate.getTime())) date = tryDate;
  }

  if (!date || Number.isNaN(date.getTime())) return "-";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <ListItem disableGutters dense>
      <ListItemText
        primary={
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 140, color: "text.secondary" }}>
              {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
          </Stack>
        }
      />
    </ListItem>
  );
}

/* -------------------- Component -------------------- */
export default function Portfolio() {
  const theme = useTheme();
  const authUser = useAppSelector(selectUser);
  const status = useAppSelector(selectAuthStatus);
  const navigate = useNavigate();
  
  const [openTransfer, setOpenTransfer] = React.useState(false);
  const openTransferDialog = () => setOpenTransfer(true);
  const closeTransferDialog = () => setOpenTransfer(false);

  // Guard for unauthenticated
  if (!authUser && status !== "loading") {
    return (
      <Card sx={{ mt: 2 }}>
        <CardHeader title="User Portfolio" />
        <CardContent>
          <Alert severity="warning">You are not logged in. Please sign in to view your portfolio.</Alert>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Summary info from auth state (instant)
  const username = authUser?.username ?? "—";
  const initial = username?.[0]?.toUpperCase() ?? "?";
  const userId = authUser?.userId ?? (authUser as any)?.id ?? "—";
  const role = authUser?.userRole ?? "USER";
  const accountStatus = "Active";

  // Fetch normalized portfolio via hook (seed with auth data)
  const { data, loading, error, refresh } = useUserPortfolio(authUser?.userId, {
    userId,
    username,
    userRole: role,
    currentBalance: authUser?.currentBalance ?? 0,
    stocks: Array.isArray(authUser?.stocks) ? (authUser!.stocks as PortfolioStockDto[]) : [],
  });

  // Derived values
  const balance = data?.currentBalance ?? authUser?.currentBalance ?? 0;
  const stocks: PortfolioStockDto[] = Array.isArray(data?.stocks) ? data!.stocks : [];

  /* ---------- Local filters: default type "CREDIT" + search ---------- */
  const [typeFilter, setTypeFilter] = React.useState<string>("CREDIT");
  const [search, setSearch] = React.useState<string>("");

  const availableTypes = React.useMemo(
    () => Array.from(new Set(stocks.map((s) => s.transactionType))).filter(Boolean),
    [stocks]
  );

  // Fallback to "ALL" if "CREDIT" doesn't exist
  React.useEffect(() => {
    if (availableTypes.length > 0 && typeFilter === "CREDIT" && !availableTypes.includes("CREDIT")) {
      setTypeFilter("ALL");
    }
  }, [availableTypes, typeFilter]);

  /* -------------------- Normalize rows (single source of truth) -------------------- */
  type Row = {
    id: string;
    stockName: string;
    pricePerUnitNum: number;
    quantityNum: number;
    amountNum: number;
    transactionType: string;
    transactionDateTs: number;    // for sorting
    transactionDateStr: string;   // for display
  };

  const rows = React.useMemo<Row[]>(
    () =>
      stocks.map((s, idx) => {
        const pricePerUnitNum = Number(s.pricePerUnit ?? NaN);
        const quantityNum = Number(s.quantity ?? NaN);
        const amountNum = Number(s.amount ?? NaN);

        // Parse to timestamp; handle non-ISO formats
        let ts = new Date(String(s.transactionDate ?? "")).getTime();
        if (Number.isNaN(ts)) {
          const normalized = String(s.transactionDate ?? "").trim().replace(" ", "T");
          const tryDt = new Date(normalized);
          ts = Number.isNaN(tryDt.getTime()) ? 0 : tryDt.getTime();
        }

        return {
          id: `${s.stockName}-${s.transactionDate}-${idx}`,
          stockName: String(s.stockName ?? "").trim(),
          pricePerUnitNum: Number.isFinite(pricePerUnitNum) ? pricePerUnitNum : NaN,
          quantityNum: Number.isFinite(quantityNum) ? quantityNum : NaN,
          amountNum: Number.isFinite(amountNum) ? amountNum : NaN,
          transactionType: String(s.transactionType ?? "").trim(),
          transactionDateTs: ts,
          transactionDateStr: String(s.transactionDate ?? ""),
        };
      }),
    [stocks]
  );

  /* -------------- External filtering before passing to Grid -------------- */
  const filteredRows = React.useMemo<Row[]>(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesType = typeFilter === "ALL" || r.transactionType === typeFilter;
      if (!q) return matchesType;
      const hay = [
        r.stockName,
        r.transactionType,
        String(r.quantityNum),
        String(r.pricePerUnitNum),
        String(r.amountNum),
        r.transactionDateStr,
      ]
        .join(" ")
        .toLowerCase();
      return matchesType && hay.includes(q);
    });
  }, [rows, typeFilter, search]);

  const totalInvested = React.useMemo(
    () => filteredRows.reduce((sum, r) => sum + (Number.isFinite(r.amountNum) ? r.amountNum : 0), 0),
    [filteredRows]
  );
  const totalQty = React.useMemo(
    () => filteredRows.reduce((sum, r) => sum + (Number.isFinite(r.quantityNum) ? r.quantityNum : 0), 0),
    [filteredRows]
  );

  /* -------------------- DataGrid columns (use renderCell) -------------------- */
  const columns = React.useMemo<GridColDef[]>(
    () => [
      { field: "stockName", headerName: "Stock", flex: 1, minWidth: 150 },
      {
        field: "pricePerUnitNum",
        headerName: "Price / Unit",
        type: "number",
        align: "right",
        headerAlign: "right",
        minWidth: 140,
        renderCell: (params: GridRenderCellParams<number>) =>
          formatCurrencySafe(params.row?.pricePerUnitNum, "INR"),
      },
      {
        field: "quantityNum",
        headerName: "Qty",
        type: "number",
        align: "right",
        headerAlign: "right",
        minWidth: 90,
      },
      {
        field: "amountNum",
        headerName: "Amount",
        type: "number",
        align: "right",
        headerAlign: "right",
        minWidth: 140,
        renderCell: (params: GridRenderCellParams<number>) =>
          formatCurrencySafe(params.row?.amountNum, "INR"),
      },
    //   {
    //     field: "transactionType",
    //     headerName: "Type",
    //     minWidth: 120,
    //     renderCell: (params: GridRenderCellParams<string>) => {
    //       const t = (params.value ?? "").toUpperCase();
    //       const color = t === "BUY" ? "success" : t === "SELL" ? "error" : "default";
    //       return <Chip label={params.value} size="small" color={color as any} variant="outlined" />;
    //     },
    //   },
      {
        field: "transactionDateTs",
        headerName: "Date",
        minWidth: 150,
        valueGetter: (params) => params.row?.transactionDateTs ?? 0,             // sort by ts
        renderCell: (params) => formatDateSafe(params.row?.transactionDateStr),  // display original string formatted
      },
    ],
    []
  );

  return (
    <html.div style={{ width: "100%" }}>
      <Card sx={{ mt: 2 }}>
        <CardHeader
          title="User Portfolio"
          subheader="Overview of your account details, balance and holdings"
          action={
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 420 }}>
              <TextField
                size="small"
                placeholder="Search stocks, type, date…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              {/* Type filter UI intentionally hidden; default = CREDIT */}
              <Button
                variant="outlined"
                size="small"
                disabled={loading || !authUser?.userId}
                onClick={() => authUser?.userId && refresh()}
              >
                Refresh
              </Button>
               <Button
                variant="outlined"
                size="small"
                disabled={loading || !authUser?.userId}
                onClick={openTransferDialog} 
              >
                Transfer Money
              </Button>
            </Stack>
          }
        />
        {loading && <LinearProgress />}

        <CardContent>
          {error ? (
            <Alert
              severity="error"
              action={<Button color="inherit" size="small" onClick={() => refresh()}>Retry</Button>}
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          ) : null}

          <Grid container spacing={3}>
            {/* Profile */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2} alignItems="center">
                <Avatar sx={{ width: 72, height: 72, fontSize: 28 }}>{initial}</Avatar>
                <Stack spacing={1} alignItems="center">
                  <Typography variant="h6">{username}</Typography>
                  <Chip label={role} color="primary" size="small" variant="outlined" />
                </Stack>
              </Stack>
            </Grid>

            {/* Summary */}
            <Grid item xs={12} md={8}>
              <List dense>
                <InfoRow label="User ID" value={userId} />
                <InfoRow label="Role" value={role} />
                <InfoRow label="Current Balance" value={formatCurrencySafe(balance)} />
                <InfoRow label="Status" value={accountStatus} />
                <InfoRow label="Total (filtered)" value={formatCurrencySafe(totalInvested)} />
                <InfoRow label="Quantity (filtered)" value={totalQty} />
              </List>
              {/* <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Use the search box (default type filter = CREDIT) to quickly find transactions. The table supports sorting,
                pagination, column toggles, and export.
              </Typography> */}
            </Grid>
          </Grid>

          {/* Stocks DataGrid */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>Stocks</Typography>

          {filteredRows.length === 0 && !loading ? (
            <Alert severity="info">No stocks found in your portfolio.</Alert>
          ) : (
            <Box sx={{ height: 520, width: "100%" }}>
              <DataGrid
                rows={filteredRows}
                columns={columns}
                disableColumnMenu={false}
                pageSizeOptions={[5, 10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } },
                  sorting: { sortModel: [{ field: "transactionDateTs", sort: "desc" }] },
                }}
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: theme.palette.mode === "dark" ? "background.paper" : "grey.50",
                  },
                }}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 300 },
                  },
                }}
                loading={loading}
              />
            </Box>
          )}
        </CardContent>
      </Card>
      
       <TransferMoneyDialog
        open={openTransfer}
        fromUserId={userId}
        fromUsername={username}
        currentBalance={balance}
        onClose={closeTransferDialog}
        onSuccess={() => {
          // Refresh the portfolio after a successful transfer
          refresh();
        }}
      />

    </html.div>
  );
}
