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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  getTransactionHistory,
  Transaction,
} from "../../../../../packages/api/src/transactions"; // adjust path
import {  useAppSelector } from "../../store/hooks";
import { selectUser} from "@rsd/state";

export default function Transactions() {
  const authUser = useAppSelector(selectUser);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<Transaction[]>([]);
  const [error, setError] = React.useState("");
  const userId = authUser?.userId ?? (authUser as any)?.id ?? "—";

  React.useEffect(() => {
    if (!userId) return;
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
      [r.transactionId, r.transactionType, r.username, r.userId, r.fromUsername, r.toUsername]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, query]);

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
              {filtered.map((t) => (
                <TableRow key={t.transactionId}>
                  <TableCell>{t.transactionId}</TableCell>
                  <TableCell>{t.userId ?? "—"}</TableCell>
                  <TableCell>{t.transactionType}</TableCell>
                  <TableCell>₹{t.amount}</TableCell>
                  <TableCell>{t.fromUsername ?? "—"}</TableCell>
                  <TableCell>{t.toUsername ?? "—"}</TableCell>
                  <TableCell>
                    {new Date(t.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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