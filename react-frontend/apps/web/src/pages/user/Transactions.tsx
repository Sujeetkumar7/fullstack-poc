
import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Stack,
  TextField,
  InputAdornment,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  getTransactionHistory,
  Transaction,
} from "../../../../../packages/api/src/transactions"; // adjust path
import { useAppSelector } from "../../store/hooks";
import { selectUser } from "@rsd/state";

export default function Transactions() {
  const authUser = useAppSelector(selectUser);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<Transaction[]>([]);
  const [error, setError] = React.useState("");

  // MUI pagination state
  const [page, setPage] = React.useState(0); // zero-based
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const userId = authUser?.userId ?? (authUser as any)?.id ?? "—";

  React.useEffect(() => {
    if (!userId || userId === "—") return;
    let mounted = true;
    setLoading(true);
    getTransactionHistory(userId)
      .then((data) => {
        if (mounted) setRows(data);
      })
      .catch((e) => {
        if (mounted) setError(e.message ?? "Failed to load transactions");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [userId]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [
        r.transactionId,
        r.transactionType,
        r.username,
        r.userId,
        r.fromUsername,
        r.toUsername,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, query]);

  // Clamp page if filtered shrinks
  React.useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(maxPage);
  }, [filtered.length, rowsPerPage, page]);

  // Reset page on search
  React.useEffect(() => {
    setPage(0);
  }, [query]);

  // Slice for current page
  const start = page * rowsPerPage;
  const end = Math.min(start + rowsPerPage, filtered.length);
  const pagedRows = filtered.slice(start, end);

  // Handlers for MUI TablePagination
  const handleChangePage = (_evt: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const next = parseInt(event.target.value, 10);
    setRowsPerPage(next);
    setPage(0); // reset to first page on rowsPerPage change
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader
        title="Transaction History"
        action={
          <TextField
            size="small"
            placeholder="Search transactions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        }
      />
      <CardContent>
        {loading ? (
          <Stack spacing={1}>
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonLine />
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filtered.length === 0 ? (
          <Alert severity="info">No transactions found.</Alert>
        ) : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>From User</TableCell>
                  <TableCell>To User</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedRows.map((t) => (
                  <TableRow key={t.transactionId}>
                    <TableCell>{t.transactionId}</TableCell>
                    <TableCell>{t.userId ?? "—"}</TableCell>
                    <TableCell>{t.transactionType}</TableCell>
                    <TableCell>₹{Number(t.amount).toLocaleString("en-IN")}</TableCell>
                    <TableCell>{t.fromUsername ?? "—"}</TableCell>
                    <TableCell>{t.toUsername ?? "—"}</TableCell>
                    <TableCell>{new Date(t.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={filtered.length}     // count after search
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 20, 50]}
              labelDisplayedRows={({ from, to, count }) =>
                `Showing ${from} to ${to} of ${count} entries`
              }
              // Optional: change label for rows per page
              labelRowsPerPage="Rows per page"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SkeletonLine() {
  return (
    <div
      style={{
        height: 16,
        background: "var(--mui-palette-divider)",
        borderRadius: 6,
      }}
    />
  );
}
